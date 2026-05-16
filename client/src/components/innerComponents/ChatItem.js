import styles from "../../css/styles.module.css";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DoneIcon from '@mui/icons-material/Done';
import Avatar from "./AvatarPage";
import Box from "@mui/material/Box";


function ChatItem({ item, fromMe,selectedRoom }) {

 let notification ;
  const align = fromMe ? "row-reverse" : "row";

  return (
    
    <Box
      sx={{ display: "flex", flexDirection: align, alignItems: "center" }}
    >
    <Avatar username={item.senderName} sx={{ alignItems: "flex-end" }} />

      <div 
        className={`${styles.chatItem} ${  fromMe === true ? styles.right : styles.left }`}>
        <div className={styles.chatContent}>
         <div className={styles.messageText}>{item.content}</div>
          <div className={styles.messageMeta}>
            <span>{`${item.createdAt}`.slice(11,16)}</span>
             {fromMe && (
            item.status === 'sent' ? (
              <DoneAllIcon sx={{ color: '#34b7f1' }} titleAccess="İletildi" />
            ) : (
              <DoneIcon sx={{ color: 'gray' }} titleAccess="Gönderiliyor" /> )
          )}
          
          </div>
        </div>
      </div>
    </Box>
  );
}

export default ChatItem;
