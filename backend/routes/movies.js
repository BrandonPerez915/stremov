import { Router } from 'express';

import * as movieController from '../controllers/movieController.js';
//import registerRequest from '../middlewares/registerRequest.js';
import errorHandler from '../middlewares/errorHandler.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const moviesRouter = new Router();

moviesRouter.route('/')
  .get(movieController.getAllMovies)
  .post(authMiddleware, movieController.postMovie); //manual, solo admins eventualmente

moviesRouter.route('/:id')
  .get(movieController.getMovie)
  .patch(authMiddleware, movieController.patchMovie)
  .delete(authMiddleware, movieController.deleteMovie);

moviesRouter.use(errorHandler);


export default moviesRouter;
