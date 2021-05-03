// module requirement
const dotenv = require(`dotenv`);
const bcrypt = require(`bcrypt`);
const mongoose = require(`mongoose`);
const fs = require(`fs`);
const path = require(`path`);

// using dotenv
dotenv.config({path: `../config/config.env`});

// models files
const guardianSchema = require(`../models/guardians`);
const mentorSchema = require(`../models/mentors`);
const childSchema = require(`../models/children`);

// middlewares files
const asyncHandler = require('../middlewares/async');

// utils files
const ErrorHandler = require('../utils/errorHandler');
const sendMail = require(`../utils/sendmail`);

// @desc    sign up as guardian
// @route   POST `/api/v1/guardian/signup`
// @access  public
exports.signUpAsGuardian = asyncHandler(async (req, res, next) => {
    const data = req.body.params;

    // check if user's email is exist
    const checkEmail = await guardianSchema.findOne({email: data.email});

    if (checkEmail) {
        return next(new ErrorHandler(`this email already exists`, 409));
    };

    // validate password
    if (!data.password && (data.password.length < 8)) {
        return next(new ErrorHandler(`invalid password`, 400));
    };

    // incrypt password
    data.password = await bcrypt.hash(data.password, 12);

    // create token to verify user account
    const randToken = Math.floor(100000 + Math.random() * 900000);
    data.varificationToken = randToken;

    // create expiry date of token
    let dateNow = new Date()
    const expiretokenDate = dateNow.setHours(dateNow.getHours() + 1);
    data.verificationTokenExpire = expiretokenDate;

    // save new user in database
    const newUser = await guardianSchema.create(data);

    // create session and cockies to sign up user
    req.session.isLoggedIn = false;
    req.session.user = {
        id: newUser._id,
        person: `guardian`,
        isVerify: false
    };

    // verify his/her account by send mail has 6 random digital
    const mail = {
        to: data.email,
        from: process.env.SENDER_MAIL,
        subject: 'Please verify your email',
        text: 'Awesome sauce',
        html: randToken
    };

    sendMail(mail);

    // send successfully response
    res.status(201).json({
            success: true,
            message: `email created successfully, please verify your email.`
    });
});

// @desc    login user
// @route   POST `/api/v1/guardian/login`
// @access  public
exports.loginUser= asyncHandler(async (req, res, next) => {
    const data = req.body.params;
    let user, personType;

    // find user in database
    if (data.person === 'mentor') {
        user = await mentorSchema.findOne({email: data.email});
        personType = 'mentor';
    } else if (data.person === 'guardian') {
        user = await guardianSchema.findOne({email: data.email});
        personType = 'guardian';
    } else {
        user = await childSchema.findOne({userName: data.userName});
        personType = 'child';
    };

    // check if didn't found user
    if (!user) {
        return next(new ErrorHandler(`there is no user with such email or username.`, 404));
    };

    // check if account isn't verify
    if (user.isVerify === false) {
        return next(new ErrorHandler(`this email isn't verified.`, 401));
    };

    // check user password is correct
    const correctPassword = await bcrypt.compare(data.password, user.password);

    if (!correctPassword) {
        return next(new ErrorHandler(`there's an error occured with email or password.`, 400));
    };

    req.session.isLoggedIn = true;
    req.session.user = {
        id: user.id,
        person: personType,
        isVerify: true
    };

    res.status(200).json({
        success: true,
        message: `user logged in successfully.`
    });
});

// @desc    verify email of user
// @route   POST `/api/v1/user/verify-email`
// @access  public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
    const data = req.body.params;
    let user;

    // find user in database
    if (req.user.person === 'mentor') {
        user = await mentorSchema.findById(req.user.id);
    } else if (req.user.person === 'guardian') {
        user = await guardianSchema.findById(req.user.id);
    };

    // console.log(req.user)
    // check if didn't found user
    if (!user) {
        return next(new ErrorHandler(`there is no user with such email or username.`, 404));
    };

    // check token is expired
    if (user.verificationTokenExpire <= new Date()) {
        return next(new ErrorHandler(`expire token`, 401))
    };

    // check if token is correct
    if (user.varificationToken !== data.token) {
        return next(new ErrorHandler(`invalid token`, 400));
    };

    // let user account is verifyed
    user.isVerify = true;
    await user.save();

    req.session.isLoggedIn = true;
    req.session.user.isVerify = true;

    res.status(200).json({
        success: true,
        message: `Account verified successfully.`
    });
});

