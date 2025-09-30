import logger from '../utils/logger';

const globalErrorHandler = (err, req, res, next) => {
  try {
    const message = err.message || 'Something went wrong';
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  } catch (error) {
    logger.error(error);
  }
};

export default globalErrorHandler;
