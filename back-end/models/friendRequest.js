const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const FriendRequest = new mongoose.model('FriendRequest', requestSchema);
module.exports = FriendRequest;