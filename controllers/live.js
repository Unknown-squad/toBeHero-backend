// load required modules
const asyncHandler = require(`../middlewares/async`);
const Subscription = require(`../models/subscriptions`);
const ErrorResponse = require(`../utils/errorResponse`);

// @route   POST `/api/v1/mentor/subscription/:subscriptionId/appointment/:appointmentId/add-note`
// @desc    add notes to appointment preparing to start live call
// @access  private (only mentor can add notes)
exports.postNote = asyncHandler(async (req, res, next) => {
  
  // check note description
  if(!req.body || !req.body.params || !req.body.params.noteDescription) {
    return next(new ErrorResponse(`please send description of note.`, 400));
  }

  // find subscription
  const currentSubscription = await Subscription.findById(req.params.subscriptionId);
  
    // check if subscription exists
    if(!currentSubscription) {
      return next(new ErrorResponse(`there's no such subscription found with given id.`, 404));
    }

  // check if mentor has access to current subscription
  if(req.user.id != currentSubscription.mentorId) {
    return next(new ErrorResponse(`forbidden.`, 403));
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

  // check if appointment is canceled
  if(currentAppointment.cancel) {
    return next(new ErrorResponse(`this appointment is already canceled.`, 400));
  }

  /* // be sure that note can't be added before appointment date
  if(currentAppointment.date.getTime() > Date.now()) {
    return next(new ErrorResponse(`appointment not come yet.`, 400));
  } */
  
  // check date of note
  // be sure that appointment isn't outdated (3 hours)
  if(Date.now() > currentAppointment.date.getTime() + (5 * 60 * 60 * 1000) /* 5 hours */) {
    return next(new ErrorResponse(`this appointment is outdated.`, 400));
  }

  // push note data into subscription
  currentSubscription.notes.push({
    appointmentId: currentAppointment._id,
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

// @route   GET `/api/v1/subscription/:subscriptionId/appointment/:appointmentId/notes`
// @desc    get live notes to mentor or child
// @access  private (only mentor or child can get notes)
exports.getNotes = asyncHandler(async (req, res ,next) => {
  
  // globas array to store notes
  const notes = [];
  
  // global variable to check if notes found
  let found = false;
  
  // find subscription
  const currentSubscription = await Subscription.findById(req.params.subscriptionId);
  
    // check if subscription exists
    if(!currentSubscription) {
      return next(new ErrorResponse(`there's no such subscription found with given id.`, 404));
    }
  
    // check if mentor has access to notes
    if(req.user.person == `mentor`) {
      if(req.user.id != currentSubscription.mentorId) {
        return next(new ErrorResponse(`forbidden.`, 403));
      }
    }

    // check if child has access to notes
    else if(req.user.person == `child`) {
      if(req.user.id != currentSubscription.childId) {
        return next(new ErrorResponse(`forbidden.`, 403));
      }
    }

  // find notes using appointment id
  currentSubscription.notes.forEach((element) => {

    if(element.appointmentId == req.params.appointmentId) {
      
      // push found notes into notes array
      notes.push({noteDescription: element.description});
      found = true;

    }

  });

  // check if note exists
  if(!found) {
    return next(new ErrorResponse(`there's no such appointment notes.`, 404));
  }

  // send response
  res.status(200).json({
    success: true,
    message: `found live notes successfully.`,
    count: notes.length,
    data: {
      kind: `subscription data (notes)`,
      items: notes
    } 
  });

});

// @route   PUT `/api/v1/mentor/subscription/:subscriptionId/appointment/:appointmentId/cancel`
// @desc    cancel appointment as mentor
// @access  private (only mentor can cancel appointment)
exports.putCancelAppointment = asyncHandler(async (req, res, next) => {

  // global variable to store appointment index
  let appointmentIndex = -1;

  // find subscription
  const currentSubscription = await Subscription.findById(req.params.subscriptionId);
  
  // check if subscription exists
  if(!currentSubscription) {
    return next(new ErrorResponse(`there's no such subscription found with given id.`, 404));
  }

  // check if mentor has access to current subscription
  if(req.user.id != currentSubscription.mentorId) {
    return next(new ErrorResponse(`forbidden.`, 403));
  }

  // find appointment
  const currentAppointment = currentSubscription.appointments.find((element) => {
    appointmentIndex++;
    if(element._id == req.params.appointmentId) {
      return element;
    }
  });

  // check if appointment exists
  if(!currentAppointment) {
    return next(new ErrorResponse(`there's no such appointment found with given id.`, 404));
  }
  
  // check if appointment is already gone
  if(currentAppointment.date.getTime() < Date.now()) {
    return next(new ErrorResponse(`can't cancel appointment that already gone.`, 400));
  }
  
  // check if subscription completed
  if(currentSubscription.complete) {
    return next(new ErrorResponse(`can't cancel appointment of subscription that already completed.`, 400));
  }
  
  // check if appointment already canceled
  if(currentAppointment.cancel == true) {
    return next(new ErrorResponse(`can't cancel appointment that already canceled.`, 409));
  }

  // cancel the appointment
  currentSubscription.appointments[appointmentIndex].cancel = true;

  // save
  await currentSubscription.save();

  // send response
  res.status(200).json({
    success: true,
    message: `appointment cancelled successfully.`
  });

});

// @route   Delete `/api/v1/mentor/subscription/:subscriptionId/appointment/:appointmentId/delete`
// @desc    delete appointment as mentor
// @access  private (only mentor can delete appointment)
exports.deleteAppointment = asyncHandler(async (req, res, next) => {

  // global variable to store appointment index
  let appointmentIndex = -1;

  // find subscription
  const currentSubscription = await Subscription.findById(req.params.subscriptionId);

  // check if subscription exists
  if(!currentSubscription) {
    return next(new ErrorResponse(`there's no such subscription found with given id.`, 404));
  }

  // check if mentor has access to current subscription
  if(req.user.id != currentSubscription.mentorId) {
    return next(new ErrorResponse(`forbidden.`, 403));
  }

  // find appointment
  const currentAppointment = currentSubscription.appointments.find((element) => {
    appointmentIndex++;
    if(element._id == req.params.appointmentId) {
      return element;
    }
  });

  // check if appointment exists
  if(!currentAppointment) {
    return next(new ErrorResponse(`there's no such appointment found with given id.`, 404));
  }
  
  // check if subscription completed
  if(currentSubscription.complete) {
    return next(new ErrorResponse(`can't delete appointment of subscription that already completed.`, 400));
  }

  // check if appointment canceled or not
  if(currentAppointment.cancel != true) {
    return next(new ErrorResponse(`can't delete appointment that doesn't canceled yet.`, 404));
  }

  // delete appointment
  currentSubscription.appointments.splice(appointmentIndex, 1);

  // save
  await currentSubscription.save();

  // return response
  res.status(200).json({
    success: true,
    message: `appointment deleted successfully.`
  });

});