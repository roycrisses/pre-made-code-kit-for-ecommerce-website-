const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [messageSchema],
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date
  },
  customerInfo: {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    customerName: String,
    customerEmail: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Method to add message to chat
chatSchema.methods.addMessage = function(messageData) {
  const message = {
    sender: messageData.sender,
    content: messageData.content.trim(),
    messageType: messageData.messageType || 'text',
    isRead: false
  };
  
  this.messages.push(message);
  
  // Update last message
  this.lastMessage = {
    content: message.content,
    sender: message.sender,
    timestamp: new Date()
  };
  
  return message;
};

// Method to mark messages as read
chatSchema.methods.markMessagesAsRead = function(userId) {
  this.messages.forEach(message => {
    if (message.sender.toString() !== userId.toString()) {
      message.isRead = true;
    }
  });
};

// Method to get unread message count for user
chatSchema.methods.getUnreadCount = function(userId) {
  return this.messages.filter(message => 
    message.sender.toString() !== userId.toString() && !message.isRead
  ).length;
};

// Method to get unread count for admin (from customers)
chatSchema.methods.getUnreadCountForAdmin = function() {
  return this.messages.filter(message => {
    // Count messages from customers (users) that are unread
    const sender = message.sender;
    return sender && 
           (typeof sender === 'object' && sender.role ? sender.role === 'user' : false) && 
           !message.isRead;
  }).length;
};

// Method to check if chat has customer participant
chatSchema.methods.hasCustomer = function() {
  return this.participants.some(p => {
    // Check if participant is populated and has role
    return typeof p === 'object' && p.role ? p.role === 'user' : false;
  }) || (this.customerInfo && this.customerInfo.customerId);
};

// Method to check if user is participant
chatSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.toString() === userId.toString());
};

// Method to check if user can access chat (participant or admin)
chatSchema.methods.canAccess = function(userId, userRole) {
  if (userRole === 'admin') {
    return true; // Admins can access all chats
  }
  
  // Check if user is participant (handle both ObjectId and populated objects)
  return this.participants.some(p => {
    const participantId = typeof p === 'object' && p._id ? p._id : p;
    return participantId.toString() === userId.toString();
  });
};

// Database Indexes for Performance Optimization
chatSchema.index({ participants: 1, isActive: 1 }); // User chat lookup
chatSchema.index({ isActive: 1, updatedAt: -1 }); // Active chats
chatSchema.index({ 'messages.sender': 1, 'messages.timestamp': -1 }); // Message queries
chatSchema.index({ 'messages.isRead': 1 }); // Unread messages
chatSchema.index({ 'customerInfo.customerId': 1 }); // Customer lookup

module.exports = mongoose.model('Chat', chatSchema);
