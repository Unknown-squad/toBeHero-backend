// Load required packages
const express = require('express');
const router = express.Router();
const subscription = require('../controllers/subscription');



// @desc    get all subscription for spicific mentor
// @route   Get localhost:3000/api/v1/mentor/subscriptions
// @access  private/mentor
router.get('/api/v1/mentor/subscriptions', subscription.getMentorSubscriptions);



// @desc    get one subscription for spicific mentor
// @route   Get localhost:3000/api/v1/mentor/subscriptions/:subscriptionId
// @access  private/mentor
router.get('/api/v1/mentor/subscription/:subscriptionId', subscription.getOneMentorSubscription);



// @desc    Add new appiontment
// @route   Post localhost:3000/api/v1/mentor/subscription/:subscriptionId/add-appointment
// @access  private/mentor
router.post('/api/v1/mentor/subscription/:subscriptionId/add-appointment', subscription.addNewAppiontment);



// @desc    get all subscription for child
// @route   Get localhost:3000/api/v1/child/home
// @access  private/child
router.get('/api/v1/child/home', subscription.getAllChildSubscriptions);



// @desc    Get child's subscription for guardian
// @route   Get localhost:3000/api/v1/guardian/child-subscription/childId
// @access  private/guardian
router.get('/api/v1/guardian/child-subscription/:childId', subscription.getChildSubsForGuardian);



// @desc    Get child's subscription for guardian
// @route   Get localhost:3000/api/v1/guardian/child-subscription/childId/subscriptionId
// @access  private/guardian
router.get('/api/v1/guardian/child-subscription/:childId/:subscriptionId', subscription.getChildSubForGuardian);


module.exports = router;