const mysql = require("mysql2");

const pool = mysql
  .createPool({
    host: "127.0.0.1",
    user: "root",
    password: "password",
    database: "leadMint",
  })
  .promise();

const getAll = async () => {
  const [result] = await pool.query("SELECT * FROM users");
  console.log(result[0]);
};

const findUser = async (phone) => {
  const [rows] = await pool.query(`SELECT * FROM users WHERE phone = ?`, [
    phone,
  ]);
  return rows[0];
};

const createUser = async (name, deviceId, phone, password) => {
  const [data] = await pool.query(
    `INSERT INTO users (name, deviceId, phone, isPrimeMember, password)
VALUES (?, ?, ?, false, ?);`,
    [name, deviceId, phone, password]
  );
  return data.insertId;
};

const findUserById = async (userId) => {
  const [rows] = await pool.query(`SELECT * FROM users WHERE userId = ?`, [
    userId,
  ]);
  const [friends] = await pool.query(
    `SELECT userId, name, coins, isPrimeMember FROM users WHERE userId IN (SELECT friendId FROM friendships WHERE userId = ? OR friendId = ? AND status = 'accepted'
);`,
    [userId, userId]
  );
  return [rows[0], friends];
};

const sendFriendRequest = async (userId, friendId) => {
  const [data] = await pool.query(
    `INSERT INTO friendships (userId, friendId)
VALUES (?, ?);`,
    [userId, friendId]
  );
  return data.insertId;
};

const acceptFriendRequest = async (userId, friendId) => {
  const [data] = await pool.query(
    `UPDATE friendships SET status = 'accepted' WHERE userId = ? AND friendId = ?`,
    [friendId, userId]
  );
  return data.insertId;
};

const createChatroom = async (userId, createdBy, roomName, password) => {
  const [data] = await pool.query(
    `INSERT INTO chatrooms (userId, createdBy, roomName, password) VALUES (?, ?, ?, ?);`,
    [userId, createdBy, roomName, password]
  );
  // console.log(data.insertId);
  updateChatroomVisit(userId, data.insertId);
  addChatroomParticipant(data.insertId, userId);
  return data.insertId;
};

const updateChatroomVisit = async (userId, roomId) => {
  const [res] = await pool.query(
    `UPDATE users SET chatRoomsVisited = chatRoomsVisited+1 WHERE userId = ?`,
    [userId]
  );
  const [res2] = await pool.query(
    `UPDATE chatrooms SET participants = participants+1 WHERE roomId = ?`,
    [roomId]
  );
  return res, res2;
};

const decreaseCoins = async (userId) => {
  const [res] = await pool.query(
    `UPDATE users SET coins = coins-150 WHERE userId = ?`,
    [userId]
  );
  return res;
};

const addChatroomParticipant = async (roomId, userId) => {
  const [data] = await pool.query(
    `INSERT INTO chatroomParticipants (roomId, userId)
VALUES (?, ?);`,
    [roomId, userId]
  );
  return data.insertId;
};

const getRoom = async (roomId) => {
  const [room] = await pool.query(
    `SELECT roomId, participants  FROM chatrooms WHERE roomId = ?`,
    [roomId]
  );
  return room[0];
};

module.exports = {
  findUser,
  createUser,
  findUserById,
  sendFriendRequest,
  acceptFriendRequest,
  createChatroom,
  decreaseCoins,
  updateChatroomVisit,
  addChatroomParticipant,
  getRoom,
};
