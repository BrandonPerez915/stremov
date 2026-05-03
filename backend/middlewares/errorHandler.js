import { handleError } from "../controllers/errorController.js"

function errorHandler(err, req, res, next) {
  const error = handleError(err)

  return res.status(error.statusCode).json({
    status: 'error',
    error: error.name,
    message: error.message,
    cause: error.cause || 'unknown'
  })
}

export default errorHandler
