import * as React from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ChatIcon from '@mui/icons-material/Chat';
import GroupsIcon from '@mui/icons-material/Groups';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NavbarIcons from "../innerComponents/NavbarIcons";
import CreateGroup  from './CreateGroup';
import { useState } from 'react';


const  MainNavbar = ({setGroup,selectedGroup, hideIcons,setHideIcons,roomList}) => {
  const [value, setValue] = React.useState(0);
  const [showChild, setShowChild] = useState(false);
  const visibility = hideIcons === true ? "hidden" : "visible";
  const  type = selectedGroup === 'chats' ? 'private' : 'public';


  const handleChange = ( event,newValue) => {

    setValue(newValue);
   if(value === 0){ setGroup('groups');} 
   if(value === 2){ setGroup('chats')}}

   const handleClick = () => {
    setShowChild((prev) => !prev); };

  return  (

   <Box sx={{ flexGrow: 1, }}>
  <AppBar
    position="static"
    sx={{
      bgcolor: "#8091cce3",
      borderBottom: "3px groove",
      borderTopLeftRadius: "15px",
      borderTopRightRadius: "15px",
    }}
  >
    <Toolbar sx={{ position: "relative" }} >
 
   {!hideIcons ? 
   ( <NavbarIcons visibility={visibility} setHideIcons={setHideIcons} itemType={type} itemList ={roomList} ></NavbarIcons>  ) 
   
   : (    
 <>
      <Box
        sx={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="secondary"
          sx={{ minHeight: 0, }}
        >
          <Tab
            icon={<ChatIcon />}
            label="Chats"
            sx={{
              color: "#5d3c9b",
              fontWeight: "bold",
              "&.Mui-selected": { color: "#ece9f1f5" },
            }}
          />
        

          <Divider  />

          <Tab
            icon={<GroupsIcon />}
            label="Groups"
            sx={{
              color: "#5d3c9b",
              fontWeight: "bold",
              "&.Mui-selected": { color: "#ece9f1f5" },
            }}
          />
        </Tabs>
      </Box>

      <Box   sx={{ marginLeft: "auto" }}>
        <IconButton sx={{ color: "#ece9f1f5"  }}>
          <MoreVertIcon  onClick ={handleClick} />
        </IconButton>
      </Box>
      
    {showChild && <CreateGroup show={setShowChild}  />}
  </>
)}
     </Toolbar>  
  </AppBar>
</Box>


  );
}
export default MainNavbar;

