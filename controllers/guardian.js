// Load required packages
const fileUpload = require('express-fileupload');
const bcrypt = require('bcrypt');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const Children = require('../models/children');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');



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


  // Data which will send in json file
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



// @desc    Update child basic information
// @route   Get localhost:3000/api/v1/child/childId
// @access  private/guardian
exports.updateChildBasicInfo = asyncHandler (async (req, res, next) => {
  

  req.body = {
    method: "child.basicInfo.put",
    params: {
      userName: "MahmoudSerag50",
      fullName: "Mahmoud Serag Ismail",
      birthDate: "1999-03-18",
      password: "YousefSrag"
    }
  };
  
  // Fetching the data to be updated
  const child = await Children
  .findById(req.params.childId)
  .select('fullName guardianId userName password birthDate picture');

  // Check if no data
  if (!child) {
    return next(new ErrorResponse('No child data', 404));
  }

  // Check if guardian authorized to update these data
  if (child.guardianId.toString() != req.user.id.toString()) {
    return next(new ErrorResponse('Forbidden', 403));
  }

  // Check validation of req.body
  const { method, params } = req.body;
  if (!method || !params) {
    return next(new ErrorResponse('Method or params are missing.', 400));
  }
  const { fullName, userName, password, birthDate } = req.body.params;
  if (!fullName || !userName || !password || !birthDate) {
    return next(new ErrorResponse('Missing property in params.', 400));
  }

  // Encrypt updated password
  const salt = await bcrypt.genSalt(10);
  const hashedPasword = await bcrypt.hash(password, salt);

  // Check date validation
  if (birthDate.split('-').length < 3) {
    return next(new ErrorResponse('Invalid date.', 400));
  }

  /* Working on picture property on children schema */
  // Check if no image
  if (!req.files) {
    return next(new ErrorResponse('No file uploaded.', 400));
  }
  
  // Global variable to use in each method
  const file = req.files.file;
  
  // Check if more than one image
  if (Array.isArray(file)) {
    return next(new ErrorResponse('One file must be uploaded.', 400));
  }

  // Check mimetype
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Only images can be uploaded.', 400));
  }

  // Check size
  const size = 5 * 1024 * 1024;
  if (file.size > size) {
    return next(new ErrorResponse(`Image max size is: ${size / 1024 / 1024} mb`, 400));
  }

  // Upload file
  const pictureName = `image-${req.user.person}-${Date.now()}${mongoose.Types.ObjectId()}${file.name}`
  const picturePath = `/images/${pictureName}`;
  const pictureDir = `${__dirname}/../public/images/${pictureName}`;
  const filePath = `${__dirname}/../public/images`
  
  file.mv(pictureDir, async (error) => {
    if (error) {
      return next(new ErrorResponse(`Error: ${error.message}`, 500));
    }

    // Replace old image
    const currentPicture = fs.readdirSync(filePath);
    const childPicture = child.picture.split('/')[2];
    // fs.unlinkSync(`${__dirname}/../public/images/${childPicture}`);
    for (let i = 0; i < currentPicture.length; i++) {
      if (currentPicture[i] === childPicture) {
        fs.unlinkSync(`${__dirname}/../public/images/${currentPicture[i]}`);
      }
    }
    
    // Update data
    child.fullName = fullName;
    child.userName = userName;
    child.password = hashedPasword;
    child.birthDate = birthDate;
    child.picture = picturePath;

    //Save data
    await child.save((error) => {
      if (error) {
        fs.unlinkSync(pictureDir);
        return next(new ErrorResponse(`${error}`, 500));
      }
      
      // Return response to client
      res.status(201).json({
        success: true,
        message: 'Child data is updated successfully.'
      });
    });
  });
});