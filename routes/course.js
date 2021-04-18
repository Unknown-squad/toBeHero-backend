// load required packages
const express = require(`express`);
const router = express.Router();
const {getOneCourse,
       getCourses,
       getReviews,
       getMentorCourses,
       postReview,
       postCourse,
       putCourse} = require(`../controllers/course`);
const {
       acceptIfGuardian,
       acceptIfMentor} = require(`../middlewares/acceptIfAuthorized`);

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
router.get(`/api/v1/mentor/dashboard/courses`, acceptIfMentor, getMentorCourses);

// @route   POST `/api/v1/add-review`
// @desc    add new review to course
// @access  private (only guardian can add reviews)
router.post(`/api/v1/add-review`, acceptIfGuardian, postReview);

// @route   POST `/api/v1/mentor/dashboard/new-course`
// @desc    add new course by mentor
// @access  private (only mentor can add new course)
router.post(`/api/v1/mentor/dashboard/new-course`, acceptIfMentor, postCourse);

// @route   GET `/api/v1/courses/:id`
// @desc    update paricular course
// @access  private (only mentor can update his own courses)
router.put(`/api/v1/courses/:id`, acceptIfMentor, putCourse);

module.exports = router;