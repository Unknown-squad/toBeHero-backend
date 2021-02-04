// Handle different error 
exports.subscriptionErrorHandling = (err, req, res, next) => {
  
  console.log(err);

  // Check if no conent with given data
  if (err.message === 'no content' || err.message === "Cannot read property 'guardianId' of null") {
    return res.status(404).json({
      success: false,
      error: {
        code: 404,
        message: "There's no content with given id"
      }
    });
  }
  
  // Check if unauthorized
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
  if (err.kind === 'ObjectId') {
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