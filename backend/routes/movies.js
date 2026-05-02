import { Router } from 'express';

import * as movieController from '../controllers/movieController.js';
import registerRequest from '../middlewares/registerRequest.js';
import errorHandler from '../middlewares/errorHandler.js';

const moviesRouter = new Router();

moviesRouter.route('/')
  .get(movieController.getAllMovies)
  .post(movieController.postMovie);

moviesRouter.route('/:id')
  .get(movieController.getMovie)
  .patch(movieController.patchMovie)
  .delete(movieController.deleteMovie);

moviesRouter.use(errorHandler);

export default moviesRouter;
