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
    // 1. Kullanıcı bağlandığında ID'sini kaydediyoruz
    const currentUserIdStr = socket.userId.toString();
    onlineUsers.set(currentUserIdStr, socket.id);
    
    console.log("Bağlanan kullanıcı:", socket.userId);

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
    });

    socket.on("newMessage", async (message, username, roomObj) => {
      console.log("Fronttan gelen mesaj:", message);
      const sender = { userId: socket.userId, username: username };

      try {
        const room = await isRoomExist(sender, roomObj);
        const savedMsg = await saveMessage(sender, room, message);

        if (savedMsg) {
      
          let activeReceivers = getOnlineReceivers(room, onlineUsers); 
          
          const isAnyReceiverOnline = activeReceivers.some(user => user.socketId !== null);
          const msgWithStatus = isAnyReceiverOnline ? "sent" : "sending";

          io.to(socket.id).emit("dbNewMessage", {
            room,
            message: savedMsg,
            tempRoomId: roomObj._id,
            tempMsgId: message._id, 
            status: msgWithStatus
          });

          
          activeReceivers = activeReceivers.filter(
            user => user.userId.toString() !== currentUserIdStr
          );

          
          activeReceivers.forEach((receiver) => {
            if (receiver.socketId) {
              console.log("Mesajın gittiği alıcı socketId:", receiver.socketId);
              
              io.to(receiver.socketId).emit("dbNewMessage", {
                room,
                message: savedMsg,
                tempRoomId: roomObj._id,
              });
            }
          });
        }
      } catch (err) {
        console.log("Socket hatası:", err); 
      }
    });

     socket.on("leaveRoom", (groupId) => {
      socket.leave(groupId);
      console.log(`${socket.userId} leaved room ${groupId}`);
    });

 socket.on("disconnect", () => {
    onlineUsers.delete(currentUserIdStr);
  });
  });

  return io;
}
function getOnlineReceivers(room) {
  if (!room || !room.user_list) return [];

  return room.user_list.map(user => {
    const rawUser = typeof user.toObject === 'function' ? user.toObject() : user;
    const userIdObj = rawUser.userId || rawUser._id;
    const userIdStr = userIdObj ? userIdObj.toString() : "";

    return {
      userId: userIdStr,
      username: rawUser.username,
      socketId: userIdStr ? onlineUsers.get(userIdStr) || null : null
    };
  });
}
function getIO() {
  if (!server) throw new Error("Socket io not initiaized");
  return server;
}



module.exports = { initSocket, getIO, getOnlineReceivers};
