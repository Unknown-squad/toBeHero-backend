//  module requirements
const bcrypt = require(`bcrypt`);
const mongoose = require(`mongoose`);
const path = require(`path`);
const fs = require(`fs`)

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
        return next(new ErrorHandler(`mentor is not found`, 404));
    };
    
    return res.status(200).json({
        success: true,
        message: `menotr basic information`,
        data: {
            kind: `mentor`,
            items: [
                mentorInfo
            ]
        }
    });
});

// @desc    get mentor's balance
// @route   Get '/api/v1/mentor/dashboard/balance'
// @access  private(mentor)
exports.getMentorBalace = asyncHandler(async (req, res, next) => {
    const result = await MentorSchema
        .findById(req.user.id)
        .select('balance -_id');
    
    // check if mentor info is found or not
    if(!result){
        return next(new ErrorHandler(`mentor is not found`, 404));
    };

    return res.status(200).json({
        success: true,
        message: `menotr balance`,
        data: {
            kind: `mentor`,
            items: [
                result
            ]
        }
    });
});

// @desc    get mentor's analytics
// @route   Get '/api/v1/mentor/dashboard/analytics'
// @access  private(mentor)
exports.getMentorAnalytics = asyncHandler(async (req, res, next) => {
    const subscriptionCount = await Subscriptions
        .count({mentorId: req.user.id});
    const courses = await MentorSchema
        .findById(req.user.id);

    // check if mentor info is found or not
    if (!courses) {
        return next(new ErrorHandler(`mentor is not found`, 404));
    };

    // enter number of courses into coursesNumber
    const coursesNumber = courses.coursesId.length;

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
    });
});

// @desc    get mentor's Mentor availability status
// @route   Get '/api/v1/mentor/availability'
// @access  private(mentor)
exports.getMentorIsAvailable = asyncHandler( async (req, res, next) => {
    const mentorInfo = await MentorSchema
        .findById(req.user.id)
        .select('isAvailable -_id');

    // check if mentor info is found or not
    if (!mentorInfo) {
        return next(new ErrorHandler(`mentor is not found`, 404));
    };

    return res.status(200).json({
        success: true,
        message: `menotr availability status`,
        data: {
            kind: `mentor`,
            items: [
                mentorInfo
            ]
        }
    });
});

// @desc   update mentor's availability status
// @route   Put '/api/v1/mentor/availability'
// @access  private(mentor)
exports.putMentorIsAvailable = asyncHandler( async (req, res, next) => {
    const mentorInfo = await MentorSchema
        .findById(req.user.id);

    // check if mentor info is found or not
    if (!mentorInfo) {
        return next(new ErrorHandler(`there's no such mentor with given id.`, 404));
    };

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
    if (!mentorInfo) {
        return next(new ErrorHandler(`there's no such mentor with given id.`, 404));
    };

    // send respone to cliant
    res.status(200).json({
        success: true,
        message: `mentor data`,
        data: {
            Kind: `mentor`,
            items:  mentorInfo
        }
    });
});

// @desc    get mentor's courses
// @route   Get '/api/v1/mentor/courses/:mentorId?page='
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
            model: `Course`,
            select: `_id title price description picture rate reviewCounter`,
            populate: {
                path: `mentorId`,
                model: `Mentor`,
                select: `_id fullName picture isAvailable`
            }
        });

    // console.log(coursesOfMentor)

    // check if there are courses
    if (!coursesOfMentor) {
        return next(new ErrorHandler(`no such mentor with given id ${req.params.mentorId}`, 404));
    };

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
    });
});

// @desc    update mentor's courses
// @route   PUT '/api/v1/mentor/dashboard/basic-info'
// @access  privet(mentor)
exports.updateMentorInfo = asyncHandler( async (req, res, next) => {   
    // get user data
    const user = await MentorSchema
        .findById(req.user.id);

    // check if found user
    if (!user) {
        return next(new ErrorHandler(`there's no such mentor with given id ${req.params.mentorId}`, 404));
    };

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
    });
});

// @desc    authorizithed user to change emial or password or phone number
// @route   POST '/api/v1/mentor/dashboard/authorization'
// @access  privet(mentor)
exports.authorzithedUpdateAdvSetting = asyncHandler(async (req, res, next) => {
    let oldPassword = req.body.params.oldPassword;

    req.user = {
        id: '60696acb19985a03a36d00ba'
    };
    // get mentor info
    const user = await MentorSchema
        .findById(req.user.id);

    // check if found user
    if (!user) {
        return next(new ErrorHandler(`there's no such mentor with given id ${req.user.id}`, 404));
    };

    // compare insert password with password saved in database
    const chackPassword = await bcrypt.compare(oldPassword, user.password);
    console.log(chackPassword);
    if (!chackPassword) {
        return next(new ErrorHandler(`incorrect old password`, 400));
    };

    // create expire time to authourized mentor to modify email or password or phone number
    let expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 1);
    console.log(expireDate);
    user.authorizationModify = expireDate;
    await user.save();

    // send successfully response
    res.status(200).json({
        success: true,
        message: `user authorized to modify data`
    });
});

