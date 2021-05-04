// Load required packages
const express = require('express');
const router = express.Router();
const {
  getChildrenDataForGuardian,
  getBasicInfoForGuardian,
  updateChildBasicInfo,
  addNewChild,
  getGurdianBasicInfo
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



// @desc    get all children date for spicific guardian
// @route   Get localhost:3000/api/v1/child/childId
// @access  private/guardian
router.route('/api/v1/child/:childId')
  .get(guardianAuthorization, getBasicInfoForGuardian)
  .put(guardianAuthorization, updateChildBasicInfo);



// @desc    Add new child
// @route   POST localhost:3000/api/v1/guardian/new-child
// @access  private/guardian
router.post('/api/v1/guardian/new-child', guardianAuthorization, addNewChild);



// @desc    Get guardian basic information
// @route   POST localhost:3000/api/v1/guardian/basic-info
// @access  private/guardian
router.get('/api/v1/guardian/basic-info', guardianAuthorization, getGurdianBasicInfo);


module.exports = router;