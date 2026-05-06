import { Router } from 'express';

import * as movieController from '../controllers/movieController.js';
import errorHandler from '../middlewares/errorHandler.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';

const moviesRouter = new Router();

moviesRouter.route('/')
  .get(movieController.getAllMovies)
  .post(authMiddleware, adminMiddleware, movieController.postMovie); // manual, solo admins eventualmente

moviesRouter.route('/:id')
  .get(movieController.getMovie)
  .patch(authMiddleware, adminMiddleware, movieController.patchMovie)
  .delete(authMiddleware, adminMiddleware, movieController.deleteMovie);

moviesRouter.use(errorHandler);


export default moviesRouter;