// @desc    change password
// @route   PUT '/api/v1/mentor/dashboard/password'
// @access  privet(mentor)
exports.changeMentorPassword = asyncHandler(async (req, res, next) => {
    const newPassword = req.body.params.newPassword;
    req.user = {
        id: '60696acb19985a03a36d00ba'
    };
    // get mentor data
    const user = await MentorSchema.findById(req.user.id);

    // chack if user authorized to change data
    const date = new Date()
    if (user.authorizationModify <= date) {
        return next(new ErrorHandler(`forbaddin`, 403));
    }

    // validation new password
    if (newPassword.length < 8) {
        return next(new ErrorHandler(`invalid password`, 400));
    };

    // encrypt new password
    const encryptPassword = await bcrypt.hash(newPassword, 12);

    // save new password
    user.password = encryptPassword;

    // expire authrization date
    user.authorizationModify = Date.now();

    // save data
    await user.save();

    // send successfully response
    res.status(200).json({
        success: true,
        message: `updated user password`
    });
});

// @desc    change email
// @route   PUT '/api/v1/mentor/dashboard/email'
// @access  privet(mentor)
/* exports.changeMentorEmail = asyncHandler(async (req, res, next) => {
    const newEmail = req.body.params.newEmail;
    req.user = {
        id: '60696acb19985a03a36d00ba'
    };

    // get mentor data
    const user = await MentorSchema.findById(req.user.id);

    // chack if user authorized to change data
    const date = new Date()
    if (user.authorizationModify <= date) {
        return next(new ErrorHandler(`forbaddin`, 403));
    };

    // check if email is used
    const checkEmail = await MentorSchema.findOne({email: newEmail});
    if (checkEmail) {
        return next(new ErrorHandler(`this email aready used`, 409));
    };

    // create token
    const verificationToken = Math.random().toString().substring(2, 8);

    // save token
    user.verificationToken = verificationToken;
    user.verificationTokenExpire = Date.now() + 24*60*60*1000;
    await user.save();

    // send token to user's gmail
    

    // send successfully response
    res.status(200).json({
        success: true,
        message: `check your gmail`
    });
}); */

// @desc    change picture profile
// @route   PUT '/api/v1/mentor/dashboard/picture'
// @access  privet(mentor)
exports.changeMentorPicture = asyncHandler(async (req, res, next) => {
    req.user = {
        id: '60696acb19985a03a36d00ba',
        person: 'mentor'
    };

    // found user
    let user = await MentorSchema.findById(req.user.id);
    
    if (!user) {
        return next(new ErrorHandler(`id not found`, 400));
    };

    // check if file sent 
    if (!req.files) {
        return next(new ErrorHandler(`please upload file`, 400));
    };

    let img = req.files.img
    // check if file is img
    if (!img.mimetype.startsWith(`image`)) {
        return next(new ErrorHandler(`please upload file`, 400));
    };

    // check size img
    if (img.size > 5 * 1024 * 1024) {
        return next(new ErrorHandler(`please upload file`, 400));
    };

    // upload img
    const fileName = `image-${req.user.person}-${Date.now()}${mongoose.Types.ObjectId()}${path.parse(img.name).ext}`;
    img.mv(`./public/images/${fileName}`, function(err) {
        // if error delete new img
        if (err){
            fs.unlinkSync(`./public/images/${fileName}`)
            return next(err);
        }
        
        let oldPicture = user.picture

        // save new img path in DB
        user.picture = `/images/${fileName}`;
        user.save(function(err) {
            if (err) {
                console.log(err)
                fs.unlinkSync(`./public/images/${fileName}`);
                return next(`didn't save new image`, 500);
            };

            // delete old picture
            fs.unlink(`./public${oldPicture}`, (err) => {
                if (err) {
                    return next(`server error`, 500);
                };

                // send successfully response
                res.status(200).json({
                    success: true,
                    message: `uploaded new image`
                });
            });
        });
    });
});

// @desc    change user phone number
// @route   PUT '/api/v1/mentor/dashboard/phone'
// @access  privet(mentor)
exports.changeMentorPhone = asyncHandler(async (req, res, next) => {
    req.user = {
        id: '60696acb19985a03a36d00ba',
        person: 'mentor'
    };

    // get user info 
    let user = await MentorSchema.findById(req.user.id);
    
    if (!user) {
        return next(new ErrorHandler(`id not found`, 400));
    }

    // save new data
    user.countryCode = req.body.params.countryCode;
    user.phone = req.body.params.phone;
    await user.save();

    // send successfully response
    res.status(200).json({
        success: true,
        message: `save phone number of user`
    });
})