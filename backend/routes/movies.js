import { Router } from 'express';

import * as movieController from '../controllers/movieController.js';
import errorHandler from '../middlewares/errorHandler.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';

/**
 * @description Router de Películas.
 * Permite la gestión del catálogo de películas en la base de datos local.
 * Las operaciones de escritura (POST, PATCH, DELETE) están restringidas a administradores.
 */
const moviesRouter = new Router();

/**
 * @route GET /api/movies
 * @summary Obtiene el listado completo de películas en la base de datos.
 * @access Público
 *
 * @route POST /api/movies
 * @summary Registra una nueva película manualmente.
 * @access Privado (Admin)
 */
moviesRouter.route('/')
  .get(movieController.getAllMovies)
  .post(authMiddleware, adminMiddleware, movieController.postMovie);

/**
 * @route GET /api/movies/:id
 * @summary Obtiene los detalles de una película específica por su ID.
 * @access Público
 *
 * @route PATCH /api/movies/:id
 * @summary Actualiza la información de una película existente.
 * @access Privado (Admin)
 *
 * @route DELETE /api/movies/:id
 * @summary Elimina una película de la base de datos local.
 * @access Privado (Admin)
 */
moviesRouter.route('/:id')
  .get(movieController.getMovie)
  .patch(authMiddleware, adminMiddleware, movieController.patchMovie)
  .delete(authMiddleware, adminMiddleware, movieController.deleteMovie);

// Middleware centralizado para la gestión de errores del router de películas
moviesRouter.use(errorHandler);

export default moviesRouter;
