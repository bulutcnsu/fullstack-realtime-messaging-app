import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import NavbarIcons from './NavbarIcons';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Avatar from './AvatarPage';

const NavBar= ({room ,selectedMessages,onTapping, onBack,hideIcons,setHideIcons})=>{


const userName = localStorage.getItem('username'); 
const visibility = hideIcons === true ? "hidden" : "visible";




return (
    <Box sx={{ flexGrow: 1,mb:1 }}>
      <AppBar position="static"  sx={{bgcolor:"#8091cce3", borderBottom:"2px groove",borderTopLeftRadius:"15px",borderTopRightRadius:"15px"}}  >

        <Toolbar  >
                     <Box >
                  <Tooltip >
                    < ArrowBackIosIcon  onClick={()=>onBack(false)}/>  
                    </Tooltip>
                  </Box>
         
             <Box onClick={()  =>  onTapping(true) } >       
               <Avatar username={room.username || room.room_name || room.user_list.find((r) => r.username !== userName )?.username || room.user_list[0].username}  />           
              </Box>
    
          <Typography variant="h6" component="div" sx={{ flexGrow: 1,textAlign:'left'}}>
            {room.username|| room.room_name || room.user_list.find((r) => r.username !== userName)?.username || room.user_list[0].username}
          </Typography>
            <>
            <NavbarIcons visibility={visibility} setHideIcons={setHideIcons} itemType={room.type} itemList={selectedMessages}></NavbarIcons>
           </>     
        </Toolbar>
      </AppBar>
    </Box>
  );

}

export default NavBar;