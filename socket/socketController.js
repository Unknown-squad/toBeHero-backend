// load required modules

const { activeAppointment } = require(`../utils/activateAppointment`);

// exporting socket server
exports.ioServer = (httpServer) => {
  // create socket.io server
  const io = require("socket.io")(httpServer, {
    cors: {
      origin: process.env.CLIENT_DOMAIN,
      methods: ["GET", "POST"],
    },
  });

  // setting controller
  io.on(`connect`, (socket) => {
    
    // send id of child to mentor
    socket.emit("me", socket.id);
    
    // listen to event that come from mentor to active button that allow child to open live page
    socket.on("mentor-in", async (subscriptionId, appointmentId) => {

      // store subscription id and appointment id in mentor socket.io profile
      socket.subscriptionId = subscriptionId;
      socket.appointmentId = appointmentId;

      // active 'join live' button to child
      io.emit(`child-in${subscriptionId}`, true);

      // save appointment activation to database
      await activeAppointment(subscriptionId, appointmentId, true);
      
    });
    
    // listening to event that allow child to send his socket id to mentor
    socket.on(`hero-send-id`, (subscriptionId) => {
      
      // send socket id of child to mentor
      io.emit(`subscription${subscriptionId}`, socket.id);
      
    });
    
    // deactivate the appointment when user end call
    socket.on(`call-ended`, async (subscriptionId, appointmentId) => {
      
      // save appointment activation to database
      await activeAppointment(subscriptionId, appointmentId, false);

    })
    
    // listening to event that raised if call is ended
    socket.on("disconnect", async () => {

      // raise event that notify user that call ended
      socket.broadcast.emit("callEnded");

      // deactivate the appointment if disconnected user is mentor
      if(socket.subscriptionId && socket.appointmentId) {

        // save appointment activation to database
        await activeAppointment(subscriptionId, appointmentId, false);

      }

    });

    // listening to event that recieves video data
    socket.on("callUser", (data) => {

      // forward video data to another user
      io.to(data.userToCall).emit("callUser", {
        signal: data.signalData,
        from: data.from,
        name: data.name,
      });

    });

    // listening to event that comes from mentor to allow child to answer the call
    socket.on("answerCall", (data) => {

      // raise event to allow child to answer the call
      io.to(data.to).emit("callAccepted", data.signal);
      
    });
  });
};