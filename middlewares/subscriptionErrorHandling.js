// Handle different error 
exports.subscriptionErrorHandling = (err, req, res, next) => {
  
  // Check if no conent with given data
  if (err.message === 'no content') {
    return res.status(404).json({
      success: false,
      error: {
        code: 404,
        message: "There's no content with given id"
      }
    });
  }
  
  if (err.message === 'forbidden') {
    return res.status(403).json({
      success: false,
      error: {
        code: 403,
        message: "forbidden"
      }
    });
  }

  // Check if invalid data
  if (err.message === 'ObjectId') {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        message: 'invalid Id'
      }
    });
  }
  else {
    return res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: 'Server error'
      }
    });
  }
}