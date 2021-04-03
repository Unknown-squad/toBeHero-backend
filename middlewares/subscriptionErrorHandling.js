// Import required modules
const ErrorResponse = require('../utils/errorResponse');


// Handle error
exports.subscriptionErrorHandling = (err, req, res, next) => {
  console.log(err);
  let error = {...err};
  error.message = err.message;

  
  // Check if invalid data
  if (err.name === 'CastError') {
    const message = `Invalid id`;
    error = new ErrorResponse(message, 400);
  }


  return res.status(error.statusCode || 500).json({
    success: false,
    error: {
      code: error.statusCode || 500,
      message: error.message || 'Server error'
    }
  });
}