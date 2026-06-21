const app = require("express")();
const http = require("http").Server(app);
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require('body-parser')
const dotenv = require('dotenv').config(); 
const {userModel} = require("../models/userModel.js");
const {messageModel} = require("../models/messageModel.js");
const { Schema } = mongoose;




app.use(cors()) 
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))


const connectDB = ()  => {
 const uri = process.env.MONGO_URI; 

  try{
    mongoose.connect(uri)
    .then(() => console.log("✅ MongoDB Atlas Connection is successfully!"))
    .catch((err) => {
      console.log("❌ MongoDB Connection Error:");
      console.error(err);
    });
}catch(err){

  console.error(err);
}}




module.exports =connectDB

