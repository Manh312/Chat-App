const mongoose = require('mongoose');

const oneToOneMessageSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  messages: [
    {
      to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      type: {
        type: String,
        enum: ['Text', 'Media', 'Document', 'Link'],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      text: {
        type: String,
      },
      file: {
        type: String,
      },
      isRead: {
        type: Boolean,
        default: false, // Mặc định là chưa đọc
      },
      readAt: {
        type: Date, // Thời gian tin nhắn được đọc
      },
    },
  ],
});

const oneToOneMessage = new mongoose.model('OneToOneMessage', oneToOneMessageSchema);
module.exports = oneToOneMessage;