import { Router } from 'express';

import * as listController from '../controllers/listController.js';
import registerRequest from '../middlewares/registerRequest.js';
import errorHandler from '../middlewares/errorHandler.js';
import authMiddleware from '../middlewares/authMiddleware.js';


const listsRouter = new Router();

listsRouter.route('/')
  .post(authMiddleware, listController.postList);

listsRouter.route('/:name')
  .get(authMiddleware, listController.getList)
  .patch(authMiddleware, listController.patchList)
  .delete(authMiddleware, listController.deleteList);

listsRouter.use(errorHandler);

export default listsRouter;
