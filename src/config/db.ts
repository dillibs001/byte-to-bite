import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/statebite';
    await mongoose.connect(MONGODB_URI);
    console.log('🛡️ MongoDB Database connected successfully.');
  } catch (error) {
    console.error('❌ CRITICAL: MongoDB connection failed:', error);
    process.exit(1); // Stop the server completely if the database is down
  }
};