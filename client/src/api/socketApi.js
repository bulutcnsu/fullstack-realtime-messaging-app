
import { io } from "socket.io-client";

let socket = null;

const URL = "https://realtime-react-chat-application.netlify.app";

export const init = (token) => {

  if (socket) {

    if (!socket.connected) {
      console.log("♻️ reconnecting socket...");
      socket.connect();
    }

    return socket;
  }

  socket = io(URL, {
    auth: { token },
  });

  console.log("⚙️ SOCKET INIT");

  socket.on("connect", () => {
    console.log("✅ Socket Connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Connection failed:", err.message);

    if (
      err.message.includes("Unauthorized") ||
      err.message.includes("jwt expired")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");

      //    window.dispatchEvent(new Event("forceLogout"));
    }
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {

  if (!socket) return;

  socket.disconnect();
  socket = null;

  console.log("🛑 Socket destroyed");
};

export const sendMessage = (message, username, room) => { //completed


  if (!socket) return;
  socket.emit("newMessage", message, username, room);
  console.log("📨 sending message");
};

export const getNewGroupRoom = (callback) => {  //socketUpdate//
  if (!socket) return;

  socket.on("newGroupRoom", (savedRoom) => {
    console.log("🔥Backend send new Group:", savedRoom);
    callback(savedRoom);
  });
}

export const publicGroupUpdated = (callback) => {//completed
  if (!socket) return;

  socket.on("publicGroupUpdated", (room) => {
    console.log("Updated public room", room);
    callback(room);
  });

}

export const privateGroupUpdated = (callback) => {//completed
  if (!socket) return;

  socket.on("privateGroupUpdated", (room) => {
    console.log("Updated private room", room);
    callback(room); // added callback here
  });

}
