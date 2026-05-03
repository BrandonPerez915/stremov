import { StatusCodes } from "../config/constants.js";

class AppError extends Error {
  constructor(message, statusCode, name, cause = null) {
    super(message);
    this.statusCode = statusCode;
    this.name = name || this.constructor.name;
    this.cause = cause;
    Error.captureStackTrace(this, this.constructor);
  }
}

const handleDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  const message = `El valor '${value}' para el campo '${field}' ya existe. Por favor, elige otro ${field} o inicia sesión.`;
  return new AppError(message, StatusCodes.CONFLICT, 'DuplicateKeyError', { field, value });
}

const handleValidationError = (error) => {
  const messages = Object.values(error.errors).map(val => val.message);
  const message = `Error de validación:\n\t${messages.join('\n\t')}`;
  return new AppError(message, StatusCodes.BAD_REQUEST, 'ValidationError');
}

const handleCastError = (error) => {
  const message = `Valor inválido para el campo '${error.path}': '${error.value}'`;
  return new AppError(message, StatusCodes.BAD_REQUEST, 'CastError');
}

const handleJWTError = () => {
  return new AppError('Token inválido. Por favor, inicia sesión nuevamente.', StatusCodes.UNAUTHORIZED, 'JWTError');
}

const handleJWTExpiredError = () => {
  return new AppError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', StatusCodes.UNAUTHORIZED, 'JWTExpiredError');
}

const handleUnknownError = (error) => {
  console.error("Error no controlado:", error.message);
  return new AppError('Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde.', StatusCodes.INTERNAL_SERVER_ERROR);
}

function handleError(error) {
  if (error instanceof AppError) return error;

  if (error.code === 11000) return handleDuplicateKeyError(error);
  if (error.name === 'ValidationError') return handleValidationError(error);
  if (error.name === 'CastError') return handleCastError(error);
  if (error.name === 'JsonWebTokenError') return handleJWTError();
  if (error.name === 'TokenExpiredError') return handleJWTExpiredError();
  if (error.name === 'UserNotFound') return new AppError(error.message, StatusCodes.NOT_FOUND, 'UserNotFound');
  return handleUnknownError(error);
}

export { handleError, AppError };
