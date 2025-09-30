import { model, Schema } from 'mongoose';
const BookingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courtId: {
      type: Schema.Types.ObjectId,
      ref: 'Court',
      required: true,
    },
    slots: {
      type: [
        {
          startTime: {
            type: Date,
            required: true,
          },
          endTime: {
            type: Date,
            required: true,
          },
          price: {
            type: Number,
            required: true,
            min: [0, 'Price cannot be negative'],
          },
        },
      ],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'cancelled', 'rejected', 'confirmed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const Booking = model('Booking', BookingSchema);

export default Booking;
