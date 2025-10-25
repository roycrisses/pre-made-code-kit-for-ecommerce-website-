const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Import passport configuration
require('./config/passport');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: process.env.MAX_FILE_SIZE || '5mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_FILE_SIZE || '5mb' }));

// Session middleware for passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Initialize passport
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes with error handling
try {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/products', require('./routes/products'));
  app.use('/api/cart', require('./routes/cart'));
  app.use('/api/orders', require('./routes/orders'));
  app.use('/api/chat', require('./routes/chat'));
  app.use('/api/payment', require('./routes/payment'));
  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join specific chat room
  socket.on('join_chat', (data) => {
    socket.join(data.chatId);
    console.log(`User ${socket.id} joined chat ${data.chatId}`);
  });

  // Join admin room to receive all customer messages
  socket.on('join_admin_room', () => {
    socket.join('admin_room');
    console.log(`Admin ${socket.id} joined admin room`);
  });

  // Handle message sending with proper routing
  socket.on('send_message', (data) => {
    // Emit to specific chat room (excluding sender to prevent duplication)
    socket.to(data.chatId).emit('receive_message', {
      chatId: data.chatId,
      message: data.message
    });
    
    // Also emit to admin room if sender is not admin
    if (data.message.sender.role !== 'admin') {
      socket.to('admin_room').emit('receive_message', {
        chatId: data.chatId,
        message: data.message
      });
    }
    
    console.log(`Message sent in chat ${data.chatId} by ${data.message.sender.name}`);
  });

  // Handle new chat creation
  socket.on('new_chat_created', (data) => {
    // Notify all admins about new chat
    socket.to('admin_room').emit('new_chat', {
      chat: data.chat
    });
    console.log(`New chat created: ${data.chat._id}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
