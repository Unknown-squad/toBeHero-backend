// module requirement
const dotenv = require(`dotenv`);

// using dotenv
dotenv.config({path: `../config/config.env`});

// models files
const guardianSchema = require(`../models/guardians`);

// middlewares files
const asyncHandler = require('../middlewares/async');

// utils files
const ErrorHandler = require('../utils/errorHandler');
const sendMail = require(`../utils/sendmail`)

// @desc    create sign up as guardian
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
    req.session.isLoggedIn = true;
    req.session.user = {
        id: newUser._id,
        person: `guardian`,
        isVerify: false
    };

    // verify his/her account by send mail has 6 random digital
    const email = {
        to: data.email,
        from: process.env.SENDER_MAIL,
        subject: 'Please verify your email',
        text: 'Awesome sauce',
        html: randToken
    };

    sendMail(email);

    // send successfully response
    res.status(200).json({
            success: true,
            message: `email created successfully, please verify your email.`
    });
});