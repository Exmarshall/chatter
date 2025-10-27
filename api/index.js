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
