// load requried packages
const asyncHandler = require(`../middlewares/async`);
const ErrorResponse = require(`../utils/errorResponse`);
const Course = require(`../models/courses`);
const Mentor = require(`../models/mentors`);
const Review = require(`../models/reviews`);
const Guardian = require(`../models/guardians`);
const path = require(`path`);
const fs = require(`fs`);
const {filterArray} = require(`../utils/filterArray`);
const mongoose = require(`mongoose`);

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
  
  // Sort
  let sortby;
  
  // Genre
  if(!req.query.genre) {
    
    // search on every genre
    req.query.genre = ['Art', 'Music', 'Programming', 'Drawing', 'Quran', 'Physics', 'Mathematics', 'Chemistry', 'Philosophy'];

    // return courses in descending order of subscription number
    sortby = ` -subscriptionNumber`;

  }

  // hndle sorting
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
  let limit = 24;
  if(page < 0) {
    page = 1;
  }
  
  // get count of all document in course collection
  const courseCount = await Course.countDocuments();

  // get numbet of total pages
  const totalPages = Math.ceil(courseCount/limit);
  
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
    currentPage: page,
    totalPages,
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
  let limit = 4;

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
  if(currentCourse.reviewsId.length === 0) {
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
  if(currentUser.coursesId.length === 0) {
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

  // find guardian by his id and get his data
  const currentGuardian = await Guardian.findById(req.user.id);

  // send response
  res.status(201).json({
    success: true,
    message: `review created successfully.`,
    data: {
      kind: `guardian`,
      items: [{
        reviewId: newReview._id,
        guardian: {
          fullName: currentGuardian.fullName,
          picture: currentGuardian.picture
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
 /*  req.body = {
    method: 'post.course',
    params: {
      title: 'learn quran for kids',
      price: 8888,
      description: 'Learning Quran is a very noble act, which every Muslim should be performing daily. It gives him/her knowledge about all aspects of life, also brings him/her near to the Creator, and will be a proof of the rewards of his/her good deeds on the Day of Judgment.',
      topicsList: [
        'recitation',
        'Preservation'
      ],
      genre: 'Quran'
    }
  } */
  // end of testing
  
  // create global virables to set picture path and media urls path
  let picturePath;
  let mediaURLSPath = [];
  
  // check if there's no files to upload
  if(req.files) {
    
    // check if one or more images uploaded as course picture
    if(Array.isArray(req.files.picture)) {
      return next(new ErrorResponse(`please chose only one image to upload as course picture.`, 400));
    }
    
    // handle course picture uploading
    // check if there's course picture uploaded
    if(!req.files.picture) {
      return next(new ErrorResponse(`file: please add course picture.`, 400));
    }

    // set name of course picture
    let pictureName = `image-${req.user.person}-${Date.now()}${mongoose.Types.ObjectId()}${path.parse(req.files.picture.name).ext}`;
    
    // set dir of images and videos
    let pictureDir = `${__dirname}/../public/images/${pictureName}`;
    
    // set path of course picture 
    picturePath = `/images/${pictureName}`;
    
    // set size limit of course picture
    if(req.files.picture.size > 5 * 1024 * 1024) {
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
        
        // set maximum number of media to 5
        if(req.files.mediaUrls.length > 5) {

          req.filesPath = {
            coursePicture: picturePath
          }

          return next(new ErrorResponse(`file: max number of media files is 5`, 400));
        }
        
        // handle media files as array
        mediaLength = req.files.mediaUrls.length;
        isMultiblefiles = true;
      }
      
      // loop on mediaURLS array
      for(let i = 0; i < mediaLength ; i++) {

        // set some of public variables to use them in uploading process
        let file = req.files.mediaUrls;
        let fileType;
        let imageSizeLimit = 5 * 1024 * 1024;
        let videoSizeLimit = 100 * 1024 * 1024;
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
        let mediaName = `${fileType}-${req.user.person}-${Date.now()}${mongoose.Types.ObjectId()}${path.parse(file.name).ext}`;

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
  }, async (err, user) => {

    // check if there's an error with creating new course
    if(err) {
      
      // delete course picture if exist
      if(picturePath) {
        fs.unlinkSync(`${__dirname}/../public${picturePath}`);

        // clear picture path after deleting file
        picturePath = ``;
      }

      // delete course media
      if(mediaURLSPath.length !== 0) {
        for(let i = 0; i < mediaURLSPath.length; i++) {
          fs.unlinkSync(`${__dirname}/../public${mediaURLSPath[i]}`);
        }

        // clear paths after deleting files
        mediaURLSPath = [];
      }

      // set new errorResponse
      return next(new ErrorResponse(err.message, 400));

    }

      // send response
      res.status(201).json({
        success: true,
        message: `Course created successfully.`
      });

      // find mentor by his id
      const currentMentor = await Mentor.findById(req.user.id);
    
      // update coursesId array in mentor model
      currentMentor.coursesId.push(user._id);
      await currentMentor.save();

    });

});

// @route   PUT `/api/v1/courses/:id`
// @desc    update particular course
// @access  private (only mentor can update his own courses)
exports.putCourse = asyncHandler(async (req, res, next) => {

  // just for testing
  /* req.body = {
    method: 'post.course',
    params: {
      title: 'rmrm',
      price: 6969,
      description: 'alien course',
      topicsList: [
        '69 thing 69',
        '69 thing 69',
        '69 thing 69'
      ],
      genre: 'Music',
      mediaUrls: [
        "/images/image-mentor-16193095037856084b3bf13624d83d7ec1dad.jpg",
        "/images/image-mentor-16193095037866084b3bf13624d83d7ec1dae.jpg",
        "/images/image-mentor-16193095037866084b3bf13624d83d7ec1daf.jpg",
        "/images/image-mentor-16193095037866084b3bf13624d83d7ec1db0.jpg"
      ],
      // picture: `/images/image-course-mentor-16183563497106076287d0e0cdc372ccabe6c.jpg`
    }
  } */
  // end of testing
  
    // check if there's no body with request
    if(!req.body || !req.body.params) {
      return next(new ErrorResponse(`The body of request and params is required.`));
    }
  
  // find course with given id
  const currentCourse = await Course.findById(req.params.id);
  
  // check if there's course found with given id
  if(!currentCourse) {
    return next(new ErrorResponse(`there's no such course found with given id.`, 404));
  }

  // check if mentor is authorized to update this course
  if(req.user.id != currentCourse.mentorId) {
    return next(new ErrorResponse(`forbidden.`, 403));
  }
  
  // set maximum number of uploaded files
  if(req.body.params.mediaUrls.length > 5) {
    return next(new ErrorResponse(`max number of media files is 5`, 400));
  }

  // create global virables to set picture path and media urls path
  let oldPicturePath = currentCourse.picture;
  let newPicturePath;
  let picturePath;
  let oldMediaURLSPath = req.body.params.mediaUrls;
  let newMediaURLSPath = [];
  let deletedPicture;
  let deletedMedia = [];

  // handle probability of no new files uploaded
  if(!req.files) {

    // keep old picture path
    picturePath = oldPicturePath;

    // check if there's no media and prepare to remove the old
    if(!req.body.params.mediaUrls || req.body.params.mediaUrls.length == 0) {

      // add media in course to deleted media and prepare to delete them
      deletedMedia = currentCourse.mediaURLS;

    } else if(req.body.params.mediaUrls || req.body.params.mediaUrls != 0) {

      // get diffrent paths between course media paths and request media paths
      deletedMedia = filterArray(currentCourse.mediaURLS, req.body.params.mediaUrls);

    }

  }
  else {

    // check if there's no media with body on the request
    if(!req.body.params.mediaUrls || req.body.params.mediaUrls.length == 0) {
      deletedMedia = currentCourse.mediaURLS;
    }

    // handle if mediaURLS is exists
    else {

      // get diffrent paths between course media paths and request media paths
      deletedMedia = filterArray(currentCourse.mediaURLS, req.body.params.mediaUrls);

    }

    // handle course's picture uploading
    // check if picture is exist
    if(req.files.picture) {
      
      // set name of course picture
      let pictureName = `image-${req.user.person}-${Date.now()}${mongoose.Types.ObjectId()}${path.parse(req.files.picture.name).ext}`;
      
      // set dir of images and videos
      let pictureDir = `${__dirname}/../public/images/${pictureName}`;
      
      // set path of course picture 
      newPicturePath = `/images/${pictureName}`;
      
      // set size limit of course picture
      if(req.files.picture.size > 5 * 1024 * 1024) {
        return next(new ErrorResponse(`file: max size of course picture is 8 mb`, 400));
      }
      
      // check mime type of course picture
      if(!req.files.picture.mimetype.startsWith(`image`)) {
        return next(new ErrorResponse(`file: course picture can only be image.`, 400));
      }
      
      // start upload course picture
      req.files.picture.mv(pictureDir, (err) => {
        if(err) {
          return next(new ErrorResponse(`file: ${err.message}`, 500));
        }
      });

      // set course's picture to new picture
      picturePath = newPicturePath;
      
      // save path of old course picture preparing to delete it
      deletedPicture = currentCourse.picture;
      
    } else {

      // if there's not course picture uploaded, then keep old one
      picturePath = oldPicturePath;

    }
    
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

      // set maximum number of uploaded files
      if((req.body.params.mediaUrls.length + mediaLength) > 5) {

        // send new course picture to next middleware to delete it
        req.filesPath = {
          coursePicture: newPicturePath
        }

        return next(new ErrorResponse(`file: max number of media files is 5`, 400));

      }
      
      // loop on mediaURLS array
      for(let i = 0; i < mediaLength ; i++) {

        // set some of public variables to use them in uploading process
        let file = req.files.mediaUrls;
        let fileType;
        let imageSizeLimit = 5 * 1024 * 1024;
        let videoSizeLimit = 100 * 1024 * 1024;
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
            coursePicture: newPicturePath,
            mediaUrls: newMediaURLSPath
          }

          return next(new ErrorResponse(`file: only images and videos can be uploaded.`, 400));
        }
        
        // set image name and video name
        let mediaName = `${fileType}-${req.user.person}-${Date.now()}${mongoose.Types.ObjectId()}${path.parse(file.name).ext}`;

        // set image dir and video dir
        let mediaDir = `${__dirname}/../public/${fileType}s/${mediaName}`;

        // set path of image and video
        let mediaPath = `/${fileType}s/${mediaName}`;
      
        // set size limit
        if(file.size > fileSizeLimit) {
          
          // set path of files to send it to next middleware
          req.filesPath = {
            coursePicture: newPicturePath,
            mediaUrls: newMediaURLSPath
          }

          return next(new ErrorResponse(`file: max size of ${fileType} is ${fileSizeLimit / 1024 / 1024} mb`, 400));
        }

        // push current media to mediaURLSPath array
        newMediaURLSPath.push(mediaPath);

        // start upload process
        file.mv(mediaDir, (err) => {
          if(err) {

            // set path of files to send it to next middleware
            req.filesPath = {
              coursePicture: newPicturePath,
              mediaUrls: newMediaURLSPath
            }

            return next(new ErrorResponse(`file: ${err.message}`, 500));
          }
        });

      }

    }

  }

  // add old media urls to new media urls
  let mediaURLSPath = oldMediaURLSPath.concat(newMediaURLSPath);

  // update current course
  await currentCourse.updateOne({
    title: req.body.params.title,
    price: req.body.params.price,
    description: req.body.params.description,
    picture: picturePath,
    topicsList: req.body.params.topicsList,
    mediaURLS: mediaURLSPath,
    genre: req.body.params.genre
  }, (err) => {

    if(err) {

      // delete new course picture which uploaded by user
      if(newPicturePath) {
        fs.unlinkSync(`${__dirname}/../public${newPicturePath}`);
      }

      // delete new media which uploaded by user
      if(newMediaURLSPath || newMediaURLSPath.length !== 0) {
        for(let i = 0; i < newMediaURLSPath.length; i++) {
          fs.unlinkSync(`${__dirname}/../public${newMediaURLSPath[i]}`);
        }
      }

      return next(new ErrorResponse(err.message, 500));

    }

    if(!err && deletedMedia.length != 0) {
      
      // delete course's media that removed by user
      for(let i = 0; i < deletedMedia.length; i++) {
        
        // delete media
        fs.unlinkSync(`${__dirname}/../public${deletedMedia[i]}`);

      }

    }

    if(!err && deletedPicture) {

      // delete course picture that removed by user
      fs.unlinkSync(`${__dirname}/../public${deletedPicture}`);

    }

    // send response
    res.status(200).json({
      success: true,
      message: `course updated successfully`
    });

  });
  
});