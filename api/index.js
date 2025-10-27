// ------------------------------
// Import dependencies
// ------------------------------
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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

// ------------------------------
// MongoDB Connection
// ------------------------------
mongoose
  .connect(
    "mongodb+srv://umarhayatudeen88_db_user:wV194RmFPBuOeP2n@cluster0.6gbfniw.mongodb.net/chatterdb",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// ------------------------------
// Import models
// ------------------------------
const User = require("./models/user");
const Message = require("./models/message");

// ------------------------------
// Token Helper
// ------------------------------
const createToken = (userId) => {
  return jwt.sign({ userId }, "Q$r2K6W8n!jCW%Zk", { expiresIn: "1h" });
};

// ------------------------------
// Routes
// ------------------------------

// ✅ Test route
app.get("/", (req, res) => {
  res.json({ message: "Chatter API is running ✅" });
});

// ✅ Register
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

    // 🔒 Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      image,
    });

    await newUser.save();

    res.status(200).json({ message: "User registered successfully ✅" });
  } catch (err) {
    console.error("❌ Registration error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔒 Compare the hashed passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = createToken(user._id);
    res.status(200).json({ token, userId: user._id });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Get All Users (except current)
app.get("/users/:userId", async (req, res) => {
  try {
    const loggedInUserId = req.params.userId;
    const users = await User.find({ _id: { $ne: loggedInUserId } });
    res.status(200).json(users);
  } catch (err) {
    console.error("Error retrieving users", err);
    res.status(500).json({ message: "Error retrieving users" });
  }
});

// ✅ Friend Request
app.post("/friend-request", async (req, res) => {
  try {
    const { currentUserId, selectedUserId } = req.body;

    await User.findByIdAndUpdate(selectedUserId, {
      $push: { freindRequests: currentUserId },
    });

    await User.findByIdAndUpdate(currentUserId, {
      $push: { sentFriendRequests: selectedUserId },
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("Friend request error:", err.message);
    res.sendStatus(500);
  }
});

// ------------------------------
// Run locally or export
// ------------------------------
if (require.main === module) {
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
} else {
  module.exports = app;
}
