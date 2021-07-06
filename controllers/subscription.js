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
  
  // Get all subscriptions for mentor
  const subscriptions = await Subscription
  .find({mentorId: req.user.id, complete: false})
  .select({_id: 1, appointments: 1, guardianId: 1, childId: 1, courseId: 1})
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

  // Check appointments and return unfinished appointments and other data
  let mentorSubs = [];
  subscriptions.forEach(el => {
    let arrayOfDates = [];
    el.appointments.forEach(el => {
      if (el.date > Date.now()) {
        arrayOfDates.push({
          cancel: el.cancel,
          mentor: el.mentor,
          child: el.child,
          _id: el._id,
          title: el.title,
          date: el.date
        });
      }
    });
    
    // sort appointments by minimum value
    if (arrayOfDates.length > 1) {
      let temp = 0;
      for (let i = 0; i < arrayOfDates.length; i++) {
        for (let j = i; j < arrayOfDates.length; j++) {
          if (arrayOfDates[j].date < arrayOfDates[i].date) {
            temp = arrayOfDates[j];
            arrayOfDates[j] = arrayOfDates[i];
            arrayOfDates[i] = temp;
          }
        }
      }
    }

    mentorSubs.push({
      _id: el._id,
      guardianId: el.guardianId,
      courseId: el.courseId,
      childId: el.childId,
      appointments: arrayOfDates
    });
  });

  // return data to mentor
  res.status(200).json({
    success: true,
    message: 'Subscriptions data',
    data: {
      kind: 'subscription',
      items: mentorSubs
    }
  });
});



// @desc    get one subscription for spicific mentor
// @route   Get localhost:3000/api/v1/mentor/subscription/subscriptionId
// @access  private/mentor
exports.getOneMentorSubscription = asyncHandler (async (req, res, next) => {

  // Get one subscription for mentor
  const subscription = await Subscription
  .findOne({_id: req.params.subscriptionId, complete: false})
  .select({_id: 1, guardianId: 1, childId: 1, courseId: 1, appointments: 1, mentorId: 1})
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

  // Check appointments and return unfinished appointments and other data
  let appointments = [];
  subscription.appointments.forEach(el => {
    if (el.date > Date.now()) {
      appointments.push({
        cancel: el.cancel,
        mentor: el.mentor,
        child: el.child,
        _id: el._id,
        title: el.title,
        date: el.date
      });
    }
  });

  // sort appointments by minimum value
  if (appointments.length > 1) {
    let temp = 0;
    for (let i = 0; i < appointments.length; i++) {
      for (let j = i; j < appointments.length; j++) {
        if (appointments[j].date < appointments[i].date) {
          temp = appointments[j];
          appointments[j] = appointments[i];
          appointments[i] = temp;
        }
      }
    }
  }

  // Return data which needed
  let subscriptionData = {
    _id: subscription._id,
    guardianId: subscription.guardianId,
    childId: subscription.childId,
    courseId: subscription.courseId,
    appointments: appointments
  }

  // return data to mentor
  res.status(200).json({
    success: true,
    message: 'subscription data',
    data: {
      kind: 'subscription',
      items: [subscriptionData]
    }
  });
});



// @desc    Add new appiontment
// @route   Post localhost:3000/api/v1/mentor/subscription/:subscriptionId/add-appointment
// @access  private/mentor
exports.addNewAppiontment = asyncHandler (async (req, res, next) => {

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

  // Check if req.body is empty
  const { params, method } = req.body;
  if (!params || !method) {
    return next(new ErrorResponse('Method or params are missing.', 400));
  }
  const { title, date, time } = req.body.params;
  if (!title || !date || !time) {
    return next(new ErrorResponse('Missing property in params.', 400));
  }

  // Check if day is valid
  if (date.split('-').length < 3) {
    return next(new ErrorResponse('Invalid date or time', 400));
  }
  
  // Check if date of appointment valid
  const newDate = new Date(`${date}T${time}`);
  if (newDate < Date.now()) {
    return next(new ErrorResponse('Date must be an upcoming date', 400));
  }

  // Add appointment
  subscription.appointments.push({
    title: req.body.params.title,
    date: newDate
  });
  
  // Save result
  await subscription.save();

  // return result for mentor
  res.status(201).json({
    success: true,
    message: 'Appointment created successfully'
  });
});



// @desc    get all subscription for child
// @route   Get localhost:3000/api/v1/child/home
// @access  private/child
exports.getAllChildSubscriptions = asyncHandler (async (req, res, next) => {

  // Get all child subscription
  const subscriptions = await Subscription
  .find({childId: req.user.id, complete: false})
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
  if (subscriptions.length === 0) {
    return next(new ErrorResponse(`No Content.`, 404));
  }
  
  // Get specific data from appointments
  let subscriptionsData = [];
  subscriptions.forEach(el => {
    let appointments = [];
    el.appointments.forEach(el => {
      if (el.date > Date.now()) {
        appointments.push({
          _id: el._id,
          title: el.title,
          date: el.date,
          active: el.active
        });
      }
    });

    // sort appointments by minimum value
    if (appointments.length > 1) {
      let temp = 0;
      for (let i = 0; i < appointments.length; i++) {
        for (let j = i; j < appointments.length; j++) {
          if (appointments[j].date < appointments[i].date) {
            temp = appointments[j];
            appointments[j] = appointments[i];
            appointments[i] = temp;
          }
        }
      }
    }
    
    subscriptionsData.push({
      _id: el._id,
      mentorId: el.mentorId,
      courseId: el.courseId,
      appointments: appointments
    });
  });
  // return data to child
  res.status(200).json({
    success: true,
    message: 'subscriptions data',
    data: {
      kind: 'subscriptions',
      items: subscriptionsData
    }
  });
});



