// Load required packages
const Subscription = require('../models/subscriptions');
const Guardian = require('../models/guardians');
const Children = require('../models/children');
const Course = require('../models/courses');

// @desc    get all subscription courses for spicific mentor
// @route   Get localhost:3000/api/v1/mentor/subscriptions
// @access  private
exports.getAllSubscriptions = (async (req, res, next) => {
  try {

    // Check if user is authorized or not
    /* req.session.person = 'mentor'; */
    if (req.session.person != 'mentor') {
      res.status(403).json({
        success: false,
        error: {
          code: 403,
          message: 'forbidden'
      }});
    }


    // Get all subscriptions
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
      return res.status(404).json({
        success: false,
        error: {
          code: 404,
          message: "There's no subsriptions yet."
        }
      });
    }
  
  
    // return data to mentor
    res.status(200).json({
      success: true,
      message: 'Subscription data',
      data: {
        kind: 'subscription',
        items: [
          {
            subscriptions: subscriptions
          }
        ]
      }
    });
  }
  catch (error) {
    console.log(error.message);
  }
});