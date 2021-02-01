exports.coursesErrorHandling = (err, req, res, next) => {
  console.log(err);

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
        message: `there's no data in current page.`
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

  // id of content not valid
  if(err.kind === `ObjectId`) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        message: `invalid id.`
      }
    });
  }

  // unexpected error
  else {
    return res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: `Server error.`
      }
    });
  }

};