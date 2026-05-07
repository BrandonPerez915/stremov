import Review from '../models/Review.js';
import User from '../models/User.js';
import Movie from '../models/Movie.js';

import { StatusCodes } from '../config/constants.js';
import { AppError } from './errorController.js';

/**
 * @summary Crea una nueva reseña para una película.
 * @description Verifica que el usuario y la película existan antes de insertar el documento en la base de datos. Emite un error si ya existe una reseña.
 * @param {express.Request} req - Objeto de petición de Express. Espera `movieId`, `score`, `title`, `body` en req.body.
 * @param {express.Response} res - Objeto de respuesta de Express.
 * @param {express.NextFunction} next - Función Next de Express para delegar errores.
 * @returns {Promise<void>} Responde con JSON incluyendo la reseña creada.
 */
async function postReview(req, res, next) {
  const { movieId, score, title, body } = req.body;
  const { userId } = req;

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

/**
 * @summary Obtiene la reseña del usuario autenticado para una película específica.
 * @param {express.Request} req - Objeto de petición de Express. Requiere `movieId` en params y `userId` del JWT.
 * @param {express.Response} res - Objeto de respuesta de Express.
 * @param {express.NextFunction} next - Función Next de Express.
 * @returns {Promise<void>} Objeto de la reseña poblada.
 */
async function getReview(req, res, next) {
  const { movieId } = req.params;
  const { userId } = req;

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
    // Si no la encuentra, en vez de reventar podemos simplemente devolver un success sin contenido
    // para que el frontend sepa que no hay reseña y deba mostrar el formulario limpio.
    if (error.name === 'ReviewNotFound') {
      return res.status(StatusCodes.OK).json({ status: 'success', review: null });
    }
    return next(error);
  }
}

/**
 * @summary Obtiene todas las reseñas de una película y calcula promedios y distribución.
 * @param {express.Request} req - Objeto de petición de Express. Requiere `movieId`.
 * @param {express.Response} res - Objeto de respuesta de Express.
 * @param {express.NextFunction} next - Función Next de Express.
 * @returns {Promise<void>} JSON con arreglo de reseñas, promedio total y distribución por estrellas en CSV.
 */
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

    // Calculamos el arreglo de distribución de barras [5 estrellas, 4 estrellas, ..., 1 estrella]
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(r => {
      const starIndex = Math.ceil(r.score / 2) - 1; // Transforma base de 10 a base de 5
      if (starIndex >= 0 && starIndex < 5) {
        distribution[4 - starIndex]++;
      }
    });

    return res.status(StatusCodes.OK).json({
      status: 'success',
      total: reviews.length,
      average,
      distribution: distribution.join(','),
      reviews
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Obtiene las reseñas globales emitidas por un usuario específico (para su perfil).
 * @param {express.Request} req - Objeto de petición. Requiere `userId` en params.
 * @param {express.Response} res - Objeto de respuesta.
 * @param {express.NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Lista de reseñas emitidas.
 */
async function getUserReviews(req, res, next) {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', StatusCodes.NOT_FOUND, 'UserNotFound');
    }

    const reviews = await Review.find({ user: userId })
      .populate('movie', 'title posterUrl imdbScore')
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

/**
 * @summary Actualiza parcialmente una reseña existente.
 * @description En lugar de borrar y crear, se modifica la nota y el cuerpo de la reseña usando PATCH.
 * @param {express.Request} req - Objeto de petición.
 * @param {express.Response} res - Objeto de respuesta.
 * @param {express.NextFunction} next - Middleware Next.
 * @returns {Promise<void>}
 */
async function patchReview(req, res, next) {
  const { movieId } = req.params;
  const { userId } = req;
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

/**
 * @summary Borra la reseña existente para el usuario autenticado y película dada.
 * @param {express.Request} req - Objeto de petición.
 * @param {express.Response} res - Objeto de respuesta.
 * @param {express.NextFunction} next - Middleware Next.
 * @returns {Promise<void>}
 */
async function deleteReview(req, res, next) {
  const { movieId } = req.params;
  const { userId } = req;

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
