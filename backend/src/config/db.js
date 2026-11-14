import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let mongod = null;

export const connectDB = async () => {
  try {
    let uri = env.MONGODB_URI;

    if (env.NODE_ENV === 'test') {
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        uri = mongod.getUri();
      } catch (err) {
        logger.warn('MongoMemoryServer fallback to standard test URI:', err.message);
      }
    }

    const conn = await mongoose.connect(uri, {
      autoIndex: true
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    // If not test environment, rethrow or handle gracefully
    if (env.NODE_ENV !== 'test') {
      logger.warn('Server will continue running. Ensure MongoDB Atlas or local daemon is active.');
    }
    return null;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (error) {
    logger.error(`MongoDB Disconnect Error: ${error.message}`);
  }
};
