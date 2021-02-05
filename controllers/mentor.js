// models files
const MentorSchema = require(`../models/mentors`);
const Subscriptions = require(`../models/subscriptions`)

// middlewares files
const asyncHandler = require('../middlewares/async');

// utils files
const ErrorHandler = require('../utils/errorHandler')

// @desc    get mentor's basic info 
// @route   Get '/api/v1/mentor/dashboard/basic-info'
// @access  private(mentor)
exports.getBasicInfoOfMentor = asyncHandler( async (req, res, next) => {
    const mentorInfo = await MentorSchema.findById('601858731b53e707f8d5asdfadfa01c').select('fullName gender email phone countryCode birthDate languages occupation certificates description picture');

    // check if mentor info is found or not
    if(!mentorInfo){
        return next(new ErrorHandler(`mentor is not found`, 404))
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
    const result = await MentorSchema.findById(req.session.user.id).select('balance -_id');
    
    // check if mentor info is found or not
    if(!result){
        return next(new ErrorHandler(`mentor is not found`, 404))
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

// @desc    get mentor's analytics
// @route   Get '/api/v1/mentor/dashboard/analytics'
// @access  private(mentor)
exports.getMentorAnalytics = asyncHandler(async (req, res, next) => {
    const subscriptionCount = await Subscriptions.count({mentorId: req.session.user.id});
    const coursesCount = await MentorSchema.findById(req.session.user.id).select('coursesId -_id')

    // check if mentor info is found or not
    if(!coursesCount){
        return next(new ErrorHandler(`mentor is not found`, 404))
    }
    // enter number of courses into coursesNumber
    coursesNumber = coursesCount.coursesId.length

    return res.status(200).json({
        success: true,
        message: `menotr balance`,
        data: {
            kind: `menotr`,
            items: [
                {
                    coursesNumber: coursesNumber,
                    subscriptionNumber: subscriptionCount
                }
            ]
        }
    })
})

// @desc    get mentor's Mentor availability status
// @route   Get '/api/v1/mentor/availability'
// @access  private(mentor)
exports.getMentorIsAvailable = asyncHandler( async (req, res, next) => {
    const mentorInfo = await MentorSchema.findById(req.session.user.id).select('isAvailable -_id');

    // check if mentor info is found or not
    if(!mentorInfo){
        return next(new ErrorHandler(`mentor is not found`, 404))
    }

    return res.status(200).json({
        success: true,
        message: `menotr availability status`,
        data: {
            kind: `menotr`,
            items: [
                mentorInfo
            ]
        }
    })
})

// @desc   update mentor's availability status
// @route   Put '/api/v1/mentor/availability'
// @access  private(mentor)
exports.putMentorIsAvailable = asyncHandler( async (req, res, next) => {
    const mentorInfo = await MentorSchema.findById('601858731b53e707f8d5a01c')

        // check if mentor info is found or not
        if(!mentorInfo){
            return next(new ErrorHandler(`mentor is not found`, 404))
        }

    mentorInfo.isAvailable = !mentorInfo.isAvailable;
    await mentorInfo.save()

    return res.status(200).json({
        success: true,
        message: `mentor's availability`,
        data: {
            kind: `menotr`,
            items: [
                {
                    isAvailable: mentorInfo.isAvailable
                }
            ]
        }
    })
})

// @desc   get mentor profile
// @route   Get '/api/v1/mentor/profile/mentorId'
// @access public
const getMentorProfile = asyncHandler(async (req, res, next) => {
    const limit = parseInt(req.queue.limit, 10) || 8
    const page = parseInt(req.queue.page, 10) || 1
    const skip = (page - 1) * limit
    const mentorInfo = await MentorSchema.findById('601858731b53e707f8d5a01c')
        .select('-creatingDate -bankingInfo -verificationToken -verificationTokenExpire')
        .populate({
            path: 'courses',
            
        })

    // check if mentor info is found or not
    if(!mentorInfo){
        return next(new ErrorHandler(`mentor is not found`, 404))
    }


})