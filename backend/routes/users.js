import { Router } from 'express'

import * as userController from '../controllers/userController.js'
import registerRequest from '../middlewares/registerRequest.js'
import errorHandler from '../middlewares/errorHandler.js'
import authMiddleware from '../middlewares/authMiddleware.js';

/**
 * @description Router de Usuarios.
 * Gestiona el ciclo de vida de las cuentas de usuario, perfiles públicos
 * y la red social (sistema de seguidos).
 */
const usersRouter = new Router()

/**
 * @route POST /api/users
 * @summary Registro de un nuevo usuario.
 * @access Público
 */
usersRouter.route('/')
  .post(registerRequest, userController.postUser)

/**
 * @route GET /api/users/:name
 * @summary Obtiene el perfil público de un usuario por su nombre.
 * @access Público
 *
 * @route PATCH /api/users/:name
 * @summary Actualiza los datos del perfil propio (username, avatar, etc.).
 * @access Privado (Propietario de la cuenta)
 *
 * @route DELETE /api/users/:name
 * @summary Elimina la cuenta del usuario.
 * @access Privado (Propietario de la cuenta)
 */
usersRouter.route('/:name')
  .get(userController.getUsers)
  .patch(authMiddleware, userController.patchUser)
  .delete(authMiddleware, userController.deleteUser)

/**
 * @route POST /api/users/:name/follow
 * @summary Comienza a seguir a un usuario.
 * @access Privado (Requiere Token)
 *
 * @route DELETE /api/users/:name/follow
 * @summary Deja de seguir a un usuario.
 * @access Privado (Requiere Token)
 */
usersRouter.route('/:name/follow')
  .post(authMiddleware, userController.followUser)
  .delete(authMiddleware, userController.unfollowUser)

/**
 * @route GET /api/users/:name/followers
 * @summary Obtiene la lista de seguidores del usuario.
 * @access Público
 */
usersRouter.route('/:name/followers')
  .get(userController.getFollowers)

/**
 * @route GET /api/users/:name/following
 * @summary Obtiene la lista de usuarios a los que sigue el perfil indicado.
 * @access Público
 */
usersRouter.route('/:name/following')
  .get(userController.getFollowing)

// Middleware centralizado para la gestión de errores del router de usuarios
usersRouter.use(errorHandler)

export default usersRouter
