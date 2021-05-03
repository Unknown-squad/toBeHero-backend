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
    sginUpAsMenter,
    resetPasswordStepOne
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

// @desc    reset password by first step, step 1: send token by mail to user allow him to change password
// @route   POST `/api/v1/user/reset-step-1`
// @access  public
router.route(`/api/v1/user/reset-step-1`)
    .post(resetPasswordStepOne);
    
module.exports = router