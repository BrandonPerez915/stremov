import mongoose from "mongoose"

import Movie from "../models/Movie.js"

import { StatusCodes } from "../config/constants.js"
import { AppError } from "./errorController.js"
import { findOrCreateMovie } from "../services/tmdbService.js"

// Post de forma manual (puede no estar en TMDB)
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

async function getMovie(req, res, next) {
  const { id } = req.params;

  try {
    const movie = await findOrCreateMovie(id);

    if (!movie) {
      return next(new AppError('No se pudo recuperar la película', StatusCodes.NOT_FOUND));
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

async function getMovieByTmdbId(req, res, next) {
  const { tmdbId } = req.params;

  try {
    const movie = await Movie.findOne({ tmdbId });

    if (!movie) {
      throw new AppError('Película no encontrada', StatusCodes.NOT_FOUND, 'MovieNotFound');
    }

    return res.status(StatusCodes.OK).json({
      status: 'success',
      movie
    });
  } catch (error) {
    return next(error);
  }
}

async function patchMovie(req, res, next) {
  const movieId = req.params.id;

  const { title, overview, releaseDate, releaseYear, runtime, runtimeFormatted,
    rated, genres, originCountry, languages, posterUrl, backdropUrl,
    imdbScore, awards, directors, actors
  } = req.body;


   if (!title && !overview && !releaseDate && !releaseYear && !runtime && !runtimeFormatted &&
      !rated && !genres && !originCountry && !languages && !posterUrl && !backdropUrl &&
      !imdbScore && !awards && !directors && !actors) {
    return next(new AppError('Al menos un campo debe ser proporcionado para actualizar', StatusCodes.BAD_REQUEST, 'ValidationError'));
  }

  try {
    const movie = await Movie.findById(movieId);

    if (!movie) {
      const error = new AppError('Película no encontrada', StatusCodes.NOT_FOUND, 'MovieNotFound');
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

async function deleteMovie(req, res, next) {
  const movieId = req.params.id;

  try {
    const movie = await Movie.findByIdAndDelete(movieId);

    if (!movie) {
      const error = new AppError('Película no encontrada', StatusCodes.NOT_FOUND, 'MovieNotFound');
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
  //findOrCreateMovie,
  postMovie,
  getMovie,
  //getMovieByTmdbId,
  patchMovie,
  deleteMovie,
  getAllMovies
};
