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
  updateGuardianPicture
} = require('../controllers/guardian');
const { 
  mentorAuthorization,
  guardianAuthorization,
  childAuthorization
} = require('../middlewares/guardianAuth');



// @desc    get all children date for spicific guardian
// @route   Get localhost:3000/api/v1/guardian/children
// @access  private/guardian
router.get('/api/v1/guardian/children', guardianAuthorization, getChildrenDataForGuardian);



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
  .get(guardianAuthorization, geChildDataForGuardian)
  .put(guardianAuthorization, updateChildBasicInfo);



// @desc    Add new child
// @route   POST localhost:3000/api/v1/guardian/new-child
// @access  private/guardian
router.post('/api/v1/guardian/new-child', guardianAuthorization, addNewChild);



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
  .get(guardianAuthorization, getGurdianBasicInfo)
  .put(guardianAuthorization, updateGuardianBasicInfo);



// @desc    Update guardian Picture
// @route   PUT localhost:3000/api/v1/guardian/basic-info/picture
// @access  private/guardian
router.put('/api/v1/guardian/basic-info/picture', guardianAuthorization, updateGuardianPicture);



module.exports = router;