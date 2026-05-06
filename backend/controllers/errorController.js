import { StatusCodes } from "../config/constants.js";

/**
 * @summary Clase base para errores personalizados de la aplicación.
 * @description Extiende la clase Error nativa para incluir códigos de estado HTTP y metadatos adicionales, facilitando la captura de trazas de pila.
 */
class AppError extends Error {
  /**
   * @param {string} message - Mensaje descriptivo del error.
   * @param {number} statusCode - Código de estado HTTP (ej. 404, 500).
   * @param {string} [name] - Nombre identificador del error.
   * @param {any} [cause=null] - Información adicional sobre el origen del error.
   */
  constructor(message, statusCode, name, cause = null) {
    super(message);
    this.statusCode = statusCode;
    this.name = name || this.constructor.name;
    this.cause = cause;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * @summary Maneja errores de claves duplicadas de MongoDB (Código 11000).
 * @param {Object} error - Error original de Mongoose/MongoDB.
 * @returns {AppError} Instancia de AppError con estatus 409 (Conflict).
 */
const handleDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  const message = `El valor '${value}' para el campo '${field}' ya existe. Por favor, elige otro ${field} o inicia sesión.`;
  return new AppError(message, StatusCodes.CONFLICT, 'DuplicateKeyError', { field, value });
}

/**
 * @summary Maneja errores de validación de esquemas de Mongoose.
 * @param {Object} error - Error de validación con lista de fallos.
 * @returns {AppError} Instancia de AppError con estatus 400 (Bad Request).
 */
const handleValidationError = (error) => {
  const messages = Object.values(error.errors).map(val => val.message);
  const message = `Error de validación:\n\t${messages.join('\n\t')}`;
  return new AppError(message, StatusCodes.BAD_REQUEST, 'ValidationError');
}

/**
 * @summary Maneja errores de conversión de tipos (CastError) en Mongoose.
 * @description Se dispara comúnmente cuando un ID de MongoDB no tiene el formato correcto.
 * @param {Object} error - Error de casteo.
 * @returns {AppError} Instancia de AppError con estatus 400 (Bad Request).
 */
const handleCastError = (error) => {
  const message = `Valor inválido para el campo '${error.path}': '${error.value}'`;
  return new AppError(message, StatusCodes.BAD_REQUEST, 'CastError');
}

/**
 * @summary Maneja errores de firma de JSON Web Token.
 * @returns {AppError} Instancia de AppError con estatus 401 (Unauthorized).
 */
const handleJWTError = () => {
  return new AppError('Token inválido. Por favor, inicia sesión nuevamente.', StatusCodes.UNAUTHORIZED, 'JWTError');
}

/**
 * @summary Maneja errores de expiración de JSON Web Token.
 * @returns {AppError} Instancia de AppError con estatus 401 (Unauthorized).
 */
const handleJWTExpiredError = () => {
  return new AppError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', StatusCodes.UNAUTHORIZED, 'JWTExpiredError');
}

/**
 * @summary Captura y normaliza errores desconocidos o no controlados.
 * @description Registra el error en la consola del servidor y devuelve una respuesta genérica al cliente para evitar fugas de información.
 * @param {Error} error - Error original capturado.
 * @returns {AppError} Instancia de AppError con estatus 500 (Internal Server Error).
 */
const handleUnknownError = (error) => {
  console.error("Error no controlado:", error.stack || error.message);
  return new AppError('Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde.', StatusCodes.INTERNAL_SERVER_ERROR);
}

/**
 * @summary Función principal de despacho de errores.
 * @description Centraliza la lógica para transformar errores de diversas librerías (Mongoose, JWT, etc.) en instancias estandarizadas de `AppError`.
 * @param {Error|Object} error - El error capturado en los bloques catch o middlewares.
 * @returns {AppError} El error procesado y listo para ser enviado como respuesta.
 */
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
