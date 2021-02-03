const errorHandler = (err, req, res, next) => {
    console.log(err)
    if (err.kind === 'ObjectId') {
        err.message = 'invalid id'
    }
    res.status(err.statusCode || 500).json({
        saccuss: false,
        error: err.message || `server error`
    })
} 

module.exports = errorHandler;