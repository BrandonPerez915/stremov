import { Router } from 'express';

import * as tmdbController from '../controllers/tmdbController.js';
import errorHandler from '../middlewares/errorHandler.js';

const tmdbRouter = Router();

//películas
tmdbRouter.get('/movies/search', tmdbController.searchMovies); //solo tmdb
tmdbRouter.get('/movies/popular', tmdbController.getPopularMovies); //solo tmbd
tmdbRouter.get('/movies/top-rated', tmdbController.getTopRatedMovies); //solo tmdb
tmdbRouter.get('/movies/:tmdbId', tmdbController.getMovie); //primero buscamos en mongoDB, si no está --> tmdb

//personas
tmdbRouter.get('/persons/search', tmdbController.searchPersons); //solo tmdb por ser búsqueda
tmdbRouter.get('/persons/:tmdbId/credits', tmdbController.getPersonCredits); //mongoDB primero y si no tmdb
tmdbRouter.get('/persons/:tmdbId', tmdbController.getPerson); //solo tmdb

tmdbRouter.use(errorHandler);

export default tmdbRouter;