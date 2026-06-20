const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      throw new Error('MONGODB_URI is not defined in process.env');
    }
    await mongoose.connect(connStr);
    console.log('MongoDB connected');
  } catch (error) {
    // Log failure in red and continue without exiting the process
    console.error('\x1b[31mMongoDB connection failed — check MONGODB_URI in .env. Server will continue running without DB for now.\x1b[0m');
  }
};

module.exports = connectDB;
