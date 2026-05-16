const express = require("express");
const router =require("express").Router();
const User = require("../controller/userContoller.js");
const Message = require("../controller/messageController.js");
const Room = require("../controller/roomController.js")



router.post('/auth/login', User.login );

router.post("/auth/signup", User.signup);

router.get ('/user/allusers/', User.getAllUsers);

router.get('/messages/public/:username', Message.getPublicMessages );

router.get('/messages/private/:username', Message.getUserMessages );

router.delete('/messages/deleteMessage', Message.deleteMessageList);

router.get('/room/roomInfo/', Room.getRoomInfo );

router.get('/room/privateRooms/:username', Room.getUserRooms);

router.get('/room/publicRooms/:username', Room.getPublicRooms );

router.patch('/room/publicRooms/subscribe/:roomId', Room.updatedPublicRoom );

router.post('/room/newGroup', Room.createNewRoom);

router.post('/room/updatePrivateGroup', Room.updatePrivateGroup);

router.delete('/room/deleteRoom', Room.deleteRoomList);


module.exports = router;