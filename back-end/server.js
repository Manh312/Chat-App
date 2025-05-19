const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const path = require("path");
const { Server } = require("socket.io");

process.on("uncaughtException", (err) => {
  console.log(err);
  console.log("UNCAUGHT Exception! Shutting down ...");
  process.exit(1);
});

const app = require("./app");
const http = require("http");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const { promisify } = require("util");
const User = require("./models/user");
const FriendRequest = require("./models/friendRequest");
const OneToOneMessage = require("./models/oneToOneMessage");

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

mongoose.set("strictQuery", true);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB Connection successful"))
  .catch((err) => console.error("Error connecting to MongoDB Atlas:", err));

const port = process.env.PORT || 8000;

server.listen(port, () => console.log(`App running on port ${port} ...`));

// Lưu socket_id theo dạng mảng để hỗ trợ nhiều thiết bị
io.on("connection", async (socket) => {
  console.log("Client connected:", socket.id);
  console.log("Auth data received:", socket.handshake.auth);

  const user_id = socket.handshake.auth.user_id;
  if (!user_id) {
    console.error("Missing user_id, disconnecting...");
    socket.disconnect();
    return;
  }

  // Cập nhật socket_id (hỗ trợ nhiều thiết bị)
  const user = await User.findById(user_id);
  if (user) {
    if (!user.socket_ids) user.socket_ids = [];
    if (!user.socket_ids.includes(socket.id)) {
      user.socket_ids.push(socket.id);
    }
    user.status = "Online";
    await user.save({ validateModifiedOnly: true });

    // Phát sự kiện trạng thái online cho tất cả bạn bè
    const friends = await User.find({ friends: user_id }).select("socket_ids");
    friends.forEach((friend) => {
      friend.socket_ids?.forEach((socketId) => {
        io.to(socketId).emit("friend_status_changed", { user_id, status: "Online" });
      });
    });
  }

  // Thêm sự kiện join_room để người dùng tham gia phòng chat
  socket.on("join_room", (conversation_id) => {
    if (!conversation_id) {
      socket.emit("error", { message: "Missing conversation_id" });
      return;
    }
    console.log(`User ${user_id} joined room ${conversation_id}`);
    socket.join(conversation_id);
  });

  socket.on("friend_request", async (data) => {
    const { to, from } = data;
    const to_user = await User.findById(to).select("socket_ids");
    const from_user = await User.findById(from).select("socket_ids");

    await FriendRequest.create({ sender: from, recipient: to });

    to_user.socket_ids?.forEach((socketId) => {
      io.to(socketId).emit("new_friend_request", { message: "New Friend Request Received" });
    });
    from_user.socket_ids?.forEach((socketId) => {
      io.to(socketId).emit("request_sent", { message: "Request sent successfully" });
    });
  });

  socket.on("accept_request", async (data) => {
    const { request_id } = data;
    if (!request_id) {
      socket.emit("error", { message: "Missing request_id in payload" });
      return;
    }

    const request_doc = await FriendRequest.findById(request_id);
    if (!request_doc) {
      socket.emit("error", { message: "Friend request not found" });
      return;
    }

    const sender = await User.findById(request_doc.sender);
    const receiver = await User.findById(request_doc.recipient);
    if (!sender || !receiver) {
      socket.emit("error", { message: "Sender or receiver not found" });
      return;
    }

    sender.friends.push(request_doc.recipient);
    receiver.friends.push(request_doc.sender);
    await sender.save({ validateModifiedOnly: true });
    await receiver.save({ validateModifiedOnly: true });
    await FriendRequest.findByIdAndDelete(request_id);

    sender.socket_ids?.forEach((socketId) => {
      io.to(socketId).emit("request_accepted", { message: "Friend Request accepted successfully" });
    });
    receiver.socket_ids?.forEach((socketId) => {
      io.to(socketId).emit("request_accepted", { message: "Friend Request accepted successfully" });
    });
  });

  socket.on("get_direct_conversations", async ({ user_id }, callback) => {
    const conversations = await OneToOneMessage.find({
      participants: { $all: [user_id] },
    })
      .populate("participants", "firstName lastName _id email status avatar")
      .sort({ "messages.createdAt": -1 });

    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conversation) => {
        const otherParticipant = conversation.participants.find(
          (p) => p._id.toString() !== user_id
        );
        const unreadCount = conversation.messages.reduce((count, msg) => {
          return count + (msg.to.toString() === user_id && !msg.isRead ? 1 : 0);
        }, 0);

        const lastMessage = conversation.messages[conversation.messages.length - 1] || null;

        return {
          _id: conversation._id,
          participants: conversation.participants,
          lastMessage: lastMessage
            ? {
              _id: lastMessage._id,
              text: lastMessage.text,
              type: lastMessage.type,
              createdAt: lastMessage.createdAt,
              isRead: lastMessage.isRead,
              readAt: lastMessage.readAt,
            }
            : null,
          unreadCount,
        };
      })
    );

    callback(conversationsWithDetails);
  });

  socket.on("start_conversation", async (data) => {
    const { to, from } = data;
    const existing_conversation = await OneToOneMessage.find({
      participants: { $size: 2, $all: [to, from] },
    }).populate("participants", "firstName lastName _id email status avatar");

    if (existing_conversation.length === 0) {
      const new_chat = await OneToOneMessage.create({ participants: [to, from] });
      const populatedChat = await OneToOneMessage.findById(new_chat._id).populate(
        "participants",
        "firstName lastName _id email status"
      );
      socket.emit("start_chat", populatedChat);
    } else {
      socket.emit("start_chat", existing_conversation[0]);
    }
  });

  socket.on("get_messages", async (data, callback) => {
    const { conversation_id } = data;
    const conversation = await OneToOneMessage.findById(conversation_id).select("messages participants");
    if (!conversation) {
      callback({ error: "Conversation not found" });
      return;
    }

    callback({ messages: conversation.messages });
  });

  socket.on("text_message", async (data) => {
    console.log("Received text_message event:", data);
    const { to, from, message, conversation_id, type } = data;

    // Kiểm tra conversation_id hợp lệ
    if (!conversation_id) {
      socket.emit("error", { message: "Missing conversation_id" });
      return;
    }

    const to_user = await User.findById(to);
    const from_user = await User.findById(from);

    if (!to_user || !from_user) {
      console.error("Sender or receiver not found");
      socket.emit("error", { message: "Sender or receiver not found" });
      return;
    }

    const new_message = {
      to,
      from,
      type,
      text: message,
      createdAt: new Date(),
      isRead: false,
      readAt: null,
    };

    const chat = await OneToOneMessage.findById(conversation_id);
    if (!chat) {
      console.error("Conversation not found");
      socket.emit("error", { message: "Conversation not found" });
      return;
    }

    chat.messages.push(new_message);
    await chat.save();

    const savedMessage = chat.messages[chat.messages.length - 1];
    console.log("Message saved and retrieved:", savedMessage);

    // Emit đến phòng chat (bao gồm cả người gửi và người nhận nếu họ đã tham gia phòng)
    io.to(conversation_id).emit("new_message", { conversation_id, message: savedMessage });

    // Cập nhật unreadCount cho người nhận
    const unreadCount = chat.messages.reduce((count, msg) => {
      return count + (msg.to.toString() === to && !msg.isRead ? 1 : 0);
    }, 0);
    console.log("Recipient unread count:", unreadCount);
    to_user.socket_ids?.forEach((socketId) => {
      console.log(`Emitting update_unread_count to recipient socket: ${socketId}`);
      io.to(socketId).emit("update_unread_count", { conversation_id, unreadCount });
    });
  });

  socket.on("file_message", async (data) => {
    const { to, from, file, conversation_id, type } = data;
    const to_user = await User.findById(to);
    const from_user = await User.findById(from);

    const fileExtension = path.extname(file.name);
    const fileName = `${Date.now()}_${Math.floor(Math.random() * 10000)}${fileExtension}`;
    // Giả sử bạn đã có logic lưu file vào server
    const filePath = `/uploads/${fileName}`; // Cần triển khai logic lưu file thực tế

    const new_message = {
      to,
      from,
      type,
      file: filePath,
      createdAt: new Date(),
      isRead: false,
      readAt: null,
    };

    const chat = await OneToOneMessage.findById(conversation_id);
    if (!chat) {
      socket.emit("error", { message: "Conversation not found" });
      return;
    }

    chat.messages.push(new_message);
    await chat.save();

    const savedMessage = chat.messages[chat.messages.length - 1];
    to_user.socket_ids?.forEach((socketId) => {
      io.to(socketId).emit("new_message", { conversation_id, message: savedMessage });
    });
    from_user.socket_ids?.forEach((socketId) => {
      io.to(socketId).emit("new_message", { conversation_id, message: savedMessage });
    });

    const unreadCount = chat.messages.reduce((count, msg) => {
      return count + (msg.to.toString() === to && !msg.isRead ? 1 : 0);
    }, 0);
    to_user.socket_ids?.forEach((socketId) => {
      io.to(socketId).emit("update_unread_count", { conversation_id, unreadCount });
    });
  });

  socket.on("open_conversation", async (data) => {
    const { conversation_id } = data;
    const conversation = await OneToOneMessage.findById(conversation_id);

    if (conversation) {
      // Đánh dấu tất cả tin nhắn gửi đến người dùng hiện tại là đã đọc
      conversation.messages = conversation.messages.map((msg) => {
        if (msg.to.toString() === user_id && !msg.isRead) {
          return { ...msg, isRead: true, readAt: new Date() };
        }
        return msg;
      });
      await conversation.save();

      // Phát sự kiện cập nhật tin nhắn đã đọc
      conversation.participants.forEach(async (participant) => {
        const participantUser = await User.findById(participant);
        participantUser.socket_ids?.forEach((socketId) => {
          io.to(socketId).emit("message_read", {
            conversation_id,
            messages: conversation.messages,
          });
        });
      });

      // Cập nhật unreadCount cho người dùng hiện tại
      const unreadCount = conversation.messages.reduce((count, msg) => {
        return count + (msg.to.toString() === user_id && !msg.isRead ? 1 : 0);
      }, 0);
      user.socket_ids?.forEach((socketId) => {
        io.to(socketId).emit("update_unread_count", { conversation_id, unreadCount });
      });
    }
  });

  socket.on("end", async (data) => {
    if (data.user_id) {
      const user = await User.findById(data.user_id);
      if (user) {
        user.socket_ids = user.socket_ids?.filter((id) => id !== socket.id) || [];
        user.status = user.socket_ids.length > 0 ? "Online" : "Offline";
        await user.save({ validateModifiedOnly: true });

        // Phát sự kiện trạng thái offline cho bạn bè
        const friends = await User.find({ friends: user_id }).select("socket_ids");
        friends.forEach((friend) => {
          friend.socket_ids?.forEach((socketId) => {
            io.to(socketId).emit("friend_status_changed", { user_id, status: user.status });
          });
        });
      }
    }
    console.log("Closing connection");
    socket.disconnect(0);
  });
});

process.on("unhandledRejection", (err) => {
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});