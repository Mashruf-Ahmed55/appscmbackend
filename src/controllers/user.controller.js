import createHttpError from 'http-errors';
import User from '../models/auth.model';
import Booking from '../models/booking.model';
import Court from '../models/court.model';

export const getAllUsers = async (request, response, next) => {
  try {
    const query = {};
    // add search
    if (request.query.search) {
      query.name = { $regex: request.query.search, $options: 'i' };
      query.email = {
        $regex: request.query.search.replace(
          replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        ),
        $options: 'i',
      };
    }
    if (request.query.isMember) {
      query.isMember = true;
    }
    const allUsers = await User.find(query).sort({ createdAt: -1 });
    return response.status(200).json({
      success: true,
      message: 'All users',
      allUsers,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (request, response, next) => {
  try {
    const { id } = request.params;
    const user = await User.findById(id).select('-password');
    if (!user) {
      return next(createHttpError(404, 'User not found'));
    }
    return response.status(200).json({
      success: true,
      message: 'User profile',
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateUser = async (request, response, next) => {
  try {
    const { id } = request.params;
    const { role } = request.body;
    const user = await User.findById(id);
    if (!user) {
      return next(createHttpError(404, 'User not found'));
    }

    user.role = role;
    user.isMember = true;
    user.membershipDate = new Date();

    await user.save();

    return response.status(200).json({
      success: true,
      message: 'User updated',
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteUser = async (request, response, next) => {
  try {
    const { id } = request.params;
    const user = await User.findById(id);
    if (!user) {
      return next(createHttpError(404, 'User not found'));
    }

    await user.deleteOne();

    return response.status(200).json({
      success: true,
      message: 'User deleted',
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const analysisData = async (req, res, next) => {
  try {
    const [allUsers, allCourts, allBookings, allPremiumMembers] =
      await Promise.all([
        User.countDocuments(),
        Court.countDocuments(),
        Booking.countDocuments(),
        User.countDocuments({ isMember: true }),
      ]);
    res.status(200).json({
      success: true,
      message: 'All users',
      analysisData: {
        allUsers,
        allCourts,
        allBookings,
        allPremiumMembers,
      },
    });
  } catch (error) {
    next(error);
  }
};
