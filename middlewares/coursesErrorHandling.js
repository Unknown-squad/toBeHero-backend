const ErrorResponse = require(`../utils/errorResponse`);

exports.coursesErrorHandling = (err, req, res, next) => {

  // console error for dev
  console.log(err);

  let error = {...err};
  error.message = err.message;

  // validation error
  if(err.name === `ValidationError`) {

    // export messages from errors object
    const message = Object.values(err.errors).map(val => {

      // check if kind of error is ObjectId
      if(val.kind === `ObjectId`) {
        val.message = `invalid id at path ${val.path}`
      }
      return ` ${val.message}`;

    });

    error = new ErrorResponse(message, 400);
  } 
  
  // id of content not valid
  if(err.name === `CastError`) {
    const message = `invalid id.`;
    error = new ErrorResponse(message, 400);
  }

  // unexpected error
  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      code: error.statusCode,
      message: error.message || `Server error.`
    }
  });

};