import mongoose from "mongoose"

import Movie from "../models/Movie.js"

import { StatusCodes } from "../config/constants.js"
import { AppError } from "./errorController.js"
import { findOrCreateMovie } from "../services/tmdbService.js"

/**
 * @summary Crea una nueva película de forma manual.
 * @description Inserta un documento de película en la base de datos local con la información proporcionada en el cuerpo de la petición. Útil para títulos que no figuran en catálogos externos.
 * @param {express.Request} req - Objeto de petición. Espera todos los campos descriptivos de la película en req.body.
 * @param {express.Response} res - Objeto de respuesta.
 * @param {express.NextFunction} next - Middleware Next para delegar errores.
 * @returns {Promise<void>} Responde con JSON de la película creada.
 */
async function postMovie(req, res, next) {
  const { title, overview, releaseDate, releaseYear, runtime, runtimeFormatted,
    rated, genres, originCountry, languages, posterUrl, backdropUrl,
    imdbScore, awards, directors, actors
  } = req.body;

  try {
    const movie = await Movie.create({
      title,
      overview,
      releaseDate,
      releaseYear,
      runtime,
      runtimeFormatted,
      rated,
      genres,
      originCountry,
      languages,
      posterUrl,
      backdropUrl,
      imdbScore,
      awards,
      directors,
      actors
    });

    return res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'Película creada con éxito',
      movie
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Obtiene o sincroniza una película mediante su ID.
 * @description Utiliza el servicio `findOrCreateMovie` para buscar la película localmente o recuperarla de TMDB si no existe.
 * @param {express.Request} req - Objeto de petición. Espera `id` en req.params.
 * @param {express.Response} res - Objeto de respuesta.
 * @param {express.NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Responde con la película encontrada o procesada.
 */
async function getMovie(req, res, next) {
  const { id } = req.params;

  try {
    const movie = await findOrCreateMovie(id);

    if (!movie) {
      return next(new AppError('The film could not be recovered', StatusCodes.NOT_FOUND));
    }

    return res.status(StatusCodes.OK).json({
      status: 'success',
      movie
    });
  } catch (error) {
    console.error(`[Controller Error] getMovie: ${error.message}`);
    return next(error);
  }
}

/**
 * @summary Busca una película específicamente por su ID de TMDB.
 * @description Consulta directamente en la base de datos local un documento que coincida con el identificador de la API externa.
 * @param {express.Request} req - Objeto de petición. Espera `tmdbId` en req.params.
 * @param {express.Response} res - Objeto de respuesta.
 * @param {express.NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Objeto de la película encontrada.
 */
async function getMovieByTmdbId(req, res, next) {
  const { tmdbId } = req.params;

  try {
    const movie = await Movie.findOne({ tmdbId });

    if (!movie) {
      throw new AppError('Movie not found', StatusCodes.NOT_FOUND, 'MovieNotFound');
    }

    return res.status(StatusCodes.OK).json({
      status: 'success',
      movie
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Actualiza parcialmente los datos de una película.
 * @description Valida que se envíe al menos un campo y actualiza el registro local. No sincroniza con fuentes externas.
 * @param {express.Request} req - Objeto de petición. Espera `id` en params y campos a editar en req.body.
 * @param {express.Response} res - Objeto de respuesta.
 * @param {express.NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Responde con la película actualizada.
 */
async function patchMovie(req, res, next) {
  const movieId = req.params.id;

  const { title, overview, releaseDate, releaseYear, runtime, runtimeFormatted,
    rated, genres, originCountry, languages, posterUrl, backdropUrl,
    imdbScore, awards, directors, actors
  } = req.body;


   if (!title && !overview && !releaseDate && !releaseYear && !runtime && !runtimeFormatted &&
      !rated && !genres && !originCountry && !languages && !posterUrl && !backdropUrl &&
      !imdbScore && !awards && !directors && !actors) {
    return next(new AppError('At least one field must be provided to update', StatusCodes.BAD_REQUEST, 'ValidationError'));
  }

  try {
    const movie = await Movie.findById(movieId);

    if (!movie) {
      const error = new AppError('Movie not found', StatusCodes.NOT_FOUND, 'MovieNotFound');
      return next(error);
    }

    if (title) movie.title = title;
    if (overview) movie.overview = overview;
    if (releaseDate) movie.releaseDate = releaseDate;
    if (releaseYear) movie.releaseYear = releaseYear;
    if (runtime) movie.runtime = runtime;
    if (runtimeFormatted) movie.runtimeFormatted = runtimeFormatted;
    if (rated) movie.rated = rated;
    if (genres) movie.genres = genres;
    if (originCountry) movie.originCountry = originCountry;
    if (languages) movie.languages = languages;
    if (posterUrl) movie.posterUrl = posterUrl;
    if (backdropUrl) movie.backdropUrl = backdropUrl;
    if (imdbScore) movie.imdbScore = imdbScore;
    if (awards) movie.awards = awards;
    if (directors) movie.directors = directors;
    if (actors) movie.actors = actors;

    await movie.save();

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Película actualizada con éxito',
      movie
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Elimina una película de la base de datos.
 * @description Borra el registro de forma permanente utilizando su ID local.
 * @param {express.Request} req - Objeto de petición. Espera `id` en req.params.
 * @param {express.Response} res - Objeto de respuesta.
 * @param {express.NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Responde con el objeto de la película eliminada.
 */
async function deleteMovie(req, res, next) {
  const movieId = req.params.id;

  try {
    const movie = await Movie.findByIdAndDelete(movieId);

    if (!movie) {
      const error = new AppError('Movie not found', StatusCodes.NOT_FOUND, 'MovieNotFound');
      return next(error);
    }

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Película eliminada con éxito',
      movie
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Obtiene todas las películas registradas.
 * @description Recupera el catálogo completo de la base de datos local, poblando la información básica de directores y actores.
 * @param {express.Request} req - Objeto de petición.
 * @param {express.Response} res - Objeto de respuesta.
 * @param {express.NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Lista total de películas con sus referencias pobladas.
 */
async function getAllMovies(req, res, next) {
  try {
    const movies = await Movie.find()
      .populate('directors', 'name')
      .populate('actors','name');

    return res.status(StatusCodes.OK).json({
      status: 'success',
      total: movies.length,
      movies
    });

  } catch (error) {
    return next(error);
  }
}

export {
  postMovie,
  getMovie,
  patchMovie,
  deleteMovie,
  getAllMovies
};
