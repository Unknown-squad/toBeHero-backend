// modules requirements
const express = require(`express`);
const router = express.Router();

// middlewares files
const {
    authorizedMentor,
    acceptedIfUserLoggedIn
} = require(`../middlewares/authorizedAccepted`);

// controllers files
const {
    getBasicInfoOfMentor,
    getMentorBalace,
    getMentorAnalytics,
    getMentorIsAvailable,
    putMentorIsAvailable,
    getMentorProfile,
    getMentorCourses,
    updateMentorInfo,
    authorzithedUpdateAdvSetting,
    changeMentorPassword,
    changeMentorPicture,
    changeMentorPhone
} = require(`../controllers/mentor`)

// @desc    get mentor's basic info 
// @route   Get '/api/v1/mentor/dashboard/basic-info'
// @access  private(mentor)
router
    .route('/api/v1/mentor/dashboard/basic-info')
    .get(acceptedIfUserLoggedIn, authorizedMentor, getBasicInfoOfMentor)

// @desc    get mentor's balance
// @route   Get '/api/v1/mentor/dashboard/balance'
// @access  private(mentor)
router
    .route('/api/v1/mentor/dashboard/balance')
    .get(acceptedIfUserLoggedIn, authorizedMentor, getMentorBalace)

// @desc    get mentor's analytics
// @route   Get '/api/v1/mentor/dashboard/analytics'
// @access  private(mentor)
router
    .route('/api/v1/mentor/dashboard/analytics')
    .get(acceptedIfUserLoggedIn, authorizedMentor, getMentorAnalytics)

// @desc  get mentor's Mentor availability status
// @desc   update mentor's availability status
// @route   get '/api/v1/mentor/availability'
// @route   PUT '/api/v1/mentor/availability'
// @access  private(mentor)
router
    .route('/api/v1/mentor/availability')
    .get(acceptedIfUserLoggedIn, authorizedMentor, getMentorIsAvailable)
    .put(acceptedIfUserLoggedIn, authorizedMentor, putMentorIsAvailable)

// @desc    get mentor's profile
// @route   Get '/api/v1/mentor/profile/:mentorId'
// @access  public
router
    .route('/api/v1/mentor/profile/:mentorId')
    .get(getMentorProfile)

// @desc    get mentor's courses
// @route   Get '/api/v1/mentor/courses/:mentorId'
// @access  public
router
    .route('/api/v1/mentor/courses/:mentorId')
    .get(getMentorCourses)

// @desc    update mentor's courses
// @route   PUT '/api/v1/mentor/dashboard/basic-info'
// @access  privet(mentor)
router
    .route('/api/v1/mentor/dashboard/basic-info')
    .put(acceptedIfUserLoggedIn, authorizedMentor, updateMentorInfo);

// @desc    authorizithed user to change emial or password or phone number
// @route   POST '/api/v1/mentor/dashboard/authorization'
// @access  privet(mentor)
router
    .route('/api/v1/mentor/dashboard/authorization')
    .post(acceptedIfUserLoggedIn, authorizedMentor, authorzithedUpdateAdvSetting);

// @desc    change password
// @route   PUT '/api/v1/mentor/dashboard/change-password'
// @access  privet(mentor)
router
    .route('/api/v1/mentor/dashboard/change-password')
    .put(acceptedIfUserLoggedIn, authorizedMentor, changeMentorPassword);

/* // @desc    change email
// @route   PUT '/api/v1/mentor/dashboard/change-email'
// @access  privet(mentor)
router
    .route('/api/v1/mentor/dashboard/change-email')
    .put(authorizedMentor, changeMentorEmail); */

// @desc    change picture profile
// @route   PUT '/api/v1/mentor/dashboard/picture'
// @access  privet(mentor)
router
    .route('/api/v1/mentor/dashboard/picture')
    .put(acceptedIfUserLoggedIn, authorizedMentor, changeMentorPicture);

// @desc    change user phone number
// @route   PUT '/api/v1/mentor/dashboard/phone'
// @access  privet(mentor)
router
    .route('/api/v1/mentor/dashboard/phone')
    .put(acceptedIfUserLoggedIn, authorizedMentor, changeMentorPhone);
        
module.exports = router