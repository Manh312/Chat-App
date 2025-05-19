const FriendRequest = require("../models/friendRequest");
const User = require("../models/user");
const OneToOneMessage = require("../models/oneToOneMessage"); // Thêm model
const catchAsync = require("../utils/catchAsync");
const filterObj = require("../utils/filterObj");

// Get current user profile
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-__v");

  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User not found.",
    });
  }

  res.status(200).json({
    status: "success",
    data: user,
  });
});

// Update current user profile
exports.updateMe = catchAsync(async (req, res, next) => {
  const allowedFields = ["firstName", "lastName", "about", "avatar"];
  let filteredBody = filterObj(req.body, ...allowedFields);

  if (req.file) {
    const baseUrl = `${req.protocol}://${req.get("host")}/images/`;
    filteredBody.avatar = `${baseUrl}${req.file.filename}`;
  } else if (req.body.avatar === "null" || !req.body.avatar) {
    filteredBody.avatar = undefined;
  }

  if (Object.keys(filteredBody).length === 0) {
    return res.status(400).json({
      status: "error",
      message: "No valid fields provided for update.",
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  ).select("-__v");

  if (!updatedUser) {
    return res.status(404).json({
      status: "error",
      message: "User not found.",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Profile updated successfully!",
    data: {
      user: updatedUser,
    },
  });
});

// Get list of potential friends
exports.getUsers = catchAsync(async (req, res, next) => {
  const this_user = req.user;
  console.log("Current user (req.user):", req.user); // Debug
  console.log("Current user ID (this_user._id):", this_user._id); // Debug

  const users = await User.find({
    verified: true,
    $and: [
      { _id: { $ne: this_user._id } },
      { _id: { $nin: this_user.friends } }
    ]
  }).select("firstName lastName _id avatar status");

  console.log("Fetched users:", users); // Debug
  res.status(200).json({
    status: "success",
    data: users,
    message: "Potential friends found successfully",
  });
});

// Get friend requests
exports.getRequests = catchAsync(async (req, res, next) => {
  const requests = await FriendRequest.find({
    recipient: req.user._id,
  })
    .populate("sender", "firstName lastName avatar _id status")
    .select("-__v");

  res.status(200).json({
    status: "success",
    data: requests,
    message: "Friend requests retrieved successfully",
  });
});

// Get friends list with last message and unread count
exports.getFriends = catchAsync(async (req, res, next) => {
  const this_user = await User.findById(req.user._id)
    .populate("friends", "firstName lastName avatar _id status")
    .select("friends");

  if (!this_user) {
    return res.status(404).json({
      status: "error",
      message: "User not found.",
    });
  }

  const friendsWithDetails = await Promise.all(
    this_user.friends.map(async (friend) => {
      const conversation = await OneToOneMessage.findOne({
        participants: { $all: [req.user._id, friend._id] },
      }).sort({ "messages.createdAt": -1 });

      let lastMessage = null;
      let unreadCount = 0;

      if (conversation && conversation.messages.length > 0) {
        lastMessage = conversation.messages[conversation.messages.length - 1];
        // Count unread messages from this friend to the current user
        unreadCount = conversation.messages.reduce((count, msg) => {
          return count + (msg.from.toString() === friend._id.toString() && msg.to.toString() === req.user._id.toString() && !msg.isRead ? 1 : 0);
        }, 0);
      }

      return {
        ...friend.toObject(),
        status: friend.status || "Offline", // Đảm bảo có status
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

  res.status(200).json({
    status: "success",
    data: friendsWithDetails,
    message: "Friends retrieved successfully",
  });
});