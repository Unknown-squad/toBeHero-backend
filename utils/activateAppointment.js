// load required modules
const Subscription = require("../models/subscriptions");

// export function to de/acitve appointment
exports.activeAppointment = async (subscriptionId, appointmentId, appointmentStatus) => {

  // find subscription with it's id
  const currentSubscription = await Subscription.findById(subscriptionId);

  // find appointment index
  const appointmentIndex = currentSubscription.appointments.findIndex(element => element._id == appointmentId);

  // activate appointment
  currentSubscription.appointments[appointmentIndex].active = appointmentStatus;

  // save appointment activation in database
  await currentSubscription.save();
  
};