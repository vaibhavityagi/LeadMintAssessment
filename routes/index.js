const express = require("express");
const router = express.Router();

const userRouter = require("./user");
const chatroomRouter = require("./chatroom");

router.use("/user", userRouter);
router.use("/chatrooms", chatroomRouter);

module.exports = router;
