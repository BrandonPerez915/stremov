import { apiClient } from "../scripts/utils/apiClient.js";
import './CustomToast.js';
import './AddToListModal.js';

let favoritesCachePromise = null;

function getFavoritesList(userId) {
  if (!favoritesCachePromise) {
    favoritesCachePromise = apiClient.get(`/lists/user/${userId}/favorites`)
      .catch(err => {
        favoritesCachePromise = null;
        throw err;
      });
  }
  return favoritesCachePromise;
}

const movieCardSheet = new CSSStyleSheet();

movieCardSheet.replaceSync(`
  :host {
    display: inline-block;
    font-family: 'Inter', sans-serif;
    flex: 1;
    min-width: 170px;
    max-width: 350px;
  }

  .icon {
    color: var(--text-primary);
    font-family: 'Material Symbols Outlined';
    font-variation-settings: 'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24;
  }

  .movie-card {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    border-radius: 5px;
    overflow: hidden;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
  }

  .card-bg {
    aspect-ratio: 260 / 320;
    width: 100%;
    object-fit: cover;
    z-index: 1;
  }

  .favorite-btn, .add-to-list-btn {
    position: absolute;
    top: 16px;
    z-index: 3;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: none;
    border-radius: 12px;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .favorite-btn { right: 16px; }
  .add-to-list-btn { left: 16px; }

  .favorite-btn:hover, .add-to-list-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  #favorite-icon, #add-to-list-icon {
    color: white;
    font-size: 25px;
    transition: color 0.3s ease;
  }

  .favorite-btn:hover #favorite-icon { color: var(--red-100, #ef4444); }
  .add-to-list-btn:hover #add-to-list-icon { color: var(--primary-color); }

  .favorite-btn.is-favorite #favorite-icon {
    color: var(--red-100, #ef4444);
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  .card-content {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 2;
    padding: 12px;
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-top: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    color: white;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .card-content-header {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: start;
    gap: 8px;
  }

  .card-title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    line-height: 1.2;
    /* Lógica de truncado a 2 líneas */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-rating {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 1rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .star-icon {
    font-size: 20px;
    color: var(--yellow-100);
  }

  .card-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .tag {
    background-color: var(--primary-color);
    color: white;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.65rem;
    font-weight: 500;
  }

  @media (max-width: 750px) {
    .card-title { font-size: 0.9rem; }
    .card-rating { font-size: 0.8rem; }
  }
`);

class MovieCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [movieCardSheet];

    this._title = 'Untitled';
    this._matchedGenres = [];
    this._isRendered = false;
    this._movieId = '';
    this._isFavorite = false;
    this._backendMovieId = null;
    this._type = 'movies';
  }

  _openAddToListModal() {
    const modalId = 'global-add-to-list-modal';
    let modal = document.getElementById(modalId);
    if (!modal) {
      modal = document.createElement('add-to-list-modal');
      modal.id = modalId;
      document.body.appendChild(modal);
    }

    modal.open({
      tmdbId: this._movieId,
      mongoId: this._backendMovieId,
      title: this._title,
      type: this._type || 'movies'
    });
  }

  static get observedAttributes() {
    return ['type', 'poster', 'title', 'rating', 'genres', 'media-id'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === 'media-id') this._movieId = newValue;
    if (name === 'type') this._type = newValue;
    if (name === 'title') this._title = newValue || 'Untitled';
    if (name === 'genres') this._matchedGenres = this._matchGenres(newValue || '');

    if (this._isRendered) {
      this._updateDOM(name, newValue);
    }
  }

  connectedCallback() {
    if (!this._isRendered) {
      this._render();
      this._isRendered = true;
    }
  }

  _matchGenres(genresStr) {
    if (!genresStr || genresStr.trim() === '') return [];
    const genreMap = {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
      99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
      27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
      10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
    };
    return genresStr.split(',').map(id => genreMap[parseInt(id.trim())]).filter(Boolean);
  }

  _updateDOM(name, newValue) {
    const root = this.shadowRoot;
    if (name === 'title') {
      root.querySelector('.card-title').textContent = this._title;
    } else if (name === 'poster') {
      root.querySelector('.card-bg').src = newValue || '';
    } else if (name === 'rating') {
      root.querySelector('.card-rating span:first-child').textContent = newValue || '0.0';
    } else if (name === 'genres') {
      root.querySelector('.card-tags').innerHTML =
        this._matchedGenres.map((genre) => `<span class="tag">${genre}</span>`).join('');
    }
  }

  async _checkFavoriteState() {
    try {
      const userRaw = localStorage.getItem('userData');
      if (!userRaw) return;
      const user = JSON.parse(userRaw);
      if (!user?._id) return;

      const response = await getFavoritesList(user._id);
      const movies = response?.list?.movies || [];

      const foundMovie = movies.find(m => {
        const mId = String(m.tmdbId);
        const cardId = String(this._movieId);
        return mId === cardId || mId === `-${cardId}` || `-${mId}` === cardId;
      });

      if (foundMovie) {
        this._isFavorite = true;
        this._backendMovieId = foundMovie._id;
        const btn = this.shadowRoot.querySelector('.favorite-btn');
        if (btn) btn.classList.add('is-favorite');
      }
    } catch (error) {
      console.warn(`Error al verificar favoritos para ${this._title}:`, error.message);
    }
  }

  _render() {
    const poster = this.getAttribute('poster') || '';
    const rating = this.getAttribute('rating') || '0.0';

    this.shadowRoot.innerHTML = `
      <div class="movie-card">
        <img class="card-bg" src="${poster}" alt="Poster of ${this._title}">
        <button class="favorite-btn" aria-label="Favorite">
          <span class="icon" id="favorite-icon">favorite</span>
        </button>
        <button class="add-to-list-btn" aria-label="Add to list">
          <span class="icon" id="add-to-list-icon">bookmark</span>
        </button>
        <section class="card-content">
          <header class="card-content-header">
            <h2 class="card-title">${this._title}</h2>
            <div class="card-rating">
              <span>${rating}</span>
              <span class="icon star-icon">star</span>
            </div>
          </header>
          <footer class="card-tags">
            ${this._matchedGenres.map((genre) => `<span class="tag">${genre}</span>`).join('')}
          </footer>
        </section>
      </div>
    `;

    this._checkFavoriteState();

    this.shadowRoot.querySelector('.movie-card').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('movie-clicked', {
        detail: {
          movieId: this._movieId,
          type: this._type,
          title: this._title,
          poster,
          rating,
          genres: this._matchedGenres
        },
        bubbles: true,
        composed: true
      }));
    });

    this.shadowRoot.querySelector('.favorite-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      // ... (mantiene la misma lógica de gestión de favoritos que tenías)
      this._handleFavoriteToggle(e.currentTarget);
    });

    this.shadowRoot.querySelector('.add-to-list-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this._openAddToListModal();
    });
  }

  // Refactorizado para mayor limpieza
  async _handleFavoriteToggle(btn) {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        window.toast({ type: 'error', title: 'Sign in to save favorites' });
        return;
      }

      const user = JSON.parse(localStorage.getItem('userData'));
      let listId = user.favoritesListId;

      if (!this._backendMovieId) {
        const endpoint = this._type === 'series' ? 'series' : 'movies';
        const movieData = await apiClient.get(`/tmdb/${endpoint}/${this._movieId}`);
        this._backendMovieId = movieData?.movie?._id;
      }

      if (this._isFavorite) {
        await apiClient.delete(`/lists/${listId}/movies/${this._backendMovieId}`);
        this._isFavorite = false;
        btn.classList.remove('is-favorite');
      } else {
        await apiClient.post(`/lists/${listId}/movies/${this._backendMovieId}`);
        this._isFavorite = true;
        btn.classList.add('is-favorite');
      }

      favoritesCachePromise = null;
      document.dispatchEvent(new CustomEvent('favorites-changed', {
        detail: { movieId: this._backendMovieId, action: this._isFavorite ? 'added' : 'removed' }
      }));
    } catch (error) {
      console.error(error);
    }
  }
}

if (!customElements.get('movie-card')) {
  customElements.define('movie-card', MovieCard);
}

export {};
