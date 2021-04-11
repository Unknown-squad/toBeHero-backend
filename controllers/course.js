// load requried packages
const asyncHandler = require(`../middlewares/async`);
const ErrorResponse = require(`../utils/errorResponse`);
const Course = require(`../models/courses`);
const Mentor = require(`../models/mentors`);
const Review = require(`../models/reviews`);
const Guardian = require(`../models/guardians`);
const path = require(`path`);
const fs = require(`fs`);
const { clear } = require("console");

// @route   GET `/api/v1/courses/:id`
// @desc    get one course
// @access  public
exports.getOneCourse = asyncHandler(async (req, res, next) => {

  // find course with givin id and pupulate mentorId
  const course = await Course
    .findById(req.params.id)
    .select(`-reviewsId`)
    .populate({
    path: `mentorId`,
    select: `_id fullName picture isAvailable`,
    model: Mentor
  });

  // check if there's no course with givin id
  if(!course) {
    return next(new ErrorResponse(`Course not found with givin id.`, 404));
  }

  // send response
  res.status(200).json({
    success: true,
    message: `successfully find course with id ${req.params.id}`,
    data:{
      kind: `course`,
      items: [course]
    }
  });

});

// @route   GET `/api/v1/courses`
// @desc    get courses
// @access  public
exports.getCourses = asyncHandler(async (req, res, next) => {

  // Genre
  if(!req.query.genre) {
    return next(new ErrorResponse(`please pick any genre.`, 400));
  }

  // Sort
  let sortby;
  if(req.query.sortby === `rating`) {
    sortby = `-rate`;
  } else if(req.query.sortby === `popularity`) {
    sortby = `-reviewCounter`;
  } else if(req.query.sortby === `newest`) {
    sortby = `-creatingDate`;
  } else if(req.query.sortby === `high-price`) {
    sortby = `-price`;
  } else if(req.query.sortby === `low-price`) {
    sortby = `price`;
  } else {
    sortby = `-reviewCounter`;
  }

  // filter by rate
  let filter = 0;
  if(req.query.ratings) {
    filter = req.query.ratings;
  }

  // page
  let page = parseInt(req.query.page, 10) || 1;
  let limit = 10;
  if(page < 0) {
    page = 1;
  }
  
  // find and filter courses
  const courses = await Course
    .find({genre: req.query.genre, rate: {$gte: filter}})
    .sort(sortby)
    .skip((page - 1) * limit)
    .limit(limit)
    .select(` -creatingDate -topicsList -mediaURLS -subscriptionNumber -reviewsId`)
    .populate({
      path: "mentorId",
      select: "_id fullName picture isAvailable",
      model: Mentor
    });

  // check if there is no courses in page
  if(courses.length === 0) {
    return next(new ErrorResponse(`this page has no data.`, 404));
  }
  
  // send response
  res.status(200).json({
    success: true,
    message: `successfully get courses data of page ${page}`,
    data: {
      kind: `courses`,
      count: courses.length,
      items: courses
    }
  });

});

// @route   GET `/api/v1/reviews/:courseId`
// @desc    get reviews
// @access  public
exports.getReviews = asyncHandler(async (req, res, next) => {

  // handle pagination
  let page = parseInt(req.query.page, 10) || 1;
  let limit = 5;

  if(page <= 0) {
    page = 1;
  }

  // search on course
  const currentCourse = await Course
    .findById(req.params.courseId)
    .populate({
      path: `reviewsId`,
      select: `-id -courseId`,
      model: Review,
      options: {
        sort: {creatingDate: -1}
      },
      skip: (page - 1) * limit,
      limit: limit,
      populate: {
        path: `guardianId`,
        select: `fullName picture -_id`,
        model: Guardian
      }
    });

  // check if course exist or not
  if(!currentCourse) {
    return next(new ErrorResponse(`Course not found with givin id.`, 404));
  }

  // check if course has reviews or not
  if(!currentCourse.reviewsId[0]) {
    return next(new ErrorResponse(`there's no reviews for this course.`, 404));
  }

  // send response
  res.status(200).json({
    success: true,
    message: `successfully get reviews.`,
    data: {
      kind: `reviews`,
      count: currentCourse.reviewsId.length,
      items: currentCourse.reviewsId
    }
  });

});

