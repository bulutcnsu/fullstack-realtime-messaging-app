import axios from "axios";

const URL ="https://realtime-react-chat-application.netlify.app";

export const loadRooms = async (username, callback) => {
  const [publicRooms, privateRooms] = await Promise.all([
    fetchPublicRooms(username),
    fetchPrivateRooms(username),
  ]);
  console.log("http returned rooms", [publicRooms, privateRooms]);
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
  console.log("http returned messages", messages);
  callback(messages);
};

export const createNewRoom = async (room) => {
  try {
    const res = await fetch(URL, {
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
    msg.status = 'sent';

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
    const url = URL + username;
    const res = await axios.get(url);

    return res.data.messages;
  } catch (err) {
    console.log("error public message call", err);
    return [];
  }
};

const fetchPrivateMessages = async (username) => {
  try {
    const url = URL + username;
    const res = await axios.get(url);
    return res.data.messages;
  } catch (err) {
    console.log("error private room call", err);
    return [];
  }
};
const fetchPrivateRooms = async (username) => {
  try {
    const url = URL + username;
    const res = await axios.get(url);
    return res.data.rooms;
  } catch (err) {
    console.log("error private room call", err);
    return [];
  }
};

const fetchPublicRooms = async (username) => {
  try {
    const url = URL + username;
    const res = await axios.get(url);

    return res.data.rooms;
  } catch (err) {
    console.log("error private room call", err);
    return [];
  }
};

export const fetchAllUsers = async () => {
  try {
    const url = URL;
    const res = await axios.get(url);

    return res.data.list;
  } catch (err) {
    console.log("error private room call", err);
    return [];
  }
}

export const deleteItemList = async (itemType, list) => {

  const url = list[0].roomId ? "messages/deleteMessage" : "room/deleteRoom"

  try {
    const res = await fetch(URL + url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        list: list,
        itemType: itemType
      })
    });

    const data = await res.json();
    console.log("Delete  Operation is succesfull")
    return data.success;

  } catch (err) {
    console.log("An error ocuured delete items", err);
    return err;
  }
};

export const updatePrivateGroup = async (list, room, username) => { //update Private Group Room List
  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ list: list, room: room, username: username })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || `Server error: ${res.status}`
      };
    }

    const data = await res.json();
    console.log("Adding Operation is successful", data.success, data.updatedRoom);
    return data;

  } catch (err) {
    console.error("An error occurred adding users:", err);
    return { success: false, message: err.message || "Network error" };
  }

}

export const updatePublicRoom = async (roomId, username) => {//updatePublic Room
  try {
    const res = await axios.patch(
      URL + roomId,
      { username: username }
    );

    console.log("updating successfull", res.data.success)
    return res.data.success;

  } catch (err) {
    console.log("error update subscribed room", err);
    return err;
  }
};