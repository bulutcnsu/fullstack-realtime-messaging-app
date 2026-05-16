const Room = require("../models/roomModel.js");
const User = require("../models/userModel.js");
const { saveMessage } = require("../controller/messageController");
const jwt = require("jsonwebtoken");


const isRoomExist = async (sender, roomObj) => {


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
  // yoksa oluştur
  const newRoom = await saveDirectRoom(roomObj, sender);
  return newRoom;
};

async function getRoomInfo(req, res) {
  let query = req.query.room;

  const room = await Room.find({ room_name: query });

  res.json({ room });
}

async function saveDirectRoom(roomObj, sender) {
   
  try {
    const newRoom = new Room({
      room_name: null , //which means room is a person 1-1 room
      type: "private",
      roomKind :"direct",
      user_list: [sender, roomObj.user_list[0]],
      description: "",
    });
    await newRoom.save();

    console.log("Room was saved", newRoom);

    return  newRoom;
  } catch (err) {
    console.log("The private room has not been created", err);
    throw err;
  }
}

async function createNewRoom(req, res) {
  //completed
  const { groupname, description, type, username } = req.body;
  const query = await User.findOne({ username: username });
  const user = { userId: query._id, username: username };

  try {
    const newRoom = new Room({
      room_name: groupname,
      type: type,
      roomKind :"group",
      user_list: [user],
      description: description,
    });
  const savedRoom = await newRoom.save();

 res.status(200).json({
    success: "Group created",
    room: savedRoom,
  });

   const { getIO } = require("../socket/socket");
    const io = getIO();
   
      savedRoom.user_list.forEach(u => {
     io.to(u.userId.toString()).emit("newGroupRoom", savedRoom);
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
    let updatedRoom = room;
    let socketUpdatedRoom = room;

    if (
      !room.user_list.some((u) => u.userId.toString() == user._id.toString())
    ) {
      room.user_list.push({ userId: user._id, username: user.username });

      console.log(user.username, "user has added the in list");

      updatedRoom = { ...room.toObject(), joined: true };
      socketUpdatedRoom = { ...room.toObject()};
    } else {
      room.user_list = room.user_list.filter(
        (u) => u.userId.toString() !== user._id.toString()
      );

      updatedRoom = { ...room.toObject(), joined: false };
      socketUpdatedRoom = { ...room.toObject()}

      console.log(user.username, "user has removed the in list");
    }
    await room.save();
    res.status(200).json({ success: true, updatedRoom });

    const { getIO } = require("../socket/socket");
    const io = getIO();

          updatedRoom.user_list.forEach(u => {
         io.to(u.userId.toString()).emit("publicGroupUpdated", socketUpdatedRoom );
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
  const list = req.body.list;
  const room =  await Room.findOne(req.body.room);
  let updatedRoom = room;

  try {
    list.forEach((value) => {
      if (
        !room.user_list.some((u) => u.userId == value.id) 
      ) {
        room.user_list.push({ userId: value.id, username: value.username });

        console.log(value.username, "user has added the in list");

        updatedRoom = { ...room.toObject()}
      }
    });

    await room.save();
    const { getIO } = require("../socket/socket");
    const io = getIO();

      res.status(200).json({ success: true, updatedRoom }); //broadcast to all users
          updatedRoom.user_list.forEach(u => {
         io.to(u.userId.toString()).emit("publicGroupUpdated", updatedRoom);});

          } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}
module.exports = {
  isRoomExist,
  getRoomInfo,
  getPublicRooms,
  getUserRooms,
  createNewRoom,
  updatedPublicRoom,
  updatePrivateGroup,
  deleteRoomList,
};
