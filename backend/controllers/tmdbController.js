import { StatusCodes } from '../config/constants.js';
import { AppError } from './errorController.js';
import { findOrCreateMovie, findOrCreateSeries, findOrCreatePerson, tmdbFetch } from '../services/tmdbService.js';

// --- PELÍCULAS ---

/**
 * @summary Busca películas en TMDB por término de búsqueda.
 * @description Realiza una consulta a la API de TMDB utilizando un string de búsqueda y devuelve resultados paginados.
 * @param {import('express').Request} req - Objeto de petición. Espera `q` (query) y opcionalmente `page` en req.query.
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next para gestión de errores.
 * @returns {Promise<void>} Lista paginada de películas que coinciden con la búsqueda.
 */
async function searchMovies(req, res, next) {
  const { q, page = 1 } = req.query;
  if (!q) return next(new AppError('El nombre es obligatorio', StatusCodes.BAD_REQUEST, 'ValidationError'));

  try {
    const data = await tmdbFetch(`/search/movie?query=${encodeURIComponent(q)}&page=${page}`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Obtiene los datos detallados de una película.
 * @description Consulta TMDB y OMDb para obtener información completa, la sincroniza con la base de datos local (MongoDB) y devuelve el documento resultante.
 * @param {import('express').Request} req - Objeto de petición. Espera `tmdbId` en req.params.
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Objeto de la película persistido en la base de datos.
 */
async function getMovie(req, res, next) {
  const { tmdbId } = req.params;
  try {
    const movie = await findOrCreateMovie(parseInt(tmdbId));
    return res.status(StatusCodes.OK).json({ status: 'success', movie });
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Obtiene la lista de películas populares.
 * @description Conecta directamente con el endpoint de popularidad de TMDB para obtener las tendencias actuales.
 * @param {import('express').Request} req - Objeto de petición. Acepta `page` opcional en req.query.
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Lista de películas populares según TMDB.
 */
async function getPopularMovies(req, res, next) {
  const { page = 1 } = req.query;
  try {
    const data = await tmdbFetch(`/movie/popular?page=${page}`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Obtiene las películas mejor valoradas.
 * @description Recupera el ranking de películas con mayor puntuación de la comunidad de TMDB.
 * @param {import('express').Request} req - Objeto de petición. Acepta `page` opcional en req.query.
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Lista paginada de películas "Top Rated".
 */
async function getTopRatedMovies(req, res, next) {
  const { page = 1 } = req.query;
  try {
    const data = await tmdbFetch(`/movie/top_rated?page=${page}`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Obtiene películas similares a una dada.
 * @description Utiliza el ID de una película para recomendar otros títulos con temática o género afín.
 * @param {import('express').Request} req - Objeto de petición. Espera `tmdbId` en params y `page` en query.
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Lista de películas similares.
 */
async function getSimilarMovies(req, res, next) {
  const { tmdbId } = req.params;
  const { page = 1 } = req.query;
  try {
    const data = await tmdbFetch(`/movie/${tmdbId}/similar?page=${page}`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Descubre películas filtrando por géneros.
 * @description Permite explorar el catálogo de TMDB aplicando filtros específicos de categorías cinematográficas.
 * @param {import('express').Request} req - Objeto de petición. Espera `genre` (ID del género) y `page` en req.query.
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Lista de películas que coinciden con el género.
 */
async function discoverMovies(req, res, next) {
  const { genre, page = 1 } = req.query;
  try {
    const data = await tmdbFetch(`/discover/movie?with_genres=${genre}&page=${page}`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

// --- SERIES ---

/**
 * @summary Obtiene los detalles de una serie de televisión.
 * @description Recupera la info de una serie y la normaliza para que el frontend pueda consumirla bajo una interfaz común (alias "movie"), inyectándola en la DB local.
 * @param {import('express').Request} req - Objeto de petición. Espera `tmdbId` en req.params.
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Objeto de la serie normalizado para compatibilidad con el front.
 */
async function getSeriesDetail(req, res, next) {
  const { tmdbId } = req.params;
  try {
    const series = await findOrCreateSeries(parseInt(tmdbId));
    const seriesObj = series.toObject();

    // Normalización para el frontend
    seriesObj.name = seriesObj.title || seriesObj.name;
    seriesObj.id = tmdbId;

    return res.status(StatusCodes.OK).json({ status: 'success', movie: seriesObj });
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Obtiene las series de televisión populares.
 * @param {import('express').Request} req - Objeto de petición (`page` en query).
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Lista paginada de series populares.
 */
async function getPopularSeries(req, res, next) {
  const { page = 1 } = req.query;
  try {
    const data = await tmdbFetch(`/tv/popular?page=${page}`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Obtiene las series mejor valoradas.
 * @param {import('express').Request} req - Objeto de petición (`page` en query).
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Lista paginada de series "Top Rated".
 */
async function getTopRatedSeries(req, res, next) {
  const { page = 1 } = req.query;
  try {
    const data = await tmdbFetch(`/tv/top_rated?page=${page}`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Busca series de TV por nombre.
 * @param {import('express').Request} req - Objeto de petición (`q` para búsqueda).
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Resultados de búsqueda de series.
 */
async function searchSeries(req, res, next) {
  const { q, page = 1 } = req.query;
  if (!q) return next(new AppError('El nombre es obligatorio', StatusCodes.BAD_REQUEST, 'ValidationError'));

  try {
    const data = await tmdbFetch(`/search/tv?query=${encodeURIComponent(q)}&page=${page}`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Busca series similares a una específica.
 * @param {import('express').Request} req - Objeto de petición (`tmdbId` en params).
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Lista de series recomendadas.
 */
async function getSimilarSeries(req, res, next) {
  const { tmdbId } = req.params;
  const { page = 1 } = req.query;
  try {
    const data = await tmdbFetch(`/tv/${tmdbId}/similar?page=${page}`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

// --- PERSONAS ---

/**
 * @summary Obtiene celebridades populares (actores, directores).
 * @param {import('express').Request} req - Objeto de petición (`page` en query).
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Lista de personas populares en la industria.
 */
async function getPopularPersons(req, res, next) {
  const { page = 1 } = req.query;
  try {
    const data = await tmdbFetch(`/person/popular?page=${page}`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Busca personas en la base de datos de TMDB.
 * @param {import('express').Request} req - Objeto de petición (`q` para búsqueda).
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Resultados de búsqueda de personas.
 */
async function searchPersons(req, res, next) {
  const { q, page = 1 } = req.query;
  if (!q) return next(new AppError('El nombre es obligatorio', StatusCodes.BAD_REQUEST, 'ValidationError'));

  try {
    const data = await tmdbFetch(`/search/person?query=${encodeURIComponent(q)}&page=${page}`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Obtiene el perfil detallado de una persona.
 * @description Extrae datos biográficos de TMDB y asegura la existencia de la persona en la base de datos local para permitir relaciones (como seguidores o favoritos).
 * @param {import('express').Request} req - Objeto de petición (`tmdbId` en params).
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Datos de la persona combinados (DB local + TMDB).
 */
async function getPerson(req, res, next) {
  const { tmdbId } = req.params;
  try {
    const data = await tmdbFetch(`/person/${tmdbId}`);
    const person = await findOrCreatePerson({
      tmdbId: parseInt(tmdbId),
      name: data.name,
      photoUrl: data.profile_path ? `https://image.tmdb.org/t/p/w500${data.profile_path}` : null
    });

    return res.status(StatusCodes.OK).json({
      status: 'success',
      person,
      tmdb: data
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Obtiene la filmografía de una persona.
 * @description Recupera todos los créditos de actuación y técnicos asociados a un individuo.
 * @param {import('express').Request} req - Objeto de petición (`tmdbId` en params).
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Listado de películas y programas de TV donde ha participado.
 */
async function getPersonCredits(req, res, next) {
  const { tmdbId } = req.params;
  try {
    const data = await tmdbFetch(`/person/${tmdbId}/movie_credits`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

// --- UTILIDADES MIXTAS (Movie/TV) ---

/**
 * @summary Obtiene el reparto y equipo técnico de una producción.
 * @description Utilidad polimórfica que funciona tanto para películas como para series según el parámetro `:type`.
 * @param {import('express').Request} req - Objeto de petición (`type` [movie|tv] y `tmdbId` en params).
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Lista de cast y crew de la obra.
 */
async function getCredits(req, res, next) {
  const { type, tmdbId } = req.params;
  try {
    const data = await tmdbFetch(`/${type}/${tmdbId}/credits`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Obtiene recomendaciones similares genéricas.
 * @description Utilidad polimórfica para buscar contenido similar basándose en el tipo de medio proporcionado.
 * @param {import('express').Request} req - Objeto de petición (`type` y `tmdbId` en params).
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Lista de obras similares.
 */
async function getSimilar(req, res, next) {
  const { type, tmdbId } = req.params;
  try {
    const data = await tmdbFetch(`/${type}/${tmdbId}/similar`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

export {
  searchMovies,
  getMovie,
  getPopularMovies,
  getTopRatedMovies,
  getSimilarMovies,
  discoverMovies,
  getSeriesDetail,
  getPopularSeries,
  getTopRatedSeries,
  searchSeries,
  getSimilarSeries,
  getPopularPersons,
  searchPersons,
  getPerson,
  getPersonCredits,
  getCredits,
  getSimilar
};
