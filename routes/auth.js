// modules requirements
const express = require(`express`);
const router = express.Router();

// middlewares files
const authorizedMentor = require(`../middlewares/authorizedMentor`);

// controllers files
const {
    signUpAsGuardian,
    loginUser,
    verifyEmail,
    sginUpAsMenter
} = require(`../controllers/auth.js`);

// @desc    create sign up as guardian
// @route   POST `/api/v1/guardian/signup`
// @access  public
router.route(`/api/v1/guardian/signup`)
    .post(signUpAsGuardian);

// @desc    verify email of user
// @route   POST `/api/v1/user/verify-email`
// @access  public
router.route(`/api/v1/user/login`)
    .post(loginUser);

// @desc    login user
// @route   POST `/api/v1/user/login`
// @access  public
router.route(`/api/v1/user/verify-email`)
    .post(verifyEmail);

// @desc    sign up as mentor
// @route   POST `/api/v1/mentor/signUp`
// @access  public
router.route(`/api/v1/mentor/signUp`)
    .post(sginUpAsMenter);
    
module.exports = router