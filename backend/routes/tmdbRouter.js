import { Router } from 'express';

import * as tmdbController from '../controllers/tmdbController.js';
import errorHandler from '../middlewares/errorHandler.js';

/**
 * @description Router de TMDB (The Movie Database).
 * Funciona como un Proxy hacia la API externa de TMDB.
 * Muchas de estas rutas no solo consultan datos externos, sino que también
 * gatillan la creación de caché local en MongoDB cuando se solicita el detalle.
 */
const tmdbRouter = Router();

// ==========================================
// PELÍCULAS (Movies)
// ==========================================

/**
 * @route GET /api/tmdb/movies/search
 * @summary Búsqueda global de películas en TMDB por nombre.
 * @access Público
 */
tmdbRouter.get('/movies/search', tmdbController.searchMovies);

/**
 * @route GET /api/tmdb/movies/popular
 * @summary Obtiene los títulos de cine en tendencia.
 * @access Público
 */
tmdbRouter.get('/movies/popular', tmdbController.getPopularMovies);

/**
 * @route GET /api/tmdb/movies/top-rated
 * @summary Obtiene las películas con mayor puntaje histórico.
 * @access Público
 */
tmdbRouter.get('/movies/top-rated', tmdbController.getTopRatedMovies);

/**
 * @route GET /api/tmdb/movies/discover
 * @summary Filtra y descubre películas (por género, año, etc.).
 * @access Público
 */
tmdbRouter.get('/movies/discover', tmdbController.discoverMovies);

/**
 * @route GET /api/tmdb/movies/:tmdbId
 * @summary Obtiene el detalle completo de una película.
 * @access Público
 */
tmdbRouter.get('/movies/:tmdbId', tmdbController.getMovie);

/**
 * @route GET /api/tmdb/movies/:tmdbId/credits
 * @summary Obtiene el reparto y equipo técnico de una película.
 * @access Público
 */
tmdbRouter.get('/movies/:tmdbId/credits', (req, res, next) => { req.params.type = 'movie'; next(); }, tmdbController.getCredits);

/**
 * @route GET /api/tmdb/movies/:tmdbId/similar
 * @summary Obtiene recomendaciones de películas similares.
 * @access Público
 */
tmdbRouter.get('/movies/:tmdbId/similar', (req, res, next) => { req.params.type = 'movie'; next(); }, tmdbController.getSimilar);


// ==========================================
// SERIES (TV)
// ==========================================

/**
 * @route GET /api/tmdb/series/search
 * @summary Búsqueda de series de TV por título.
 * @access Público
 */
tmdbRouter.get('/series/search', tmdbController.searchSeries);

/**
 * @route GET /api/tmdb/series/popular
 * @summary Obtiene las series de televisión más populares actualmente.
 * @access Público
 */
tmdbRouter.get('/series/popular', tmdbController.getPopularSeries);

/**
 * @route GET /api/tmdb/series/:tmdbId
 * @summary Obtiene el detalle de una serie y la registra en el catálogo local.
 * @access Público
 */
tmdbRouter.get('/series/:tmdbId', tmdbController.getSeriesDetail);

/**
 * @route GET /api/tmdb/series/:tmdbId/credits
 * @summary Obtiene el reparto de una serie de TV.
 * @access Público
 */
tmdbRouter.get('/series/:tmdbId/credits', (req, res, next) => { req.params.type = 'tv'; next(); }, tmdbController.getCredits);

/**
 * @route GET /api/tmdb/series/:tmdbId/similar
 * @summary Obtiene recomendaciones de series similares.
 * @access Público
 */
tmdbRouter.get('/series/:tmdbId/similar', (req, res, next) => { req.params.type = 'tv'; next(); }, tmdbController.getSimilar);


// ==========================================
// PERSONAS (Actors & Directors)
// ==========================================

/**
 * @route GET /api/tmdb/persons/search
 * @summary Busca actores, directores o miembros de la industria.
 * @access Público
 */
tmdbRouter.get('/persons/search', tmdbController.searchPersons);

/**
 * @route GET /api/tmdb/persons/popular
 * @summary Lista de personas famosas en tendencia.
 * @access Público
 */
tmdbRouter.get('/persons/popular', tmdbController.getPopularPersons);

/**
 * @route GET /api/tmdb/persons/:tmdbId/credits
 * @summary Obtiene la filmografía completa de una persona (Cast/Crew).
 * @access Público
 */
tmdbRouter.get('/persons/:tmdbId/credits', tmdbController.getPersonCredits);

/**
 * @route GET /api/tmdb/persons/:tmdbId
 * @summary Obtiene la biografía y datos personales de un profesional del cine.
 * @access Público
 */
tmdbRouter.get('/persons/:tmdbId', tmdbController.getPerson);

// Gestión centralizada de errores para todas las consultas a servicios externos
tmdbRouter.use(errorHandler);

export default tmdbRouter;
