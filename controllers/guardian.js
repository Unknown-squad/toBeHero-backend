// Load required packages
const bcrypt = require('bcrypt');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const Children = require('../models/children');
const Guardian = require('../models/guardians');
const Subscription = require('../models/subscriptions');
const Course = require('../models/courses');
const mongoose = require('mongoose');
const fs = require('fs');
const stripe = require('stripe')('sk_test_51Ipv0NAq98pIrueXPNChnWXW3YOSsyNHbpOuM0SDJsQl9ZwLS9VDTuYRp21eP1e4bzyNNcc0yMjvrYqXqWw2Lkyr00NQMVdzx8');



// @desc    get all children date for spicific guardian
// @route   Get localhost:3000/api/v1/guardian/children
// @access  private/guardian
exports.getChildrenDataForGuardian = asyncHandler (async (req, res, next) => {

  // Get children data for guardian
  const childrenData = await Children
  .find({guardianId: req.user.id})
  .select('fullName picture');
  
  // Check if no content
  if (childrenData.length === 0) {
    return next(new ErrorResponse(`No children data with given id ${req.user.id}.`, 404));
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



// @desc    Get basic info of child for specific guardian
// @route   Get localhost:3000/api/v1/child/childId
// @access  private/guardian
exports.geChildDataForGuardian = asyncHandler (async (req, res, next) => {

  // Get basic info for spicific guardian
  const childData = await Children
  .findById(req.params.childId)
  .select('fullName userName birthDate picture guardianId');


  // Check if no content
  if (!childData) {
    return next(new ErrorResponse(`No child data with given id ${req.params.childId}.`, 404));
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
// @route   PUT localhost:3000/api/v1/child/childId
// @access  private/guardian
exports.updateChildBasicInfo = asyncHandler (async (req, res, next) => {
  
  // For testing
  /* req.body = {
    method: "child.basicInfo.put",
    params: {
      userName: "yousseff-serag",
      fullName: "Mahmoud Serag Ismail",
      birthDate: "1999-03-25",
      password: "Yousef Srag dkjasljdaslk"
    }
  }; */
  
  // Fetching the data to be updated
  const child = await Children
  .findById(req.params.childId)
  .select('fullName guardianId userName password birthDate picture');

  // Check if no data
  if (!child) {
    return next(new ErrorResponse(`No child data with given id ${req.params.childId}.`, 404));
  }

  // Check if guardian authorized to update these data
  if (child.guardianId.toString() != req.user.id.toString()) {
    return next(new ErrorResponse('Forbidden.', 403));
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

  // Check uniqueness of userName
  const isExist = await Children.findOne({userName});
  if (isExist) {
    return next(new ErrorResponse('User name is already exist', 409));
  }

  // Check Match validation of userName
  const regex = /^[a-zA-Z\-]+$/;
  const match = userName.match(regex);
  if (!match) {
    return next(new ErrorResponse(`Your user name is not valid. Only characters A-Z, a-z and '-' are  acceptable.`, 400));
  }

  // Check date validation
  if (birthDate.split('-').length < 3) {
    return next(new ErrorResponse('Invalid date.', 400));
  }

  /* Working on picture property on children schema */

  // If image uploaded
  if (req.files) {
    
    const file = req.files.file;

    // Check if more than one image
    if (Array.isArray(file)) {
      return next(new ErrorResponse('One image can be uploaded.', 400));
    }
  
    // Check mimetype
    if (!file.mimetype.startsWith('image')) {
      return next(new ErrorResponse('Only images can be uploaded.', 400));
    }
  
    // Check size
    const size = 5 * 1024 * 1024;
    if (file.size > size) {
      return next(new ErrorResponse(`Image max size is: ${size / 1024 / 1024} MB`, 400));
    }
  
    // Upload image
    const pictureName = `image-${req.user.person}-${Date.now()}${mongoose.Types.ObjectId()}${file.name}`;
    const picturePath = `/images/${pictureName}`;
    const pictureDir = `${__dirname}/../public/images/${pictureName}`;
    const filePath = `${__dirname}/../public/images`;
    
    file.mv(pictureDir, async (error) => {
      if (error) {
        return next(new ErrorResponse(`Error: ${error.message}`, 500));
      }
    });

    // Replace old image
    const currentPicture = fs.readdirSync(filePath);
    const childPicture = child.picture.split('/')[2];
    // fs.unlinkSync(`${__dirname}/../public/images/${childPicture}`);
    for (let i = 0; i < currentPicture.length; i++) {
      if (currentPicture[i] === childPicture) {
        fs.unlinkSync(`${filePath}/${currentPicture[i]}`);
      }
    }

    // Update data
    child.fullName = fullName;
    child.userName = userName;
    child.password = hashedPasword;
    child.birthDate = birthDate;
    child.picture = picturePath;

    // Save data
    await child.save(async (err) => {
      if (err) {
        fs.unlinkSync(pictureDir);
        const result = [];
        const arrayOfErrors = err.message.split(':');
        for (let i = 2; i < arrayOfErrors.length; i++) {
          result.push(arrayOfErrors[i]);
        }
        const error = result.join(':');
        return next(new ErrorResponse(`${error}`, 500));
      }
  
      // Return json data
      res.status(201).json({
        success: true,
        message: 'Child data updated successfully.'
      });
    });
  }
  else {
    
    // Update data without changes in image
    child.fullName = fullName;
    child.userName = userName;
    child.password = hashedPasword;
    child.birthDate = birthDate;

    // Save data
    await child.save();

    // Return response to client
    res.status(200).json({
      success: true,
      message: 'Child data updated successfully.'
    });
  }
});



// @desc    Add new child
// @route   POST localhost:3000/api/v1/guardian/new-child
// @access  private/guardian
exports.addNewChild = asyncHandler (async (req, res, next) => {
  
  // For testing
  /* req.body = {
    method: "child.basicInfo.put",
    params: {
      userName: "Mahmoud",
      fullName: "Mahmoud Serag Ismail",
      birthDate: "1999-03-18",
      password: "Yousef Srag dkjasljdaslk",
      gender: "male"
    }
  }; */

  // Check validation of req.body
  const { method, params } = req.body;
  if (!method || !params) {
    return next(new ErrorResponse('Method or params are missing.', 400));
  }
  const { fullName, userName, password, birthDate, gender } = req.body.params;
  if (!fullName || !userName || !password || !birthDate || !gender) {
    return next(new ErrorResponse('Missing property in params.', 400));
  }
  
  // Check uniqueness of userName
  const isExist = await Children.findOne({userName});
  if (isExist) {
    return next(new ErrorResponse('User name is already exist', 409));
  }

  // Check Match validation of userName
  const regex = /^[a-zA-Z\-]+$/;
  const match = userName.match(regex);
  if (!match) {
    return next(new ErrorResponse(`Your user name is not valid. Only characters A-Z, a-z and '-' are  acceptable.`, 400));
  }

  // Check date validation
  if (birthDate.split('-').length < 3) {
    return next(new ErrorResponse('Invalid date', 400));
  }

  // Encrypt password
  const salt = await bcrypt.genSalt(10);
  const hashedPasword = await bcrypt.hash(password, salt);
  
  /* Working on picture property on children schema */
  if (!req.files) {
    return next(new ErrorResponse('No image uploaded.', 400));
  }

  // Global variable
  const file = req.files.file;

  // Check if more than one image
  if (Array.isArray(file)) {
    return next(new ErrorResponse('One image can be uploaded.', 400));
  }

  // Check mimetype
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Only image can be uploaded.', 400));
  }

  // Check size
  const size = 5 * 1024 * 1024;
  if (file.size > size) {
    return next(new ErrorResponse(`Image max size is: ${size / 1024 / 1024} MB`));
  }

  // Upload image
  const pictureName = `image-${req.user.person}-${Date.now()}${mongoose.Types.ObjectId()}${file.name}`;
  const picturePath = `/images/${pictureName}`;
  const pictureDir = `${__dirname}/../public/images/${pictureName}`;

  file.mv(pictureDir, async (error) => {
    if (error) {
      return next(new ErrorResponse(`Error: ${error.message}`, 500));
    }
  });

  // Create new child
  const child = new Children({
    fullName: fullName,
    userName: userName,
    password: hashedPasword,
    birthDate: birthDate, 
    picture: picturePath,
    gender: gender,
    guardianId: req.user.id
  });

  // Save data
  await child.save(async (err) => {

    // Check if error
    if (err) {
      fs.unlinkSync(pictureDir);
      const result = [];
      const arrayOfErrors = err.message.split(':');
      for (let i = 2; i < arrayOfErrors.length; i++) {
        result.push(arrayOfErrors[i]);
      }
      const error = result.join(':');
      console.log(error);
      return next(new ErrorResponse(`${error}`, 500));
    }

    // Save childId in guardian property in guardian schema
    const guardian = await Guardian.findById(req.user.id);
    guardian.childrenId.push(child._id);
    await guardian.save();

    // Return json data
    res.status(201).json({
      success: true,
      message: 'Child data added successfully.'
    });
  });
});



// @desc    Get guardian basic information
// @route   GET localhost:3000/api/v1/guardian/basic-info
// @access  private/guardian
exports.getGurdianBasicInfo = asyncHandler (async (req, res, next) => {

  // Get guardian info
  const guardian = await Guardian
  .findById(req.user.id)
  .select('fullName email phone countryCode -_id');

  // If no guardian data
  if (!guardian) {
    return next(new ErrorResponse(`No guardian data with given id ${req.user.id}.`, 404));
  }
  
  // Return data to client
  res.status(200).json({
    success: true,
    message: `Guardian's basic info`,
    data: {
      kind: 'Guardian data',
      items: [guardian]
    }
  });
});



// @desc    Update guardian basic information
// @route   PUT localhost:3000/api/v1/guardian/basic-info
// @access  private/guardian
exports.updateGuardianBasicInfo = asyncHandler (async (req, res, next) => {

  // Fetching the data to be updated
  const guardian = await Guardian
  .findById(req.user.id)
  .select('fullName email phone countryCode password');

  // Check if no data
  if (!guardian) {
    return next(new ErrorResponse(`No guardian data with given id ${req.user.id}.`, 404));
  }

  // Check validation of req.body
  const { method, params } = req.body;
  if (!method || !params) {
    return next(new ErrorResponse('Method of params are missing.', 400));
  }
  const { fullName, email, phone, countryCode, password } = req.body.params;
  if (!fullName || !email || !phone || !countryCode || !password) {
    return next(new ErrorResponse('Missing property in params.', 400));
  }

  // Encrypt password
  const salt = await bcrypt.genSalt(10);
  const hashedPasword = await bcrypt.hash(password, salt);

  // Check uniqueness of email
  const isExist = await Guardian.findOne({email});
  if (isExist) {
    return next(new ErrorResponse('Email is already exist.', 409));
  }
  
  // Update data
  guardian.fullName = fullName;
  guardian.email = email;
  guardian.phone = phone;
  guardian.countryCode = countryCode;
  guardian.password = hashedPasword;

  // Save data
  await guardian.save(async (err) => {
    if (err) {
      const result = [];
      const arrayOfErrors = err.message.split(':');
      for (let i = 1; i < arrayOfErrors.length; i++) {
        result.push(arrayOfErrors[i]);
      }
      const error = result.join(':');
      return next(new ErrorResponse(`${error}`, 500));
    }

    // Return json data
    res.status(201).json({
      success: true,
      message: `Guardian's basic info updated successfully.`
    });
  });
});



// @desc    Update guardian Picture
// @route   PUT localhost:3000/api/v1/guardian/basic-info/picture
// @access  private/guardian
exports.updateGuardianPicture = asyncHandler (async (req, res, next) => {
  
  // Fetching data to be updated
  const guardian = await Guardian.findById(req.user.id);

  // Check if no file uploaded
  if (!req.files) {
    return next(new ErrorResponse('No image uploaded.', 400));
  }

  // Global variable
  const file = req.files.file;

  // Check if more than one image
  if (Array.isArray(file)) {
    return next(new ErrorResponse('One image can be uploaded.', 400));
  }

  // Check mimetype
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Only image can be uploaded.', 400));
  }

  // Check size
  const size  = 5* 1024 * 1024;
  if (file.size > size) {
    return next(new ErrorResponse(`Image max size is ${size / 1024 / 1024} MB.`, 400));
  }

  // Uploade image
  const pictureName = `image-${req.user.person}-${Date.now()}${mongoose.Types.ObjectId()}${file.name}`;
  const picturePath = `/images/${pictureName}`;
  const pictureDir = `${__dirname}/../public/images/${pictureName}`;
  const filePath = `${__dirname}/../public/images`;

  file.mv(pictureDir, async (error) => {
    if (error) {
      return next(new ErrorResponse(`Error: ${error}.`, 500));
    }
  });

  // Replace old image
  const currentPicture = fs.readdirSync(filePath);
  const guardianPicture = guardian.picture.split('/')[2];
  // fs.unlinkSync(`${__dirname}/../public/images/${childPicture}`);
  for (let i = 0; i < currentPicture.length; i++) {
    if (currentPicture[i] === guardianPicture) {
      fs.unlinkSync(`${filePath}/${currentPicture[i]}`);
    }
  }

  // Update guardian picture
  guardian.picture = picturePath;

  // Save data
  await guardian.save(async (err) => {
    if (err) {
      fs.unlinkSync(pictureDir);
      const result = [];
      const arrayOfErrors = err.message.split(':');
      for (let i = 2; i < arrayOfErrors.length; i++) {
        result.push(arrayOfErrors[i]);
      }
      const error = result.join(':');
      return next(new ErrorResponse(`${error}`, 500));
    }

    // Return json data
    res.status(201).json({
      success: true,
      message: 'Guardian picture updated successfully.'
    });
  });
});



// @desc    Create subscription and create payment
// @route   POST localhost:3000/api/v1/guardian/:courseId/checkout
// @access  private/guardian
exports.createSubscription = asyncHandler (async (req, res, next) => {

  // For testing
  /* req.body = {
    method: 'Create.subscription.POST',
    params: {
      childId: '608d8963975b697849c6c46c',
      address: 'da5s4d5as4das5d4as-cairo-egypt'
    },
    stripeToken: req.body.stripeToken,
    stripeEmail: req.body.stripeEmail
  }; */

  // Get course
  const course = await Course
  .findById(req.params.courseId)
  .select('price mentorId description title');

  // Check if no course
  if (!course) {
    return next(new ErrorResponse(`No course data with given id ${req.params.courseId}`, 400));
  }

  // Check validation of req.body
  const { method, params, address } = req.body;
  if (!method || !params || !address) {
    return next(new ErrorResponse('Method or params are missing.', 400));
  }
  const { childId } = req.body.params;
  if (!childId) {
    return next(new ErrorResponse('Missing property in params.', 400));
  }
  
  // Get child data from database
  const child = await Children
  .findById(childId)
  .select('guardianId');

  // Check if no child data
  if (!child) {
    return next(new ErrorResponse(`No child data with given id ${childId}.`, 404));
  }

  // Check if guardian not authorized
  if (child.guardianId.toString() != req.user.id.toString()) {
    return next(new ErrorResponse('Forbidden', 403));
  }

  // Create customer payment process
  const customer = await stripe.customers.create({
    email: req.body.stripeEmail,
		source: req.body.stripeToken
  });

  // Create customer charge in stripe.com in payment field
  await stripe.charges.create({
    amount: course.price,
    receipt_email: req.body.stripeEmail,
    description: course.description,
    currency: 'EGP',
    shipping: {
      address: {
        line1: address
      },
      name: course.title
    },
    customer: customer.id
  });

  // Create subscription and save it in database
  await Subscription.create({
    guardianId: req.user.id,
    childId: childId,
    mentorId: course.mentorId,
    courseId: req.params.courseId,
    balance: course.price
  });

  // Return response to the client
  res.status(201).json({
    success: true,
    charge: 'You successfully subscribe to this course.'
  });
});