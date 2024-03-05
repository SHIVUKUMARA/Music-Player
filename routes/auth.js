const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const {getToken} = require("../utils/helper");

// This POST route helps to register a user
router.post("/register", async(req, res) =>{
    const {email, password, firstName, lastName, username} = req.body;
    
    // Does a user with email already exist? If Yes, then return an error
    const user = await User.findOne({email: email}); 
    if (user){
        return res.status(403)
        .json({error:"Email is already taken"})
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserData = {
        email,
        password : hashedPassword,
        firstName,
        lastName,
        username
    };
    const newUser = await User.create(newUserData);

    // Create Token for the user
    const token = await getToken(email, newUser);
    
    const userToReturn = {...newUser.toJSON(), token};
    delete userToReturn.password;
    return res.status(200).json(userToReturn);
});

//  This POST route helps to login a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Find the user with the provided email
  const user = await User.findOne({ email: email });

  // If user does not exist, return an error
  if (!user) {
    return res.status(403).json({ error: "User not found" });
  }

  // Compare the provided password with the stored password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  // If passwords do not match, return an error
  if (!isPasswordValid) {
    return res.status(403).json({ error: "Invalid password" });
  }

  // Create Token for the user
  const token = await getToken(user.email, user);

  const userToReturn = {...user.toJSON(), token };
  delete userToReturn.password;

  return res.status(200).json(userToReturn);
});


// Logout route handler
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
});


module.exports = router;
