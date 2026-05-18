const app = require("express")();
const http = require("http").Server(app);
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { socketAuth } = require("../middleware/socketMiddleware");
const { isRoomExist} = require("../controller/roomController");
const { saveMessage } = require("..//controller/messageController");

const cors = require("cors");
let server = null;
let senderInfo ;

  const onlineUsers = new Map();

  

function initSocket(io) {
  io.use(socketAuth);
  server = io;


  io.on("connection", (socket) => {
    
    onlineUsers.set(socket.userId, socket.id);
    console.log("connected user:", socket.userId);
    console.log("online users", onlineUsers);
    senderInfo = { userId: socket.userId, socketId :socket.id};
    socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
  });

    socket.on("newMessage", async (message, username, roomObj) => {
      console.log("fronttan gelen mesaj", message);
       console.log("fronttan gelen room", roomObj);
      const sender = { userId: socket.userId, username: username };
     

      try {
        const room = await isRoomExist(sender, roomObj);
        console.log("sockete dönen room", room);

        const savedMsg = await saveMessage(sender, room, message)
          if (savedMsg) {

 
  const activeReceivers = getOnlineReceivers(room,sender); //take room
  const isAnyReceiverOnline = activeReceivers.some(user => user.socketId !== undefined);
  const msgWithStatus = isAnyReceiverOnline ? "sent" : "sending";


  io.to(socket.id.toString()).emit("dbNewMessage", { //message to owner to order state
        room,
        message: savedMsg,
        tempRoomId: roomObj._id,
        tempMsgId : message._id, 
        status: msgWithStatus
  });
  console.log(`Sender  e mesaj gönderildi (${sender}):`);
 
  activeReceivers.forEach((receiver) => {
    if (receiver.socketId) {
      console.log(`Mesaj gönderilen alıcı socketId ):`, receiver.socketId);
      
      io.to(receiver.socketId).emit("dbNewMessage", {
        room,
        message: savedMsg,
        tempRoomId: roomObj._id,
               
      });
    }
  });
}}   
  catch (err) {
        console.log(err); }});

     socket.on("leaveRoom", (groupId) => {
      socket.leave(groupId);
      console.log(`${socket.userId} leaved room ${groupId}`);
    });

 socket.on("disconnect", () => {
    onlineUsers.delete(socket.userId);
  });
  });

  return io;
}
 function getOnlineReceivers(room)  {
  console.log("  current user", senderInfo.userId);

   const sender =  onlineUsers.get(senderInfo.userId.toString())
    const receivers = room.user_list.filter(
    user => user.userId.toString() !== senderInfo.userId.toString()); 
   const activeReceivers = receivers.map(user => ({
    ...user,
    socketId: onlineUsers.get(user.userId.toString())
  }));

  return activeReceivers;

}
function getIO() {
  if (!server) throw new Error("Socket io not initiaized");
  return server;
}



module.exports = { initSocket, getIO, getOnlineReceivers};
