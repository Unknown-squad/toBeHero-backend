// modules requirements
const express = require(`express`);
const router = express.Router();

// middlewares files
const {
    authorizedMentor,
    acceptedIfUserLoggedIn,
    acceptedtIfUserLoggedOut,
    acceptedIfUserAddInfoInSsnCookie
} = require(`../middlewares/authorizedaccepted`);

// controllers files
const {
    signUpAsGuardian,
    loginUser,
    verifyEmail,
    sginUpAsMenter,
    resetPasswordStepOne,
    resetPasswordStepTwo,
    resetPasswordStepThree,
    logout,
    userStatus,
    statusEmail
} = require(`../controllers/auth.js`);

// @desc    create sign up as guardian
// @route   POST `/api/v1/guardian/signup`
// @access  public
router.route(`/api/v1/guardian/signup`)
    .post(acceptedtIfUserLoggedOut, signUpAsGuardian);

// @desc    login user
// @route   POST `/api/v1/user/verify-email`
// @access  public
router.route(`/api/v1/user/login`)
    .post(acceptedtIfUserLoggedOut, loginUser);

// @desc    verify email of user
// @route   POST `/api/v1/user/login`
// @access  public
router.route(`/api/v1/user/verify-email`)
    .post(acceptedtIfUserLoggedOut, acceptedIfUserAddInfoInSsnCookie, verifyEmail);

// @desc    sign up as mentor
// @route   POST `/api/v1/mentor/signUp`
// @access  public
router.route(`/api/v1/mentor/signUp`)
    .post(acceptedtIfUserLoggedOut, sginUpAsMenter);

// @desc    send token in mail to user email to verify user account
// @route   POST `/api/v1/user/password/reset-step-1`
// @access  public
router.route(`/api/v1/user/password/reset-step-1`)
    .post(acceptedtIfUserLoggedOut, resetPasswordStepOne);

// @desc    allow user to change password
// @route   POST `/api/v1/user/password/reset-step-2`
// @access  private (authenticated user)
router.route(`/api/v1/user/password/reset-step-2`)
    .post(acceptedtIfUserLoggedOut, acceptedIfUserAddInfoInSsnCookie, resetPasswordStepTwo);

// @desc    user change pasword if authorized
// @route   PUT `/api/v1/user/password/reset-step-3`
// @access  private (authenticated user)
router.route(`/api/v1/user/password/reset-step-3`)
    .put(acceptedtIfUserLoggedOut, acceptedIfUserAddInfoInSsnCookie, resetPasswordStepThree);

// @desc    logout user
// @route   DELETE `/api/v1/user/logout`
// @access  private (user login)
router.route(`/api/v1/user/logout`)
    .delete(acceptedIfUserLoggedIn, logout);

// @desc    get login status user
// @route   GET `/api/v1/user/status`
// @access  private (user login)
router.route(`/api/v1/user/status`)
    .get(userStatus);

// @desc    check if email already exists
// @route   GET `/api/v1/email/status`
// @access  public
router.route(`/api/v1/email/status/:userEmail`)
    .get(statusEmail);
    
module.exports = router