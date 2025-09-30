import { Router } from 'express';
import {
  createBooking,
  deleteBooking,
  getAllBookings,
  getBooking,
  updateBookingStatus,
} from '../controllers/booking.controller.js';
import { protectAdmin } from '../middlewares/protectAdmin.js';
import verifyUser from '../middlewares/verifyUser.js';

const bookingRouter = Router();

bookingRouter.post('/create-booking', verifyUser, createBooking);
bookingRouter.get('/all-bookings', verifyUser, getAllBookings);
bookingRouter.patch(
  '/update-booking/:id',
  verifyUser,
  protectAdmin,
  updateBookingStatus
);

bookingRouter.get('/get-booking/:id', verifyUser, getBooking);
bookingRouter.delete('/delete-booking/:id', verifyUser, deleteBooking);

export default bookingRouter;
