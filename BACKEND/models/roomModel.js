const mongoose = require('mongoose');
const User =require('./userModel');
const { Schema } = mongoose;



const roomSchema = new mongoose.Schema({
  room_name: { type: String , default: null},
  type: {type :String , enum :["private","public"] },
  roomKind: {type: String, enum: ["direct", "group"],},
  user_list: [ {
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
  username: {type :String, ref: "User"}}],
  description: { type: String , default: null},
  createdAt: { type: Date,default: Date.now },
  lastMessageAt :{ type: Date, default: null}

});




// Create a model
module.exports = mongoose.model("Room", roomSchema);