import 'dotenv/config';
import app from './app';
import connectDb from './configs/dbConfig';
import logger from './utils/logger';

const startServer = async () => {
  await connectDb();
  app.listen(process.env.PORT, () => {
    logger.info(`Server running on port ${process.env.PORT}`);
  });
};

startServer();
