// Load required packages
const Subscription = require('../models/subscriptions');
const Guardian = require('../models/guardians');
const Children = require('../models/children');
const Course = require('../models/courses');
const asyncHandler = require('../middlewares/async');

// @desc    get all subscription for spicific mentor
// @route   Get localhost:3000/api/v1/mentor/subscriptions
// @access  private
exports.getAllSubscriptions = asyncHandler (async (req, res, next) => {

  // Check if user is authorized or not
  if (req.session.person != 'mentor') {
    throw new Error('forbidden');
  }


  // Get all subscriptions for mentor
  const subscriptions = await Subscription
  .find({mentorId: req.session.user.id})
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
exports.getOneSubscription = asyncHandler (async (req, res, next) => {

  // Check if user is authorized or not
  if (req.session.person !== 'mentor') {
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
  if (subscription.mentorId.toString() !== req.session.user.id.toString()) {
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