// Load required packages
const express = require('express');
const router = express.Router();
const {
  getChildrenDataForGuardian,
  geChildDataForGuardian,
  updateChildBasicInfo,
  addNewChild,
  getGurdianBasicInfo,
  updateGuardianBasicInfo,
  updateGuardianPicture,
  getCourseData,
  createSubscription
} = require('../controllers/guardian');
const {
  guardianAuthorization
} = require('../middlewares/guardianAuth');

// middlewares files
const {
  acceptedIfUserLoggedIn
} = require(`../middlewares/authorizedAccepted`);

// @desc    get all children date for spicific guardian
// @route   Get localhost:3000/api/v1/guardian/children
// @access  private/guardian
router.get('/api/v1/guardian/children', acceptedIfUserLoggedIn, guardianAuthorization, getChildrenDataForGuardian);



/* 
  First route
  @desc    get all children date for spicific guardian
  @route   Get localhost:3000/api/v1/child/childId
  @access  private/guardian
*/

/* 
  Second route
  @desc    Update basic info of particular child
  @route   Get localhost:3000/api/v1/child/childId
  @access  private/guardian
*/
router.route('/api/v1/child/:childId')
  .get(acceptedIfUserLoggedIn, guardianAuthorization, geChildDataForGuardian)
  .put(acceptedIfUserLoggedIn, guardianAuthorization, updateChildBasicInfo);



// @desc    Add new child
// @route   POST localhost:3000/api/v1/guardian/new-child
// @access  private/guardian
router.post('/api/v1/guardian/new-child', acceptedIfUserLoggedIn, guardianAuthorization, addNewChild);



/* 
  First route
  @desc    Get guardian basic information
  @route   GET localhost:3000/api/v1/guardian/basic-info
  @access  private/guardian
*/

/* 
  Second route
  @desc    Update guardian basic information
  @route   PUT localhost:3000/api/v1/guardian/basic-info
  @access  private/guardian
*/
router.route('/api/v1/guardian/basic-info')
  .get(acceptedIfUserLoggedIn, guardianAuthorization, getGurdianBasicInfo)
  .put(acceptedIfUserLoggedIn, guardianAuthorization, updateGuardianBasicInfo);



// @desc    Update guardian Picture
// @route   PUT localhost:3000/api/v1/guardian/basic-info/picture
// @access  private/guardian
router.put('/api/v1/guardian/basic-info/picture', acceptedIfUserLoggedIn, guardianAuthorization, updateGuardianPicture);



// @desc    Get course data and send it to client
// @route   GET localhost:3000/api/v1/guardian/:courseId
// @access  private/guardian
router.get('/api/v1/guardian/:courseId', acceptedIfUserLoggedIn, guardianAuthorization, getCourseData);



// @desc    Create subscription and create payment process
// @route   POST localhost:3000/api/v1/guardian/checkout
// @access  private/guardian
router.post('/api/v1/guardian/checkout', acceptedIfUserLoggedIn, guardianAuthorization, createSubscription);



module.exports = router;