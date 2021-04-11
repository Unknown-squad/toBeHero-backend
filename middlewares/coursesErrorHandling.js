const fs = require(`fs`);
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

  // file errors
  // just to be sure that no file will uploaded and not store its path in database
  if(error.message.startsWith(`file`)) {

    if(req.filesPath) {
      
      // delete course picture if exist
      if(req.filesPath.coursePicture) {
        fs.unlinkSync(`${__dirname}/../public${req.filesPath.coursePicture}`);

        // clear picture path after deleting file
        req.filesPath.coursePicture = '';
      }
  
      // delete course media
      if(req.filesPath.mediaUrls[0]) {
        for(let i = 0; i < req.filesPath.mediaUrls.length; i++) {
          fs.unlinkSync(`${__dirname}/../public${req.filesPath.mediaUrls[i]}`);
        }

        // clear pathes after deleting files
        req.filesPath.mediaUrls = [];
      }

    }

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