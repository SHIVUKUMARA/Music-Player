const express = require("express");
const mongoose = require("mongoose");
const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
const passport = require("passport");
const path = require("path");
const User = require("./models/User");
const authRoutes = require("./routes/auth");
const songRoutes = require("./routes/song");
const playlistRoutes = require("./routes/playlist");
require("dotenv").config();
const cors = require("cors");
const app = express();
const PORT = process.env.PORT;


app.use(cors());
app.use(express.json());

// connect mongodb to node.js
const DB = process.env.MONGODB_URL;  
 
mongoose.connect(DB,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then(()=>console.log("Database connected Successfully")).catch((err)=>console.log("err",err))

// setup passport-jwt
let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = "thiskeyissecretandnotaccessiblebyanyone";
passport.use(
  new JwtStrategy(opts, function (jwt_payload, done) {
    User.findOne({ id: jwt_payload.sub }, function (err, user) {
      if (err) {
        return done(err, false);
      }
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
        // or you could create a new account
      }
    });
  })
);


app.get("/", (req, res) => {
    res.redirect("/login");
})

app.use("/auth", authRoutes);

app.use("/song", songRoutes);

app.use("/playlist", playlistRoutes);

// static files access
app.use(express.static(path.join(__dirname, "./client/build")));

// call all files
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
}) 
