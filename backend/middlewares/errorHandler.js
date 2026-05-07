import { handleError } from "../controllers/errorController.js"

function errorHandler(err, req, res, next) {
  const error = handleError(err)

  const statusCode = error.statusCode || 500

  return res.status(statusCode).json({
    status: 'error',
    error: error.name,
    message: error.message,
    cause: error.cause || 'unknown'
  })
}

export default errorHandler
