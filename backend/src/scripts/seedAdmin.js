import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { logger } from '../utils/logger.js';

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ email: env.ADMIN_EMAIL.toLowerCase() });
    if (existingAdmin) {
      logger.info(`Admin user (${env.ADMIN_EMAIL}) already exists.`);
      await disconnectDB();
      process.exit(0);
    }

    const admin = await User.create({
      fullName: 'Harish Patel (Factory Owner)',
      email: env.ADMIN_EMAIL.toLowerCase(),
      phone: '+91 98220 00001',
      password: env.ADMIN_PASSWORD,
      role: 'admin',
      businessName: 'Apex Precision Bearings & Hydraulics Ltd.',
      city: 'Pune',
      state: 'Maharashtra',
      status: 'active'
    });

    logger.info(`Admin user created successfully: ${admin.email}`);
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