// @desc    sign up as mentor
// @route   POST `/api/v1/mentor/signUp`
// @access  public
exports.sginUpAsMenter = asyncHandler(async (req, res, next) => {
    let data = req.body.params;
    let fileName;

    // check if user's email is exist
    const checkEmail = await mentorSchema.findOne({email: data.email});

    if (checkEmail) {
        return next(new ErrorHandler(`this email already exists`, 409));
    };

    // validate password
    if (!data.password && (data.password.length < 8)) {
        return next(new ErrorHandler(`invalid password`, 400));
    };

    if (req.files && req.files.img) {
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
        fileName = `image-mentor-${Date.now()}${mongoose.Types.ObjectId()}${path.parse(img.name).ext}`;
        img.mv(`./public/images/${fileName}`, function(err) {
            // if error delete new img
            if (err){
                fs.unlinkSync(`./public/images/${fileName}`);
                return next(err);
            };
        });
    };

    // save path picture profile in user database
    data.picture = `/images/${fileName}`;

    // incrypt password
    data.password = await bcrypt.hash(data.password, 12);

    // create token to verify user account
    const randToken = Math.floor(100000 + Math.random() * 900000);
    data.verificationToken = randToken;

    // create expiry date of token
    let dateNow = new Date()
    const expiretokenDate = dateNow.setHours(dateNow.getHours() + 1);
    data.verificationTokenTokenExpire = expiretokenDate;

    // save new user in database
    const newUser = await mentorSchema.create(data);

    // create session and cockies to sign up user
    req.session.isLoggedIn = false;
    req.session.user = {
        id: newUser._id,
        person: `mentor`,
        isVerify: false
    };

    // verify his/her account by send mail has 6 random digital
    const mail = {
        to: data.email,
        from: process.env.SENDER_MAIL,
        subject: 'Please verify your email',
        text: 'Awesome sauce',
        html: randToken
    };

    sendMail(mail);

    // send successfully response
    res.status(201).json({
            success: true,
            message: `email created successfully, please verify your email.`
    });
});

// @desc    reset password by steps, step 1: send token by send mail to user 
// @route   POST `/api/v1/user/reset-step-1`
// @access  public
exports.resetPasswordStepOne = asyncHandler(async (req, res, next) => {
    const data = req.body.params;
    let userInfo;

    // find user in database
    if (data.person === 'mentor') {
        userInfo = await mentorSchema.findOne({email: data.email});
        personType = 'mentor';
    } else if (data.person === 'guardian') {
        userInfo = await guardianSchema.findOne({email: data.email});
        personType = 'guardian';
    };

    if (!userInfo) {
        return next(new ErrorHandler(`this email not found`, 404));
    };

    // create token to verify user account
    const randToken = Math.floor(100000 + Math.random() * 900000);
    userInfo.verificationToken = randToken;

    // create expiry date of token
    let dateNow = new Date()
    const expiretokenDate = dateNow.setHours(dateNow.getHours() + 1);
    userInfo.verificationTokenExpire = expiretokenDate;

    // save token in DB
    await userInfo.save();
 
    // verify his/her account by send mail has 6 random digital
    const mail = {
        to: data.email,
        from: process.env.SENDER_MAIL,
        subject: 'Reset your password',
        text: 'Awesome sauce',
        html: randToken
    };
 
    sendMail(mail); 

    // create session and cockies to sign up user
    req.session.isLoggedIn = false;
    req.session.user = {
        id: userInfo._id,
        person: personType,
        isVerify: true
    };

    // send successfully response
    res.status(200).json({
        success: true,
        message: `please, check your email.`
    });
});

