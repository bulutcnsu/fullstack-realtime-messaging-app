
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const dotenv = require('dotenv').config(); 
const express = require('express');
const router = express.Router();
const app = express();
const http = require("http").Server(app);
const bodyParser = require('body-parser')
const cors = require("cors");
const  {Server} = require("socket.io");
const api = require("./routes/api");
const connectDB = require("./database/connectDB");
const {initSocket} =require("./socket/socket")



app.use(cors())
app.use(express.json());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); 

const io = new Server(http, {
  cors: {
    origin: "http://localhost:3000", 
     origin: "http://localhost:3001", 
    methods: ["GET", "POST"],
    credentials:true,
  }
})

app.use('/api', api);

connectDB();
initSocket(io);



  http.listen(process.env.PORT || "3000", () => {
	console.log("listening on *:3000");})

  module.exports = api;