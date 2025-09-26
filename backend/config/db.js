/**
 * Database Configuration
 *
 * Handles MongoDB connection using Mongoose ODM.
 * Provides connection management with error handling and logging.
 *
 * @author PulseVote Team
 * @version 1.0.0
 */

import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 *
 * Establishes connection to MongoDB using the connection string from environment variables.
 * Exits the process if connection fails to prevent the application from running without a database.
 *
 * @returns {Promise<void>} - Connection promise
 */
const connectDB = async () => {
  try {
    // Connect to MongoDB using connection string from environment variables
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Log successful connection
    // eslint-disable-next-line no-console
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    // Log connection error and exit process
    // eslint-disable-next-line no-console
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
