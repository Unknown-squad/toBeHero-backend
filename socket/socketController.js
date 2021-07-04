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
    // await activeAppointment(subscriptionId, appointmentId, true);

    socket.emit("me", socket.id);

    socket.on("mentor-in", (subscriptionId) => {
      io.emit(`child-in${subscriptionId}`, true);
    });

    socket.on(`hero-send-id`, (subscriptionId) => {
      console.log("hero id is" + socket.id);
      io.emit(`subscription${subscriptionId}`, socket.id);
    });

    socket.on("disconnect", () => {
      socket.broadcast.emit("callEnded");
    });

    socket.on("callUser", (data) => {
      io.to(data.userToCall).emit("callUser", {
        signal: data.signalData,
        from: data.from,
        name: data.name,
      });
    });

    socket.on("answerCall", (data) => {
      io.to(data.to).emit("callAccepted", data.signal);
    });
  });
};