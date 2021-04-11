// load required packages
const asyncHandler = require(`./async`);
const ErrorResponse = require(`../utils/errorResponse`);

// middleware to check authorization
exports.acceptIfGuardian = asyncHandler(async (req, res, next) => {
  
  // check if user is (guardian) authorized
  if(req.user.person !== `guardian`) {
    return next(new ErrorResponse(`forbidden.`, 403));
  }

  // if user is guardian move to next middleware
  next();
  
});

// middleware to check authorization
exports.acceptIfMentor = asyncHandler(async (req, res, next) => {
  
  // check if user is (mentor) authorized
  if(req.user.person !== `mentor`) {
    return next(new ErrorResponse(`forbidden.`, 403));
  }

  // if user is mentor move to next middleware
  next();
  
});