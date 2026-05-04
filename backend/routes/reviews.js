import { Router } from 'express';

import * as reviewController from '../controllers/reviewController.js';
import errorHandler from '../middlewares/errorHandler.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const reviewsRouter = new Router();

//crear review
reviewsRouter.route('/')
  .post(authMiddleware, reviewController.postReview);

//todas las reviews de una película y promedio
reviewsRouter.route('/movie/:movieId')
  .get(reviewController.getMovieReviews);

//obtener, actualizar o eliminar mi review
reviewsRouter.route('/movie/:movieId/me')
  .get(authMiddleware, reviewController.getReview)
  .patch(authMiddleware, reviewController.patchReview)
  .delete(authMiddleware, reviewController.deleteReview);

//las reviews de un usuario para su profile
reviewsRouter.route('/user/:userId')
  .get(reviewController.getUserReviews);

reviewsRouter.use(errorHandler);

export default reviewsRouter;