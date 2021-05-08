// load required packages
const asyncHandler = require(`./async`);
const ErrorResponse = require(`../utils/errorResponse`);

// middleware to check authorization for guardian
exports.acceptIfGuardian = asyncHandler(async (req, res, next) => {

  // just for testing
  /* req.user = {
    person: `guardian`,
    id: `606f00646adcf04d84c70a6b`
  } */
  
  // check if user is (guardian) authorized
  if(req.user.person !== `guardian`) {
    return next(new ErrorResponse(`forbidden.`, 403));
  }

  // if user is guardian move to next middleware
  next();
  
});

// middleware to check authorization for mentor
exports.acceptIfMentor = asyncHandler(async (req, res, next) => {

  /* // just for testing
  req.user = {
    person: `mentor`,
    id: `6094e6089e01d04fbbfa8128`
  } */
  
  // check if user is (mentor) authorized
  if(req.user.person !== `mentor`) {
    return next(new ErrorResponse(`forbidden.`, 403));
  }

  // if user is mentor move to next middleware
  next();
  
});

// middleware to check authorization for child
exports.acceptIfChild = asyncHandler(async (req, res, next) => {

  // just for testing
  /* req.user = {
    person: `child`,
    id: `6083842afd1bb5eaec7a3590`
  } */
  
  // check if user is (child) authorized
  if(req.user.person !== `child`) {
    return next(new ErrorResponse(`forbidden.`, 403));
  }

  // if user is child move to next middleware
  next();
  
});