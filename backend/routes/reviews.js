import { Router } from 'express';

import * as reviewController from '../controllers/reviewController.js';
import errorHandler from '../middlewares/errorHandler.js';

const reviewsRouter = new Router();

//crear review
reviewsRouter.route('/')
  .post(reviewController.postReview);

//todas las reviews de una película y promedio
reviewsRouter.route('/movie/:movieId')
  .get(reviewController.getMovieReviews);

//obtener, actualizar o eliminar mi review
reviewsRouter.route('/movie/:movieId/me')
  .get(reviewController.getReview)
  .patch(reviewController.patchReview)
  .delete(reviewController.deleteReview);

//las reviews de un usuario para su profile
reviewsRouter.route('/user/:userId')
  .get(reviewController.getUserReviews);

reviewsRouter.use(errorHandler);

export default reviewsRouter;