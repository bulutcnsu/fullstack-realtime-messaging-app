import styles from "../../css/styles.module.css"
import { useState, useEffect, useRef } from "react";
import { useChat } from "../../context/ChatContext"
import ChatItem from "./ChatItem"


function ChatList({ selectedRoom, hideIcons, setHideIcons, selectedMessageList, setSelectedMessageList }) {
  const { messages } = useChat();
  const messagesEndRef = useRef(null)
  const [longPress, setLongPress] = useState(false);
  const timerRef = useRef(null);

  const username = localStorage.getItem('username');
   let currentRoom;
  
  if (selectedRoom.hasOwnProperty("type")) {
    currentRoom = messages[selectedRoom.type].find(r => r.roomId === selectedRoom._id); //find exact room in message Context
    }
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);



  const handlePress = (item, event) => {
    if (event.type === "mousedown" || event.type === "touchstart") {
      timerRef.current = setTimeout(() => {
        setLongPress(true);
        setHideIcons(false);
        
      }, 700);
    }

    if (event.type === "mouseup" || event.type === "touchend") {
      clearTimeout(timerRef.current);
         if (longPress && hideIcons) {
        event.preventDefault();
        event.stopPropagation();
        setLongPress(false);

        setSelectedMessageList((prev) => {
          let newMsgs;
          if (prev.includes(item)) {
            newMsgs = prev.filter((id) => id !== item);
          } else {
            newMsgs = [...prev, item];
          }
          if (newMsgs.length === 0) setHideIcons(true);
          console.log("current selected messages", newMsgs);
          return newMsgs;
        });
      }
    }
  }
  return (

    <div className={styles.chatList} >

      {currentRoom !== null && currentRoom && currentRoom.messages && currentRoom.messages?.map((message) =>
        <li key={message._id}
          onMouseDown={(e) => handlePress(message, e)}
          onMouseUp={(e) => handlePress(message, e)}
          onMouseOver={(e) => handlePress(message, e)}
          onTouchStart={(e) => handlePress(message, e)}
          onTouchEnd={(e) => handlePress(message, e)}
          style={{
            backgroundColor: selectedMessageList.includes(message) ? "#93a7c4ed" : null,
            transition: "background-color 0.2s ease"
          }}>

          <ChatItem item={message} fromMe={message.senderName == username} selectedRoom={selectedRoom} />
        </li>)}

      <div ref={messagesEndRef} />
    </div>);

}

export default ChatList;       