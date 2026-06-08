import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Avatar from "./AvatarPage";
import AddUserPage from "./AddUserPage";
import { jwtDecode } from "jwt-decode";
import { useState} from "react";
import { updatePrivateGroupRoom } from "../../api/httpApi";

const RoomInfo = ({ room, onBack, changeRoom, updatePrivateGroupList  }) => {
 
  const [showChild, setShowChild] = useState(false);
  const visibilty = room.type === "private"  && room.room_name !== null  ? "visible" : "hidden";

 const currentUsername = localStorage.getItem("username");
 const token = localStorage.getItem("token");
 const decoded = jwtDecode(token);
 const currentUserId = decoded.id;
  

  const addUsertoGroup = () =>{
      setShowChild((prev) => !prev); 
  }

  return (
    <>
      <Box sx={{ flexGrow: 1, mb: 1 }}>
        <AppBar
          position="static"
          sx={{ bgcolor: "#7f5dfaeb", borderBottom: "1px groove" }}
        >
          <Toolbar>
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip>
                <ArrowBackIosIcon onClick={() => onBack(false)} />
              </Tooltip>
            </Box>

            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, ml: 2, textAlign: "left" }}
            >
              {room.room_name || room.username}
            </Typography>


            <Tooltip sx={{visibility : visibilty}}>
              <IconButton>
                <PersonAddIcon
                  variant="rounded"
                  sx={{ fontSize: 30, color: "#ffffff" }}
                  onClick ={() => addUsertoGroup()}
                />
              </IconButton>
            </Tooltip>

          </Toolbar>
        </AppBar>

        {room !== null &&
          room.hasOwnProperty("room_name") &&
          room.room_name !== null && ( 
            <div key={room._id}>
              {room.user_list.map(
                (
                  user
                ) => (
                  <AppBar 
                    position="static"
                    sx={{
                      bgcolor: "#cfd4d8eb",
                      borderBottom: "1px groove #ffffff",
                      color: "#1c2e7e",
                      fontWeight: "bold",
                    }}
                  >
                    <Toolbar
                      onClick={() => {
                        changeRoom(user);
                        onBack(false);
                      }}
                    >
                      <Avatar username={user.username} />

                      <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, ml: 2, textAlign: "left" }}
                      >
                        {user.userId === currentUserId ? "Ben" : user.username}
                      </Typography>
                    </Toolbar>
                  </AppBar>
                )
              )}
            </div>
          )}
      </Box>

           
          {showChild && <AddUserPage show={setShowChild}  room={room}  updatePrivateGroupList ={updatePrivateGroupList}/>}
    </>
  );
};

export default RoomInfo;
