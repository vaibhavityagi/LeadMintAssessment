CREATE DATABASE IF NOT EXISTS leadMint;

USE leadMint;

CREATE TABLE IF NOT EXISTS users(
 userId INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
 name VARCHAR(255) NOT NULL,
 deviceId INT NOT NULL,
 phone VARCHAR(10) NOT NULL UNIQUE,
 coins INT DEFAULT 500,
 isPrimeMember BOOLEAN DEFAULT FALSE,
 password VARCHAR(225),
 chatRoomsVisited INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS friendships (
    userId INT NOT NULL,
    friendId INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userId, friendId),
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (friendId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chatrooms (
    roomId INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    createdBy VARCHAR(225) NOT NULL,
    roomName VARCHAR(225) NOT NULL UNIQUE,
    participants INT(6) NOT NULL DEFAULT 0,
    password VARCHAR(225) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(userId)
);

CREATE TABLE IF NOT EXISTS chatroomParticipants (
    roomId INT NOT NULL,
    userId INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (roomId, userId),
    FOREIGN KEY (roomId) REFERENCES chatrooms(roomId) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

DELIMITER $$

CREATE TRIGGER MaxParticipantsBeforeInsert
BEFORE INSERT ON chatroomParticipants
FOR EACH ROW
BEGIN
    DECLARE participant_count INT;

    SELECT COUNT(*)
    INTO participant_count
    FROM chatroomParticipants
    WHERE roomId = NEW.roomId;

    IF participant_count >= 6 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'This chatroom already has the maximum number of participants (6).';
    END IF;
END$$

DELIMITER ;
