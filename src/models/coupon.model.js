import mongoose, { Schema } from 'mongoose';

const CouponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    discountPercent: {
      type: Number,
      required: true,
      min: [1, 'Discount must be at least 1%'],
      max: [100, 'Discount cannot exceed 100%'],
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    couponType: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Coupon = mongoose.model('Coupon', CouponSchema);
export default Coupon;
