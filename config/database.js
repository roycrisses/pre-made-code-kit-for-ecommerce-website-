const mongoose = require('mongoose');

// Database connection configuration with performance optimizations
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Connection pool settings for better performance
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 5,  // Minimum number of connections in the pool
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server
      socketTimeoutMS: 45000, // How long a send or receive on a socket can take
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
      
      // Performance optimizations
      useNewUrlParser: true,
      useUnifiedTopology: true,
      
      // Read preferences for better performance
      readPreference: 'primaryPreferred',
      
      // Write concern for better performance vs consistency trade-off
      writeConcern: {
        w: 'majority',
        j: true, // Wait for journal
        wtimeout: 1000 // Timeout after 1 second
      },
      
      // Compression for network efficiency
      compressors: ['zlib'],
      
      // Connection monitoring
      heartbeatFrequencyMS: 10000, // Ping every 10 seconds
      
      // Auto-reconnection settings
      retryWrites: true,
      retryReads: true
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Connection event handlers for monitoring
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

    // Set mongoose options for better performance
    mongoose.set('strictQuery', false);
    mongoose.set('autoIndex', process.env.NODE_ENV !== 'production'); // Disable auto-indexing in production
    
    return conn;
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Query optimization middleware
mongoose.plugin(function(schema) {
  // Add automatic lean() for read operations in production
  if (process.env.NODE_ENV === 'production') {
    schema.pre(['find', 'findOne', 'findOneAndUpdate'], function() {
      if (!this.getOptions().hasOwnProperty('lean')) {
        this.lean();
      }
    });
  }
  
  // Add automatic field selection to exclude __v
  schema.pre(['find', 'findOne'], function() {
    if (!this.getOptions().hasOwnProperty('select')) {
      this.select('-__v');
    }
  });
});

module.exports = connectDB;
