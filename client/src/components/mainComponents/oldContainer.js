import { useEffect, useState, useRef } from "react";
import { init,disconnectSocket, getNewMessage, getDeletedItemList } from "../api/socketApi";
import { loadMessages, loadRooms } from "../api/httpApi";
import { useChat } from "../context/ChatContext";
import { getSocket, authEvents } from "../api/socketApi";
import msgFromBackend from "./innerComponents/TEMP.JS";
import msgFromFrontEnd from "./innerComponents/TEMP.JS";
import AuthForm from "./AuthForm";
import MainPage from "./MainPage";
import InnerContainer from "./InnerContainer";
import "../css/App.css";

function Container() {
  const [isAuth, setIsAuth] = useState(false);
  const [rooms, setRooms] = useState({ public: [], private: [] });
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [toggleRoomInfo, setToggleRoomInfo] = useState(false);
  const [token, setToken] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
 

  const { setMessages } = useChat();
  const [username, setUsername] = useState("");
  const selectedRoomRef = useRef(null);

    useEffect(() => {
    selectedRoomRef.current = selectedRoom;},
     [selectedRoom]);

 
useEffect(() => { 
    console.log(" useEffect 1 çalıştı")
  if (!token) {  setIsAuth(false);
     return;}

  const socket = init(token);

  socket.on("connect", () => {
    console.log("connected");
  });

  return () => {
    disconnectSocket();
  };
}, [token]);


useEffect(() => {
  const handleTokenChange = () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken && token) {
      console.log("Token removed from localStorage");
      setToken(null);
      setIsAuth(false);
      
      // Socket bağlantısını kapat ama event listener'ları temizleme
      disconnectSocket();
    }
  };

  window.addEventListener("storage", handleTokenChange);
  window.addEventListener("forceLogout", logout);

  return () => {
    window.removeEventListener("storage", handleTokenChange);
    window.removeEventListener("forceLogout", logout);
  };
}, [token]);


  useEffect(() => {
     if (isAuth === false) return;
   
     loadRooms(username, (rooms) => {
       setRooms(rooms);
     });
     loadMessages(username, (messages) => {
       setMessages(messages);
     });
   }, [isAuth]);
 
   
 useEffect(() => {
  const handleOnline = () => {
    console.log("Internet connection restored");
    setIsOnline(true);
  };

  const handleOffline = () => {
    console.log("Internet connection lost");
    setIsOnline(false);
    setIsAuth(false);
    disconnectSocket();
    
    // Socket event listener'larını temizle
    const socket = getSocket();
    if (socket) {
      socket.off("dbNewMessage");
      socket.off("itemDeleted");
      socket.off("newGroupRoom");
      socket.off("publicGroupUpdated");
      socket.off("privateGroupUpdated");
    }
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}, []);

useEffect(() => {

  if (!isAuth) return;

  const socket = getSocket();
 
  if (!socket) return;


  const handleNewMessage = (data) => {
    setRooms((prev) =>
      handleUpdatedRooms(prev, data, selectedRoomRef.current)
    );

    setMessages((prev) =>
      handleUpdatedMessages(prev, data)
    );
  };

  const handleDeletedItem = (item, type, list) => {
    if (item === "room") {
      setRooms((prev) =>
        handleDeleteRoomList(prev, type, list)
      );
    }

    setMessages((prev) =>
      handleDeleteMessageList(prev, type, list)
    );
  };


    getNewMessage(handleNewMessage); //otomatik burayı çalıştırıyor
    getDeletedItemList(handleDeletedItem);

  return () => {
    socket.off("dbNewMessage", handleNewMessage);
    socket.off("itemDeleted", handleDeletedItem);
  };

}, [isAuth]);


 const logout = () => {
    
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    setToken(null);
    setIsAuth(false);

    disconnectSocket();}
 
  console.log("isAuth baslangıc degeri:", isAuth);
  console.log("current selected room is : ", selectedRoom);

  return (
    <div className="myContainer">
      {isAuth === false ? (
        <AuthForm
          onAuthSuccess={(token, username) => {
            console.log(" auth form 1 çalıştı")
           localStorage.setItem("token", token);
            localStorage.setItem("username", username);
          
            setUsername(username);
            setToken(token);
            setIsAuth(true);
          }}
        />
      ) : selectedRoom == null ? (
        <MainPage
          rooms={rooms}
          setRooms={setRooms}
          setSelectedRoom={setSelectedRoom}
        />
      ) : (
        <InnerContainer
          rooms={rooms}
          setRooms={setRooms}
          selectedRoom={selectedRoom}
          setSelectedRoom={setSelectedRoom}
          toggleRoomInfo={toggleRoomInfo}
          setToggleRoomInfo={setToggleRoomInfo}
        
        />
      )}
    </div>
  );

}


