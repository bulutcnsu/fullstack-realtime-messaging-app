
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const dotenv = require('dotenv').config(); 
const express = require('express');
const router = express.Router();
const app = express();
const http = require("http").createServer(app);
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


const allowedOrigin = "https://realtime-react-chat-application.netlify.app" || process.env.FRONTEND_URL ;
app.use(cors({ origin: allowedOrigin }));


const io = new Server(http, { 
  cors: { origin: allowedOrigin,  
     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allowedHeaders: ["Content-Type", "Authorization"],
     credentials :true }
});

app.options('*', cors());
app.use('/api', api);

connectDB();
initSocket(io);



  http.listen(process.env.PORT, "0.0.0.0" , () => {
	console.log("listening on *:3000");})

  module.exports = api;