const z = require("zod");
const jwt = require("jsonwebtoken");

const { findUser, findUserById, decreaseCoins, getRoom } = require("./db");

const signupSchema = z.object({
  name: z.string().max(50),
  phone: z.string().max(10).min(10),
  password: z.string(),
  deviceId: z.number(),
});

const signinSchema = z.object({
  phone: z.string().max(12),
  password: z.string(),
});

const chatroomSchema = z.object({
  roomName: z.string(),
  password: z.string(),
});

function validateSignupBody(req, res, next) {
  const isValidated = signupSchema.safeParse(req.body);
  if (isValidated.success) return next();
  return res.status(411).json({
    message: "Incorrect inputs",
  });
}

function validateSigninBody(req, res, next) {
  const isValidated = signinSchema.safeParse(req.body);
  if (isValidated.success) return next();
  return res.status(411).json({
    message: "Incorrect inputs",
  });
}

function validateChatroomBody(req, res, next) {
  const isValidated = chatroomSchema.safeParse(req.body);
  if (isValidated.success) return next();
  return res.status(411).json({
    message: "Incorrect inputs",
  });
}

async function existingUser(req, res, next) {
  const { phone } = req.body;
  const isUser = await findUser(phone);
  if (isUser) {
    return res.status(411).json({
      message: "Incorrect inputs",
    });
  }
  next();
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({});
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({
      message: "Invalid token",
    });
  }
}

async function isPrimeMember(req, res, next) {
  const userId = parseInt(req.userId);
  const [user] = await findUserById(userId);
  if (user.isPrimeMember) return next();
  return res.status(401).json({
    message: "Not a prime member",
  });
}

async function notPrime(req, res, next) {
  const userId = parseInt(req.userId);
  const [user] = await findUserById(userId);
  if (user.isPrimeMember == 1) return next();
  let coins = user.coins;
  if (user.chatRoomsVisited >= 1) {
    coins -= 150;
    if (coins < 0) {
      return res.json({
        message: "Coins less than 150, cannot join this room!",
      });
    }
    decreaseCoins(userId);
  }
  return next();
}

async function checkParticipants(req, res, next) {
  const room = await getRoom(req.roomId);
  if ((room.participants = 6)) {
    return res.json({
      message: "Room is full!",
    });
  }
  return next();
}

module.exports = {
  validateSigninBody,
  validateSignupBody,
  validateChatroomBody,
  existingUser,
  authMiddleware,
  isPrimeMember,
  notPrime,
  checkParticipants,
};
