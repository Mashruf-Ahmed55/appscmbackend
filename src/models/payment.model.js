import mongoose, { Schema } from 'mongoose';

const PaymentSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },
    couponCode: {
      type: String,
      default: null,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [ 'confirmed', 'cancelled'],
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', PaymentSchema);

export default Payment;
