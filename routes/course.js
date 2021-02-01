// load required packages
const express = require(`express`);
const router = express.Router();
const {getOneCourse,
       getCourses} = require(`../controllers/course`);

// @route   GET `/api/v1/courses/:id`
// @desc    get one course
// @access  public
router.get(`/api/v1/courses/:id`, getOneCourse);

// @route   GET `/api/v1/courses`
// @desc    get courses
// @access  public
router.get(`/api/v1/courses`, getCourses);

module.exports = router;