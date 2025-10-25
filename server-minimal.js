const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

// Environment variables validation
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'SENDGRID_API_KEY',
  'EMAIL_FROM',
  'CLIENT_URL',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_BUCKET_NAME'
];

// Check for required environment variables
const missingRequiredVars = [];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    missingRequiredVars.push(envVar);
    console.warn(`⚠️  Warning: Missing environment variable: ${envVar}`);
  }
}

// Exit if critical variables are missing
if (process.env.MONGODB_URI === undefined || process.env.JWT_SECRET === undefined) {
  console.error('❌ Critical error: Missing required environment variables');
  process.exit(1);
}

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline styles for development
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.netlify.app'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { message: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// Body parser middleware
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Connect to MongoDB with optimized settings
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// User model
const User = require('./models/User');

// Input validation middleware
const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  
  next();
};

// Login route with rate limiting and validation
app.post('/api/auth/login', authLimiter, validateLoginInput, async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Login attempt for:', req.body.email);
    }
    
    const { email, password } = req.body;

    // Find user with optimized query
    const user = await User.findOne({ email }).select('+password').lean();
    if (!user) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('❌ User not found:', email);
      }
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // For lean queries, we need to create a User instance to use comparePassword
    const userInstance = new User(user);
    const isMatch = await userInstance.comparePassword(password);
    if (!isMatch) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('❌ Invalid password for:', email);
      }
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token with shorter expiry
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Login successful for:', email, 'Role:', user.role);
    }
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({ 
      message: 'Server error during login',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
});

// Optimized products route
app.get('/api/products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const { page = 1, limit = 8, category, search } = req.query;
    
    const query = { isActive: true };
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const products = await Product.find(query)
      .select('name price images category rating brand isActive')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();
      
    const total = await Product.countDocuments(query);
    
    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Products error:', error.message);
    res.status(500).json({ 
      message: 'Server error fetching products',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});
