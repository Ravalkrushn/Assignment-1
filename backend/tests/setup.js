import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

export const setupTestDB = () => {
  beforeAll(async () => {
    try {
      // Connect to local MongoDB instance if running
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/loyaltybox_test', {
        serverSelectionTimeoutMS: 2000
      });
    } catch (err) {
      // Fallback to in-memory server with valid version
      try {
        mongoServer = await MongoMemoryServer.create({
          binary: { version: '6.0.4' }
        });
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
      } catch (innerErr) {
        throw new Error(`Failed to initialize test DB: ${innerErr.message}`);
      }
    }
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });
};
