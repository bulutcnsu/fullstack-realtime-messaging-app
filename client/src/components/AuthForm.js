import styles from "../css/styles.module.css"
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import useMediaQuery from '@mui/material/useMediaQuery';
import { jwtDecode } from "jwt-decode";
import { useTheme } from '@mui/material/styles';
import { useState } from "react";



const AuthForm = ({ onAuthSuccess }) => { //onSelect ,getName,getToken
  const [open, setOpen] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [color, setColor] = useState("");
 
  const URL ="https://realtime-chatapp-backend-ybmv.onrender.com"; 
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleInputChange = e => {
    const { value, name } = e.target;

    if (name === "name") {
      setName(value);
      if (value.length === 0) {
        setNameError(true);
      } else { setNameError(false) };
    }

    if (name === "password") {
      setPassword(value);
      if (value.length === 0) { setPasswordError(true) } else { setPasswordError(false) };
    }
  }


  //works properlyy
  const handleSignIn = async () => {

    if (name && password) {

      const res = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name.trim(), password: password }),
      });
      const data = await res.json();


      if (data.token) {

        setColor("green");
        setMessage("You are signed with successfully");

        setTimeout(() => {
          onAuthSuccess(data.token, name)
        }, 3000);
      }

      else {
        setColor("red");
        setMessage(data.error);
      };

      setName("");
      setPassword("");
    }
  }

  const handleLogin = async () => {

    const res = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: name.trim(), password: password }),
    });

    const data = await res.json();
    if (data.token) {
      onAuthSuccess(data.token, name);
      const decoded = jwtDecode(data.token);
      const currentUserId = decoded.id;
      localStorage.setItem("userId", currentUserId);
    }
    else { setMessage("Username or password is  wrong"); }
  };

  return (
    <Dialog open>
      <DialogTitle sx={{ fontSize: "1em", fontWeight: "bold" }}>Enter Your Name and Password</DialogTitle>
      <DialogContent>

        <TextField id="outlined-basic" label="Name" variant="outlined"
          sx={{ mt: 1 }}
          required={true}
          onChange={handleInputChange}
          error={nameError}
          value={name}
          name='name'
          helperText={nameError ? "Please enter your name" : ""} />
      </DialogContent>

      <DialogContent>
        <TextField id="outlined-password-input" label="Password" variant="outlined"
          required={true}
          type="Password"
          name="password"
          onChange={handleInputChange}
          error={passwordError}
          value={password}
          helperText={passwordError ? "Please enter your password" : ""} />
      </DialogContent>
      <div className={styles.alertDiv} style={{ color: color }} > <span> {message}</span></div>
      <DialogContent>
        <div style={{ display: "block" }}>
          <Button variant="contained"
            sx={{ padding: ".5em   7.5em" }}
            onClick={() => handleLogin()}>
            LogIn
          </Button></div>
        <Button variant="contained"
          sx={{
            mt: 1.6, padding: ".5em   7.5em",
            backgroundColor: "#afd3d3ff",
            color: "#06048bff"
          }}
          onClick={() => handleSignIn()}
        >
          SignIn
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default AuthForm;