// Load required packages
const ErrorResponse = require('../utils/errorResponse');


// Mentor authorization
exports.mentorAuthorization = (req, res, next) => {

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
exports.guardianAuthorization = (req, res, next) => {
  
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
exports.childAuthorization = (req, res, next) => {

  // Suppose for testing
  req.user = {
    id: '607c459b37bbc66087e940f9',
    person: 'child'
  }

  // Check if authorized
  if (req.user.person != 'child') {
    return next(new ErrorResponse('Forbidden', 403));
  }
  next();
}