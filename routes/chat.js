const express = require('express');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/chat
// @desc    Get user's chats
// Get all chats for current user
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id,
      isActive: true
    })
    .populate('participants', 'name email role')
    .populate('lastMessage.sender', 'name')
    .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread message count for current user
router.get('/unread-count', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id,
      isActive: true
    });

    let unreadCount = 0;
    for (const chat of chats) {
      const unreadMessages = await Chat.aggregate([
        { $match: { _id: chat._id } },
        { $unwind: '$messages' },
        { 
          $match: { 
            'messages.sender': { $ne: req.user.id },
            'messages.readBy': { $ne: req.user.id }
          }
        },
        { $count: 'unread' }
      ]);
      
      if (unreadMessages.length > 0) {
        unreadCount += unreadMessages[0].unread;
      }
    }

    res.json({ count: unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark chat messages as read
router.post('/:chatId/mark-read', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark all messages as read by this user
    await Chat.updateOne(
      { _id: req.params.chatId },
      { $addToSet: { 'messages.$[].readBy': req.user.id } }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/chat/start
// @desc    Start new chat with admin/seller
// @access  Private
router.post('/start', auth, async (req, res) => {
  try {
    // Check if user already has an active chat
    let existingChat = await Chat.findOne({
      participants: req.user._id,
      isActive: true
    }).populate('participants', 'name email role avatar');

    if (existingChat) {
      return res.json(existingChat);
    }

    // Create new chat with just the customer initially
    // Admins will be able to see and respond to all customer chats
    const chat = new Chat({
      participants: [req.user._id],
      messages: [],
      customerInfo: {
        customerId: req.user._id,
        customerName: req.user.name,
        customerEmail: req.user.email
      }
    });
    
    await chat.save();
    await chat.populate('participants', 'name email role avatar');
    
    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chat/:chatId
// @desc    Get chat messages
// @access  Private
router.get('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('participants', 'name email role avatar')
      .populate('messages.sender', 'name avatar');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      participant => participant._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark messages as read
    chat.messages.forEach(message => {
      if (message.sender._id.toString() !== req.user._id.toString()) {
        message.isRead = true;
      }
    });

    await chat.save();
    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/chat/:chatId/message
// @desc    Send message
// @access  Private
router.post('/:chatId/message', auth, async (req, res) => {
  try {
    const { content, messageType = 'text' } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check access permissions
    const isParticipant = chat.participants.some(
      participant => participant.toString() === req.user._id.toString()
    );
    
    const isAdmin = req.user.role === 'admin';

    if (!isParticipant && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // If admin is responding to customer chat, add admin to participants
    if (isAdmin && !isParticipant) {
      chat.participants.push(req.user._id);
    }

    // Add message
    const newMessage = {
      sender: req.user._id,
      content: content.trim(),
      messageType,
      isRead: false
    };

    chat.messages.push(newMessage);
    
    // Update last message
    chat.lastMessage = {
      content: content.trim(),
      sender: req.user._id,
      timestamp: new Date()
    };
    
    await chat.save();

    await chat.populate('participants', 'name email role avatar');
    await chat.populate('messages.sender', 'name email role avatar');
    await chat.populate('lastMessage.sender', 'name');

    // Return only the new message for socket emission
    const populatedMessage = {
      ...newMessage,
      sender: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar
      },
      createdAt: new Date()
    };

    res.json({ chat, newMessage: populatedMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chat/admin/all
// @desc    Get all customer chats for admin
// @access  Private/Admin
router.get('/admin/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // Find all chats that have at least one customer (user role)
    const chats = await Chat.find({
      isActive: true,
      'participants': { $elemMatch: { $exists: true } }
    })
    .populate('participants', 'name email role avatar')
    .populate('lastMessage.sender', 'name')
    .populate('messages.sender', 'name email role avatar')
    .sort({ 'lastMessage.timestamp': -1 });

    // Filter chats that have customer participants
    const customerChats = chats.filter(chat => 
      chat.participants.some(participant => participant.role === 'user')
    );

    res.json(customerChats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/chat/:chatId/close
// @desc    Close chat
// @access  Private
router.put('/:chatId/close', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is participant or admin
    const isParticipant = chat.participants.some(
      participant => participant.toString() === req.user._id.toString()
    );

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    chat.isActive = false;
    await chat.save();

    res.json({ message: 'Chat closed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
