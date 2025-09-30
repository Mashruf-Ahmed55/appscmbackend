import createHttpError from 'http-errors';
import User from '../models/auth.model.js';

export const protectAdmin = async (request, response, next) => {
  try {
    const role = request.user?.role;
    const id = request.user?.id;

    const user = await User.findById(id);

    if (!user) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    if (user.role !== 'admin' && role !== 'admin') {
      return next(createHttpError(401, 'Unauthorized'));
    }

    next();
  } catch (error) {
    next(error);
  }
};
