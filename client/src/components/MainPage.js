import { useState } from "react";
import MainNavbar from "./mainComponents/MainNavbar";
import ChatRoomList from "./mainComponents/ChatRoomList";
import { createGroup } from "../api/socketApi";

const MainPage = ({ rooms, setRooms, setSelectedRoom}) => {
  const [selectedGroup, setSelectedGroup] = useState("chats");
  const [hideSecretsIcons, setHideSecretsIcons] = useState(true);
  const [selectedRoomList, setSelectedRoomList] = useState([]);
 


 /* const handleUpdatePublicRoom = (room) => {  ///setPublic users with http response
    if (room) {
      const type = room.type; // 'public' veya 'private'
     
      setRooms((prevRooms) => {
        const list = prevRooms[type];
        const filtered = list.filter((r) => r._id !== room._id);

        const updated = [...filtered, room];
        updated.sort((a, b) => b.joined - a.joined);

        return {
          ...prevRooms,
          [type]: updated,
        };
      });
    }
  };*/
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
