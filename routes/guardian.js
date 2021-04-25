// Load required packages
const express = require('express');
const router = express.Router();
const {
  getChildrenDataForGuardian,
  getBasicInfoForGuardian,

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
router.get('/api/v1/child/:childId', guardianAuthorization, getBasicInfoForGuardian);



module.exports = router;