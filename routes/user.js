const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const {
  validateSigninBody,
  validateSignupBody,
  existingUser,
  authMiddleware,
} = require("../middleware");

const {
  createUser,
  findUser,
  findUserById,
  sendFriendRequest,
  acceptFriendRequest,
} = require("../db");

router.post("/signup", validateSignupBody, existingUser, async (req, res) => {
  const { name, phone, password, deviceId } = req.body;
  const hashedPW = await bcrypt.hash(password, 10);
  const insertId = await createUser(name, deviceId, phone, hashedPW);

  const token = jwt.sign({ userId: insertId }, "badSecret");

  res.status(200).json({
    message: "User created successfully",
    token,
  });
});

router.post("/signin", validateSigninBody, async (req, res) => {
  const phone = req.body.phone;
  const password = req.body.password;
  const user = await findUser(phone);

  if (user) {
    // checking the password
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      const token = jwt.sign({ userId: user.userId }, "badSecret");
      return res.status(200).json({
        token,
      });
    }
  }
  return res.status(411).json({
    message: "Error while logging in",
  });
});

router.get("/profile/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const [user, friends] = await findUserById(userId);
  if (user) {
    return res.status(200).json({
      name: user.name,
      coins: user.coins,
      isPrimeMember: user.isPrimeMember,
      friends,
    });
  }
  return res.json({
    message: "User by this id not found",
  });
});

router.post("/friend-requests", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { friendId } = req.body;
  const isSent = await sendFriendRequest(userId, friendId);
  if (isSent >= 0) {
    return res.status(200).json({
      message: "Request sent! Wait for the user to accept the request",
    });
  }
  return res.status(411).json({
    message: "Can't send request to this user",
  });
});

// the user to whom the request has been send should request this point to accept the incoming request
router.post("/friend-requests-accept", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { friendId } = req.body;
  const isAccepted = await acceptFriendRequest(userId, friendId);
  console.log(isAccepted);
  if (isAccepted >= 0) {
    return res.status(200).json({
      message: `Request accepted! You are now friends with ${friendId}`,
    });
  }
  return res.status(411).json({
    message: "Can't accept this request",
  });
});

module.exports = router;
