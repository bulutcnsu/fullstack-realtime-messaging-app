const mongoose = require('mongoose');
const { Schema } = mongoose;




const userSchema = new mongoose.Schema({
   
    username:{type:String, required:true,unique: true} ,
    password: { type: String, required: true },
  
});





// Create a model
module.exports = mongoose.model("User", userSchema);