import createHttpError from 'http-errors';
import Coupon from '../models/coupon.model';
import Payment from '../models/payment.model';

export const createCoupon = async (req, res, next) => {
  try {
    const { code, discountPercent, expiresAt, couponType } = req.body;
    if (!code || !discountPercent || !expiresAt) {
      return next(createHttpError(400, 'All fields are required'));
    }

    const coupon = await Coupon.create({
      code,
      discountPercent,
      expiresAt,
      couponType,
    });

    return res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCoupons = async (req, res, next) => {
  try {
    const allCoupons = await Coupon.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: 'All coupons',
      allCoupons,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCoupons = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, discountPercent, expiresAt, couponType } = req.body;

    if (!code || !discountPercent || !expiresAt) {
      return next(createHttpError(400, 'All fields are required'));
    }

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return next(createHttpError(404, 'Coupon not found'));
    }

    coupon.code = code;
    coupon.discountPercent = discountPercent;
    coupon.expiresAt = expiresAt;
    coupon.couponType = couponType;

    await coupon.save();

    return res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupons = async (req, res, next) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return next(createHttpError(404, 'Coupon not found'));
    }

    return res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const applyCoupon = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;

    const coupon = await Coupon.findOne({ code });

    if (!coupon) {
      return next(createHttpError(404, 'Invalid coupon code'));
    }
    if (coupon.expiresAt < new Date()) {
      return next(createHttpError(400, 'Coupon expired'));
    }
    const isUseCoupon = await Payment.findOne({ couponCode: coupon.code });

    if (isUseCoupon && userId === isUseCoupon.userId) {
      return next(createHttpError(400, 'Coupon Code Already used!'));
    } else {
      return res.status(200).json({
        success: true,
        message: 'Coupon applied successfully',
        coupon,
      });
    }
  } catch (error) {
    next(error);
  }
};
