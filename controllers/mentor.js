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
    const coursesCount = await MentorSchema.findById(req.session.user.id)

    // check if mentor info is found or not
    if(!coursesCount){
        return next(new ErrorHandler(`mentor is not found`, 404))
    }
    // enter number of courses into coursesNumber
    const coursesNumber = coursesCount.coursesId.length

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
            return next(new ErrorHandler(`there's no such mentor with given id.`, 404))
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

// @desc    get mentor's profile
// @route   Get '/api/v1/mentor/profile/:mentorId'
// @access  public
exports.getMentorProfile = asyncHandler(async (req, res, next) => {
    console.log(req.params.mentorId)
    // get mentor info.
    const mentorInfo = await MentorSchema.findById(req.params.mentorId).select(`-coursesId -SubscriptionIDs -bankingInfo -verificationToken -verificationTokenExpire`)
        .populate('topReviewsId')

    // check if mentor info is found or not
    if(!mentorInfo){
        return next(new ErrorHandler(`there's no such mentor with given id.`, 404))
    }

    // send respone to cliant
    res.status(200).json({
        success: true,
        message: `mentor data`,
        data: {
            Kind: `mentor`,
            items:  mentorInfo
        }
    })
})

// @desc    get mentor's courses
// @route   Get '/api/v1/mentor/courses/mentorId?page='
// @access  public
exports.getMentorCourses = asyncHandler(async (req, res, next) => {
    // add pagenation
    const limit = 8;
    const { page = 1 } = req.query;

    // get mentor's courses
    const coursesOfMentor = await MentorSchema.findById(req.params.mentorId)
        .select(`coursesId -_id`)
        .limit(limit)
        .skip((page - 1) * limit)
        .populate({
            path: `couressId`,
            select: `_id title picture discription`
        });

    // check if there are courses
    if (coursesOfMentor.coursesId.length === 0) {
        return next(new ErrorHandler(`there's no such courses with given mentor id ${req.params.mentorId}`, 404));
    };

    // send successfully response
    res.status(200).json({
        success: true,
        message: `mentor data`,
        data: {
            Kind: `mentor`,
            items: coursesOfMentor
        }
    })
});

// @desc    update mentor's courses
// @route   PUT '/api/v1/mentor/dashboard/basic-info'
// @access  privet
exports.updateMentorInfo = asyncHandler( async (req, res, next) => {   
    // get user data
    const user = await MentorSchema.findById(req.session.id);

    // check if found user
    if (!user) {
        return next(new ErrorHandler(`there's no such mentor with given id ${req.params.mentorId}`, 404));
    }

    // save new update
    user.fullName       = req.body.fullName;
    user.address        = req.body.address;
    user.gender         = req.body.gender;
    user.birthDate      = req.body.birthDate;
    user.occupation     = req.body.occupation;
    user.certificates   = req.body.certificates;
    user.description    = req.body.description;
    await user.save();

    // send successfully response
    res.status(201).json({
        success: true,
        message: `mentor basic information is updated successfully.`
    })
});