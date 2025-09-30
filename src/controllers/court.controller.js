import createHttpError from 'http-errors';
import Court from '../models/court.model';
import uploadImage from '../utils/uploadImage';

// Create a new court
export const createCourt = async (request, response, next) => {
  try {
    const { title, type, slots } = request.body;

    if (!title || !type) {
      return next(createHttpError(400, 'All fields are required'));
    }

    let image;
    if (request.file) {
      const res = await uploadImage(request.file.buffer, 'courts-images');
      image = {
        imageUrl: res.secure_url,
        publicId: res.public_id,
      };
    } else {
      image = {
        imageUrl:
          'https://mashruf-ahmed55.github.io/img-cdn/global/notFoundImage.png',
        publicId: '',
      };
    }

    let transformedSlots = [];
    if (slots) {
      let slotsArray = [];

      try {
        slotsArray = typeof slots === 'string' ? JSON.parse(slots) : slots;
      } catch (err) {
        return next(createHttpError(400, 'Invalid slots format'));
      }

      transformedSlots.push(
        ...slotsArray.map((slot) => {
          const [startHour, startMinute] = slot.startTime
            .split(':')
            .map(Number);
          const [endHour, endMinute] = slot.endTime.split(':').map(Number);

          const startDate = new Date();
          startDate.setHours(startHour, startMinute, 0, 0);

          const endDate = new Date();
          endDate.setHours(endHour, endMinute, 0, 0);

          return {
            startTime: startDate,
            endTime: endDate,
            price: slot.price,
          };
        })
      );
    }

    const court = await Court.create({
      title,
      type,
      image,
      slots: transformedSlots,
    });

    return response.status(201).json({
      success: true,
      message: 'Court created successfully',
      court,
    });
  } catch (error) {
    next(error);
  }
};

// Get all courts
export const getAllCourts = async (request, response, next) => {
  try {
    const { page = 1, limit = 10 } = request.query;

    const courts = await Court.find()
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Court.countDocuments();

    return response.status(200).json({
      success: true,
      message: 'All courts',
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      total,
      courts,
    });
  } catch (error) {
    next(error);
  }
};

// Get a Single court
export const getSingleCourt = async (request, response, next) => {
  try {
    const { id } = request.params;
    const court = await Court.findById(id);
    if (!court) {
      return next(createHttpError(404, 'Court not found'));
    }
    return response.status(200).json({
      success: true,
      message: 'Single court',
      court,
    });
  } catch (error) {
    next(error);
  }
};

// Update a court
export const updateCourt = async (request, response, next) => {
  try {
    const { id } = request.params;
    const { title, type, customType, slots } = request.body;

    const court = await Court.findById(id);
    if (!court) {
      return next(createHttpError(404, 'Court not found'));
    }

    // Handle image upload
    if (request.file) {
      const res = await uploadImage(request.file.buffer, 'courts-images');
      court.image = {
        imageUrl: res.secure_url,
        publicId: res.public_id,
      };
    } else if (request.body.image) {
      // If frontend sends an image object, use it
      court.image = request.body.image;
    }

    // Handle custom type logic
    const finalType = type === 'custom' ? customType : type;
    court.type = finalType;

    // Transform slots from "HH:mm" strings to Date objects
    const transformedSlots = [];
    if (slots) {
      let slotsArray = [];
      try {
        slotsArray = typeof slots === 'string' ? JSON.parse(slots) : slots;
      } catch (err) {
        return next(createHttpError(400, 'Invalid slots format'));
      }

      transformedSlots.push(
        ...slotsArray.map((slot) => {
          const [startHour, startMinute] = slot.startTime
            .split(':')
            .map(Number);
          const [endHour, endMinute] = slot.endTime.split(':').map(Number);

          const startDate = new Date();
          startDate.setHours(startHour, startMinute, 0, 0);

          const endDate = new Date();
          endDate.setHours(endHour, endMinute, 0, 0);

          return {
            startTime: startDate,
            endTime: endDate,
            price: slot.price,
          };
        })
      );
    }

    court.slots = transformedSlots;
    court.title = title;

    await court.save();

    return response.status(200).json({
      success: true,
      message: 'Court updated successfully',
      court,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a court
export const deleteCourt = async (request, response, next) => {
  try {
    const { id } = request.params;
    const court = await Court.findByIdAndDelete(id);
    if (!court) {
      return next(createHttpError(404, 'Court not found'));
    }
    return response.status(200).json({
      success: true,
      message: 'Court deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
