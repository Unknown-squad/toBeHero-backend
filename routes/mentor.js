// modules requirements
const express = require(`express`);
const router = express.Router();

// middlewares files
const authorizedMentor = require(`../middlewares/authorizedMentor`)

// controllers files
const {
    getBasicInfoOfMentor,
    getMentorBalace,
    getMentorAnalytics,
    getMentorIsAvailable,
    putMentorIsAvailable
} = require(`../controllers/mentor`)

// @desc    get mentor's basic info 
// @route   Get '/api/v1/mentor/dashboard/basic-info'
// @access  private(mentor)
router
    .route('/api/v1/mentor/dashboard/basic-info')
    .get(authorizedMentor, getBasicInfoOfMentor)

// @desc    get mentor's balance
// @route   Get '/api/v1/mentor/dashboard/balance'
// @access  private(mentor)
router
    .route('/api/v1/mentor/dashboard/balance')
    .get(authorizedMentor, getMentorBalace)

// @desc    get mentor's analytics
// @route   Get '/api/v1/mentor/dashboard/analytics'
// @access  private(mentor)
router
    .route('/api/v1/mentor/dashboard/analytics')
    .get(authorizedMentor, getMentorAnalytics)

// @desc  get mentor's Mentor availability status
// @desc   update mentor's availability status
// @route   get '/api/v1/mentor/availability'
// @route   PUT '/api/v1/mentor/availability'
// @access  private(mentor)
router
    .route('/api/v1/mentor/availability')
    .get(authorizedMentor, getMentorIsAvailable)
    .put(authorizedMentor, putMentorIsAvailable)

module.exports = router