import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import styles from "../../css/styles.module.css"
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useState} from "react";
import AppBar from '@mui/material/AppBar';
import {createNewRoom} from "../../api/httpApi"


const CreateGroup = ({show,newRoom}) => {


const [groupName, setGroupName] = useState("");
const [desc, setDesc] = useState("");
const [groupType, setGroupType] = useState('public');

const [message,setMessage] =useState("");
const [color,setColor]=useState("");

  const username = localStorage.getItem('username') ;
  const handleClick = () => { show(false);}
 

   async function  handleCreate (e) {
    e.preventDefault();

    if(groupName && desc){

      const room =
      { groupname: groupName,
        description: desc,
        type:groupType,
        username }
     
   const data  =   await   createNewRoom(room);
   
   if (data.success) {      
     setColor("green");   
     setMessage("Group has created succesfully");
      newRoom(data.room)} 
  
    else {
    setColor("red");
    setMessage("Something went wrong");};
   
    setGroupName("");
    setDesc("");}

    else {
    setColor("red");
    setMessage("Fill in all blanks") }}



  return  ( 
  <Dialog open>
    <AppBar sx={{position:"static",  bgcolor: "#8091cce3"}}>
    
    <div>

       <DialogTitle sx={{fontSize:"1.2em",fontWeight:"bold", display:'inline-flex' }}>Create A Group</DialogTitle>
       <IconButton sx={{color:'red' }}>
       <HighlightOffIcon sx={{width:'1.5em',height:'1.5em'}} onClick ={handleClick} /> </IconButton>
       
     </div>
    </AppBar>
<br/>
 <div className={styles.alertDiv} style={{color:color}} > <span> {message}</span></div>
 
  <form onSubmit={handleCreate}>

  <Box sx={{ mx:2.2,mt:2}}>
      <FormControl sx={{ width:'90%'}}>
        <InputLabel id="demo-simple-select-label"> Group Type</InputLabel>
        <Select
            
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label= "Group Type"
            placeholder="Placeholder"
             value={groupType}
            onChange={(e) =>setGroupType(e.target.value)}
        >
           
          <MenuItem value={'public'}>Public</MenuItem>
          <MenuItem value={'private'}>Private</MenuItem>
         
        </Select>
      </FormControl>
    </Box>
 
   <Box sx={{ mx:2.2,mt:2}}>   <TextField  label="Enter Group Name" variant="outlined" value={groupName} onChange={(e)=>setGroupName(e.target.value)}/> </Box>
   <Box sx={{mx:2.2,mt:2}}>   <TextField label="About Your Group" variant="outlined" value={desc} onChange={(e)=>setDesc(e.target.value)}/> </Box>
   <Box sx={{textAlign:"center",mx:2,my:3.5}}> 
   <Button sx={{ padding: "1em 2em", minWidth: "12em", height: "3em" ,bgcolor:"#8184bbf5"}} 
    variant="contained"  type='submit'>Save Group </Button > </Box>
    
     </form>
          
    </Dialog>
    
   )

}

export default CreateGroup;