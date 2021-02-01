// load required packages
const express = require(`express`);
const router = express.Router();
const {getOneCourse} = require(`../controllers/course`);

// @route   GET `/api/v1/courses/:id`
// @desc    get one course
// @access  public
router.get(`/api/v1/courses/:id`, getOneCourse);

module.exports = router;