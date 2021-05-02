// module requirement
const dotenv = require(`dotenv`);
const bcrypt = require(`bcrypt`);

// using dotenv
dotenv.config({path: `../config/config.env`});

// models files
const guardianSchema = require(`../models/guardians`);
const mentorSchema = require(`../models/mentors`);
const chaildSchema = require(`../models/children`);

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
    data.varificationTokenExpire = expiretokenDate;

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
        user = await chaildSchema.findOne({userName: data.userName});
        personType = 'children';
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
    if (user.varificationTokenExpire <= new Date()) {
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