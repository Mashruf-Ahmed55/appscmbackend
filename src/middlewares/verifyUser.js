import createHttpError from 'http-errors';
import { verifyToken } from '../utils/generateJwt.js';
const verifyUser = async (request, response, next) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = verifyToken(token);
    request.user = decodedToken;
    next();
  } catch (error) {
    return next(createHttpError(401, 'Unauthorized'));
  }
};
export default verifyUser;
