import { StatusCodes } from '../config/constants.js';
import { AppError } from './errorController.js';
import { findOrCreateMovie, findOrCreatePerson, tmdbFetch } from '../services/tmdbService.js'; 

//buscar películas por nombre con tmbd
async function searchMovies(req, res, next) {
  const { q, page = 1 } = req.query;

  if (!q) {
    return next(new AppError('El nombre es obligatorio', StatusCodes.BAD_REQUEST, 'ValidationError'));
  }

  try {
    const data = await tmdbFetch(`/search/movie?query=${encodeURIComponent(q)}&page=${page}`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

//obtener detalle de película. busca en mongoDB primero, si no existe llama a TMDB, guarda todo y devuelve. Una sola llamada para el frontend.
async function getMovie(req, res, next) {
  const { tmdbId } = req.params;

  try {
    const movie = await findOrCreateMovie(parseInt(tmdbId));
    return res.status(StatusCodes.OK).json({
      status: 'success',
      movie
    });
  } catch (error) {
    return next(error);
  }
}

//películas populares: solo tmdb
async function getPopularMovies(req, res, next) {
  const { page = 1 } = req.query;

  try {
    const data = await tmdbFetch(`/movie/popular?page=${page}`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

//películas mejor valoradas: solo tmdb
async function getTopRatedMovies(req, res, next) {
  const { page = 1 } = req.query;

  try {
    const data = await tmdbFetch(`/movie/top_rated?page=${page}`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

//discover por géneros
async function discoverMovies(req, res, next) {
  const { genre, page = 1 } = req.query;

  try {
    const data = await tmdbFetch(
      `/discover/movie?with_genres=${genre}&page=${page}`
    );
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

//buscar peliculas similares
async function getSimilarMovies(req, res, next) {
  const { tmdbId } = req.params;
  const { page = 1 } = req.query;
 
  try {
    const data = await tmdbFetch(`/movie/${tmdbId}/similar?page=${page}`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

//SERIES

//populares
async function getPopularSeries(req, res, next) {
  const { page = 1 } = req.query;
 
  try {
    const data = await tmdbFetch(`/tv/popular?page=${page}`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}


//mejor valoradas
async function getTopRatedSeries(req, res, next) {
  const { page = 1 } = req.query;
 
  try {
    const data = await tmdbFetch(`/tv/top_rated?page=${page}`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

//busqueda por nombre
async function searchSeries(req, res, next) {
  const { q, page = 1 } = req.query;
 
  if (!q) {
    return next(new AppError('El nombre es obligatorio', StatusCodes.BAD_REQUEST, 'ValidationError'));
  }
 
  try {
    const data = await tmdbFetch(`/search/tv?query=${encodeURIComponent(q)}&page=${page}`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

//detalles
async function getSerie(req, res, next) {
  const { tmdbId } = req.params;
 
  try {
    const data = await tmdbFetch(`/tv/${tmdbId}`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

//créditos de serie
async function getSerieCredits(req, res, next) {
  const { tmdbId } = req.params;
 
  try {
    const data = await tmdbFetch(`/tv/${tmdbId}/credits`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

//similares
async function getSimilarSeries(req, res, next) {
  const { tmdbId } = req.params;
  const { page = 1 } = req.query;
 
  try {
    const data = await tmdbFetch(`/tv/${tmdbId}/similar?page=${page}`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

//PERSONAS

//populares 
async function getPopularPersons(req, res, next) {
  const { page = 1 } = req.query;
 
  try {
    const data = await tmdbFetch(`/person/popular?page=${page}`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

//buscar persona: solo tmdb y no guarda en mongoDB
async function searchPersons(req, res, next) {
  const { q, page = 1 } = req.query;

  if (!q) {
    return next(new AppError('El parámetro nombre es obligatorio', StatusCodes.BAD_REQUEST, 'ValidationError'));
  }

  try {
    const data = await tmdbFetch(`/search/person?query=${encodeURIComponent(q)}&page=${page}`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}

//info de persona busca en mongoDB primero, si no existe llama a TMDB, guarda y devuelve
async function getPerson(req, res, next) {
  const { tmdbId } = req.params;

  try {
    const data = await tmdbFetch(`/person/${tmdbId}`);
    const person = await findOrCreatePerson({
      tmdbId: parseInt(tmdbId),
      name: data.name,
      photoUrl: data.profile_path
        ? `https://image.tmdb.org/t/p/w500${data.profile_path}`
        : null
    });

    return res.status(StatusCodes.OK).json({
      status: 'success',
      person,         //datos de mongoDB (_id incluido)
      tmdb: data      //datos completos de TMDB
    });
  } catch (error) {
    return next(error);
  }
}

//trabajos de la persona: solo tmdb
async function getPersonCredits(req, res, next) {
  const { tmdbId } = req.params;

  try {
    const data = await tmdbFetch(`/person/${tmdbId}/movie_credits`);
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
}


export {
  //peliculas
  searchMovies,
  getMovie,
  getPopularMovies,
  getTopRatedMovies,
  discoverMovies,
  getSimilarMovies,
  //series
  getPopularSeries,
  getTopRatedSeries,
  searchSeries,
  getSerie,
  getSerieCredits,
  getSimilarSeries,
  //personas
  getPopularPersons,
  searchPersons,
  getPerson,
  getPersonCredits  
};