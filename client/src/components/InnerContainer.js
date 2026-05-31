import ChatList from "./innerComponents/ChatList";
import ChatForm from "./innerComponents/ChatForm";
import RoomInfo from "./innerComponents/RoomInfo"
import NavBar from "./innerComponents/Navbar";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import '../css/App.css';


function InnerContainer({ rooms, setRooms, selectedRoom,
  toggleRoomInfo, setToggleRoomInfo, setSelectedRoom }) {

  const [hideSecretsIcons, setHideSecretsIcons] = useState(true);
  const [selectedMessageList, setSelectedMessageList] = useState([]);
  const currentUsername = localStorage.getItem("username");
  const currentUserId  = localStorage.getItem("userId");
 

const handleSelectedRoom = (room) => {
  const privateRooms = rooms.private.filter((r) => r.room_name === null);

  if (privateRooms.length === 0) {
    return setSelectedRoom(room);
  }


  const isMe = room.userId === currentUserId;

  const foundRoom = isMe 
    ? findSelfChatRoom(privateRooms) 
    : findPrivateChatWithUser(privateRooms, room.userId);

  setSelectedRoom(foundRoom || room);
};


const findSelfChatRoom = (rooms) => {
  return rooms.find(item => 
    item.user_list.length === 2 && 
    item.user_list.every(user => user.userId === currentUserId)
  );
};

const findPrivateChatWithUser = (rooms, targetUserId) => {
  return rooms.find(item => 
    item.user_list.some(u => u.userId === targetUserId)
  );
};

  return toggleRoomInfo ? (
    <RoomInfo room={selectedRoom} changeRoom={handleSelectedRoom}
      onBack={() => setToggleRoomInfo()}
      />

  ) : (
    <>

      <NavBar room={selectedRoom} selectedMessages={selectedMessageList} hideIcons={hideSecretsIcons}
        setHideIcons={() => { setHideSecretsIcons(true); setSelectedMessageList([]) }}
        onTapping={() => setToggleRoomInfo(true)} onBack={() => setSelectedRoom(null)} />

      <ChatList selectedRoom={selectedRoom} setRooms={setRooms} hideIcons={setHideSecretsIcons} setHideIcons={setHideSecretsIcons}
        selectedMessageList={selectedMessageList}
        setSelectedMessageList={(msg) => setSelectedMessageList(msg)} />

      <ChatForm selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom} rooms={rooms} setRooms={setRooms} />
    </>
  )
}

export default InnerContainer;

