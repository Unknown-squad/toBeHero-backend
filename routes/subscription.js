// Load required packages
const express = require('express');
const router = express.Router();
const subscription = require('../controllers/subscription');
const subscriptionAuthorization = require('../middlewares/subscriptionAuthorization');

// middlewares files
const {
  acceptedIfUserLoggedIn
} = require(`../middlewares/authorizedAccepted`);

// @desc    get all subscription for spicific mentor
// @route   Get localhost:3000/api/v1/mentor/subscriptions
// @access  private/mentor
router.get('/api/v1/mentor/subscriptions', acceptedIfUserLoggedIn, subscriptionAuthorization.mentorAuthorization, subscription.getMentorSubscriptions);



// @desc    get one subscription for spicific mentor
// @route   Get localhost:3000/api/v1/mentor/subscriptions/:subscriptionId
// @access  private/mentor
router.get('/api/v1/mentor/subscription/:subscriptionId', acceptedIfUserLoggedIn, subscriptionAuthorization.mentorAuthorization, subscription.getOneMentorSubscription);



// @desc    Add new appiontment
// @route   Post localhost:3000/api/v1/mentor/subscription/:subscriptionId/add-appointment
// @access  private/mentor
router.post('/api/v1/mentor/subscription/:subscriptionId/add-appointment', acceptedIfUserLoggedIn, subscriptionAuthorization.mentorAuthorization, subscription.addNewAppiontment);



// @desc    get all subscription for child
// @route   Get localhost:3000/api/v1/child/home
// @access  private/child
router.get('/api/v1/child/home', acceptedIfUserLoggedIn, subscriptionAuthorization.childAuthorization, subscription.getAllChildSubscriptions);



// @desc    Get child's subscription for guardian
// @route   Get localhost:3000/api/v1/guardian/child-subscription/childId
// @access  private/guardian
router.get('/api/v1/guardian/child-subscription/:childId', acceptedIfUserLoggedIn, subscriptionAuthorization.guardianAuthorization, subscription.getChildSubsForGuardian);



// @desc    Get child's subscription for guardian
// @route   Get localhost:3000/api/v1/guardian/child-subscription/childId/subscriptionId
// @access  private/guardian
router.get('/api/v1/guardian/child-subscription/:childId/:subscriptionId', acceptedIfUserLoggedIn, subscriptionAuthorization.guardianAuthorization, subscription.getChildSubForGuardian);



// @desc    Handle completed courses
// @route   POST localhost:3000/api/v1/mentor/complete-subscription/subscriptionId
// @access  private/mentor
router.post('/api/v1/mentor/complete-subscription/:subscriptionId', acceptedIfUserLoggedIn, subscriptionAuthorization.mentorAuthorization, subscription.finishCourse);


module.exports = router;