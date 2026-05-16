const app = require("express")();
const http = require("http").Server(app);
const { Server } = require("socket.io")
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

const onlineUsers = new Map();

let server = null;

const socketAuth = (socket, next) => {

  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("No token"));}
   
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          socket.userId = decoded.id;
          next();

        } catch (err) {
          console.log("New Error",err)
         
          if(err.name ==="TokenExpiredError"){
            return next(new Error("🔥jwt expired🔥"));
          }
          return next(new Error(" 🔥Unauthorized🔥"));  }
      };

module.exports = {socketAuth};
