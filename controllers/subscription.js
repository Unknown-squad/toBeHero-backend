// Load required packages
const Subscription = require('../models/subscriptions');
const Guardian = require('../models/guardians');
const Children = require('../models/children');
const Course = require('../models/courses');
const Mentor = require('../models/mentors');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const { populate } = require('../models/subscriptions');



// @desc    get all subscription for spicific mentor
// @route   Get localhost:3000/api/v1/mentor/subscriptions
// @access  private/mentor
exports.getMentorSubscriptions = asyncHandler (async (req, res, next) => {
  
  // Check if user is authorized or not
  if (req.user.person != 'mentor') {
    return next(new ErrorResponse(`Forbidden.`, 403));
  }

  // Get all subscriptions for mentor
  const subscriptions = await Subscription
  .find({mentorId: req.user.id})
  .select({_id: 1, appiontments: 1, guardianId: 1, childId: 1, courseId: 1})
  .populate({
    path: 'guardianId',
    select: "fullName phone countryCode -_id",
    model: Guardian
  })
  .populate({
    path: 'childId',
    select: "fullName -_id",
    model: Children
  })
  .populate({
    path: 'courseId',
    select: "title genre -_id",
    model: Course
  });

  // Check if no subscriptions yet
  if (subscriptions.length === 0) {
    return next(new ErrorResponse(`No Content.`, 404));
  }


  // return data to mentor
  res.status(200).json({
    success: true,
    message: 'Subscriptions data',
    data: {
      kind: 'subscription',
      items: [
        {
          subscriptions: subscriptions
        }
      ]
    }
  });
});



// @desc    get one subscription for spicific mentor
// @route   Get localhost:3000/api/v1/mentor/subscription/subscriptionId
// @access  private/mentor
exports.getOneMentorSubscription = asyncHandler (async (req, res, next) => {
  
  // Check if user is authorized or not
  if (req.user.person != 'mentor') {
    return next(new ErrorResponse(`Forbidden.`, 403));
  }

  // Get one subscription for mentor
  const subscription = await Subscription
  .findById(req.params.subscriptionId)
  .select({_id: 1, guardianId: 1, childId: 1, courseId: 1, appiontments: 1, mentorId: 1})
  .populate({
    path: 'guardianId',
    select: "fullName picture phone countryCode -_id",
    model: Guardian
  })
  .populate({
    path: 'childId',
    select: "fullName picture -_id",
    model: Children
  })
  .populate({
    path: 'courseId',
    select: "title genre -_id",
    model: Course
  });

  // Check if no subscription with given id
  if (!subscription) {
    return next(new ErrorResponse(`No Content.`, 404));
  }

  // Check if mentor authorized
  if (subscription.mentorId.toString() != req.user.id.toString()) {
    return next(new ErrorResponse(`Forbidden.`, 403));
  }

  // return data to mentor
  res.status(200).json({
    success: true,
    message: 'subscription data',
    data: {
      kind: 'subscription',
      items: [
        {
          subscription: subscription
        }
      ]
    }
  });
});



// @desc    Add new appiontment
// @route   Post localhost:3000/api/v1/mentor/subscription/:subscriptionId/add-appointment
// @access  private/mentor
exports.addNewAppiontment = asyncHandler (async (req, res, next) => {
  
  // Check if user authorized
  if (req.user.person != 'mentor') {
    return next(new ErrorResponse(`Forbidden.`, 403));
  }

  const subscription = await Subscription
  .findById(req.params.subscriptionId)
  .select({appointments: 1, _id: 1, mentorId: 1});

  // Check if no content
  if (!subscription) {
    return next(new ErrorResponse(`No Content`, 404));
  }

  // Check if mentor auhtorized
  if (subscription.mentorId.toString() != req.user.id.toString()) {
    return next(new ErrorResponse(`Forbidden.`, 403));
  }

  // Add appointment property
  req.body = {
    method: 'mentor.appointment.post',
    params: {
      title: req.body.title,
      time: req.body.time,
      date: req.body.date,
    }
  }
  subscription.appointments.push({
    title: req.body.params.title,
    date: `${req.body.params.date}T${req.body.params.time}`
  });

  // return result for mentor
  res.status(201).json({
    success: true,
    message: 'Appointment added successfully.'

  });
  await subscription.save();
});



