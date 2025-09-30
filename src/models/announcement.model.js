import mongoose, { Schema } from 'mongoose';

const AnnouncementSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now(),
    },
  },
  {
    timestamps: false,
  }
);

const Announcement = mongoose.model('Announcement', AnnouncementSchema);
export default Announcement;
