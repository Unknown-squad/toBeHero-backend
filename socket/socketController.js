// load required modules
const { Server } = require(`socket.io`);

// exporting socket server
exports.ioServer = (httpServer) => {

  // create socket.io server
  const io = new Server(httpServer);
  
  // setting controller
  io.on(`connect`, (socket) => {

    
    
  });

};