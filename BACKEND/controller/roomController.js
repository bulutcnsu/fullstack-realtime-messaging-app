const Room = require("../models/roomModel.js");
const User = require("../models/userModel.js");
const { saveMessage } = require("../controller/messageController");
const jwt = require("jsonwebtoken");

async function saveDirectRoom(roomObj, sender) {

  try {
    const newRoom = new Room({
      room_name: null, //which means room is a person 1-1 room
      type: "private",
      roomKind: "direct",
      user_list: [sender, roomObj.user_list[0]],
      description: "",
    });
    await newRoom.save();

    console.log("Room was saved", newRoom);

    return newRoom;
  } catch (err) {
    console.log("The private room has not been created", err);
    throw err;
  }
}
async function isRoomExist(sender, roomObj) {


  if (roomObj._id && !roomObj._id.startsWith("temp")) {
    const found = await Room.findById(roomObj._id);
    if (found) return found;
  }
  let userIds = [roomObj.user_list[0].userId, sender.userId];

  const existingRoom = await Room.findOne({
    roomKind: "direct",
    "user_list.userId": { $all: userIds },
    $expr: { $eq: [{ $size: "$user_list" }, userIds.length] }
  });

  if (existingRoom) return existingRoom;

  const newRoom = await saveDirectRoom(roomObj, sender);
  return newRoom;
};

async function getRoomInfo(req, res) {
  let query = req.query.room;

  const room = await Room.find({ room_name: query });

  res.json({ room });
}

async function createNewGroupRoom(req, res) {
  //completed
  const { groupname, description, type, username } = req.body;
  const query = await User.findOne({ username: username });
  const user = { userId: query._id, username: username };


  try {
    const newRoom = new Room({
      room_name: groupname,
      type: type,
      roomKind: "group",
      user_list: [user],
      description: description,
    });
    const savedRoom = await newRoom.save();
    console.log("olussturulan room", savedRoom)

    res.status(200).json({
      success: "Group created",
      room: savedRoom,
    });

  const { getIO, getOnlineReceivers,getOnlineUser} = require("../socket/socket");
    const io = getIO();

    const _user = typeof user.toObject === 'function' ? user.toObject() : user
    
    const sender = getOnlineUser(_user)
    const receivers = getOnlineReceivers(savedRoom, _user);

     
  if (sender) {
  io.to(sender).emit("newGroupRoom", { 
    room: savedRoom, 
    joined: true
  });
 
} else { console.log("Sender socket bağlantısı bulunamadı.");}

receivers?.forEach((receiver) => { 
  if (receiver.socketId) {
    console.log(`Room gönderilen alıcı socketId :`, receiver.socketId);
    io.to(receiver.socketId).emit("newGroupRoom", savedRoom);
  }
});
 
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Something went wrong" });
  }

}
async function updatedPublicRoom(req, res) {
  //completed
  try {
    const room = await Room.findById(req.params.roomId);
    const user = await User.findOne({ username: req.body.username });
    let currentRoom = {...room.toObject()};
    let socketUpdatedRoom = room;
    let joinedStatus = false;

    if (
      !room.user_list.some((u) => u.userId.toString() === user._id.toString())) {
       room.user_list.push({ userId: user._id, username: user.username });

      console.log(user.username, "user has added the in list");

       joinedStatus = true ;
       
    } else {
      room.user_list = room.user_list.filter(
        (u) => u.userId.toString() !== user._id.toString()
      );

      joinedStatus = false;
      console.log(user.username, "user has removed the in list");
    }
    
    const savedRoom = await room.save(); 
    const baseRoomObj = savedRoom.toObject();  

   console.log("saved to database successfully",savedRoom);
    res.status(200).json({ success: true });

   
    const { getIO, getOnlineReceivers,getOnlineUser } = require("../socket/socket");
   const io = getIO();
   
   const _user = typeof user.toObject === 'function' ? user.toObject() : user
  
   const currentSocketId = getOnlineUser(_user);
   const receivers = getOnlineReceivers(savedRoom, _user);// first roomlist
  
    console.log("bana gelen current", currentSocketId);
     console.log("all receivers public", receivers);
   
      io.to(currentSocketId).emit("publicGroupUpdated", {...baseRoomObj, joined: joinedStatus });

    
    receivers?.forEach((receiver) => {
      if (receiver.socketId) {
     
        const isThisReceiverJoined = baseRoomObj.user_list.some(
          (u) => u.userId.toString() === receiver.userId.toString()
        );

    
        const personalRoomData = { 
          ...baseRoomObj, 
          joined: isThisReceiverJoined 
        };

        console.log( `${receiver.username}, Joined: ${isThisReceiverJoined}`);
        io.to(receiver.socketId).emit("publicGroupUpdated", personalRoomData);
     
      }
    });


  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getUserRooms(req, res) {
  //completed
  const user = await User.findOne({ username: req.params.username });

  const rooms = await Room.find({
    type: "private",
    user_list: {
      $elemMatch: { userId: user._id },
    },
  })
    .sort({ lastMessageAt: -1 })
    .exec();

  res.json({ rooms });
}

async function getPublicRooms(req, res) {
  //completed

  const user = await User.findOne({ username: req.params.username });
  const datas = await Room.find({ type: "public" })
    .sort({ lastMessageAt: -1 })
    .exec();

  const rooms = datas?.map((room) => ({
    ...room.toObject(),
    joined: room.user_list.some((u) => u.userId.equals(user._id)),
  }));

  rooms.sort((a, b) => b.joined - a.joined);

  res.json({ rooms });
}

async function deleteRoomList(req, res) {
  const list = req.body.list; // Frontend'den gelen obje listesi
  const type = req.body.itemType;

  try {

    const ids = list.map((item) => item._id);
    const result = await Room.deleteMany({ _id: { $in: ids } });

    console.log(`Deleted ${result.deletedCount} room`);

    const { getIO } = require("../socket/socket");
    const io = getIO();

    io.emit("itemDeleted", "room", type, ids);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updatePrivateGroup(req, res) { 
  console.log("update Private room and list", req.body?.list);
  const list = req.body?.list;
  
  try {

    const roomId = req.body.room?._id || req.body.room; 
    const room = await Room.findById(roomId);

       if (!room) {
      console.log("Oda veritabanında bulunamadı! Gelen veri:", req.body.room);
      return res.status(404).json({ success: false, message: "Room not found" });
    }

  
    if (!room.user_list) {
      room.user_list = [];
    }

    let isChanged = false;

    list?.forEach((value) => {
        if (!room.user_list.some((u) => u.userId == value.id)) {
        room.user_list.push({ userId: value.id, username: value.username });
        console.log(value.username, "user has added to the list");
        isChanged = true;
      }
    });

    if (isChanged) {
      await room.save();
    }


    const updatedRoom = room.toObject();

    res.status(200).json({ success: true }); 

    const { getIO, getOnlineReceivers } = require("../socket/socket");
    const io = getIO();
    const receivers = getOnlineReceivers(updatedRoom);

    console.log("all receivers", receivers);

    receivers?.forEach((receiver) => { 
      if (receiver.socketId) {
        console.log(`Room gönderilen alıcı socketId :`, receiver.socketId);
        io.to(receiver.socketId).emit("privateGroupUpdated", updatedRoom);
      }
    });

  } catch (err) {
    console.error("Backend Error in updatePrivateGroup:", err);
  
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
module.exports = {
  isRoomExist,
  getRoomInfo,
  getPublicRooms,
  getUserRooms,
  createNewGroupRoom,
  updatedPublicRoom,
  updatePrivateGroup,
  deleteRoomList,
};
