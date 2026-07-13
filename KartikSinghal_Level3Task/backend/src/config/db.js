import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    // Log the error but do NOT exit — server still serves non-DB routes (health check, etc.)
    // In development, this allows the server to run while MongoDB is starting up.
    console.error(`⚠️   MongoDB connection failed: ${error.message}`);
    console.warn('⚠️   Server running WITHOUT database. Start MongoDB to enable data routes.');
  }
};

export default connectDB;
