// Load required packages
const Subscription = require('../models/subscriptions');
const Guardian = require('../models/guardians');
const Children = require('../models/children');
const Course = require('../models/courses');
const Mentor = require('../models/mentors');
const asyncHandler = require('../middlewares/async');
const { populate } = require('../models/subscriptions');



// @desc    get all subscription for spicific mentor
// @route   Get localhost:3000/api/v1/mentor/subscriptions
// @access  private
exports.getAllMentorSubscriptions = asyncHandler (async (req, res, next) => {
  
  // Check if user is authorized or not
  if (req.user.person != 'mentor') {
    throw new Error('forbidden');
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
    throw new Error('no content');
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
// @access  private
exports.getOneMentorSubscription = asyncHandler (async (req, res, next) => {
  
  // Check if user is authorized or not
  if (req.user.person != 'mentor') {
    throw new Error('forbidden');
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
    throw new Error('no content');
  }

  // Check if mentor authorized
  if (subscription.mentorId.toString() != req.user.id.toString()) {
    throw new Error('forbidden');
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
// @access  private
exports.addNewAppiontment = asyncHandler (async (req, res, next) => {
  
  // Check if user authorized
  if (req.session.person != 'mentor') {
    throw new Error('forbidden');
  }

  const subscription = await Subscription
  .findById(req.params.subscriptionId)
  .select({appointments: 1, _id: 1, mentorId: 1});

  // Check if no content
  if (!subscription) {
    throw new Error('no content');
  }

  // Check if mentor auhtorized
  if (subscription.mentorId.toString() != req.user.id.toString()) {
    throw new Error('forbidden');
  }

  // Add appointment property
  const title = req.body.title;
  const date = req.body.date;
  const time = req.body.time;
  subscription.appointments.push({
    title: title,
    date: `${date}T${time}`
  });

  // return result for mentor
  res.status(201).json({
    success: true,
    message: 'Appointment added successfully'

  });
  await subscription.save();
});



// @desc    get all subscription for child
// @route   Get localhost:3000/api/v1/child/home
// @access  private
exports.getAllChildSubscriptions = asyncHandler (async (req, res, next) => {
  
  // Check if authorized or not
  if (req.user.person != 'child') {
    throw new Error('forbidden');
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
    throw new Error('no content');
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
// @access  private
exports.getChildSubsForGuardian = asyncHandler (async (req, res, next) => {

  // Check if authorized or not
  if (req.user.person != 'guardian') {
    throw new Error('forbidden');
  }

  // get child subscriptions for guardian
  const childSubscriptions = await Subscription
  .find({childId: req.params.childId})
  .select({_id: 1, courseId: 1, mentorId: 1, appointments: 1})
  .populate({
    path: 'mentorId',
    select: "_id fullName picture",
    model: Mentor
  })
  .populate({
    path: 'courseId',
    select: "title description picture -_id",
    model: Course
  });
  
  // Get child's nextAppointment && other data
  let result = [];
  childSubscriptions.forEach(el => {
    let arrayOfDates = [];
    let minDate;
    el.appointments.forEach(el => {
      if (el.date > Date.now()) {
        arrayOfDates.push(el.date);
      }
    });
    minDate = new Date(Math.min(...arrayOfDates));
    result.push({
      _id: el._id,
      mentorId: el.mentorId,
      courseId: el.courseId,
      nextAppointment: minDate
    });
  });
  
  // Check if no content
  if (childSubscriptions.length === 0) {
    throw new Error('no content');
  }

  // Check if guardian authorized for child's subscriptions
  const child = await Children
  .findById(req.params.childId)
  .select({_id: 0, guardianId: 1});
  if(child.guardianId != req.user.id) {
    throw new Error('forbidden');
  }
  
  // return data to child
  res.status(200).json({
    success: true,
    message: "Child's subscriptions",
    data: {
      kind: 'subscriptions',
      items: [
        {
          childSubscriptions: result
        }
      ]
    }
  });
});



// @desc    Get child's subscription for guardian
// @route   Get localhost:3000/api/v1/guardian/child-subscription/childId/subscriptionId
// @access  private
exports.getOneChildsubForGuardian = asyncHandler (async (req, res, next) => {
  
  // Check if authorized or not
  if (req.user.person != 'guardian') {
    throw new Error('forbidden');
  }

  // Get one child subscription for guardian
  const childSubscription = await Subscription
  .findById(req.params.subscriptionId)
  .select({_id: 1, childId: 1, mentorId: 1, appointments: 1})
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

  // Check if no content
  if (!childSubscription) {
    throw new Error('no content');
  }

  // Check if guardian authorized for child's subscription
  const child = await Children
  .findById(req.params.childId)
  .select({_id: 0, guardianId: 1});
  if(child.guardianId != req.user.id) {
    throw new Error('forbidden');
  }

  //return data to guardian
  res.status(200).json({
    success: true,
    message: "Child's subscription",
    data: {
      kind: 'subscriptoins',
      items: [
        {
          childSubscription: childSubscription
        }
      ]
    }
  });
});