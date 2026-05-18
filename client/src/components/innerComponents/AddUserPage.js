import ListItemText from "@mui/material/ListItemText";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import styles from "../../css/styles.module.css";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Checkbox from "@mui/material/Checkbox";
import { useEffect, useState } from "react";
import { fetchAllUsers } from "../../api/httpApi";
import { updatePrivateGroup} from "../../api/httpApi";

const AddUserPage = ({ show, room, updatePrivateGroupList }) => {
  const [checkedItems, setCheckedItems] = useState([]);
  const [entry, setEntry] = useState(null);
  const [users, setUsers] = useState([]);
  const [userlist, setUserList] = useState([]);
  const [text, setText] = useState("");
  const [color, setColor] = useState("");

  let query = null;

  useEffect(() => {
    fetchAllUsers()
      .then((list) => {
        let newList = list;
        room.user_list.map((user) => {
          newList = newList.filter((u) => user.userId !== u.id);
        });

        setUsers(newList);
        setUserList(newList);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleClick = () => {
    show(false);
  };

  const handleChange = (event) => {
    const { name, checked, id } = event.target;

    setCheckedItems((prevState) => {
      const exists = prevState.some((item) => item.id === id);

      if (exists) {
        return prevState.map((item) =>
          item.id === id
            ? { ...item, username: name, checkStatus: checked }
            : item
        );
      } else {
        return [...prevState, { id, username: name, checkStatus: checked }];
      }
    });
  };
  const handleSearch = () => {
    if (entry !== null) {
      query = users.filter((user) => user.username.includes(entry.trim()));
  

      if (query) {
        setUserList(query);
      }
    }
  };

  const handleInputChange = (e) => {
    setEntry(e.target.value);
    if (userlist !== null && e.target.value == "") {
      setUserList(users);
    }
  };
  const handleSubmit = async(e) => {
    e.preventDefault();

    const newList = checkedItems?.filter((el) => el.checkStatus === true);
    console.log("checked newlist", newList)
   
if (newList.length > 0) {
  try {
    const res = await updatePrivateGroup(newList, room);
    if (res && res.success) {
      setColor("green");
      setText("Changes have been saved");

      updatePrivateGroupList(res.updatedRoom);
    
    } else {
      setColor("red");
    
      setText(res?.message || "Nobody has added");
      console.log("Operation failed on backend:", res);
    }
  } catch (error) {
    setColor("red");
    setText("An unexpected error occurred");
    console.error("UI Request failed:", error);
  }
}}
  return (
    <Dialog open>
      <AppBar sx={{ position: "static", bgcolor: "#8091cce3" }}>
        <div>
          <DialogTitle
            sx={{
              fontSize: "1.2em",
              fontWeight: "bold",
              display: "inline-flex",
            }}
          >
            Add User To Group
          </DialogTitle>
          <IconButton sx={{ color: "red" }}>
            <HighlightOffIcon
              sx={{ width: "1.5em", height: "1.5em" }}
              onClick={handleClick}
            />{" "}
          </IconButton>
        </div>
      </AppBar>
      <br />
      <Paper
        component="form"
        elevation={20}
        sx={{
          p: "2px 4px",
          display: "flex",
          alignItems: "center",
          margin: "0 0 1em 2em",
          width: 0.8,
        }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          value={entry}
          onChange={handleInputChange}
          placeholder="Search User "
          inputProps={{ "aria-label": "search google maps" }}
        />
        <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
          <SearchIcon onClick={handleSearch} />
        </IconButton>
      </Paper>

      <div className={styles.alertDiv} style={{ color: color }}>
        {" "}
        <span> {text}</span>
      </div>
      <form onSubmit={handleSubmit}>
        <List
          sx={{
            width: "90%",
            height: "35vh",
            maxWidth: 360,
            margin: "0 0.5em",
            bgcolor: "background.paper",
            overflow: "scroll",
          }}
        >
          {userlist?.map((value, index) => (
            <>
              <ListItem alignItems="flex-start" key={index}>
                <Checkbox
                  id={value.id}
                  name={value.username}
                  checked={value.checked}
                  onChange={handleChange}
                  slotProps={{ input: { "aria-label": "controlled" } }}
                />
                <ListItemText
                  sx={{ ml: "0.5em" }}
                  primary={value.username}
                  secondary
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </>
          ))}
        </List>

        <Button
          sx={{
            padding: "1em 2em",
            minWidth: "12em",
            margin: "1em 5em",
            height: "3em",
            bgcolor: "#8184bbf5",
          }}
          variant="contained"
          type="submit"
        >
          Save Changes{" "}
        </Button>
      </form>
    </Dialog>
  );
};
export default AddUserPage;