// @desc    reset password by steps, step 2: user will enter token to authrized him to change password
// @route   POST `/api/v1/user/reset-step-2`
// @access  private (authenticated user)
exports.resetPasswordStepTwo = asyncHandler(async (req, res, next) => { 
    const data = req.body.params;
    let userInfo;

    // find user in database
    if (req.user.person === 'mentor') {
        userInfo = await mentorSchema.findById(req.user.id);
    } else if (req.user.person === 'guardian') {
        userInfo = await guardianSchema.findById(req.user.id);
    };

    if (!userInfo) {
        return next(new ErrorHandler(`this email not found`, 404));
    };

    // check if token expired
    if (userInfo.verificationTokenExpire <= new Date()) {
        return next(new ErrorHandler(`expire token`, 401))
    };

    // compare correct token with other token entered by user
    if (data.token !== userInfo.verificationToken) {
        return next(new ErrorHandler(`invalid token`, 400));
    };

    // expire token 
    userInfo.verificationTokenExpire = new Date();

    // authorizated user to change Password
    let dateNow = new Date()
    userInfo.authorizationModifyPasswordExpire = dateNow.setHours(dateNow.getHours() + 1);

    await userInfo.save();

    // send successfully response
    res.status(200).json({
        success: true,
        message: `user authorized to change password`
    });
});

// @desc    reset password by steps, step 3: write password if user authorized
// @route   PUT `/api/v1/user/reset-step-3`
// @access  private (authenticated user)
exports.resetPasswordStepThree = asyncHandler(async (req, res, next) => {
    const data = req.body.params;
    let userInfo;

    // find user in database
    if (req.user.person === 'mentor') {
        userInfo = await mentorSchema.findById(req.user.id);
    } else if (req.user.person === 'guardian') {
        userInfo = await guardianSchema.findById(req.user.id);
    };

    if (!userInfo) {
        return next(new ErrorHandler(`this email not found`, 404));
    };

    // chekc if user authorized to change password
    if (userInfo.authorizationModifyPasswordExpire <= new Date()) {
        return next(new ErrorHandler(`user unauthorized to change password`, 403));
    };

    // validation password
    if (data.password.length < 8) {
        return next(new ErrorHandler(`add at least 8 length string`, 400));
    };

    // incrypt new password
    const encryptPassword = await bcrypt.hash(data.password, 12);

    // save new password
    userInfo.password = encryptPassword;

    // expire authorization change password
    userInfo.authorizationModifyPasswordExpire = new Date();

    await userInfo.save();

    // send successfully response
    res.status(200).json({
        success: true,
        message: `successfully change passwaord`
    });
});

// @desc    logout user
// @route   DELETE `/api/v1/user/logout`
// @access  private (user login)
exports.logout = asyncHandler(async (req, res, next) => {
    req.session.destroy(err => {
        if (err) {
            return next(new ErrorHandler(`server error`));
        };

        res.clearCookie("connect.sid")
            .status(200)
            .json({
                success: true,
                message: `logged out user`
            })
     })
});

// @desc    get login status user
// @route   GET `/api/v1/user/login/status`
// @access  private (user login)
exports.loginStatus = asyncHandler(async (req, res, next) => {
    let userInfo;

    // find user in database
    if (req.user.person === 'mentor') {
        userInfo = await mentorSchema.findById(req.user.id);
        personType = 'mentor';
    } else if (req.user.person === 'guardian') {
        userInfo = await guardianSchema.findById(req.user.id);
        personType = 'guardian';
    } else if (req.user.person === 'child') {
        userInfo = await childSchema.findById(req.user.id);
        personType = 'child';
    };

    if (!userInfo) {
        res.status(404).json({
            success: true,
            message: `user not found in database`
        });
    };

    // send successfully response
    res.status(200).json({
        success: true,
        message: `mentor data`,
        data: {
            Kind: "user type",
            items: {
                isLoggedIn: true,
                person: personType
            }
        }
    });
});