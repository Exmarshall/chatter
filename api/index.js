// server.js
// Full fixed server — copy & paste (replace any existing server file)

// ------------------------------
// Import dependencies
// ------------------------------
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");

// ------------------------------
// Initialize app
// ------------------------------
const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || "Q$r2K6W8n!jCW%Zk"; // move to env in prod

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
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
};

// ------------------------------
// Router (mount all routes under /api)
// ------------------------------
const router = express.Router();

// ✅ Test route
router.get("/", (req, res) => {
  res.json({ message: "Chatter API is running ✅" });
});

// ✅ Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, image } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash the password before saving
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
router.post("/login", async (req, res) => {
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

    // Compare the hashed passwords
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
router.get("/users/:userId", async (req, res) => {
  try {
    const loggedInUserId = req.params.userId;
    if (!loggedInUserId) {
      return res.status(400).json({ message: "userId is required" });
    }
    const users = await User.find({ _id: { $ne: loggedInUserId } }).select(
      "-password"
    ); // don't return passwords
    res.status(200).json(users);
  } catch (err) {
    console.error("Error retrieving users", err);
    res.status(500).json({ message: "Error retrieving users" });
  }
});

// ✅ Friend Request - send
router.post("/friend-request", async (req, res) => {
  try {
    const { currentUserId, selectedUserId } = req.body;
    if (!currentUserId || !selectedUserId) {
      return res.status(400).json({ message: "Missing user ids" });
    }

    await User.findByIdAndUpdate(selectedUserId, {
      $addToSet: { freindRequests: currentUserId },
    });

    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { sentFriendRequests: selectedUserId },
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("Friend request error:", err.message);
    res.sendStatus(500);
  }
});

// ✅ List incoming friend requests for a user
router.get("/friend-request/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const user = await User.findById(userId)
      .populate("freindRequests", "name email image")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    const freindRequests = user.freindRequests || [];
    res.json(freindRequests);
  } catch (error) {
    console.error("friend-request error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Accept friend request
router.post("/friend-request/accept", async (req, res) => {
  try {
    const { senderId, recepientId } = req.body;
    if (!senderId || !recepientId) {
      return res.status(400).json({ message: "Missing ids" });
    }

    const sender = await User.findById(senderId);
    const recepient = await User.findById(recepientId);

    if (!sender || !recepient) {
      return res.status(404).json({ message: "Sender or recipient not found" });
    }

    // Add each other as friends if not already
    if (!sender.friends.includes(recepientId)) sender.friends.push(recepientId);
    if (!recepient.friends.includes(senderId)) recepient.friends.push(senderId);

    // Remove the incoming friend request from recipient
    recepient.freindRequests = (recepient.freindRequests || []).filter(
      (request) => request.toString() !== senderId.toString()
    );

    // Remove the sent request from sender.sentFriendRequests
    sender.sentFriendRequests = (sender.sentFriendRequests || []).filter(
      (request) => request.toString() !== recepientId.toString()
    );

    await sender.save();
    await recepient.save();

    res.status(200).json({ message: "Friend Request accepted successfully" });
  } catch (error) {
    console.error("accept friend error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Get accepted friends (IDs)
router.get("/accepted-friends/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const user = await User.findById(userId).populate(
      "friends",
      "name email image"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const acceptedFriends = user.friends || [];
    res.json(acceptedFriends);
  } catch (error) {
    console.error("accepted-friends error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Sent friend requests
router.get("/friend-requests/sent/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const user = await User.findById(userId)
      .populate("sentFriendRequests", "name email image")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    const sentFriendRequests = user.sentFriendRequests || [];
    res.json(sentFriendRequests);
  } catch (error) {
    console.error("sent friend requests error", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Friends IDs (simplified)
router.get("/friends/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const user = await User.findById(userId).populate("friends", "_id");
    if (!user) return res.status(404).json({ message: "User not found" });

    const friendIds = (user.friends || []).map((f) => f._id);
    res.status(200).json(friendIds);
  } catch (error) {
    console.error("friends error:", error);
    res.status(500).json({ message: "internal server error" });
  }
});

// ------------------------------
// Message upload (multer)
// ------------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "files/"); // NOTE: on Vercel this won't persist — use cloud storage in prod
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post("/messages", upload.single("imageFile"), async (req, res) => {
  try {
    const { senderId, recepientId, messageType, messageText } = req.body;

    const newMessage = new Message({
      senderId,
      recepientId,
      messageType,
      message: messageText,
      timestamp: new Date(),
      imageUrl: messageType === "image" ? req.file?.path || null : null,
    });

    await newMessage.save();
    res.status(200).json({ message: "Message sent Successfully" });
  } catch (error) {
    console.error("messages error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ User details for chat header
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const recepientId = await User.findById(userId).select("-password");
    if (!recepientId)
      return res.status(404).json({ message: "User not found" });

    res.json(recepientId);
  } catch (error) {
    console.error("user detail error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Fetch messages between two users
router.get("/messages/:senderId/:recepientId", async (req, res) => {
  try {
    const { senderId, recepientId } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: senderId, recepientId: recepientId },
        { senderId: recepientId, recepientId: senderId },
      ],
    }).populate("senderId", "_id name");

    res.json(messages);
  } catch (error) {
    console.error("messages fetch error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Delete messages
router.post("/deleteMessages", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "invalid req body!" });
    }
    await Message.deleteMany({ _id: { $in: messages } });
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("delete messages error:", error);
    res.status(500).json({ error: "Internal Server" });
  }
});

// mount router on /api
app.use("/api", router);

// ------------------------------
// Run locally or export
// ------------------------------
if (require.main === module) {
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
} else {
  module.exports = app;
}
