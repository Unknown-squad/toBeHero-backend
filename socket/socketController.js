// load required modules
const { Server } = require(`socket.io`);
const {activeAppointment} = require(`../utils/activateAppointment`);

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

        // activate appointment
        activeAppointment(subscriptionId, appointmentId, true);
        
      });
      
      // listening to end-live event
      io.on(`end-live`, () => {
        
        // create event to active live button
        io.to(roomId).emit(`deactivate-button`, true);
        
        // deactivate appointment
        activeAppointment(subscriptionId, appointmentId, false);

      });

    });
    
  });

};