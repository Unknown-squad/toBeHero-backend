// load required modules
const asyncHandler = require(`../middlewares/async`);
const Subscription = require(`../models/subscriptions`);
const ErrorResponse = require(`../utils/errorResponse`);

// @route   POST `/api/v1/mentor/subscription/:subscriptionId/appointment/:appointmentId/add-note`
// @desc    add notes to appointment preparing to start live call
// @access  private (only mentor can add notes)
exports.postNote = asyncHandler(async (req, res, next) => {

  // find subscription
  const currentSubscription = await Subscription.findById(req.params.subscriptionId);

  // check if subscription exists
  if(!currentSubscription) {
    return next(new ErrorResponse(`there's no such subscription found with given id.`, 404));
  }

  // find appointment
  const currentAppointment = currentSubscription.appointments.find((element) => {
    if(element._id == req.params.appointmentId) {
      return element;
    }
  });

  // check if appointment exists
  if(!currentAppointment) {
    return next(new ErrorResponse(`there's no such appointment found with given id.`, 404));
  }

  // check note description
  if(!req.body || !req.body.params || !req.body.params.noteDescription) {
    return next(new ErrorResponse(`please send description of note.`, 400));
  }

  // push note data into subscription
  currentSubscription.notes.push({
    appointmentId: currentAppointment._id,
    date: currentAppointment.date,
    description: req.body.params.noteDescription
  });

  // save
  await currentSubscription.save();

  // send response
  res.status(201).json({
    success: true,
    message: `note added successfully.`
  });

});