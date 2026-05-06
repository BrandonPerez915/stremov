import { Router } from "express";

import usersRouter from "./users.js";
import listsRouter from "./lists.js";
import moviesRouter from "./movies.js";
import personsRouter from "./persons.js";
import reviewsRouter from "./reviews.js";
import tmdbRouter from "./tmdbRouter.js";
import authRouter from "./authRouter.js";

/**
 * @description Master Router de la API.
 * Este router centraliza todas las rutas de la aplicación bajo el prefijo `/api`,
 * delegando la responsabilidad a submódulos especializados según el dominio.
 */
const apiRouter = Router();

/**
 * @section Autenticación y Usuarios
 * @route  /api/login - Maneja el inicio de sesión y generación de tokens JWT.
 * @route  /api/users - Gestión de perfiles, registros y relaciones sociales.
 */
apiRouter.use('/users', usersRouter);
apiRouter.use('/login', authRouter);

/**
 * @section Colecciones Personales
 * @route  /api/lists - CRUD de listas personalizadas y gestión de películas favoritas.
 */
apiRouter.use('/lists', listsRouter);

/**
 * @section Contenido Multimedia (Caché Local)
 * @route  /api/movies  - Acceso a datos de películas persistidos en MongoDB.
 * @route  /api/persons - Acceso a datos de actores y directores persistidos.
 */
apiRouter.use('/movies', moviesRouter);
apiRouter.use('/persons', personsRouter);

/**
 * @section Interacción Social
 * @route  /api/reviews - Sistema de calificaciones y comentarios de usuarios sobre obras.
 */
apiRouter.use('/reviews', reviewsRouter);

/**
 * @section Integración Externa
 * @route  /api/tmdb - Proxy hacia TMDB y OMDb para búsqueda y descubrimiento en tiempo real.
 * @description Este módulo permite traer contenido que aún no existe en la base de datos local.
 */
apiRouter.use('/tmdb', tmdbRouter);

export default apiRouter;
