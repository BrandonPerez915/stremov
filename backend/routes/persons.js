import { Router } from 'express';

import * as personController from '../controllers/personController.js';
import errorHandler from '../middlewares/errorHandler.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';

const personsRouter = new Router();

//get buscar por nombre (o listar todos)
//post crear persona
personsRouter.route('/')
  .get(personController.searchPersons)
  .post(authMiddleware, adminMiddleware, personController.postPerson);


personsRouter.route('/:id')
  .get(personController.getPerson)
  .patch(authMiddleware, adminMiddleware, personController.patchPerson)
  .delete(authMiddleware, adminMiddleware, personController.deletePerson);

personsRouter.use(errorHandler);

export default personsRouter;