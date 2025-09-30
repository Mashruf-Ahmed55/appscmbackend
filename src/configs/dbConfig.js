import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import envConfig from './envConfig.js';

const connectDb = async () => {
  try {
    const connection = await mongoose.connect(envConfig.MONGO_URI, {
      dbName: 'scmSystem',
    });

    logger.info(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

export default connectDb;
