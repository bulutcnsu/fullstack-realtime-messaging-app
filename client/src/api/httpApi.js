import axios from "axios";

export const loadRooms = async (username, callback) => {
  const [publicRooms, privateRooms]  = await Promise.all([
    fetchPublicRooms(username),
    fetchPrivateRooms(username),
  ]);
  console.log("http dönen roooms",[publicRooms, privateRooms]  );
  callback({
    public: publicRooms,
    private: privateRooms
  });
};
export const loadMessages = async (username, callback) => {
  const messages = { public: [], private: [] };

  const publicMessagesFromHttp = await fetchPublicMessages(username);
  const privateMessagesFromHttp = await fetchPrivateMessages(username);

  normalizeMessages(publicMessagesFromHttp, messages.public);
  normalizeMessages(privateMessagesFromHttp, messages.private);
  console.log("http dönen mesajlar",messages);
  callback(messages);
};

export const createNewRoom = async (room) =>{
   try {
      const res = await fetch("http://localhost:3000/api/room/newGroup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(room),
    })
     const data = await res.json();
     return data;

  } catch (err) {
    console.log("error public message call", err);
    return false;
  }
}

const normalizeMessages = (messagesFromHttp, targetArray) => {
  for (let msg of messagesFromHttp) {
    
    let room = targetArray.find((r) => r.roomId === msg.roomId);
    msg.status ='sent';

    if (!room) {

      room = {
        roomId: msg.roomId,
        messages: [],
      };
      targetArray.push(room);
    }
    room.messages.push(msg); // mesajı odaya ekle
  }
};

const fetchPublicMessages = async (username) => {
  try {
    const url = "http://localhost:3000/api/messages/public/"+ username;
    const res = await axios.get(url);
    
    return res.data.messages;
  } catch (err) {
    console.log("error public message call", err);
    return [];
  }
};

const fetchPrivateMessages = async (username) => {
  try {
    const url = "http://localhost:3000/api/messages/private/" + username;
    const res = await axios.get(url);
    return res.data.messages;
  } catch (err) {
    console.log("error private room call", err);
    return [];
  }
};
const fetchPrivateRooms = async (username) => {
  try {
    const url = "http://localhost:3000/api/room/privateRooms/" + username;
    const res = await axios.get(url);
    return res.data.rooms;
  } catch (err) {
    console.log("error private room call", err);
    return [];
  }
};

const fetchPublicRooms = async (username) => {
  try {
    const url = "http://localhost:3000/api/room/publicRooms/" + username;
    const res = await axios.get(url);
   
    return res.data.rooms;
  } catch (err) {
    console.log("error private room call", err);
    return [];
  }
};

export const fetchAllUsers = async() =>{
    try {
    const url = "http://localhost:3000/api/user/allusers/";
    const res = await axios.get(url);
   
    return res.data.list;
  } catch (err) {
    console.log("error private room call", err);
    return [];
  }
}

export const deleteItemList = async (itemType,list) =>{

  const url = list[0].roomId ? "messages/deleteMessage" : "room/deleteRoom"

  try {
      const res = await fetch("http://localhost:3000/api/"+ url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
      list: list, 
      itemType: itemType 
    })
 });

      const data = await res.json();
      console.log("Delete  Operation is succesfull")
      return  data.success;

  } catch (err) {
    console.log("An error ocuured delete items", err);
    return err;
  }
};

export const updatePrivateGroup = async(list,room) =>{ //update Private Group Room List
console.log("htttp hgelen list , room",list)
  try {
      const res = await fetch("http://localhost:3000/api/room/updatePrivateGroup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
      list: list ,
      room : room})
 });

      const data = await res.json();
      console.log("Adding Operation is succesfull", data.success,data.updatedRoom)
      return  data.updatedRoom ;

  } catch (err) {
    console.log("An error ocuured add users", err);
    return err;
  }

}

export const updatePublicRoom = async (roomId, username) => {//updatePublic Room
  try {
    const res = await axios.patch(
      `http://localhost:3000/api/room/publicRooms/subscribe/` + roomId,
      { username: username }
    );

    console.log( "updating successfull", res.data.success ,res.data.updatedRoom)
    return  res.data.updatedRoom;
    
  } catch (err) {
    console.log("error update subscribed room",err);
    return err;
  }
};