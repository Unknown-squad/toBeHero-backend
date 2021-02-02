// models files
const MentorSchema = require(`../models/mentors`);

// middlewares files
const asyncHandler = require('../middlewares/async')

// @desc    get mentor's basic info 
// @route   Get '/api/v1/mentor/dashboard/basic-info'
// @access  private(mentor)
exports.getBasicInfoOfMentor = asyncHandler( async (req, res, next) => {
    const mentorInfo = await MentorSchema.findById(req.session.user.id).select('fullName gender email phone countryCode birthDate languages occupation certificates description picture');

    // check if mentor info is found or not
    if(!mentorInfo){
        return res.status(404).json({
            success: false,
            error: {
                code: 404,
                message: 'not found'
            }
        });
    }
    
    return res.status(200).json({
        success: true,
        message: `menotr basic information`,
        data: {
            kind: `menotr`,
            items: [
                mentorInfo
            ]
        }
    })
})

// @desc    get mentor's balance
// @route   Get '/api/v1/mentor/dashboard/balance'
// @access  private(mentor)
exports.getMentorBalace = asyncHandler(async (req, res, next) => {
    const result = await MentorSchema.findById(req.session.user.id).select('balance');
    
    // check if mentor info is found or not
    if(!result){
        return res.status(404).json({
            success: false,
            error: {
                code: 404,
                message: 'not found'
            }
        });
    }

    return res.status(200).json({
        success: true,
        message: `menotr balance`,
        data: {
            kind: `menotr`,
            items: [
                result
            ]
        }
    })
})