import { Router } from 'express';

import * as listController from '../controllers/listController.js';
import registerRequest from '../middlewares/registerRequest.js';
import errorHandler from '../middlewares/errorHandler.js';
import authMiddleware from '../middlewares/authMiddleware.js';


const listsRouter = new Router();

listsRouter.route('/')
  .post(authMiddleware, listController.postList);

listsRouter.route('/user/:userId')
  .get(listController.getUserLists);
 
listsRouter.route('/user/:userId/favorites')
  .get(listController.getFavoriteList);

listsRouter.route('/:id')
  .get(authMiddleware, listController.getList)
  .patch(authMiddleware, listController.patchList)
  .delete(authMiddleware, listController.deleteList);

listsRouter.route('/:id/movies/:movieId')
  .post(authMiddleware, listController.addMovieToList) //agregar 
  .delete(authMiddleware, listController.removeMovieFromList); //y eliminar peliculas de lists

listsRouter.use(errorHandler);

export default listsRouter;
