import { deleteList, getList, updateList } from './api.js';

const TMDB_API_KEY = 'b7fcf224d742725d5ab77502464a0f49';
const TMDB_MOVIE_BASE_URL = 'https://api.themoviedb.org/3/movie/';
const FALLBACK_POSTER = 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/3Qud19bBUrrJAzy0Ilm8gRJlJXP.jpg';

function getListIdFromLocation() {
  const pathnameMatch = window.location.pathname.match(/\/list(?:s)?\/([^/]+)/i);
  if (pathnameMatch?.[1]) return pathnameMatch[1];

  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get('id') || '';
}

function normalizeMovie(movie) {
  return {
    ...movie,
    _id: movie._id || movie.id || movie.tmdbId,
    tmdbId: movie.tmdbId || movie.id || movie._id,
    title: movie.title || movie.name || 'Untitled movie',
    posterUrl: movie.posterUrl || FALLBACK_POSTER,
    imdbScore: typeof movie.imdbScore === 'number' ? movie.imdbScore : Number(movie.imdbScore || 0),
    genres: Array.isArray(movie.genres) ? movie.genres : [],
  };
}

function normalizeList(list) {
  const normalizedMovies = Array.isArray(list.movies) ? list.movies.map(normalizeMovie) : [];
  return {
    ...list,
    _id: list._id || list.id,
    name: list.name || 'Untitled list',
    description: list.description || '',
    owner: list.owner || null,
    movies: normalizedMovies,
  };
}

function formatOwner(owner) {
  if (!owner) return 'Unknown owner';
  if (typeof owner === 'string') return owner;
  return owner.username || owner.name || 'Unknown owner';
}

function getMovieApiUrl(movieId) {
  return `${TMDB_MOVIE_BASE_URL}${movieId}?api_key=${TMDB_API_KEY}&language=en-US`;
}

