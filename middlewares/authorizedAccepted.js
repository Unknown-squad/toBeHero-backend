// utile files
const ErrorResponse = require(`../utils/errorResponse`);

// middlewares files
const asyncHandler = require('../middlewares/async');

// utils files
const ErrorHandler = require('../utils/errorHandler');

// check if the user is authorized to use mentor's url
exports.authorizedMentor = asyncHandler((req, res, next) => {
    if(req.user.person != 'mentor') {
        return next(new ErrorHandler(`forbidden`, 403));
    }
    next();
});

// accept any user logged in 
exports.acceptedIfUserLoggedIn = asyncHandler((req, res, next) => {
    if(!req.isLoggedIn) {
        return next(new ErrorHandler(`user unauthenticated`, 401));
    }
    next();
});

// accept any user logged out 
exports.acceptedtIfUserLoggedOut = asyncHandler((req, res, next) => {
    if(req.isLoggedIn) {
        return next(new ErrorHandler(`user is logged in`, 401));
    }
    next();
});

// accept any user have session cookie 
exports.acceptedIfUserAddInfoInSsnCookie = asyncHandler((req, res, next) => {
    if(!req.user) {
        return next(new ErrorHandler(`user unauthenticated`, 401));
    }
    next();
});