const mongoose = require("mongoose");
const Message = require("../models/messageModel.js");
const Room = require("../models/roomModel.js");

async function saveMessage(sender, room, message) {

  try {
    const msg = new Message({
      roomId: room._id,
      senderId: sender.userId,
      senderName: sender.username,
      content: message.content

    });
    await msg.save();

    await Room.findByIdAndUpdate(room._id,
      { lastMessageAt: new Date() });

    console.log("Message has been saved and room updated", msg);
    return msg;

  } catch (err) {
    console.log("The message has not been saved", err);
    throw err;
  }
}

async function getPublicMessages(req, res) {
  try {
    const { username } = req.params;
    const messages = await getMessagesByType("public", username);

    return res.json({ messages });
  } catch (error) {
    console.error("Bringing Message Error :", error);
    return res.status(500).json({ error: "Server Error occured." });
  }
}

async function getUserMessages(req, res) {
  try {
    const { username } = req.params;
    const messages = await getMessagesByType("private", username);

    return res.json({ messages });
  } catch (error) {
    console.error("Bringing Message Error :", error);
    return res.status(500).json({ error: "Server Error occured" });
  };
}

async function getMessagesByType(typeMsg, name) {
  const userRooms = await Room.find(
    {
      type: typeMsg,
      "user_list.username": name
    },
    "_id"
  );

  if (userRooms.length === 0) return [];
  const roomIds = userRooms.map(room => room._id);

  const messages = await Message.find({ roomId: { $in: roomIds } });

  console.log(`${typeMsg} messages of users count:`, messages.length);
  return messages;
}

async function deleteMessageList(req, res) {

  const list = req.body.list;
  const type = req.body.itemType

  try {

    const result = await Message.deleteMany({ _id: { $in: list } });
    console.log(`Deleted ${result.deletedCount} messages`);

    const roomId = list[0].roomId;


    const ids = {
      roomId: roomId,
      idList: list.map(item => item._id)
    }

    const { getIO } = require("../socket/socket");
    const io = getIO();

    io.emit("itemDeleted", "message", type, ids);
    res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}
module.exports = { saveMessage, getPublicMessages, getUserMessages, deleteMessageList };
