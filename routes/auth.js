// modules requirements
const express = require(`express`);
const router = express.Router();

// middlewares files
const authorizedMentor = require(`../middlewares/authorizedMentor`);

// controllers files
const {
    signUpAsGuardian,
    loginUser
} = require(`../controllers/auth.js`);

// @desc    create sign up as guardian
// @route   POST `/api/v1/guardian/signup`
// @access  public
router.route(`/api/v1/guardian/signup`)
    .post(signUpAsGuardian);

// @desc    login user
// @route   POST `/api/v1/user/login`
// @access  public
router.route(`/api/v1/user/login`)
    .post(loginUser)
module.exports = router