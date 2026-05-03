import { Router } from 'express';

import * as personController from '../controllers/personController.js';
import errorHandler from '../middlewares/errorHandler.js';

const personsRouter = new Router();

//get buscar por nombre (o listar todos)
//post crear persona
personsRouter.route('/')
  .get(personController.searchPersons)
  .post(personController.postPerson);


personsRouter.route('/:id')
  .get(personController.getPerson)
  .patch(personController.patchPerson)
  .delete(personController.deletePerson);

personsRouter.use(errorHandler);

export default personsRouter;