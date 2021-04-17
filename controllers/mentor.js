// models files
const MentorSchema = require(`../models/mentors`);
const Subscriptions = require(`../models/subscriptions`);
const coursesSchema = require(`../models/courses`)

// middlewares files
const asyncHandler = require('../middlewares/async');

// utils files
const ErrorHandler = require('../utils/errorHandler')

// @desc    get mentor's basic info 
// @route   Get '/api/v1/mentor/dashboard/basic-info'
// @access  private(mentor)
exports.getBasicInfoOfMentor = asyncHandler( async (req, res, next) => {
    const mentorInfo = await MentorSchema.findById(req.user.id)
        .select('fullName gender email phone countryCode birthDate languages occupation certificates description picture -_id');

    // check if mentor info is found or not
    if(!mentorInfo){
        return next(new ErrorHandler(`mentor is not found`, 404))
    }
    
    return res.status(200).json({
        success: true,
        message: `menotr basic information`,
        data: {
            kind: `mentor`,
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
    const result = await MentorSchema
        .findById(req.user.id)
        .select('balance -_id');
    
    // check if mentor info is found or not
    if(!result){
        return next(new ErrorHandler(`mentor is not found`, 404))
    }

    return res.status(200).json({
        success: true,
        message: `menotr balance`,
        data: {
            kind: `mentor`,
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
    const subscriptionCount = await Subscriptions
        .count({mentorId: req.user.id});
    const courses = await MentorSchema
        .findById(req.user.id)

    // check if mentor info is found or not
    if(!courses){
        return next(new ErrorHandler(`mentor is not found`, 404))
    }
    // enter number of courses into coursesNumber
    const coursesNumber = courses.coursesId.length

    return res.status(200).json({
        success: true,
        message: `mentor balance`,
        data: {
            kind: `mentor`,
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
    const mentorInfo = await MentorSchema
        .findById(req.user.id)
        .select('isAvailable -_id');

    // check if mentor info is found or not
    if(!mentorInfo){
        return next(new ErrorHandler(`mentor is not found`, 404))
    }

    return res.status(200).json({
        success: true,
        message: `menotr availability status`,
        data: {
            kind: `mentor`,
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
    const mentorInfo = await MentorSchema
        .findById(req.user.id);

    // check if mentor info is found or not
    if (!mentorInfo) {
        return next(new ErrorHandler(`there's no such mentor with given id.`, 404));
    }

    mentorInfo.isAvailable = !mentorInfo.isAvailable;
    await mentorInfo.save();

    return res.status(200).json(
        {
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
        }
    );
});

// @desc    get mentor's profile
// @route   Get '/api/v1/mentor/profile/:mentorId'
// @access  public
exports.getMentorProfile = asyncHandler(async (req, res, next) => {
    // console.log(req.params.mentorId)
    // get mentor info.
    const mentorInfo = await MentorSchema
        .findById(req.params.mentorId)
        .select(`-coursesId -SubscriptionIDs -bankingInfo -verificationToken -verificationTokenExpire`)
        .populate('topReviewsId');

    // check if mentor info is found or not
    if(!mentorInfo){
        return next(new ErrorHandler(`there's no such mentor with given id.`, 404));
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
});

// @desc    get mentor's courses
// @route   Get '/api/v1/mentor/courses/mentorId?page='
// @access  public
exports.getMentorCourses = asyncHandler(async (req, res, next) => {
    // add pagenation
    const limit = 8;
    const { page = 1 } = req.query;

    // get mentor's courses
    const coursesOfMentor = await MentorSchema.findById(req.params.mentorId)
        .select(`coursesId`)
        .slice('coursesId', [((page - 1) * limit), limit])
        .populate({
            path: `coursesId`,
            model: `Course`
        });

    console.log(coursesOfMentor)
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
            items: coursesOfMentor.coursesId
        }
    })
});

// @desc    update mentor's courses
// @route   PUT '/api/v1/mentor/dashboard/basic-info'
// @access  privet(mentor)
exports.updateMentorInfo = asyncHandler( async (req, res, next) => {   
    // get user data
    const user = await MentorSchema.findById(req.user.id);

    // check if found user
    if (!user) {
        return next(new ErrorHandler(`there's no such mentor with given id ${req.params.mentorId}`, 404));
    }

    // save new update
    user.fullName       = req.body.params.fullName;
    user.address        = req.body.params.address;
    user.gender         = req.body.params.gender;
    user.birthDate      = req.body.params.birthDate;
    user.occupation     = req.body.params.occupation;
    user.certificates   = req.body.params.certificates;
    user.description    = req.body.params.description;
    user.languages      = req.body.params.languages;
    await user.save();

    // send successfully response
    res.status(201).json({
        success: true,
        message: `mentor basic information is updated successfully.`
    })
});