export const handleUpdatedRooms = (prev, data, current) => { //change //updateRoomtemp 
  //sortingRooms

console.log("asko container room update")

  const tempRoomId = data.tempRoomId;
  const room = data.room;
  const updated = { public: [...prev.public], private: [...prev.private] };
  const isEqual = room._id === tempRoomId ? true : false;

  const arr = updated[room.type];

  if (isEqual) { // dbRoom is exist in state ,just order rooms

    const index = arr.findIndex((r) => r._id === room._id); //index must be >=0
    let newArr = arr.filter((r) => r._id !== room._id);
    newArr.unshift(room);

    console.log("updated rooms ", { ...updated, [room.type]: newArr }); // just order state
    return { ...updated, [room.type]: newArr };
  }
  else if (current._id === tempRoomId) { //is there tempId Room in roomState and shift dbRoom

    const index = arr.findIndex((r) => r._id === tempRoomId);
    let array = arr.filter((r) => r._id !== tempRoomId);
    let newArr = [room, ...array];

    console.log("updated rooms ", { ...updated, [room.type]: newArr });
    return { ...updated, [room.type]: newArr }
  } else {  //there is not dbRoom in state

    let newArr = [room, ...arr];
    console.log(" Container updated rooms  ", { ...updated, [room.type]: newArr });
    return { ...updated, [room.type]: newArr }
  }
};

export const handleUpdatedMessages = (prev, data) => {
console.log("asko container msg update")
  const msg = data.message
  const room = data.room
  const tempMsgId = data.tempMsgId
  const tempRoomId = data.tempRoomId

  const status = tempMsgId === msg._id ? "sending" : "sent"; // msg from front or update
  const messageWithStatus = { ...msg, status: status };

  //sortingMessages
  const updated = { public: [...prev.public], private: [...prev.private] };
  const newArr = [...updated[room.type]];
  const index = updated[room.type].findIndex((r) => r.roomId === tempRoomId); //


  if (index >= 0) { //roomId has found in state, just override

   const  arr = newArr.map(r => {

      if (r.roomId !== tempRoomId) return r;

      const exists = r.messages.some(m => m._id === tempMsgId);

      let updatedMessages;

      if (exists) { // sender state has tempMsg
        updatedMessages = r.messages.map(m =>
          m._id === tempMsgId ? messageWithStatus : m);
      }

      else { updatedMessages = [...r.messages, messageWithStatus]; }// receiver has no msg


      return {
        ...r,
        roomId: room._id,
        messages: updatedMessages
      }
    })

    console.log("Container updated messages ", { ...updated, [room.type]: arr });
    return { ...updated, [room.type]: arr}

  } else { //there is no room in that state ,so create

    const newRoom = { roomId: room._id, messages: [messageWithStatus], };
    const arr = [newRoom, ...newArr]

    console.log("updated Messages ", { ...updated, [room.type]: arr });
    return { ...updated, [room.type]: arr };

  }
}


export const handleDeleteRoomList = (prev, type, list) => {
  const updated = { public: [...prev.public], private: [...prev.private] };
  const arr = updated[type];
  let newArr = [];

  list.forEach((id) => {
    newArr = arr.filter((r) => r._id !== id);
  });

  console.log("updated rooms after deletion ", { ...updated, [type]: newArr });
  return { ...updated, [type]: newArr };
};
export const handleDeleteMessageList = (prev, type, list) => {
  const updated = { public: [...prev.public], private: [...prev.private] };
  const arr = updated[type];
  let newArr = [];

  if (list.roomId) {
    //delete messages in that roomId

    let index = arr.findIndex((r) => r.roomId === list.roomId);
    let room = arr.find((r) => r.roomId === list.roomId);
    console.log("room msg", room);

    list.idList.forEach((id) => {
      room.messages = room.messages.filter((r) => r._id !== id);
    });

    newArr = arr;
    newArr[index] = room;
  } else {
    // delete roomids in list

    list.forEach((id) => {
      newArr = arr.filter((r) => r.roomId !== id);
    });
  }
  console.log("updated messages after deletion ", {
    ...updated,
    [type]: newArr,
  });
  return { ...updated, [type]: newArr };
};

export default Container;
