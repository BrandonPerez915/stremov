import { Router } from 'express';

import * as listController from '../controllers/listController.js';
import registerRequest from '../middlewares/registerRequest.js';
import errorHandler from '../middlewares/errorHandler.js';
import authMiddleware from '../middlewares/authMiddleware.js';

/**
 * @description Router de Listas.
 * Gestiona las colecciones personales de películas de los usuarios.
 * La mayoría de las rutas requieren autenticación mediante `authMiddleware`.
 */
const listsRouter = new Router();

/**
 * @route POST /api/lists
 * @summary Crea una nueva lista personalizada.
 * @access Privado (Requiere Token)
 */
listsRouter.route('/')
  .post(authMiddleware, listController.postList);

/**
 * @route GET /api/lists/user/:userId
 * @summary Obtiene todas las listas públicas/privadas asociadas a un usuario específico.
 * @access Público
 */
listsRouter.route('/user/:userId')
  .get(listController.getUserLists);

/**
 * @route GET /api/lists/user/:userId/favorites
 * @summary Obtiene la lista específica de "Favoritos" de un usuario.
 * @access Público
 */
listsRouter.route('/user/:userId/favorites')
  .get(listController.getFavoriteList);

/**
 * @route GET /api/lists/:id
 * @summary Obtiene los detalles de una lista específica por su ID.
 * @access Privado (Requiere Token)
 *
 * @route PATCH /api/lists/:id
 * @summary Actualiza el nombre o la visibilidad de una lista existente.
 * @access Privado (Requiere Token)
 *
 * @route DELETE /api/lists/:id
 * @summary Elimina una lista de la base de datos.
 * @access Privado (Requiere Token)
 */
listsRouter.route('/:id')
  .get(authMiddleware, listController.getList)
  .patch(authMiddleware, listController.patchList)
  .delete(authMiddleware, listController.deleteList);

/**
 * @route POST /api/lists/:id/movies/:movieId
 * @summary Agrega o elimina películas de una lista determinada.
 * @access Privado (Requiere Token)
 *
 * @route DELETE /api/lists/:id/movies/:movieId
 * @summary Elimina una película específica de una lista determinada.
 * @access Privado (Requiere Token)
 */
listsRouter.route('/:id/movies/:movieId')
  .post(authMiddleware, listController.addMovieToList)
  .delete(authMiddleware, listController.removeMovieFromList);

// Middleware centralizado para la gestión de errores del router de listas
listsRouter.use(errorHandler);

export default listsRouter;
