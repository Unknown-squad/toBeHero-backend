// Import required modules
const ErrorResponse = require('../utils/errorResponse');


// Handle error
exports.subscriptionErrorHandling = (err, req, res, next) => {
  console.log(err);
  console.log(err.name);
  let error = {...err};
  error.message = err.message;

  
  // Check if invalid data
  if (err.name === 'CastError') {
    const message = 'Invalid id';
    error = new ErrorResponse(message, 400);
  }

  // Check validation error
  if (err.name === 'ValidationError') {
    console.log('Mahmoud');
    const message = 'Invalid date or time';
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