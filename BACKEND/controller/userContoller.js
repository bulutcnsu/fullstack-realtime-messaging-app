const app = require("express")();
const bodyParser = require('body-parser')
const dotenv = require("dotenv").config()
const cors = require("cors");
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt');
const User = require("../models/userModel.js");




async function login(req, res) {

  const { username, password } = req.body; //works properly

  if (!username || !password)
    return res.status(400).json({ error: "Missing credentials" });

  const user = await User.findOne({ username });
  if (!user)
    return res.status(404).json({ error: "User not found" });

  const ok = await bcrypt.compare(password, user.password);

  if (!ok)
    return res.status(401).json({ error: "Wrong password" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.json({ token });

}


async function signup(req, res) {
  const { username, password } = req.body;

  const exist = await User.findOne({ username });
  if (exist) return res.json({ error: "Name was taken, try different one" });

  const hash = await bcrypt.hash(password, 10);


  const user = await User.create({ username, password: hash });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "2d" });

  res.json({ token });
}

async function getAllUsers(req, res) {
  const users = await User.find();

  const list = [];

  users.forEach((user, index) => {
    list[index] = { id: user._id.toString(), username: user.username }
  })
  res.json({ list });
}




module.exports = { login, signup, getAllUsers };