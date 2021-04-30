// models files
const guardianSchema = require(`../models/guardians`);

// middlewares files
const asyncHandler = require('../middlewares/async');

// utils files
const ErrorHandler = require('../utils/errorHandler');

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

    // save new user in database
    const newUser = await guardianSchema.create(data);

    // create session and cockies to sign up user
    req.session.isLoggedIn = true;
    req.session.user = {
        id: newUser._id,
        person: `guardian`,
        isVerify: false
    };

    // send successfully response
    res.status(200).json({
            success: true,
            message: `email created successfully, please verify your email.`
    });
});