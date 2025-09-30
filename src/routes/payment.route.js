import { Router } from 'express';
import {
  confirmStripePayment,
  createStripeSession,
  getAllPayments,
} from '../controllers/payment.controller.js';
import verifyUser from '../middlewares/verifyUser.js';

const paymentRouter = Router();

paymentRouter.post('/create-payment', verifyUser, createStripeSession);
paymentRouter.post('/confirm-payment', verifyUser, confirmStripePayment);
paymentRouter.get('/all-payments', verifyUser, getAllPayments);

export default paymentRouter;
