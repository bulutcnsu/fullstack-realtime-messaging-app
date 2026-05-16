const mongoose = require('mongoose');
const { Schema } = mongoose;
const User = require('./userModel');
const Room = require('./roomModel');



const messageSchema = new mongoose.Schema({

   roomId:{type: Schema.Types.ObjectId },
   senderId: { type: Schema.Types.ObjectId, ref: 'User' },
   senderName :{type:String,ref: 'User'},
   content:{type:String , default: null},
   createdAt: { type: Date, default:Date.now }

})

module.exports = mongoose.model('message',messageSchema);


