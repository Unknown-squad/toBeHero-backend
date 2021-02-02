// load required packages
const express = require(`express`);
const router = express.Router();
const {getOneCourse,
       getCourses,
       getReviews} = require(`../controllers/course`);

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

// router.post(`/api/v1/session`, setSession);

module.exports = router;