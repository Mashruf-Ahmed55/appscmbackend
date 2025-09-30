import { Router } from 'express';
import {
  applyCoupon,
  createCoupon,
  deleteCoupons,
  getAllCoupons,
  updateCoupons,
} from '../controllers/coupon.controller.js';
import verifyUser from '../middlewares/verifyUser.js';
import { protectAdmin } from './../middlewares/protectAdmin.js';

const couponRouter = Router();

couponRouter.route('/').get(verifyUser, getAllCoupons);

couponRouter.post('/create-coupon', verifyUser, protectAdmin, createCoupon);

couponRouter
  .route('/:id')
  .delete(verifyUser, protectAdmin, deleteCoupons)
  .put(verifyUser, protectAdmin, updateCoupons);

couponRouter.route('/apply-coupon').post(verifyUser, applyCoupon);

export default couponRouter;
