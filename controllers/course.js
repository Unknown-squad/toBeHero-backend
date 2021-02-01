// load requried packages
const Course = require(`../models/courses`);
const Mentor = require(`../models/mentors`);
const asyncHandler = require(`../middlewares/async`);

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
    throw new Error(`no data in page`);
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