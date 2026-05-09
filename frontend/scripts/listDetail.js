import { getList, updateList, deleteList } from './api.js';
import '../components/AddToListModal.js';

const FALLBACK_POSTER = '../assets/img/defaultListImage.jpg';

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

function getMovieApiUrl(tmdbId) {
  return `/api/tmdb/movies/${tmdbId}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const state = {
    listId: getListIdFromLocation(),
    list: null,
  };

  const titleElement       = document.getElementById('list-title');
  const descriptionElement = document.getElementById('list-description');
  const moviesCountElement = document.getElementById('movies-count');
  const editModal          = document.getElementById('edit-list-modal');
  const form               = document.getElementById('list-form');
  const nameInput          = document.getElementById('list-name-input');
  const descriptionInput   = document.getElementById('list-description-input');
  const moviesGrid         = document.getElementById('movies-grid');
  const statusElement      = document.getElementById('form-status');
  const editListButton     = document.getElementById('edit-list-btn');
  const saveButton         = document.getElementById('save-list-btn');
  const deleteButton       = document.getElementById('delete-list-btn');

  function setStatus(message, type = '') {
    if (!statusElement) return;
    statusElement.textContent = message;
    statusElement.classList.remove('is-success', 'is-error');
    if (type) statusElement.classList.add(type === 'success' ? 'is-success' : 'is-error');
  }

  function openEditModal() {
    if (!editModal) return;
    editModal.classList.remove('hidden');
    editModal.setAttribute('aria-hidden', 'false');
    window.requestAnimationFrame(() => nameInput?.focus());
  }

  function closeEditModal() {
    if (!editModal) return;
    editModal.classList.add('hidden');
    editModal.setAttribute('aria-hidden', 'true');
  }

  function renderDetails() {
    if (!state.list) return;
    titleElement.textContent       = state.list.name;
    descriptionElement.textContent = state.list.description || '';
    moviesCountElement.textContent = `${state.list.movies.length} ${state.list.movies.length === 1 ? 'movie' : 'movies'}`;
    nameInput.value                = state.list.name;
    descriptionInput.value         = state.list.description || '';

    //para no modificar favs
    const isFavorites = ['favoritos', 'favorites'].includes((state.list.name || '').toLowerCase());
    if (editListButton) editListButton.style.display = isFavorites ? 'none' : 'block';
  }

  function createMovieCard(movie) {
    const card = document.createElement('movie-card');
    card.setAttribute('title', movie.title);
    card.setAttribute('poster', movie.posterUrl || FALLBACK_POSTER);
    card.setAttribute('rating', movie.imdbScore ? movie.imdbScore.toFixed(1) : '0.0');

    if (movie.genres?.length) {
      card.setAttribute('genres', movie.genres.join(', '));
    }

    // Detectar series por tmdbId negativo
    const isSeries = typeof movie.tmdbId === 'number' && movie.tmdbId < 0;
    const positiveTmdbId = Math.abs(movie.tmdbId || 0) || movie._id;

    card.setAttribute('media-id', positiveTmdbId);
    card.setAttribute('type', isSeries ? 'series' : 'movies');

    card.addEventListener('movie-clicked', (e) => {
      const { movieId, type } = e.detail;
      const modal = document.createElement('movie-modal');
      const endpoint = type === 'series' ? 'series' : 'movies';
      modal.setAttribute('api-url', `/tmdb/${endpoint}/${movieId}`);
      modal.setAttribute('open', '');
      document.body.appendChild(modal);
    });

    return card;
  }

  function renderMovies() {
    if (!moviesGrid) return;
    moviesGrid.innerHTML = '';

    if (!state.list?.movies?.length) {
      moviesGrid.innerHTML = `
        <div class="empty-state-container" style="grid-column: 1 / -1; width: 100%;">
          <article class="empty-state">
            <h3>Nothing in this list</h3>
            <p>Add some titles from the catalog to start filling it up.</p>
          </article>
        </div>
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
      moviesGrid.innerHTML = `
        <article class="empty-state">
          <h3>List unavailable</h3>
          <p>We could not load the list data.</p>
        </article>
      `;
      setStatus(error.message || 'Error loading list', 'error');
      console.error('Error loading list detail:', error);
      return;
    }

    renderDetails();
    renderMovies();
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
    if (event.target?.hasAttribute('data-close-edit-modal')) closeEditModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && editModal && !editModal.classList.contains('hidden')) {
      closeEditModal();
    }
  });

  document.addEventListener('list-membership-changed', (event) => {
    const { listId, movieId, action } = event.detail || {};
    if (action !== 'removed' || listId !== state.listId) return;

    const index = state.list.movies.findIndex((movie) =>
      String(movie._id) === String(movieId) || String(movie.tmdbId) === String(movieId)
    );

    if (index !== -1) {
      state.list.movies.splice(index, 1);
      renderDetails();
      renderMovies();
    }
  });

  loadList();
});
