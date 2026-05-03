import Review from '../models/Review.js';
import User from '../models/User.js';
import Movie from '../models/Movie.js';

import { StatusCodes } from '../config/constants.js';
import { AppError } from './errorController.js';

async function postReview(req, res, next) {
  const { movieId, score, title, body } = req.body;
  const userId = req.userId || req.headers['user-id'];

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', StatusCodes.NOT_FOUND, 'UserNotFound');
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      throw new AppError('Película no encontrada', StatusCodes.NOT_FOUND, 'MovieNotFound');
    }

    const review = await Review.create({
      user: userId,
      movie: movieId,
      score,
      title,
      body
    });

    return res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'Reseña creada con éxito',
      review
    });
  } catch (error) {
    return next(error);
  }
}

async function getReview(req, res, next) {
  const { movieId } = req.params;
  const userId = req.userId || req.headers['user-id'];

  try {
    const review = await Review.findOne({ user: userId, movie: movieId })
      .populate('user', 'username avatarUrl')
      .populate('movie', 'title posterUrl');

    if (!review) {
      throw new AppError('Reseña no encontrada', StatusCodes.NOT_FOUND, 'ReviewNotFound');
    }

    return res.status(StatusCodes.OK).json({
      status: 'success',
      review
    });
  } catch (error) {
    return next(error);
  }
}

async function getMovieReviews(req, res, next) {
  const { movieId } = req.params;

  try {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      throw new AppError('Película no encontrada', StatusCodes.NOT_FOUND, 'MovieNotFound');
    }

    const reviews = await Review.find({ movie: movieId })
      .populate('user', 'username avatarUrl')
      .sort({ createdAt: -1 });

    const average = reviews.length
      ? Math.round((reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length) * 10) / 10
      : null;

    return res.status(StatusCodes.OK).json({
      status: 'success',
      total: reviews.length,
      average,
      reviews
    });
  } catch (error) {
    return next(error);
  }
}

async function getUserReviews(req, res, next) {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', StatusCodes.NOT_FOUND, 'UserNotFound');
    }

    const reviews = await Review.find({ user: userId })
      .populate('movie', 'title posterUrl')
      .sort({ createdAt: -1 });

    return res.status(StatusCodes.OK).json({
      status: 'success',
      total: reviews.length,
      reviews
    });
  } catch (error) {
    return next(error);
  }
}

async function patchReview(req, res, next) {
  const { movieId } = req.params;
  const userId = req.userId || req.headers['user-id'];
  const { score, title, body } = req.body;

  if (!score && !title && !body) {
    const error = new AppError('Al menos un campo (score, title, body) debe ser proporcionado para actualizar', StatusCodes.BAD_REQUEST, 'ValidationError');
    return next(error);
  }

  try {
    const review = await Review.findOne({ user: userId, movie: movieId });

    if (!review) {
      throw new AppError('Reseña no encontrada', StatusCodes.NOT_FOUND, 'ReviewNotFound');
    }

    if (score) review.score = score;
    if (title) review.title = title;
    if (body) review.body = body;

    await review.save();

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Reseña actualizada con éxito',
      review
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteReview(req, res, next) {
  const { movieId } = req.params;
  const userId = req.userId || req.headers['user-id'];

  try {
    const review = await Review.findOneAndDelete({ user: userId, movie: movieId });

    if (!review) {
      throw new AppError('Reseña no encontrada', StatusCodes.NOT_FOUND, 'ReviewNotFound');
    }

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Reseña eliminada con éxito',
      review
    });
  } catch (error) {
    return next(error);
  }
}

export {
  postReview,
  getReview,
  getMovieReviews,
  getUserReviews,
  patchReview,
  deleteReview
};