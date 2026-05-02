import { Router } from 'express';

import * as listController from '../controllers/listController.js';
import registerRequest from '../middlewares/registerRequest.js';
import errorHandler from '../middlewares/errorHandler.js';

// Consider adding auth middleware to set req.userId for these routes

const listsRouter = new Router();

listsRouter.route('/')
  .post(listController.postList);

listsRouter.route('/:name')
  .get(listController.getList)
  .patch(listController.patchList)
  .delete(listController.deleteList);

listsRouter.use(errorHandler);

export default listsRouter;
