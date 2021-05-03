// modules requirements
const express = require(`express`);
const router = express.Router();

// middlewares files
const {
    authorizedMentor,
    accectIfUserLoggedIn,
    accectIfUserLoggedOut,
    accectIfUserAuthenticated
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
    loginStatus
} = require(`../controllers/auth.js`);

// @desc    create sign up as guardian
// @route   POST `/api/v1/guardian/signup`
// @access  public
router.route(`/api/v1/guardian/signup`)
    .post(accectIfUserLoggedOut, signUpAsGuardian);

// @desc    login user
// @route   POST `/api/v1/user/verify-email`
// @access  public
router.route(`/api/v1/user/login`)
    .post(accectIfUserLoggedOut, loginUser);

// @desc    verify email of user
// @route   POST `/api/v1/user/login`
// @access  public
router.route(`/api/v1/user/verify-email`)
    .post(accectIfUserLoggedOut, accectIfUserAuthenticated, verifyEmail);

// @desc    sign up as mentor
// @route   POST `/api/v1/mentor/signUp`
// @access  public
router.route(`/api/v1/mentor/signUp`)
    .post(accectIfUserLoggedOut, sginUpAsMenter);

// @desc    reset password by first step, step 1: send token by mail to user allow him to change password
// @route   POST `/api/v1/user/reset-step-1`
// @access  public
router.route(`/api/v1/user/reset-step-1`)
    .post(accectIfUserLoggedOut, resetPasswordStepOne);

// @desc    reset password by steps, step 2: user will enter token to authrized him to change password
// @route   POST `/api/v1/user/reset-step-2`
// @access  private (authenticated user)
router.route(`/api/v1/user/reset-step-2`)
    .post(accectIfUserLoggedOut, accectIfUserAuthenticated, resetPasswordStepTwo);

// @desc    reset password by steps, step 3: write password if user authorized
// @route   PUT `/api/v1/user/reset-step-3`
// @access  private (authenticated user)
router.route(`/api/v1/user/reset-step-3`)
    .put(accectIfUserLoggedOut, accectIfUserAuthenticated, resetPasswordStepThree);

// @desc    logout user
// @route   DELETE `/api/v1/user/logout`
// @access  private (user login)
router.route(`/api/v1/user/logout`)
    .delete(accectIfUserLoggedIn, logout);

// @desc    get login status user
// @route   GET `/api/v1/user/login/status`
// @access  private (user login)
router.route(`/api/v1/user/login/status`)
    .get(loginStatus);
    
module.exports = router