// load requried packages
const asyncHandler = require(`../middlewares/async`);
const ErrorResponse = require(`../utils/errorResponse`);
const Course = require(`../models/courses`);
const Mentor = require(`../models/mentors`);
const Review = require(`../models/reviews`);
const Guardian = require(`../models/guardians`);

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
  
  // check if user is mentor or not
  if(!currentUser) {
    throw new Error(`forbidden`);
  }

  // check if mentor has no courses yet
  if(!currentUser.coursesId[0]) {
    throw new Error(`no data`);
  }

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

  // check if user is authorized to add new review
  if(req.user.person !== `guardian`) {
    return next(new ErrorResponse(`forbidden.`, 403));
  }

  // create new review
  const newReview = await Review.create({
    rate: req.body.params.rate,
    description: req.body.params.description,
    courseId: req.body.params.courseId,
    guardianId: req.user.id
  });

  // find course with givin id
  const course = await Course.findById(req.body.params.courseId);

  // check if there's no course with givin id
  if(!course) {
    return next(new ErrorResponse(`Course not found with givin id.`, 404));
  }

  // update course data
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

});