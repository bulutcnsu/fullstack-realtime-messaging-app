const app = require("express")();
const http = require("http").Server(app);
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require('body-parser')
const {userModel} = require("../models/userModel.js");
const {messageModel} = require("../models/messageModel.js");
const { Schema } = mongoose;

app.use(cors()) 
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))


const connectDB = ()  => {
const uri =  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/chatApp_db";
  try {
     mongoose.connect(uri);
    console.log("✅ MongoDB connected")
  } catch (err) {
    console.error("❌ MongoDB error", err)
    process.exit(1);
  }
};


module.exports =connectDB

