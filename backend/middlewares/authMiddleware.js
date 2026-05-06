import jwt from 'jsonwebtoken';
import { AppError } from '../controllers/errorController.js';
import { StatusCodes } from '../config/constants.js';

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError('No se proporcionó token de autenticación', StatusCodes.UNAUTHORIZED, 'JWTError');
    }

    const token = authHeader.split(' ')[1]; // Extraer el token del formato "Bearer <token>"

    if (!token) {
      throw new AppError('Token de autenticación mal formado', StatusCodes.UNAUTHORIZED, 'JWTError');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //mandamos userId y usernamr en request para controllers
    req.userId = decoded.userId;
    req.username = decoded.username;
    req.role = decoded.role;

    return next();
  } catch (error) {
    return next(error);
  }
}

export default authMiddleware;