document.addEventListener('DOMContentLoaded', () => {
  const state = {
    listId: getListIdFromLocation(),
    list: null,
    fallbackUsed: false,
  };

  const titleElement = document.getElementById('list-title');
  const descriptionElement = document.getElementById('list-description');
  const ownerElement = document.getElementById('list-owner');
  const moviesCountElement = document.getElementById('movies-count');
  const listIdElement = document.getElementById('list-id');
  const editModal = document.getElementById('edit-list-modal');
  const form = document.getElementById('list-form');
  const nameInput = document.getElementById('list-name-input');
  const descriptionInput = document.getElementById('list-description-input');
  const moviesGrid = document.getElementById('movies-grid');
  const statusElement = document.getElementById('form-status');
  const editListButton = document.getElementById('edit-list-btn');
  const saveButton = document.getElementById('save-list-btn');
  const deleteButton = document.getElementById('delete-list-btn');

  function setStatus(message, type = '') {
    if (!statusElement) return;
    statusElement.textContent = message;
    statusElement.classList.remove('is-success', 'is-error');
    if (type) {
      statusElement.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
  }

  function openEditModal() {
    if (!editModal) return;

    editModal.classList.remove('hidden');
    editModal.setAttribute('aria-hidden', 'false');

    window.requestAnimationFrame(() => {
      nameInput?.focus();
    });
  }

  function closeEditModal() {
    if (!editModal) return;

    editModal.classList.add('hidden');
    editModal.setAttribute('aria-hidden', 'true');
  }

  function renderDetails() {
    if (!state.list) return;

    titleElement.textContent = state.list.name;
    descriptionElement.textContent = state.list.description || 'No description provided yet.';
    ownerElement.textContent = formatOwner(state.list.owner);
    moviesCountElement.textContent = `${state.list.movies.length} movies`;
    listIdElement.textContent = state.list._id;

    nameInput.value = state.list.name;
    descriptionInput.value = state.list.description || '';
  }

  function createMovieCard(movie) {
    const card = document.createElement('movie-card');
    card.className = 'movie-card-shell';
    card.setAttribute('title', movie.title);
    card.setAttribute('poster', movie.posterUrl || FALLBACK_POSTER);
    card.setAttribute('rating', movie.imdbScore ? movie.imdbScore.toFixed(1) : '0.0');

    if (movie.genres?.length) {
      card.setAttribute('genres', movie.genres.join(', '));
    }

    card._movieId = movie.tmdbId || movie._id;

    card.addEventListener('movie-clicked', (event) => {
      const movieId = event.detail?.movieId || card._movieId;
      if (!movieId) return;

      const existingModal = document.getElementById('list-detail-movie-modal');
      const apiUrl = getMovieApiUrl(movieId);

      if (existingModal) {
        existingModal.setAttribute('api-url', apiUrl);
        existingModal.setAttribute('open', 'true');
        return;
      }

      const modal = document.createElement('movie-modal');
      modal.id = 'list-detail-movie-modal';
      modal.setAttribute('api-url', apiUrl);
      modal.setAttribute('open', 'true');
      document.body.appendChild(modal);
    });

    return card;
  }

  function renderMovies() {
    if (!moviesGrid) return;

    moviesGrid.innerHTML = '';

    if (!state.list?.movies?.length) {
      moviesGrid.innerHTML = `
        <article class="empty-state">
          <h3>No movies in this list</h3>
          <p>Add some titles from the catalog to start filling it up.</p>
        </article>
      `;
      return;
    }

    state.list.movies.forEach((movie) => {
      moviesGrid.appendChild(createMovieCard(movie));
    });
  }

  async function loadList() {
    if (!state.listId) {
      moviesGrid.innerHTML = `
        <article class="empty-state">
          <h3>Missing list id</h3>
          <p>Open this page with a valid list id in the URL.</p>
        </article>
      `;
      return;
    }

    try {
      const response = await getList(state.listId);
      state.list = normalizeList(response.list);
      setStatus('');
    } catch (error) {
      try {
        const response = await fetch('../mocks/userLists.json');
        const data = await response.json();
          const fallbackList = data.lists.find((list) => list._id === state.listId || list.id === state.listId);

        if (!fallbackList) {
            throw new Error(`List not found: ${state.listId}`);
        }

        state.list = normalizeList(fallbackList);
        state.fallbackUsed = true;
        setStatus('Loaded fallback mock data', 'success');
      } catch (fallbackError) {
        moviesGrid.innerHTML = `
          <article class="empty-state">
            <h3>List unavailable</h3>
            <p>We could not load the list data.</p>
          </article>
        `;
        setStatus(fallbackError.message || 'Error loading list', 'error');
        console.error('Error loading list detail:', error, fallbackError);
        return;
      }
    }

    renderDetails();
    renderMovies();

    if (state.fallbackUsed) {
      moviesCountElement.textContent = `${state.list.movies.length} movies `;
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!state.list?._id) return;

    saveButton.disabled = true;
    setStatus('Saving changes...');

    try {
      const payload = {
        name: nameInput.value.trim(),
        description: descriptionInput.value.trim(),
      };

      const response = await updateList({ id: state.list._id, data: payload });
      state.list = normalizeList({ ...state.list, ...response.list, ...payload, owner: state.list.owner });
      renderDetails();
      setStatus('Changes saved successfully', 'success');
    } catch (error) {
      setStatus(error.message || 'Error saving changes', 'error');
    } finally {
      saveButton.disabled = false;
    }
  }

  async function handleDelete() {
    if (!state.list?._id) return;

    const confirmDelete = window.confirm(`Delete "${state.list.name}" permanently?`);
    if (!confirmDelete) return;

    deleteButton.disabled = true;
    setStatus('Deleting list...');

    try {
      await deleteList(state.list._id);
      window.location.href = '/your-lists';
    } catch (error) {
      setStatus(error.message || 'Error deleting list', 'error');
      deleteButton.disabled = false;
    }
  }

  editListButton?.addEventListener('click', openEditModal);
  form?.addEventListener('submit', handleSubmit);
  deleteButton?.addEventListener('click', handleDelete);
  editModal?.addEventListener('click', (event) => {
    if (event.target?.hasAttribute('data-close-edit-modal')) {
      closeEditModal();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && editModal && !editModal.classList.contains('hidden')) {
      closeEditModal();
    }
  });

  loadList();
});
