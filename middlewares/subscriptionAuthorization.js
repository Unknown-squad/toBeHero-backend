// Load required packages
const ErrorResponse = require('../utils/errorResponse');


// Mentor authorization
const mentorAuthorization = (req, res, next) => {

  // Suppose for testing
  req.user = {
    id: '607c470f37bbc66087e940fc',
    person: 'mentor'
  }

  // Check if authorized
  if (req.user.person != 'mentor') {
    return next(new ErrorResponse('Forbidden', 403));
  }
  next();
}


// Guardian authorization
const guardianAuthorization = (req, res, next) => {
  
    // Suppose for testing
    req.user = {
      id: '607c469437bbc66087e940fb',
      person: 'guardian'
    }

    // Check if authorized
    if (req.user.person != 'guardian') {
    return next(new ErrorResponse('Forbidden', 403));
  }
  next();
}


// Child authorization
const childAuthorization = (req, res, next) => {

  // Suppose for testing
  req.user = {
    id: '608d8963975b697849c6c46c',
    person: 'child'
  }

  // Check if authorized
  if (req.user.person != 'child') {
    return next(new ErrorResponse('Forbidden', 403));
  }
  next();
}


// Export middleware functions
module.exports.mentorAuthorization = mentorAuthorization;
module.exports.guardianAuthorization = guardianAuthorization;
module.exports.childAuthorization = childAuthorization;