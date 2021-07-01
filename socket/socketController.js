// load required modules
const { Server } = require(`socket.io`);
const Subscription = require(`../models/subscriptions`);

// exporting socket server
exports.ioServer = (httpServer) => {

  // create socket.io server
  const io = new Server(httpServer);
  
  // setting controller
  io.on(`connect`, (socket) => {

    // join to room
    socket.on(`join-room`, (subscriptionId, appointmentId) => {

      // create room id
      const roomId = `${subscriptionId}SA${appointmentId}`;

      // join user to room
      socket.join(roomId);

      // listening to start-live event
      io.on(`start-live`, async () => {

        // create event to active live button
        io.to(roomId).emit(`activate-button`, roomId);

        // find subscription with it's id
        const currentSubscription = Subscription.findById(subscriptionId);
        
        // find appointment index
        const appointmentIndex = currentSubscription.appointments.findIndex(element => element._id == appointmentId);

        // activate appointment
        currentSubscription.appointments[appointmentIndex].active = true;
        
        // save appointment activation in database
        currentSubscription.save();

      });

      // listening to end-live event
      io.on(`end-live`, () => {

        // create event to active live button
        io.to(roomId).emit(`deactivate-button`, true);

        // find subscription with it's id
        const currentSubscription = Subscription.findById(subscriptionId);
        
        // find appointment index
        const appointmentIndex = currentSubscription.appointments.findIndex(element => element._id == appointmentId);

        // activate appointment
        currentSubscription.appointments[appointmentIndex].active = false;
        
        // save appointment activation in database
        currentSubscription.save();

      });

    });
    
  });

};