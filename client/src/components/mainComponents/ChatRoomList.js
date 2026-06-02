import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import Avatar from "../innerComponents/AvatarPage";
import Typography from "@mui/material/Typography";
import MsgIcon from '@mui/icons-material/MarkEmailUnread';
import styles from "../../css/styles.module.css";
import { updatePublicRoom } from "../../api/httpApi";
import { useChat } from "../../context/ChatContext";
import { useState, useRef } from "react";

const ChatRoomList = ({
  rooms,
  group,
  onSelectRoom,
  updateRoom,
  hideIcons,
  selectedRoom,
  setHideIcons,
  selectedRoomList,
  setSelectedRoomList,
}) => {
  const [longPress, setLongPress] = useState(false);
  const { messages, setMessages } = useChat();

  const type = group === "chats" ? "private" : "public";
  const visibile = type === "private" ? "hidden" : "visible";
  const username = localStorage.getItem("username");
  const timerRef = useRef(null);



  const handlePress = (room, event) => {
    if (event.type === "mousedown" || event.type === "touchstart") {
      timerRef.current = setTimeout(() => {
        setLongPress(true);
        setHideIcons(false);
      }, 1000);
    }

    if (event.type === "mouseup" || event.type === "touchend") {
      clearTimeout(timerRef.current);
      if (longPress === true) {
        event.preventDefault();
        event.stopPropagation();
        setLongPress(false);
      }
    }

    if (event.type === "click") {
      if (longPress === false && hideIcons === true) {
        //hideIcons true
        onSelectRoom(room);
      } else if (!hideIcons) {
        //hideIcons false

        setSelectedRoomList((prev) => {
          let newRooms;
          if (prev.includes(room)) {
            newRooms = prev.filter((id) => id !== room);
          } else {
            newRooms = [...prev, room];
          }
          if (newRooms.length === 0) setHideIcons(true);
          console.log("current selected rooms", newRooms);
          return newRooms;
        });
      }
    }
  };

  const toggleJoin = async (event, roomId) => {
    event.stopPropagation();
    await updatePublicRoom(roomId, username)
      .then((success) => console.log("update işlemi başarılı",success))
      .catch((err) => console.log("An error occured when updating room ", err));
  };

  return (
    <div className={styles.chatRoomList}>
      <List
        sx={{
          width: "100%",
          maxWidth: "inherit",
          padding: 0,
          marginTop: 0,
          bgcolor: "#cfd3e7ed",
          border: "1px solid #c7b9b9",
          boxSizing: "border-box",
        }}
      >
        {Object.values(rooms[type] || [])?.map((room) => (

          <div key={room._id}
            onMouseDown={(e) => handlePress(room, e)}
            onMouseUp={(e) => handlePress(room, e)}
            onMouseOver={(e) => handlePress(room, e)}
            onTouchStart={(e) => handlePress(room, e)}
            onTouchEnd={(e) => handlePress(room, e)}
            onClick={(e) => handlePress(room, e)}
          >
            <ListItem
              alignItems="flex-start"
              style={{
                backgroundColor: selectedRoomList.includes(room)
                  ? "#a6b4d3ed"
                  : null,
                transition: "background-color 0.2s ease",
              }}
            >
              <Avatar
                username={
                  room.room_name ||
                  room.user_list?.find((u) => u.username !== username)
                    ?.username ||
                  "null"
                }
              />

              <ListItemText sx={{ marginLeft: 1 }}
                primary={
                  room.room_name ||
                  room.user_list.find((u) => u.username !== username)
                    ?.username || room.user_list[0].username
                }
                secondary={
                  <React.Fragment>
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ color: "text.primary", display: "inline" }}
                    ></Typography>
                    <span className={styles.content_line}>
                      {" "}
                      {messages &&
                        Object.values(messages[room.type])
                          .find((r) => r.roomId === room._id)
                          ?.messages.at(-1)?.content}{" "}
                    </span>
                  </React.Fragment>
                }
              />

              {room.unreadCount > 0 &&  ( // show msg icon

                <div style = {{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.2rem", 
                  marginLeft: "1.5rem",
                  alignSelf: "center" }}>

                 <MsgIcon sx={{ color: "#5771cf", fontSize: "1.3rem" }} />

                  <div style={{
                    backgroundColor: "#e9e9ed",
                    color: "#3052ce",
                    borderRadius: "50%",
                    minWidth: ".9rem",
                    height: "1.2rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: ".8rem",
                    fontWeight: "bold",
                    padding: "0 4px",
                    marginLeft: ".3rem",
                    alignSelf: "center",
                    borderColor:"#5771cf",
                    boxShadow: "0px 1px 3px rgba(0,0,0,0.15)"
                  }}>
                    {room.unreadCount}
                  </div>
                </div>
              )}


           <>
              {visibile && (
                <Button
                  size="small"
                  variant="contained"
                  onClick={(e) => toggleJoin(e, room._id)}
                  sx={{
                    display: room.type === "public" ? "inline-flex" : "none",
                    backgroundColor: "#b4bfdd",
                    borderRadius: "20%",
                    fontWeight: 600,
                    marginLeft: "auto",
                    color: "#654fc4",
                    flexShrink: 0
                  }}
                >
                  {room.joined ? "JOINED" : "JOIN"}{" "}
                </Button>
              )}
          </>
            </ListItem>
                    
        

          
    <Divider variant="inset" component="li" />

          </div>
        ))}
      </List>
    </div>
  );
};
export default ChatRoomList;