// @desc    Get child's subscription for guardian
// @route   Get localhost:3000/api/v1/guardian/child-subscription/childId
// @access  private/guardian
exports.getChildSubsForGuardian = asyncHandler (async (req, res, next) => {

  // get child subscriptions for guardian
  const childSubscriptions = await Subscription
  .find({childId: req.params.childId, complete: false})
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
  
  // Check if no content
  if (childSubscriptions.length === 0) {
    return next(new ErrorResponse(`No Content.`, 404));
  }

  // Check if guardian authorized to see child's subscriptions
  childSubscriptions.forEach(el => {
    if (el.childId.guardianId.toString() != req.user.id.toString()) {
      return next(new ErrorResponse(`Forbidden.`, 403));
    }
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

  // return data to child
  res.status(200).json({
    success: true,
    message: "Child's subscriptions",
    data: {
      kind: 'subscriptions',
      items: childSubs
    }
  });
});



// @desc    Get child's subscription for guardian
// @route   Get localhost:3000/api/v1/guardian/child-subscription/childId/subscriptionId
// @access  private/guardian
exports.getChildSubForGuardian = asyncHandler (async (req, res, next) => {

  // Get one child subscription for guardian
  const childSubscription = await Subscription
  .findOne({_id: req.params.subscriptionId, childId: req.params.childId,guardianId: req.user.id, complete:false})
  .select({_id: 1, childId: 1, mentorId: 1, appointments: 1, guardianId: 1, courseId: 1})
  .populate({
    path: 'childId',
    select: "fullName picture -_id",
    model: Children
  })
  .populate({
    path: 'mentorId',
    select: "_id fullName gender picture phone countryCode",
    model: Mentor
  })
  .populate({
    path: 'courseId',
    select: "title _id",
    model: Course
  });

  // Check if no content
  if (!childSubscription) {
    return next(new ErrorResponse(`No Content.`, 404));
  }

  // Check appointments and return unfinished appointments and other data
  let appointments = [];
  childSubscription.appointments.forEach(el => {
    if (el.date > Date.now()) {
      appointments.push({
        cancel: el.cancel,
        mentor: el.mentor,
        child: el.child,
        _id: el._id,
        title: el.title,
        date: el.date,
        active: el.active
      });
    }
  });

  // sort appointments by minimum value
  if (appointments.length > 1) {
    let temp = 0;
    for (let i = 0; i < appointments.length; i++) {
      for (let j = i; j < appointments.length; j++) {
        if (appointments[j].date < appointments[i].date) {
          temp = appointments[j];
          appointments[j] = appointments[i];
          appointments[i] = temp;
        }
      }
    }
  }

  // Save the result which will return to the user
  let childSub = {
    _id: childSubscription._id,
    child: childSubscription.childId,
    mentor: childSubscription.mentorId,
    course: childSubscription.courseId,
    appointments: appointments
  };

  // Check if guardian authorized for child's subscription
  if (childSubscription.guardianId.toString() != req.user.id.toString()) {
    return next(new ErrorResponse(`Forbidden.`, 403));
  }

  //return data to guardian
  res.status(200).json({
    success: true,
    message: "Child's subscription",
    data: {
      kind: 'subscriptoins',
      items: [childSub]
    }
  });
});



// @desc    Handle completed courses
// @route   POST localhost:3000/api/v1/mentor/complete-subscription/subscriptionId
// @access  private/mentor
exports.finishCourse  = asyncHandler (async (req, res, next) => {
  
  // Get single subscription by id
  const subscription = await Subscription
  .findById(req.params.subscriptionId)
  .select('complete balance mentorId');
  

  // Check if no subscription
  if (!subscription) {
    return next(new ErrorResponse(`No Content.`, 404));
  }


  // Check if mentor have access to this subscription
  if (subscription.mentorId.toString() !== req.user.id.toString()) {
    return next(new ErrorResponse(`Forbidden`, 403));
  }

  
  // Get mentor by id to change balance
  const mentor = await Mentor
  .findById(subscription.mentorId)
  .select('balance');
  
  // Check if no mentor
  if (!mentor) {
    return next(new ErrorResponse(`No Content.`, 404));
  }

  // Make transaction process to mentor
  mentor.balance += subscription.balance;
  mentor.save();

  // Convert complete to true and balance to 0
  subscription.complete = true;
  subscription.balance = 0;
  subscription.save();


  res.status(201).json({
    success: true,
    message: 'Course completed successfully'
  });
});