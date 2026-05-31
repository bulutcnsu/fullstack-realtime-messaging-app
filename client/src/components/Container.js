import { useEffect, useState, useRef } from "react";
import { init, disconnectSocket, getNewMessage, getDeletedItemList, privateGroupUpdated } from "../api/socketApi";
import { loadMessages, loadRooms } from "../api/httpApi";
import { useChat } from "../context/ChatContext";
import { getSocket, authEvents } from "../api/socketApi";
import AuthForm from "./AuthForm";
import MainPage from "./MainPage";
import InnerContainer from "./InnerContainer";
import "../css/App.css";

function Container() {

  const [isAuth, setIsAuth] = useState(false);
  const [token, setToken] = useState(null);
  const [rooms, setRooms] = useState({ public: [], private: [] });
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [toggleRoomInfo, setToggleRoomInfo] = useState(false);


  const { setMessages } = useChat();

  const [username, setUsername] = useState("");

  const selectedRoomRef = useRef(null);


  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  useEffect(() => {

    if (!token) {
      setIsAuth(false);
      return;
    }
    const socket = init(token);

    const handleConnect = () => {
      setIsAuth(true);
    };

    if (socket) {
      socket.on("connect", handleConnect);
    }

    return () => {
      if (socket) {
        socket.off("connect", handleConnect);
      }
      disconnectSocket();
    };
  }, [token]);


  useEffect(() => {
    if (!isAuth) return;

    loadRooms(username, setRooms);
    loadMessages(username, setMessages);

  }, [isAuth]);



  useEffect(() => {
    if (!isAuth) return;

    const socket = getSocket();
    if (!socket) return;

   

    const handleNewMessage = (data) => {

     const room = data.room;
     const tempRoomId = data.tempRoomId;

      setRooms(prev =>
        handleUpdatedRooms(prev, data, selectedRoomRef.current)
      );

      setMessages(prev =>
        handleUpdatedMessages(prev, data)
      );
    
     setSelectedRoom(prev => {
  
    if (prev?._id === tempRoomId || prev?._id === room._id) {
      
      setRooms(prev => {
        const updated = { public: [...prev.public], private: [...prev.private] };
        const arr = updated[room.type] || [];
        
        const newArr = arr.map(r => r._id === room._id ? { ...r, unreadCount: 0 } : r);
        return { ...prev, [room.type]: newArr };
      });
      return { ...room, unreadCount: 0 }; 
    }
    return prev;
  });
  
    };

    const handleDeletedItem = (item, type, list) => {
      if (item === "room") {
        setRooms(prev =>
          handleDeleteRoomList(prev, type, list)
        );
      }

      setMessages(prev =>
        handleDeleteMessageList(prev, type, list)
      );
    };

 const handlePrivateGroupUpdate = (room) => {
  console.log("socketten gelen yakalanan yeni updated private room:", room);
  setRooms(prev => 
    handleUpdatedRooms(prev, room, selectedRoomRef.current) 
  );
    if (selectedRoomRef.current && selectedRoomRef.current._id === room._id) {
       setSelectedRoom(room); 
      selectedRoomRef.current = room; 
  }

};

  const handleAddNewGroupRoom = (room) => {
  console.log("socketten gelen yakalanan yeni group room:", room);
  setRooms(prev => 
    handleUpdatedRooms(prev, room, selectedRoomRef.current) // ✅ Başına return eklendi (tek satır arrow function)
  );
};

 const handlePublicGroupUpdate =(room) =>{
 
  setRooms(prev => 
    handleUpdatedRooms(prev, room, selectedRoomRef.current) 
  );
 }


    socket.on("dbNewMessage", handleNewMessage);
    socket.on("itemDeleted", handleDeletedItem);
    socket.on("privateGroupUpdated", handlePrivateGroupUpdate);
    socket.on("newGroupRoom",handleAddNewGroupRoom );
    socket.on("publicGroupUpdated",handlePublicGroupUpdate);
    


    return () => {
      socket.off("dbNewMessage", handleNewMessage);
      socket.off("itemDeleted", handleDeletedItem);
      socket.off("privateGroupUpdated", handlePrivateGroupUpdate);
      socket.off("newGroupRoom",handleAddNewGroupRoom )
      socket.off("publicGroupUpdated",handlePublicGroupUpdate);
    };

  }, [isAuth]);


  console.log("isAuth baslangıc degeri:", isAuth);
  console.log("current selected room is : ", selectedRoom)

  return (
    <div className="myContainer">
      {isAuth === false ? (
        <AuthForm
          onAuthSuccess={(token, username) => {
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
          selectedRoom={selectedRoom}
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
export const handleUpdatedRooms = (prev, data, current) => {
  const updated = { public: [...prev.public], private: [...prev.private] };
  
   const dbRoom = data?._id ? data : data?.room;
  if (!dbRoom) return prev;

  const room = { ...dbRoom};
 
  if (current?._id === room._id) {
    room.unreadCount = 0;
  } else {
    const oldRoom = (updated[room.type] || []).find(r => r._id === room._id);
    const oldUnread = oldRoom ? (oldRoom.unreadCount || 0) : 0;
        room.unreadCount = oldUnread + 1;
  }
    
  const tempRoomId = data?.tempRoomId; 
  const arr = updated[room.type] || [];

 
  if (tempRoomId) {

    const hasTempRoom = arr.some(r => r._id === tempRoomId);
    const hasRealRoom = arr.some(r => r._id === room._id);

    if (hasTempRoom || hasRealRoom) {
      
      let filteredArr = arr.filter((r) => r._id !== tempRoomId && r._id !== room._id);
  
      let newArr = [room, ...filteredArr];

      console.log("Gönderici odası güncellendi ve en üste taşındı:", { ...updated, [room.type]: newArr });
      return { ...updated, [room.type]: newArr };
    }
  }

    const index = arr.findIndex((r) => r._id === room._id);

  if (index > -1) {
    if (room.type === "public") {
      let filteredArr = arr.filter((r) => r._id !== room._id);
      filteredArr.unshift(room); 
      return { ...updated, [room.type]: filteredArr };
    } else {
     
      const newArr = [...arr];
      newArr[index] = room;
      
      console.log("Private oda mevcut yerinde güncellendi");
      return { ...updated, [room.type]: newArr };
    }
  }
  
  else {  
  
    let filteredArr = arr.filter((r) => r._id !== room._id);
    let newArr = [room, ...filteredArr];
    
    console.log("Yeni oda state'e eklendi:", { ...updated, [room.type]: newArr });
    return { ...updated, [room.type]: newArr };
  }
};


export const handleUpdatedMessages = (prev, data) => {
  const msg = data.message;
  const room = data.room;
  const tempMsgId = data.tempMsgId;
  const tempRoomId = data.tempRoomId;
  const messageWithStatus = data.status !== undefined ? { ...msg, status: data.status } : msg;

  console.log("New message came -->", messageWithStatus);

  const updated = { public: [...prev.public], private: [...prev.private] };
  const newArr = [...updated[room.type]];
  
 
  const index = newArr.findIndex((r) => r.roomId === tempRoomId || r.roomId === room._id);

  if (index > -1) { 
    const arr = newArr.map((r, id) => {
     
      if (id !== index) return r;

      
      const tempMsgExists = r.messages.some(m => m._id === tempMsgId);
      const realMsgExists = r.messages.some(m => m._id === messageWithStatus._id);

      let updatedMessages;

      if (tempMsgId && tempMsgExists) { 
      
        updatedMessages = r.messages.map(m =>
          m._id === tempMsgId ? messageWithStatus : m
        );
      } else if (realMsgExists) {
        
        updatedMessages = r.messages;
      } else {
        
        updatedMessages = [...r.messages, messageWithStatus];
      }

     
      return {
        ...r,
        roomId: room._id, 
        messages: updatedMessages
      };
    });

    console.log("Container updated messages ", { ...updated, [room.type]: arr });
    return { ...updated, [room.type]: arr };

  } else { 
 
    const newRoom = { roomId: room._id, messages: [messageWithStatus] };
    const arr = [newRoom, ...newArr];

    console.log("updated Messages (New Room Created) ", { ...updated, [room.type]: arr });
    return { ...updated, [room.type]: arr };
  }
};


export const handleDeleteRoomList = (prev, type, list) => {
  const updated = { public: [...prev.public], private: [...prev.private] };
  const arr = updated[type];
  const newArr = arr.filter((room) => !list.includes(room._id));

  console.log("updated rooms after deletion ", { ...updated, [type]: newArr });
  return { ...updated, [type]: newArr };
};
export const handleDeleteMessageList = (prev, type, list) => {
  const updated = { public: [...prev.public], private: [...prev.private] };
  const arr = updated[type] || [];

  let newArr = [];

  if (list.roomId) {
    newArr = arr.map((room) => {
      if (room.roomId === list.roomId) {

        return {
          ...room,
          messages: room.messages.filter((msg) => !list.idList.includes(msg._id))
        };
      }
      return room;
    });

  } else {// delete roomids in list

    newArr = arr.filter((room) => !list.includes(room.roomId));
  }

  console.log("updated messages after deletion ", { ...updated, [type]: newArr });
  return { ...updated, [type]: newArr }; //"Eğer bu oda artık oda listemde yoksa, mesaj state'inde de yeri yok, komple geçmişini temizle
};

export default Container;
