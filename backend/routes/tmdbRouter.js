import { Router } from 'express';

import * as tmdbController from '../controllers/tmdbController.js';
import errorHandler from '../middlewares/errorHandler.js';

const tmdbRouter = Router();

//películas
tmdbRouter.get('/movies/search', tmdbController.searchMovies); //solo tmdb
tmdbRouter.get('/movies/popular', tmdbController.getPopularMovies); //solo tmbd
tmdbRouter.get('/movies/top-rated', tmdbController.getTopRatedMovies); //solo tmdb
tmdbRouter.get('/movies/discover', tmdbController.discoverMovies); //género, tmdb
tmdbRouter.get('/movies/:tmdbId/similar', tmdbController.getSimilarMovies); //similar
tmdbRouter.get('/movies/:tmdbId', tmdbController.getMovie); //primero buscamos en mongoDB, si no está --> tmdb


//series
tmdbRouter.get('/series/search', tmdbController.searchSeries);
tmdbRouter.get('/series/popular', tmdbController.getPopularSeries);
tmdbRouter.get('/series/top-rated', tmdbController.getTopRatedSeries);
tmdbRouter.get('/series/:tmdbId/credits', tmdbController.getSerieCredits);
tmdbRouter.get('/series/:tmdbId/similar', tmdbController.getSimilarSeries);
tmdbRouter.get('/series/:tmdbId', tmdbController.getSerie);


//personas
tmdbRouter.get('/persons/search', tmdbController.searchPersons); //solo tmdb por ser búsqueda
tmdbRouter.get('/persons/popular', tmdbController.getPopularPersons);
tmdbRouter.get('/persons/:tmdbId/credits', tmdbController.getPersonCredits); //mongoDB primero y si no tmdb
tmdbRouter.get('/persons/:tmdbId', tmdbController.getPerson); //solo tmdb

tmdbRouter.use(errorHandler);

export default tmdbRouter;