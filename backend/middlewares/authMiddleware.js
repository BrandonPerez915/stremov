import jwt from 'jsonwebtoken';
import { AppError } from '../controllers/errorController.js';
import { StatusCodes } from '../config/constants.js';

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError('No se proporcionó token de autenticación', StatusCodes.UNAUTHORIZED, 'JWTError');
    }

    const decoded = jwt.verify(authHeader, process.env.JWT_SECRET);

    //mandamos userId y usernamr en request para controllers
    req.userId = decoded.userId;
    req.username = decoded.username;

    return next();
  } catch (error) {
    return next(error);
  }
}

export default authMiddleware;