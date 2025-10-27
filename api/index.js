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
const PORT = process.env.PORT || 8000;

// ------------------------------
// Middleware
// ------------------------------
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());

// ------------------------------
// MongoDB Connection
// ------------------------------
mongoose
  .connect(
    "mongodb+srv://umarhayatudeen88_db_user:wV194RmFPBuOeP2n@cluster0.6gbfniw.mongodb.net/chatterdb",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) =>
    console.error("❌ Error connecting to MongoDB:", err.message)
  );

// ------------------------------
// Import models
// ------------------------------
const User = require("./models/user");
const Message = require("./models/message");

// ------------------------------
// Routes
// ------------------------------

// ✅ Test route
app.get("/", (req, res) => {
  res.json({ message: "Chatter API is running ✅" });
});

// ✅ Register user route
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, image } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newUser = new User({ name, email, password, image });
    await newUser.save();

    res.status(200).json({ message: "User registered successfully ✅" });
  } catch (err) {
    console.error("❌ Error registering user:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ------------------------------
// Run locally OR export for Vercel
// ------------------------------
if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`✅ Server running locally on port ${PORT}`)
  );
} else {
  module.exports = app;
}


//function to create a token for the user
const createToken = (userId) => {
  // Set the token payload
  const payload = {
    userId: userId,
  };

  // Generate the token with a secret key and expiration time
  const token = jwt.sign(payload, "Q$r2K6W8n!jCW%Zk", { expiresIn: "1h" });

  return token;
};

//endpoint for logging in of that particular user
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  //check if the email and password are provided
  if (!email || !password) {
    return res
      .status(404)
      .json({ message: "Email and the password are required" });
  }

  //check for that user in the database
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        //user not found
        return res.status(404).json({ message: "User not found" });
      }

      //compare the provided passwords with the password in the database
      if (user.password !== password) {
        return res.status(404).json({ message: "Invalid Password!" });
      }

      const token = createToken(user._id);
      res.status(200).json({ token });
    })
    .catch((error) => {
      console.log("error in finding the user", error);
      res.status(500).json({ message: "Internal server Error!" });
    });
});




//endpoint to access all the users except the user who's is currently logged in!
app.get("/users/:userId", (req, res) => {
  const loggedInUserId = req.params.userId;

  User.find({ _id: { $ne: loggedInUserId } })
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.log("Error retrieving users", err);
      res.status(500).json({ message: "Error retrieving users" });
    });
});

//endpoint to send a request to a user
app.post("/friend-request", async (req, res) => {
  const { currentUserId, selectedUserId } = req.body;

  try {
    //update the recepient's friendRequestsArray!
    await User.findByIdAndUpdate(selectedUserId, {
      $push: { freindRequests: currentUserId },
    });

    //update the sender's sentFriendRequests array
    await User.findByIdAndUpdate(currentUserId, {
      $push: { sentFriendRequests: selectedUserId },
    });

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

