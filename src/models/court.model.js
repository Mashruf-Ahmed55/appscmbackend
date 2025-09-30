import mongoose, { Schema } from 'mongoose';

const imageSchema = new Schema(
  {
    imageUrl: String,
    publicId: String,
  },
  { _id: false, timestamps: false }
);

const slotsSchema = new Schema(
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
      default: 0,
    },
  },
  {
    _id: false,
    timestamps: false,
  }
);

const CourtSlot = mongoose.model('Slot', slotsSchema);

const CourtSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: imageSchema,
    type: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    slots: {
      type: [slotsSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Court = mongoose.model('Court', CourtSchema);

export default Court;
