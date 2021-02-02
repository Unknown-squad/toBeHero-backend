// modules requirements
const express = require(`express`);
const router = express.Router();

// middlewares files
const authorizedMentor = require(`../middlewares/authorizedMentor`)

// controllers files
const {
    getBasicInfoOfMentor,
    getMentorBalace
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

module.exports = router