// @desc    get all subscription for child
// @route   Get localhost:3000/api/v1/child/home
// @access  private/child
exports.getAllChildSubscriptions = asyncHandler (async (req, res, next) => {

  // Check if authorized or not
  if (req.user.person != 'child') {
    return next(new ErrorResponse(`Forbidden.`, 403));
  }

  // Get all child subscription
  const subscription = await Subscription
  .find({childId: req.user.id})
  .select({_id: 1, mentorId: 1, courseId: 1, appointments: 1})
  .populate({
    path: 'mentorId',
    select: "fullName picture gender -_id",
    model: Mentor
  })
  .populate({
    path: 'courseId',
    select: "title picture -_id",
    model: Course
  });

  
  // Check if no content
  if (subscription.length === 0) {
    return next(new ErrorResponse(`No Content.`, 404));
  }

  // return data to child
  res.status(200).json({
    success: true,
    message: 'subscriptions data',
    data: {
      kind: 'subscriptions',
      items: [
        {
          subscription: subscription
        }
      ]
    }
  });
});



// @desc    Get child's subscription for guardian
// @route   Get localhost:3000/api/v1/guardian/child-subscription/childId
// @access  private/guardian
exports.getChildSubsForGuardian = asyncHandler (async (req, res, next) => {

  // Check if authorized or not
  if (req.user.person != 'guardian') {
    return next(new ErrorResponse(`Forbidden.`, 403));
  }

  // get child subscriptions for guardian
  const childSubscriptions = await Subscription
  .find({childId: req.params.childId})
  .select({_id: 1, courseId: 1, mentorId: 1, appointments: 1, childId: 1})
  .populate({
    path: 'mentorId',
    select: "_id fullName picture",
    model: Mentor
  })
  .populate({
    path: 'courseId',
    select: "title description picture -_id",
    model: Course
  })
  .populate({
    path: 'childId',
    select: "_id guardianId",
    model: Children
  });
  
  
  // Get child's nextAppointment && other data
  let childSubs = [];
  childSubscriptions.forEach(el => {
    let arrayOfDates = [];
    let nextAppointment;
    el.appointments.forEach(el => {
      if (el.date > Date.now()) {
        arrayOfDates.push(el.date);
      }
    });
    nextAppointment = new Date(Math.min(...arrayOfDates));
    childSubs.push({
      _id: el._id,
      mentorId: el.mentorId,
      courseId: el.courseId,
      nextAppointment: nextAppointment
    });
  });
  
  // Check if no content
  if (childSubscriptions.length === 0) {
    return next(new ErrorResponse(`No Content.`, 404));
  }

  // Check if guardian authorized to see child's subscriptions
  childSubscriptions.forEach(el => {
    if (el.childId.guardianId != req.user.id) {
      return next(new ErrorResponse(`Forbidden.`, 403));
    }
  });
  
  // return data to child
  res.status(200).json({
    success: true,
    message: "Child's subscriptions",
    data: {
      kind: 'subscriptions',
      items: [
        {
          childSubscriptions: childSubs
        }
      ]
    }
  });
});



// @desc    Get child's subscription for guardian
// @route   Get localhost:3000/api/v1/guardian/child-subscription/childId/subscriptionId
// @access  private/guardian
exports.getChildSubForGuardian = asyncHandler (async (req, res, next) => {
  
  // Check if authorized or not
  if (req.user.person != 'guardian') {
    return next(new ErrorResponse(`Forbidden.`, 403));
  }

  // Get one child subscription for guardian
  const childSubscription = await Subscription
  .findOne({_id: req.params.subscriptionId, childId: req.params.childId})
  .select({_id: 1, childId: 1, mentorId: 1, appointments: 1, guardianId: 1})
  .populate({
    path: 'childId',
    select: "fullName picture -_id",
    model: Children
  })
  .populate({
    path: 'mentorId',
    select: "_id fullName gender picture phone countryCode",
    model: Mentor
  });

  let childSub = {
    _id: childSubscription._id,
    childId: childSubscription.childId,
    mentorId: childSubscription.mentorId,
    appointments: childSubscription.appointments
  };

  // Check if no content
  if (!childSubscription) {
    return next(new ErrorResponse(`No Content.`, 404));
  }

  // Check if guardian authorized for child's subscription
  if (childSubscription.guardianId != req.user.id) {
    return next(new ErrorResponse(`Forbidden.`, 403));
  }

  //return data to guardian
  res.status(200).json({
    success: true,
    message: "Child's subscription",
    data: {
      kind: 'subscriptoins',
      items: [
        {
          childSubscription: childSub
        }
      ]
    }
  });
});