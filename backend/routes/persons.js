import { Router } from 'express';

import * as personController from '../controllers/personController.js';
import errorHandler from '../middlewares/errorHandler.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';

/**
 * @description Router de Personas (Reparto y Dirección).
 * Gestiona la información de actores, directores y otros profesionales del cine.
 * Las acciones de modificación están reservadas para usuarios con rol de administrador.
 */
const personsRouter = new Router();

/**
 * @route GET /api/persons
 * @summary Busca personas por nombre o lista todos los registros disponibles.
 * @access Público
 *
 * @route POST /api/persons
 * @summary Registra una nueva persona en el catálogo local.
 * @access Privado (Admin)
 */
personsRouter.route('/')
  .get(personController.searchPersons)
  .post(authMiddleware, adminMiddleware, personController.postPerson);

/**
 * @route GET /api/persons/:id
 * @summary Obtiene el perfil detallado de una persona por su ID de base de datos.
 * @access Público
 *
 * @route PATCH /api/persons/:id
 * @summary Actualiza la información de una persona existente.
 * @access Privado (Admin)
 *
 * @route DELETE /api/persons/:id
 * @summary Elimina un registro de persona de la base de datos.
 * @access Privado (Admin)
 */
personsRouter.route('/:id')
  .get(personController.getPerson)
  .patch(authMiddleware, adminMiddleware, personController.patchPerson)
  .delete(authMiddleware, adminMiddleware, personController.deletePerson);

// Middleware centralizado para la gestión de errores del router de personas
personsRouter.use(errorHandler);

export default personsRouter;
