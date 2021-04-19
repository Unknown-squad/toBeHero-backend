// check if the user is authorized to mentor's url
module.exports = (req, res, next) => {
    if('mentor' != 'mentor') {
        return res.status(403).json({
            success: false,
            error: {
                code: 403,
                message: 'forbidden.'
            }
        })
    }
    next();
}