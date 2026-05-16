import styles from "../../css/styles.module.css"
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';


function AvatarPage({username}){
 
return((
  <>
  <Typography sx={{display:"contents"}}>

         <Tooltip title={username}>
       <IconButton sx={{ p: 0, width: "10%" }}>
        <Avatar
          alt={username}
          src="../static/images/user.png"
          sx={{
            color: "#5930caeb",
            bgcolor: "white",
            mr: 2,
          }}
        />
      </IconButton>
    </Tooltip>
         
    </Typography>
  </>
  ))
}
export default AvatarPage;