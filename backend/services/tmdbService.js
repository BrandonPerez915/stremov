import Movie from '../models/Movie.js';
import Person from '../models/Person.js';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';

const OMDB_BASE_URL = 'https://www.omdbapi.com';
const OMDB_API_KEY = process.env.OMDB_API_KEY;

// Fetch base a TMDB
async function tmdbFetch(endpoint) {
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${TMDB_BASE_URL}${endpoint}${separator}api_key=${TMDB_API_KEY}&language=en-US`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`TMDB error ${response.status} en ${endpoint}`);
  }

  return response.json();
}

// Fetch base a OMDB con imdbId (obtenido del fetch a tmdb)
async function omdbFetch(imdbId) {
  const url = `${OMDB_BASE_URL}/?i=${imdbId}&apikey=${OMDB_API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`OMDb error ${response.status} para ${imdbId}`);
  }

  const data = await response.json();

  // Omdb devuelve { Response: "False", Error: "..." } si no encuentra
  if (data.Response === 'False') {
    throw new Error(`OMDb: ${data.Error}`);
  }

  return data;
}


function formatRuntime(minutes) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const min = minutes % 60;
  if (h === 0) return `${min}min`;
  if (min === 0) return `${h}h`;
  return `${h}h ${min}min`;
}


// FindOrCreate de Person a partir de datos de TMDB
async function findOrCreatePerson({ tmdbId, name, photoUrl }) {
  let person = await Person.findOne({ tmdbId });

  if (!person) {
    person = await Person.create({ tmdbId, name, photoUrl });
  }

  return person;
}

// FindOrCreate de Movie completo: busca en MongoDB primero, y si no existe llama a TMDB, guarda todo y devuelve
async function findOrCreateMovie(tmdbId) {

  // Buscar en mongoDB primero
  let movie = await Movie.findOne({ tmdbId })
    .populate('directors', 'name photoUrl')
    .populate('actors', 'name photoUrl');

  if (movie) return movie;

  // Si no está en mongoDB se trae los datos de TMDB
  const [movieData, creditsData] = await Promise.all([
    tmdbFetch(`/movie/${tmdbId}`),
    tmdbFetch(`/movie/${tmdbId}/credits`)
  ]);

  // Traer datos de omdb si hay imdbId
  let omdbData = null;
  if (movieData.imdb_id) {
    try {
      omdbData = await omdbFetch(movieData.imdb_id);
    } catch (error) {
      // Si OMDb falla no rompemos el flujo, seguimos sin esos datos
      console.warn(`OMDb no disponible para ${movieData.imdb_id}:`, error.message);
    }
  }

  // Procesar director(es)
  const directorDocs = await Promise.all(
    creditsData.crew
      .filter(c => c.job === 'Director')
      .map(d =>
        findOrCreatePerson({
          tmdbId: d.id,
          name: d.name,
          photoUrl: d.profile_path
            ? `${TMDB_IMAGE_BASE}${d.profile_path}`
            : null
        })
      )
  );

  // Procesar actores (top 10)
  const actorsData = creditsData.cast.slice(0, 10);
  const actorDocs = await Promise.all(
    actorsData.map(actor =>
      findOrCreatePerson({
        tmdbId: actor.id,
        name: actor.name,
        photoUrl: actor.profile_path
          ? `${TMDB_IMAGE_BASE}${actor.profile_path}`
          : null
      })
    )
  );

  // Crear Movie en mongoDB con todos los datos
  movie = await Movie.create({
    tmdbId,
    imdbId: movieData.imdb_id || null,
    title: movieData.title,
    overview: movieData.overview,
    releaseDate: movieData.release_date || null,
    releaseYear: movieData.release_date
      ? new Date(movieData.release_date).getFullYear()
      : null,
    runtime: movieData.runtime || null,
    runtimeFormatted: formatRuntime(movieData.runtime),
    rated: omdbData?.Rated || null,
    genres: movieData.genres.map(g => g.name),
    originCountry: movieData.origin_country || [],
    languages: movieData.spoken_languages.map(l => l.english_name),
    posterUrl: movieData.poster_path
      ? `${TMDB_IMAGE_BASE}${movieData.poster_path}`
      : null,
    backdropUrl: movieData.backdrop_path
      ? `${TMDB_BACKDROP_BASE}${movieData.backdrop_path}`
      : null,
    imdbScore: (omdbData?.imdbRating && omdbData.imdbRating !== "N/A")
      ? parseFloat(omdbData.imdbRating)
      : null,
    awards: omdbData?.Awards || null,
    directors: directorDocs.map(d => d._id),
    actors: actorDocs.map(a => a._id)
  });

  // Populate antes de devolver
  await movie.populate('directors', 'name photoUrl');
  await movie.populate('actors', 'name photoUrl');

  return movie;
}

async function findOrCreateSeries(tmdbId) {
  // Guardamos las series con ID negativo para no chocar con las de películas
  const dbTmdbId = -Math.abs(tmdbId);

  let series = await Movie.findOne({ tmdbId: dbTmdbId })
    .populate('directors', 'name photoUrl')
    .populate('actors', 'name photoUrl');

  if (series) return series;

  // Si no está en mongoDB se trae los datos de TMDB (TV Endpoint)
  const [tvData, creditsData] = await Promise.all([
    tmdbFetch(`/tv/${tmdbId}`),
    tmdbFetch(`/tv/${tmdbId}/aggregate_credits`)
  ]);

  const creators = tvData.created_by || [];
  const directorDocs = await Promise.all(
    creators.map(d =>
      findOrCreatePerson({
        tmdbId: d.id,
        name: d.name,
        photoUrl: d.profile_path
          ? `${TMDB_IMAGE_BASE}${d.profile_path}`
          : null
      })
    )
  );

  const actorsData = (creditsData.cast || []).slice(0, 10);
  const actorDocs = await Promise.all(
    actorsData.map(actor =>
      findOrCreatePerson({
        tmdbId: actor.id,
        name: actor.name,
        photoUrl: actor.profile_path
          ? `${TMDB_IMAGE_BASE}${actor.profile_path}`
          : null
      })
    )
  );

  const runtime = tvData.episode_run_time?.[0] || null;

  series = await Movie.create({
    tmdbId: dbTmdbId,
    title: tvData.name,
    overview: tvData.overview,
    releaseDate: tvData.first_air_date || null,
    releaseYear: tvData.first_air_date
      ? new Date(tvData.first_air_date).getFullYear()
      : null,
    runtime: runtime,
    runtimeFormatted: formatRuntime(runtime),
    genres: (tvData.genres || []).map(g => g.name),
    originCountry: tvData.origin_country || [],
    languages: tvData.languages || [],
    posterUrl: tvData.poster_path
      ? `${TMDB_IMAGE_BASE}${tvData.poster_path}`
      : null,
    backdropUrl: tvData.backdrop_path
      ? `${TMDB_BACKDROP_BASE}${tvData.backdrop_path}`
      : null,
    imdbScore: tvData.vote_average ? parseFloat(tvData.vote_average.toFixed(1)) : null,
    directors: directorDocs.map(d => d._id),
    actors: actorDocs.map(a => a._id)
  });

  await series.populate('directors', 'name photoUrl');
  await series.populate('actors', 'name photoUrl');

  return series;
}

export { findOrCreateMovie, findOrCreateSeries, findOrCreatePerson, tmdbFetch, formatRuntime };
