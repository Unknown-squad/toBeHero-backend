// load requried packages
const asyncHandler = require(`../middlewares/async`);
const Course = require(`../models/courses`);
const Mentor = require(`../models/mentors`);
const Review = require(`../models/reviews`);
const Guardian = require(`../models/guardians`);

// @route   GET `/api/v1/courses/:id`
// @desc    get one course
// @access  public
exports.getOneCourse = asyncHandler(async (req, res) => {

  // find course with givin id and pupulate mentorId
  const course = await Course.findById(req.params.id).populate({
    path: `mentorId`,
    select: `_id fullName picture isAvailable`,
    model: Mentor
  });

  // handle if there's no course with givin id
  if(!course) {
    throw new Error(`no content`);
  }

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
exports.getCourses = asyncHandler(async (req, res) => {

  // Genre
  if(!req.query.genre) {
    throw new Error(`no genre`);
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
  if(courses.length == 0) {
    throw new Error(`no data`);
  }
  
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
exports.getReviews = asyncHandler(async (req, res) => {

  // handle pagination
  let page = parseInt(req.query.page, 10) || 1;
  let limit = 5;

  if(page <= 0) {
    page = 1;
  }
  
  // find reviews
  const reviews = await Review
    .find({courseId: req.params.courseId})
    .select(`-id -courseId`)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(`-creatingDate`)
    .populate({
      path: `guardianId`,
      select: `fullName picture -_id`,
      model: Guardian
    });

    // handle if there's no reviews in current page
    if(reviews.length === 0) {
      throw new Error(`no data`);
    }

  res.status(200).json({
    success: true,
    message: `successfully get reviews.`,
    data: {
      kind: `reviews`,
      count: reviews.length,
      items: reviews
    }
  });

});

// @route   GET `/api/v1/mentor/dashboard/courses`
// @desc    get courses that created by mentor
// @access  private (just mentor can see it)
exports.getMentorCourses = asyncHandler(async (req, res) => {

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