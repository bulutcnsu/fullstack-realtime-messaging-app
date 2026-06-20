
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import UndoIcon from '@mui/icons-material/Reply';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteItemList } from '../../api/httpApi'
import { deleteItemFromState } from '../Container';


const NavbarIcons = ({ visibility, setHideIcons, itemType, itemList }) => {


  const hideEditTool = () => { setHideIcons(true); }

  const deleteItems = async (e) => {
    const success = await deleteItemList(itemType, itemList);
    if (success) {
      setHideIcons(true);
    }
  };



  return (
    <Box sx={{ visibility: visibility }}>
      <Tooltip >
        <IconButton>
          < UndoIcon sx={{ fontSize: 23 }} onClick={() => hideEditTool()} />
        </IconButton>
      </Tooltip>

      <Tooltip >
        <IconButton>
          < DeleteIcon sx={{ fontSize: 23, ml: 1 }} onClick={(e) => deleteItems(e.target)} />
        </IconButton>
      </Tooltip>

    </Box>
  )

}

export default NavbarIcons;