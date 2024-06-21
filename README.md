# Chatroom Implementation

## Introducion

    A user can signup/signin, can create chatrooms and  send request to other users.

## API Endpoints

# For user

    - /api/user/signup
    - /api/user/signin
    - /api/user/profile/:userId
    - /api/user/friend-requests
    - /api/user/friend-requests-accept

# For chatrooms

    - /api/chatrooms
    - /api/chatrooms/join/:roomId
    - /api/chatrooms/messages

## Additional security features

    - validation using zod
    - password hashing using bcryt

### Technologies used

    - Express: for server creaction
    - MySQL: database used
    - Socket.io: for real-time messaging

- expected request body in json
- response in json
