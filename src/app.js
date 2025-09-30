import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import globalErrorHandler from './middlewares/globalErrorHandler.js';
import announcementRouter from './routes/announcement.route';
import authRouter from './routes/auth.route';
import bookingRouter from './routes/booking.route';
import couponRouter from './routes/coupon.route';
import courtRouter from './routes/court.route';
import paymentRouter from './routes/payment.route';
import userRouter from './routes/user.route';

const app = express();

app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// main routes
app.use('/api/auths', authRouter);
app.use('/api/users', userRouter);
app.use('/api/courts', courtRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/coupons', couponRouter);
app.use('/api/announcements', announcementRouter);

// Error handler
app.use(globalErrorHandler);

export default app;
