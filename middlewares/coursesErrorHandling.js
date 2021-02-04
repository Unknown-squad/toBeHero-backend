const ErrorResponse = require(`../utils/errorResponse`);

exports.coursesErrorHandling = (err, req, res, next) => {

  // console error for dev
  console.log(err);

  let error = {...err};
  error.message = err.message;

  // if user don't select any genre
  if(err.message === `no genre`) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        message: `please pick any genre`
      }
    });
  }

  // if user choose page that hasn't any data
  if(err.message === `no data`) {
    return res.status(404).json({
      success: false,
      error: {
        code: 404,
        message: `there's no content found.`
      }
    });
  }

  // no content error
  if(err.message === `no content`) {
    return res.status(404).json({
      success: false,
      error: {
        code: 404,
        message: `there's no data with givin id.`
      }
    });
  }

  
  // forbidden to get data
  if(err.message === `forbidden`) {
    return res.status(403).json({
      success: false,
      error: {
        code: 403,
        message: `forbidden.`
      }
    });
  }

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