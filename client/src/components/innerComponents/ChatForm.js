import { useState } from "react";
import styles from "../../css/styles.module.css"
import '../../css/App.css';
import { handleUpdatedMessages } from "../Container";
import { sendMessage } from "../../api/socketApi"
import { useChat } from "../../context/ChatContext";

function ChatForm({ selectedRoom, setSelectedRoom, rooms, setRooms }) {

    const [text, setText] = useState("");
    const { setMessages } = useChat();

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    const shortDate = new Intl.DateTimeFormat("tr-TR",
        { dateStyle: "short", timeStyle: "short" });
    const currentTime = shortDate.format(Date.now());

    const handleSubmit = (e) => {
        e.preventDefault();


        const newMsg = {
            _id: "temp-" + Date.now(),
            content: text,
            sender: token,
            roomId: selectedRoom._id, //group has name, but private has not ,*username
            senderName: username,
            createdAt: currentTime,
            status: "sending"
        };


        // status: "sending" | "sent" | "error"
        setContexes(newMsg, selectedRoom); //completed 

        setText("");
    }

    const setContexes = (newMsg, selectedRoom) => {  //find selectedRoom
        const type = "private";
        let tempRoom = selectedRoom;


        setRooms(prev => {
            const updated = { public: [...prev.public], private: [...prev.private] };
            let arr = [updated.private];

            if (!tempRoom.hasOwnProperty('type')) {

                tempRoom = {
                    _id: "temp-" + selectedRoom._id,
                    roomKind: "direct",
                    type: "private",
                    user_list: [selectedRoom], //will update at backend
                    room_name: selectedRoom.username
                }

                arr = [tempRoom, ...updated.private]; //if there is not room has type property then add the state

                console.log(`ChatForm  updated ${type} room array :`, arr)

                return { ...updated, [type]: arr };

            } else { return { ...updated }; }
        });


        setMessages(prev => { //check Room is in message Context ,if not create
            const updated = { public: [...prev.public], private: [...prev.private] };
            let arr = [...updated.private];


            const index = arr.findIndex((r) => r.roomId === tempRoom._id);
            let newRoom = null;

            if (index < 0) {

                newRoom = {
                    roomId: tempRoom._id,
                    messages: [],
                };

                const msg = { ...newMsg, roomId: tempRoom._id }

                newRoom.messages.push(msg);
                arr = [newRoom, ...updated.private];
            }

            else { arr[index].messages.push(newMsg) }

            console.log(`ChatForm  updated ${type} msg array :`, arr)
            return { ...updated, [type]: arr };

        })

        sendMessage(newMsg, username, tempRoom);

        setSelectedRoom(tempRoom);
    }


    return (

        <div className={styles.textInput}>
            <form onSubmit={handleSubmit}>
                <input className={styles.textInput}
                    value={text}
                    placeholder="Type a message..."
                    onChange={(e) => setText(e.target.value)}
                />

                <button type="submit" > Send </button>
            </form>
        </div>


    )
}
export default ChatForm;