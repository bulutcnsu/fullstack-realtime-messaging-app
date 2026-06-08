const app = require("express")();
const http = require("http").Server(app);
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { socketAuth } = require("../middleware/socketMiddleware");
const { isRoomExist } = require("../controller/roomController");
const { saveMessage } = require("..//controller/messageController");

const cors = require("cors");
const { omitUndefined } = require("mongoose");
let server = null;
let senderInfo;

const onlineUsers = new Map();


function initSocket(io) {
  io.use(socketAuth);
  server = io;


  io.on("connection", (socket) => {

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
        const _room = await isRoomExist(sender, roomObj);
        const savedMsg = await saveMessage(sender, _room, message);

        if (savedMsg) {

          let activeReceivers = getOnlineReceivers(_room, onlineUsers);

          const isAnyReceiverOnline = activeReceivers.some(user => user.socketId !== null);
          const msgWithStatus = isAnyReceiverOnline ? "sent" : "sending";
          const room = _room.toObject ? _room.toObject() : { ..._room };
          room.joined = true;

          io.to(socket.id).emit("dbNewMessage", {
            room,
            message: savedMsg,
            tempRoomId: roomObj._id,
            tempMsgId: message._id,
            status: msgWithStatus
          });


          activeReceivers = activeReceivers.filter(user => user.userId.toString() !== currentUserIdStr);
          console.log("bana gelen activeReceivers", activeReceivers);

          activeReceivers.forEach((receiver) => {
            if (receiver.socketId) {
              let room = _room.toObject ? _room.toObject() : { ..._room };
              room.joined = true;

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
function getOnlineReceivers(room, user) {

  if (!room || !room.user_list) return [];

  const receiverList = room.user_list?.filter((u) => u.userId !== (user.userId || user._id));

  return receiverList.map(user => {
    const _user = user;
    const userIdObj = _user.userId || _user._id;
    const userIdStr = userIdObj ? userIdObj.toString() : "";

    return {
      userId: userIdStr,
      username: _user.username,
      socketId: userIdStr ? onlineUsers.get(userIdStr) || null : null
    };
  });
}

function getAllUsers() {
 
  if(!onlineUsers) return [];

  return [...onlineUsers.values()];

}

function getOnlineUser(user) {
  if (!user) return null;

  const _user = user;
  const userIdObj = _user.userId || _user._id;
  const userIdStr = userIdObj ? userIdObj.toString() : "";

  return onlineUsers.get(userIdStr);

}
function getIO() {
  if (!server) throw new Error("Socket io not initiaized");
  return server;
}



module.exports = { initSocket, getIO, getOnlineUser, getAllUsers, getOnlineReceivers };
