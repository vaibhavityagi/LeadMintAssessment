const express = require("express");
const {
  authMiddleware,
  isPrimeMember,
  validateChatroomBody,
  notPrime,
  checkParticipants,
} = require("../middleware");
const router = express.Router();
const bcrypt = require("bcrypt");
const {
  createChatroom,
  findUserById,
  getRoom,
  updateChatroomVisit,
  addChatroomParticipant,
} = require("../db");

router.post(
  "/",
  validateChatroomBody,
  authMiddleware,
  isPrimeMember,
  async (req, res) => {
    const { roomName, password } = req.body;
    const hashedPW = await bcrypt.hash(password, 10);
    const userId = parseInt(req.userId);
    const [user] = await findUserById(userId);

    const created = await createChatroom(userId, user.name, roomName, hashedPW);
    if (!created)
      return res.status(500).json({
        message: "Error creating the chatroom",
      });
    const { roomId } = await getRoom(created);
    req.roomId = roomId;
    return res.json({
      roomId,
    });
  }
);

router.post(
  "/join/:roomId",
  authMiddleware,
  checkParticipants,
  notPrime,
  async (req, res) => {
    const userId = parseInt(req.userId);
    const roomId = parseInt(req.params.roomId);
    updateChatroomVisit(userId, roomId);
    addChatroomParticipant(roomId, userId);
    return res.json({
      message: "Room joined!",
    });
  }
);

router.post("/messages", async (req, res) => {
  res.status(200);
});

module.exports = router;
