// Load required packages
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const Children = require('../models/children');



// @desc    get all children date for spicific guardian
// @route   Get localhost:3000/api/v1/guardian/children
// @access  private/guardian
exports.getChildrenDataForGuardian = asyncHandler (async (req, res, next) => {

  // Get children data for guardian
  const childrenData = await Children
  .find({guardianId: req.user.id})
  .select('_id fullName picture');

  
  // Check if no content
  if (childrenData.length === 0) {
    return next(new ErrorResponse('No children data.', 404));
  }
  

  // Rturn children data for guardian
  res.status(200).json({
    success: true,
    message: 'Children data',
    data: {
      kind: 'Child',
      items: childrenData
    }
  });
});



// @desc    get all children date for spicific guardian
// @route   Get localhost:3000/api/v1/child/childId
// @access  private/guardian
exports.getBasicInfoForGuardian = asyncHandler (async (req, res, next) => {

  // Get basic info for spicific guardian
  const childData = await Children
  .findById(req.params.childId)
  .select('_id fullName userName birthDate picture guardianId');


  // Check if no content
  if (!childData) {
    return next(new ErrorResponse('No child data.', 404));
  }


  // Check if guardian authorized to see child data
  if (childData.guardianId.toString() != req.user.id.toString()) {
    return next(new ErrorResponse('Forbidden', 403));
  }


  // Grap data which needed
  let child = {
    _id: childData._id,
    userName: childData.userName,
    fullName: childData.fullName,
    birthDate: childData.birthDate,
    picture: childData.picture
  }


  // Return data for guardian
  res.status(200).json({
    success: true,
    message: 'Child data',
    date: {
      kind: 'Child',
      items: [child]
    }
  });
});