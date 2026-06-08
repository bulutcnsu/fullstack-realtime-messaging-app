import { useState } from "react";
import MainNavbar from "./mainComponents/MainNavbar";
import ChatRoomList from "./mainComponents/ChatRoomList";
import { createGroup } from "../api/socketApi";

const MainPage = ({ rooms, selectedRoom, setRooms, setSelectedRoom}) => {
  const [selectedGroup, setSelectedGroup] = useState("chats");
  const [hideSecretsIcons, setHideSecretsIcons] = useState(true);
  const [selectedRoomList, setSelectedRoomList] = useState([]);
 

  return (
    <>
      <MainNavbar
        setGroup={setSelectedGroup}
        selectedGroup ={selectedGroup}
        hideIcons={hideSecretsIcons} setHideIcons ={() => {setHideSecretsIcons(true); setSelectedRoomList([])}}
        roomList ={selectedRoomList}
      />
      <ChatRoomList
        rooms={rooms}
        group={selectedGroup}
        selectedRoom ={selectedRoom}
        onSelectRoom={setSelectedRoom}
        setHideIcons={setHideSecretsIcons}
        hideIcons={hideSecretsIcons}
        selectedRoomList = {selectedRoomList}
        setSelectedRoomList ={(room) =>setSelectedRoomList(room)}

      />
    </>
  );
};
export default MainPage;
