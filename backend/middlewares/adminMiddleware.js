import { AppError } from '../controllers/errorController.js';
import { StatusCodes } from '../config/constants.js';

function adminMiddleware(req, res, next) {
  try {
    if (req.role !== 'admin') {
      throw new AppError('No tienes permisos de administrador', StatusCodes.UNAUTHORIZED, 'UnauthorizedError');
    }
    return next();
  } catch (error) {
    return next(error);
  }
}

export default adminMiddleware;