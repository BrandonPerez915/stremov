import { Router } from 'express';

import * as reviewController from '../controllers/reviewController.js';
import errorHandler from '../middlewares/errorHandler.js';
import authMiddleware from '../middlewares/authMiddleware.js';

/**
 * @description Router de Reseñas y Calificaciones.
 * Gestiona la interacción social de los usuarios con el contenido multimedia,
 * permitiendo la publicación de críticas, puntajes y la consulta de estadísticas.
 */
const reviewsRouter = new Router();

/**
 * @route POST /api/reviews
 * @summary Publica una nueva reseña.
 * @access Privado (Requiere Token)
 */
reviewsRouter.route('/')
  .post(authMiddleware, reviewController.postReview);

/**
 * @route GET /api/reviews/movie/:movieId
 * @summary Obtiene el feedback de una película específica.
 * @access Público
 */
reviewsRouter.route('/movie/:movieId')
  .get(reviewController.getMovieReviews);

/**
 * @route GET /api/reviews/movie/:movieId/me
 * @summary Obtiene la reseña del propio usuario para una película.
 * @access Privado (Requiere Token)
 *
 * @route PATCH /api/reviews/movie/:movieId/me
 * @summary Edita el contenido o puntaje de la reseña propia.
 * @access Privado (Requiere Token)
 *
 * @route DELETE /api/reviews/movie/:movieId/me
 * @summary Elimina la reseña del usuario autenticado.
 * @access Privado (Requiere Token)
 */
reviewsRouter.route('/movie/:movieId/me')
  .get(authMiddleware, reviewController.getReview)
  .patch(authMiddleware, reviewController.patchReview)
  .delete(authMiddleware, reviewController.deleteReview);

/**
 * @route GET /api/reviews/user/:userId
 * @summary Obtiene el historial de reseñas de un usuario.
 * @description Útil para mostrar la actividad de un perfil o el dashboard personal.
 * @access Público
 */
reviewsRouter.route('/user/:userId')
  .get(reviewController.getUserReviews);

// Middleware centralizado para la gestión de errores del router de reseñas
reviewsRouter.use(errorHandler);

export default reviewsRouter;
