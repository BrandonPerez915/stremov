function getToken() {
  return localStorage.getItem('jwtToken');
}

//fetch autenticado para poner el header de autorizacion automático
async function authFetch(url, options = {}) {
  const token = getToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}) //por cambios en backend y apiClient
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error en la petición');
  }
  return data;
}

//fetch público para lógica de no login
async function publicFetch(url) {
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error en la petición');
  }
  return data;
}

function logout() {
  localStorage.removeItem('jwtToken');
  localStorage.removeItem('userData');
  window.location.href = '/home';
}

//AUTH

async function login({ username, password }) {
  return authFetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

async function register({ username, email, password }) {
  return authFetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({ username, email, password })
  });
}

//USUARIOS

async function getUser(username) {
  return authFetch(`/api/users/${username}`);
}

async function updateUser({ username, data }) {
  return authFetch(`/api/users/${username}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

async function deleteUser(username) {
  return authFetch(`/api/users/${username}`, {
    method: 'DELETE'
  });
}

async function followUser(username) {
  return authFetch(`/api/users/${username}/follow`, {
    method: 'POST'
  });
}

async function unfollowUser(username) {
  return authFetch(`/api/users/${username}/follow`, {
    method: 'DELETE'
  });
}

async function getFollowers(username) {
  return publicFetch(`/api/users/${username}/followers`);
}

async function getFollowing(username) {
  return publicFetch(`/api/users/${username}/following`);
}

//LISTAS

async function createList({ name, description }) {
  return authFetch('/api/lists', {
    method: 'POST',
    body: JSON.stringify({ name, description })
  });
}

async function getList(id) {
  return authFetch(`/api/lists/${id}`);
}
 
async function getUserLists(userId) {
  return publicFetch(`/api/lists/user/${userId}`);
}
 
async function getFavoriteList(userId) {
  return publicFetch(`/api/lists/user/${userId}/favorites`);
}
 
async function updateList({ id, data }) {
  return authFetch(`/api/lists/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}
 
async function deleteList(id) {
  return authFetch(`/api/lists/${id}`, {
    method: 'DELETE'
  });
}

async function addMovieToList({ listId, movieId }) {
  return authFetch(`/api/lists/${listId}/movies/${movieId}`, {
    method: 'POST'
  });
}
 
async function removeMovieFromList({ listId, movieId }) {
  return authFetch(`/api/lists/${listId}/movies/${movieId}`, {
    method: 'DELETE'
  });
}

//PELÍCULAS (MongoDB)

async function getAllMovies() {
  return publicFetch('/api/movies');
}

async function getMovie(id) {
  return publicFetch(`/api/movies/${id}`);
}

async function createMovie({ data }) {
  return authFetch('/api/movies', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

async function updateMovie({ id, data }) {
  return authFetch(`/api/movies/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

async function deleteMovie(id) {
  return authFetch(`/api/movies/${id}`, {
    method: 'DELETE'
  });
}

//TMDB

async function searchMovies(name, page = 1) {
  return publicFetch(`/api/tmdb/movies/search?q=${encodeURIComponent(name)}&page=${page}`);
}

async function getTmdbMovie(tmdbId) {
  return publicFetch(`/api/tmdb/movies/${tmdbId}`);
}

async function getPopularMovies(page = 1) {
  return publicFetch(`/api/tmdb/movies/popular?page=${page}`);
}

async function getTopRatedMovies(page = 1) {
  return publicFetch(`/api/tmdb/movies/top-rated?page=${page}`);
}

async function discoverMovies(genre, page = 1) {
  return publicFetch(`/api/tmdb/movies/discover?genre=${genre}&page=${page}`);
}

async function getSimilarMovies(tmdbId, page = 1) {
  return publicFetch(`/api/tmdb/movies/${tmdbId}/similar?page=${page}`);
}

//TMDB SERIES

async function searchSeries(name, page = 1) {
  return publicFetch(`/api/tmdb/series/search?q=${encodeURIComponent(name)}&page=${page}`);
}
 
async function getPopularSeries(page = 1) {
  return publicFetch(`/api/tmdb/series/popular?page=${page}`);
}
 
async function getTopRatedSeries(page = 1) {
  return publicFetch(`/api/tmdb/series/top-rated?page=${page}`);
}
 
async function getTmdbSerie(tmdbId) {
  return publicFetch(`/api/tmdb/series/${tmdbId}`);
}
 
async function getSerieCredits(tmdbId) {
  return publicFetch(`/api/tmdb/series/${tmdbId}/credits`);
}
 
async function getSimilarSeries(tmdbId, page = 1) {
  return publicFetch(`/api/tmdb/series/${tmdbId}/similar?page=${page}`);
}

//REVIEWS

async function createReview({ movieId, score, title, body }) {
  return authFetch('/api/reviews', {
    method: 'POST',
    body: JSON.stringify({ movieId, score, title, body })
  });
}

async function getMovieReviews(movieID) {
  return publicFetch(`/api/reviews/movie/${movieID}`);
}

async function getMyReview(movieId) {
  return authFetch(`/api/reviews/movie/${movieId}/me`);
}

async function updateReview(movieId, data) {
  return authFetch(`/api/reviews/movie/${movieId}/me`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

async function deleteReview(movieId) {
  return authFetch(`/api/reviews/movie/${movieId}/me`, {
    method: 'DELETE'
  });
}

async function getUserReviews(userId) {
  return publicFetch(`/api/reviews/user/${userId}`);
}

//TMDB PERSONAS

async function searchPersons(name, page = 1) {
  return publicFetch(`/api/tmdb/persons/search?q=${encodeURIComponent(name)}&page=${page}`);
}

async function getPopularPersons(page = 1) {
  return publicFetch(`/api/tmdb/persons/popular?page=${page}`);
}

async function getTmdbPerson(tmdbId) {
  return publicFetch(`/api/tmdb/persons/${tmdbId}`);
}

async function getPersonCredits(tmdbId) {
  return publicFetch(`/api/tmdb/persons/${tmdbId}/credits`);
}

//PERSONS (MongoDB)

async function searchPersonsDB(name) {
  return publicFetch(`/api/persons?name=${encodeURIComponent(name)}`);
}
 
async function getPerson(id) {
  return publicFetch(`/api/persons/${id}`);
}
 
async function createPerson({ name, photoUrl }) {
  return authFetch('/api/persons', {
    method: 'POST',
    body: JSON.stringify({ name, photoUrl })
  });
}
 
async function updatePerson({ id, name }) {
  return authFetch(`/api/persons/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name })
  });
}
 
async function deletePerson(id) {
  return authFetch(`/api/persons/${id}`, {
    method: 'DELETE'
  });
}


export {
  logout,
  //auth
  login,
  register,
  //users
  getUser,
  updateUser,
  deleteUser,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  //listas
  createList,
  getList,
  getUserLists,
  getFavoriteList,
  updateList,
  deleteList,
  addMovieToList,
  removeMovieFromList,
  //películas MongoDB
  getAllMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  //tmdb peliculas
  searchMovies,
  getTmdbMovie,
  getPopularMovies,
  getTopRatedMovies,
  discoverMovies,
  getSimilarMovies,
  //tmdb series
  searchSeries,
  getPopularSeries,
  getTopRatedSeries,
  getTmdbSerie,
  getSerieCredits,
  getSimilarSeries,
  //tmdb personas
  searchPersons,
  getPopularPersons,
  getTmdbPerson,
  getPersonCredits,
  //reviews
  createReview,
  getMovieReviews,
  getMyReview,
  updateReview,
  deleteReview,
  getUserReviews,
  //persons MongoDB
  searchPersonsDB,
  getPerson,
  createPerson,
  updatePerson,
  deletePerson
};