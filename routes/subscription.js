// Load required packages
const express = require('express');
const router = express.Router();
const subscription = require('../controllers/subscription');



// @desc    get all subscription for spicific mentor
// @route   Get localhost:3000/api/v1/mentor/subscriptions
// @access  private
router.get('/api/v1/mentor/subscriptions', subscription.getOneMentorSubscription);



// @desc    get one subscription for spicific mentor
// @route   Get localhost:3000/api/v1/mentor/subscriptions/:subscriptionId
// @access  private
router.get('/api/v1/mentor/subscription/:subscriptionId', subscription.getOneMentorSubscription);



// @desc    Add new appiontment
// @route   Post localhost:3000/api/v1/mentor/subscription/:subscriptionId/add-appointment
// @access  private
router.post('/api/v1/mentor/subscription/:subscriptionId/add-appointment', subscription.addNewAppiontment);



// @desc    get all subscription for child
// @route   Get localhost:3000/api/v1/child/home
// @access  private
router.get('/api/v1/child/home', subscription.getAllChildSubscriptions);


module.exports = router;