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


  if (selectedRoom && selectedRoom.type) {
    const type = selectedRoom.type; 

    setRooms((prev) => {
    
      
      const updatedList = prev[type].map((room) => {
        if (room._id === selectedRoom._id || room === selectedRoom) {
          return { ...room, unreadCount: 0 };
        }
        return room;
      });

      return {
        ...prev,
        [type]: updatedList,
      };
    });
  }
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
     const status = "MESSAGE"
      setRooms(prev =>
        handleUpdatedRooms(prev, data, selectedRoomRef.current,status)
      );

      setMessages(prev =>
        handleUpdatedMessages(prev, data)
      );
    
     setSelectedRoom(prev => {
    if (prev?._id === tempRoomId || prev?._id === room._id) {
        return { 
      ...room, 
       unreadCount: 0 
    };
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
  const status = "PRIVATE_GROUP_UPDATE"
  setRooms(prev => 
    handleUpdatedRooms(prev, room, selectedRoomRef.current,status) 
  );
    if (selectedRoomRef.current && selectedRoomRef.current._id === room._id) {
       setSelectedRoom(room); 
      selectedRoomRef.current = room; 
  }

};

  const handleAddNewGroupRoom = (room) => {
 const status ="ADD_GROUP_ROOM"
  setRooms(prev => 
    handleUpdatedRooms(prev, room, selectedRoomRef.current,status) // ✅ Başına return eklendi (tek satır arrow function)
  );
};

 const handlePublicGroupUpdate =(room) =>{
  const status = "PUBLIC_GROUP_UPDATE"
  setRooms(prev => 
    handleUpdatedRooms(prev, room, selectedRoomRef.current,status) 
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


export const handleUpdatedRooms = (prev, data, current, status) => {
  const updated = { public: [...prev.public], private: [...prev.private] };
  
  let room = data?._id ? data : data?.room;
  if (!room) return prev;

  const tempRoomId = data?.tempRoomId; 
  let arr = updated[room.type] || [];
  const oldRoom = arr.find(r => r._id === room._id);
  

  if (status === "MESSAGE") {
  
    if (current?._id !== room._id && (room.joined || room.type === 'private')) {
      room.unreadCount = (oldRoom?.unreadCount || 0) + 1; 
    } else {
      room.unreadCount = 0;
    }
    
     const filteredArr = arr.filter((r) => r._id !== room._id);
    let newArr = [room, ...filteredArr];

    return { ...updated, [room.type]: newArr };
  }

  //  SADECE GRUP JOIN/UNJOIN public room update
  if (status === "PUBLIC_GROUP_UPDATE") { 
    room.unreadCount = oldRoom?.unreadCount || 0; 

    const filtered = arr.filter((r) => r._id !== room._id);
    let newArr = [...filtered, room];
    newArr.sort((a, b) => b.joined - a.joined);

    return { ...updated, [room.type]: newArr };  
  }


  if (tempRoomId) {
    const hasTempRoom = arr.some(r => r._id === tempRoomId);
    const hasRealRoom = arr.some(r => r._id === room._id);

    if (hasTempRoom || hasRealRoom) {
      let filteredArr = arr.filter((r) => r._id !== tempRoomId && r._id !== room._id);
      let newArr = [room, ...filteredArr];
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
      return { ...updated, [room.type]: newArr };
    }
  } else {  
    let filteredArr = arr.filter((r) => r._id !== room._id);
    let newArr = [room, ...filteredArr];
    return { ...updated, [room.type]: newArr };
  }
};

export const handlePublicGroupUpdated = (prev, room) => {
  
  const updated = { public: [...prev.public], private: [...prev.private] }
  const newArr = [...updated[room.type]];

/*  if (!room || room.type !== "public") return prev;

     const newRoom = { ...room }; 
      newRoom.unreadCount = 0;


  let filteredArr = newArr.filter((r) => r._id !== newRoom._id);

  if (newRoom.joined === false) {
      filteredArr.push(newRoom);
  } else {
      filteredArr.unshift(newRoom);
  }

    return { ...updated, [room.type]: newArr };*/
};
export const handleUpdatedMessages = (prev, data) => {
  const msg = data.message;
  const room = data.room;
  const tempMsgId = data.tempMsgId;
  const tempRoomId = data.tempRoomId;
  const messageWithStatus = data.status !== undefined ? { ...msg, status: data.status } : msg;

  console.log("New message came -->", messageWithStatus);
  console.log("msg ye gelen room", room)

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

