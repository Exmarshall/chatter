// ------------------------------
// Import dependencies
// ------------------------------
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const LocalStrategy = require("passport-local").Strategy;

// ------------------------------
// Initialize app
// ------------------------------
const app = express();
const port = 8000; // Hardcoded instead of process.env.PORT

// ------------------------------
// Middleware
// ------------------------------
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());

// ------------------------------
// MongoDB Connection (hardcoded URI)
// ------------------------------
mongoose
  .connect(
    "mongodb+srv://umarhayatudeen88_db_user:wV194RmFPBuOeP2n@cluster0.6gbfniw.mongodb.net/",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ Error connecting to MongoDB:", err));

// ------------------------------
// Start server
// ------------------------------
app.listen(port, () => console.log(`✅ Server running on port ${port}`));



const User = require("./models/user");
const Message = require("./models/message");


//endpoint for registration of the user

app.post("/register", (req, res) => {
  const { name, email, password, image } = req.body;

  // create a new User object
  const newUser = new User({ name, email, password, image });

  // save the user to the database
  newUser
    .save()
    .then(() => {
      res.status(200).json({ message: "User registered successfully" });
    })
    .catch((err) => {
      console.log("Error registering user", err);
      res.status(500).json({ message: "Error registering the user!" });
    });
});