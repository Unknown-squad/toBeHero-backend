// Load required packages
const express = require('express');
const router = express.Router();
const subscription = require('../controllers/subscription');


// @desc    get all subscription courses for spicific mentor
// @route   Get localhost:3000/api/v1/mentor/subscriptions
// @access  private
router.get('/api/v1/mentor/subscriptions', subscription.getAllSubscriptions);


module.exports = router;