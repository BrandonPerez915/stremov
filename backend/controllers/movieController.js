import mongoose from "mongoose"

import Movie from "../models/Movie.js"

import { StatusCodes } from "../config/constants.js"
import { AppError } from "./errorController.js"

async function postMovie(req, res, next) {
  const { title, releaseYear, genre, director, posterUrl } = req.body;

  try {
    const movie = await Movie.create({
      title,
      releaseYear,
      genre,
      director,
      posterUrl
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
  const movieId = req.params.id;

  try {
    const movie = await Movie.findById(movieId);

    if (!movie) {
      const error = new AppError('Película no encontrada', StatusCodes.NOT_FOUND, 'MovieNotFound');
      return next(error);
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

  const { title, releaseYear, genre, director, posterUrl } = req.body;

  if (!title && !releaseYear && !genre && !director && !posterUrl) {
    const error = new AppError('Al menos un campo debe ser proporcionado para actualizar', StatusCodes.BAD_REQUEST, 'ValidationError');
    return next(error);
  }

  try {
    const movie = await Movie.findById(movieId);

    if (!movie) {
      const error = new AppError('Película no encontrada', StatusCodes.NOT_FOUND, 'MovieNotFound');
      return next(error);
    }

    if (title) movie.title = title;
    if (releaseYear) movie.releaseYear = releaseYear;
    if (genre) movie.genre = genre;
    if (director) movie.director = director;
    if (posterUrl) movie.posterUrl = posterUrl;

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
    const movies = await Movie.find();
    return res.status(StatusCodes.OK).json({
      status: 'success',
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
