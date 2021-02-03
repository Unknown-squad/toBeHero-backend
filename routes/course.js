// load required packages
const express = require(`express`);
const router = express.Router();
const {getOneCourse,
       getCourses,
       getReviews,
       getMentorCourses} = require(`../controllers/course`);

// @route   GET `/api/v1/courses/:id`
// @desc    get one course
// @access  public
router.get(`/api/v1/courses/:id`, getOneCourse);

// @route   GET `/api/v1/courses`
// @desc    get courses
// @access  public
router.get(`/api/v1/courses`, getCourses);

// @route   GET `/api/v1/reviews/:courseId`
// @desc    get reviews
// @access  public
router.get(`/api/v1/reviews/:courseId`, getReviews);

// @route   GET `/api/v1/mentor/dashboard/courses`
// @desc    get courses that created by mentor
// @access  private (just mentor can see it)
router.get(`/api/v1/mentor/dashboard/courses`, getMentorCourses);

module.exports = router;