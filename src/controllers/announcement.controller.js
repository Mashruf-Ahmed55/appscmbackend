import createHttpError from 'http-errors';
import Announcement from '../models/announcement.model';

export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return next(createHttpError(400, 'All fields are required'));
    }

    const announcement = await Announcement.create({
      title,
      content,
    });


    return res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: 'All announcements',
      announcements,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return next(createHttpError(400, 'All fields are required'));
    }

    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return next(createHttpError(404, 'Announcement not found'));
    }

    announcement.title = title;
    announcement.content = content;

    await announcement.save();

    return res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      return next(createHttpError(404, 'Announcement not found'));
    }

    return res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
