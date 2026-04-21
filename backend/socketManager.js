const { Server } = require("socket.io");

let io;
const userSockets = new Map(); // Map to store userId -> socketId

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "https://farmeasy-one.vercel.app",
        "http://localhost:5173",
        "http://localhost:5000"
      ],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 New socket connection:", socket.id);

    // Join a private room for the user
    socket.on("setup", (userData) => {
      if (userData && userData.id) {
        socket.join(userData.id.toString());
        userSockets.set(userData.id.toString(), socket.id);
        console.log(`👤 User ${userData.id} joined their private room`);
        socket.emit("connected");
      }
    });

    // Join a specific conversation room
    socket.on("join chat", (room) => {
      socket.join(room);
      console.log("🗨️ User joined chat room:", room);
    });

    // Handle typing indicators
    socket.on("typing", (room) => socket.in(room).emit("typing", room));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing", room));

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
      // Clean up userSockets map
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

// Function to emit message to a specific room or user
const emitNewMessage = (message) => {
  if (!io) return;
  
  const { conversation_id, receiver_id } = message;
  
  // Emit to the conversation room
  io.to(conversation_id).emit("message received", message);
  
  // also emit to the receiver's private room to trigger notifications
  io.to(receiver_id.toString()).emit("new message notification", message);
};

module.exports = { initSocket, getIO, emitNewMessage };