// @route   GET `/api/v1/mentor/dashboard/courses`
// @desc    get courses that created by mentor
// @access  private (just mentor can see it)
exports.getMentorCourses = asyncHandler(async (req, res, next) => {

  // search on user
  const currentUser = await Mentor
    .findById(req.user.id)
    .populate({
      path: `coursesId`,
      select: `_id title description picture`,
      model: Course
    });
  
  // check if mentor has no courses
  if(!currentUser.coursesId[0]) {
    return next(new ErrorResponse(`there's no courses created by this mentor.`, 404));
  }

  // send response
  res.status(200).json({
    success: true,
    message: `successfully get mentor courses.`,
    data: {
      kind: `courses`,
      count: currentUser.coursesId.length,
      items: currentUser.coursesId
    }
  });
  
});

// @route   POST `/api/v1/add-review`
// @desc    add new review to course
// @access  private (only guardian can add reviews)
exports.postReview = asyncHandler(async (req, res, next) => {

  // find course with givin id
  const course = await Course.findById(req.body.params.courseId);
  
  // check if there's no course with givin id
  if(!course) {
    return next(new ErrorResponse(`Course not found with givin id.`, 404));
  }

  // create new review
  const newReview = await Review.create({
    rate: req.body.params.rate,
    description: req.body.params.description,
    courseId: req.body.params.courseId,
    guardianId: req.user.id
  });

  // increase reviewCounter by 1 and push new review id to course
  course.reviewCounter++;
  course.reviewsId.push(newReview._id);
  await course.save();

  // send response
  res.status(201).json({
    success: true,
    message: `review created successfully.`,
    data: {
      kind: `guardian`,
      items: [{
        reviewId: newReview._id,
        giardian: {
          fullName: req.user.fullName,
          picture: req.user.picture
        }
      }]
    }
  });

  // adding new review to topRewviews in mentor who created current course
  // filter reviews by rate, only reviews with rate equal or greater than 4 will added to topReviews
  if(newReview.rate >= 4) {

    // find mentor to access to top reviews
    const currentMentor = await Mentor.findById(course.mentorId);

    // check if the length of top reviews is less than 4
    // and if so add the id of new review to the begining of top review array
    if(currentMentor.topReviewsId.length < 4) {
      currentMentor.topReviewsId.unshift(newReview._id);
      await currentMentor.save();
    }
    
    // check if tha maximum length of top reviews is 4
    // and if so remove the oldest review then add the new one to the begining of top review array
    else {
      currentMentor.topReviewsId.pop();
      currentMentor.topReviewsId.unshift(newReview._id);
      await currentMentor.save();
    }

  }

});

// @route   POST `/api/v1/mentor/dashboard/new-course`
// @desc    add new course by mentor
// @access  private (only mentor can add new course)
exports.postCourse = asyncHandler(async (req, res, next) => {

  // just for testing
  /* req.user = {
    person: `mentor`,
    id: `606f00646adcf04d84c70a6b`
  }
  req.body = {
    method: 'post.course',
    params: {
      title: 'title',
      price: 123,
      description: 'description',
      topicList: [
        'thing-2',
        'thing-2',
        'thing-3'
      ],
      genre: 'Art',
      topicsList: [`thing`]
    }
  } */

  let isFiles = false;
  
  // check if one or more images uploaded as course picture
  if(req.files) {
    isFiles = true;
    if(Array.isArray(req.files.picture)) {
      return next(new ErrorResponse(`please chose only one image to upload as course picture.`, 400));
    }
  }
  
  // create global virables to set picture path and media urls path
  let picturePath;
  let mediaURLSPath = [];
  
  // check if there's no files uploaded
  if(isFiles) {
    
    // handle course picture uploading
    // check if there's course picture uploaded
    if(!req.files.picture) {
      return next(new ErrorResponse(`file: please add course picture.`, 400));
    }

    // set name of course picture
    let pictureName = `image-course-${req.user.person}-${Date.now()}${path.parse(req.files.picture.name).ext}`;
    
    // set dir of images and videos
    let pictureDir = `${__dirname}/../public/images/${pictureName}`;
    
    // set path of course picture 
    picturePath = `/images/${pictureName}`;
    
    // set size limit of course picture
    if(req.files.picture.size > 8 * 1024 * 1024) {
      return next(new ErrorResponse(`file: max size of course picture is 8 mb`, 400));
    }

    // check mime type of course picture
    if(!req.files.picture.mimetype.startsWith(`image`)) {
      return next(new ErrorResponse(`file: course picture can only be image.`, 400));
    }

    // start upload course picture
    req.files.picture.mv(pictureDir, (err) => {
      if(err) {

        // set path of files to send it to next middleware
        req.filesPath = {
          coursePicture: picturePath
        }

        return next(new ErrorResponse(`file: ${err.message}`, 500));
      }
    });


    // handle course's media uploading
    // check if there's course's media uploaded
    if(req.files.mediaUrls) {

      // set mediaLength and isMultiblefiles as global variables to check if media is multible files or one file
      let mediaLength = 1;
      let isMultiblefiles = false;

      // check if media is multible files uploaded
      if(Array.isArray(req.files.mediaUrls)) {
        mediaLength = req.files.mediaUrls.length;
        isMultiblefiles = true;
      }
      
      // loop on mediaURLS array
      for(let i = 0; i < mediaLength ; i++) {

        // set some of public variables to use them in uploading process
        let file = req.files.mediaUrls;
        let fileType;
        let imageSizeLimit = 8 * 1024 * 1024;
        let videoSizeLimit = 30 * 1024 * 1024;
        let fileSizeLimit;

        // check if media is multible files uploaded
        if(isMultiblefiles) {
          file = req.files.mediaUrls[i];
        }

        // check mimetype
        if(file.mimetype.startsWith(`video`)) {
          fileType = `video`;
          fileSizeLimit = videoSizeLimit;
        }
        else if(file.mimetype.startsWith(`image`)){
          fileType = `image`;
          fileSizeLimit = imageSizeLimit;
        }
        else {

          // set path of files to send it to next middleware
          req.filesPath = {
            coursePicture: picturePath,
            mediaUrls: mediaURLSPath
          }

          return next(new ErrorResponse(`file: only images and videos can be uploaded.`, 400));
        }
        
        // set image name and video name
        let mediaName = `${fileType}-course-${req.user.person}-${Date.now()}${path.parse(file.name).ext}`;

        // set image dir and video dir
        let mediaDir = `${__dirname}/../public/${fileType}s/${mediaName}`;

        // set path of image and video
        let mediaPath = `/${fileType}s/${mediaName}`;
      
        // set size limit
        if(file.size > fileSizeLimit) {
          
          // set path of files to send it to next middleware
          req.filesPath = {
            coursePicture: picturePath,
            mediaUrls: mediaURLSPath
          }

          return next(new ErrorResponse(`file: max size of ${fileType} is ${fileSizeLimit / 1024 / 1024} mb`, 400));
        }

        // push current media to mediaURLSPath array
        mediaURLSPath.push(mediaPath);

        // start upload process
        file.mv(mediaDir, (err) => {
          if(err) {

            // set path of files to send it to next middleware
            req.filesPath = {
              coursePicture: picturePath,
              mediaUrls: mediaURLSPath
            }

            return next(new ErrorResponse(`file: ${err.message}`, 500));
          }
        });

      }

    }

  }

  // create new course
  await Course.create({
    title: req.body.params.title,
    price: req.body.params.price,
    description: req.body.params.description,
    picture: picturePath,
    topicsList: req.body.params.topicsList,
    mediaURLS: mediaURLSPath,
    genre: req.body.params.genre,
    mentorId: req.user.id
  }, (err) => {

    // check if there's an error with creating new course
    if(err) {
      
      // delete course picture if exist
      if(picturePath) {
        fs.unlinkSync(`${__dirname}/../public${picturePath}`);

        // clear picture path after deleting file
        picturePath = ``;
      }

      // delete course media
      if(mediaURLSPath[0]) {
        for(let i = 0; i < mediaURLSPath.length; i++) {
          fs.unlinkSync(`${__dirname}/../public${mediaURLSPath[i]}`);
        }

        // clear pathes after deleting files
        mediaURLSPath = [];
      }

      // set new errorResponse
      return next(new ErrorResponse(err.message, 400));

    }
    
    // send response
    return res.status(201).json({
      success: true,
      message: `Course created successfully.`
    });

  });

});

// @route   GET `/api/v1/courses/:id`
// @desc    update paricular course
// @access  private (only mentor can update his own courses)
exports.putCourse = asyncHandler(async (req, res, next) => {

  
  
});