import { apiClient } from "../scripts/utils/apiClient.js";
import './CustomToast.js';

// ==========================================
// CACHÉ GLOBAL DE FAVORITOS
// Evita hacer 20 peticiones iguales al backend
// ==========================================
let favoritesCachePromise = null;

function getFavoritesList(userId) {
  if (!favoritesCachePromise) {
    favoritesCachePromise = apiClient.get(`/lists/user/${userId}/favorites`)
      .catch(err => {
        favoritesCachePromise = null; // Si falla, permitimos reintentar después
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

  /* --- BOTÓN FAVORITOS --- */
  .favorite-btn {
    position: absolute;
    top: 16px;
    right: 16px;
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

  .favorite-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  #favorite-icon {
    color: white;
    font-size: 25px;
    transition: color 0.3s ease, font-variation-settings 0.3s ease;
  }

  .favorite-btn:hover #favorite-icon {
    color: var(--red-100, #ef4444);
  }

  /* ESTADO: CUANDO YA ES FAVORITO */
  .favorite-btn.is-favorite #favorite-icon {
    color: var(--red-100, #ef4444);
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  /* --- BOTÓN ADD TO LIST --- */
  .add-to-list-btn {
    position: absolute;
    top: 16px;
    left: 16px;
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

  .add-to-list-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  #add-to-list-icon {
    color: white;
    font-size: 25px;
    transition: color 0.3s ease;
  }

  .add-to-list-btn:hover #add-to-list-icon {
    color: var(--primary-color);
  }

  .card-content {
    position: absolute;
    display: flex;
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
    border-left: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    color: white;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .card-content-header {
    width: 65%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 8px;
  }

  .card-title {
    width: 100%;
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-subtitle {
    width: 100%;
    height: 14px;
    margin: 0;
    font-size: 0.6rem;
    font-weight: 300;
    letter-spacing: 0.3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-rating {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .star-icon {
    font-size: 25px;
    color: var(--yellow-100);
  }

  .card-tags {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .tag {
    background-color: var(--primary-color);
    color: white;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.3px;
  }

  @media (max-width: 750px) {
    .card-title { font-size: 0.9rem; font-weight: 500; }
    .card-rating { font-size: 0.8rem; font-weight: 400; }
    .card-content { padding: 12px; }
    .tag { font-size: 0.6rem; padding: 4px 12px; }
  }

  @media (max-width: 1000px) {
    .star-icon { font-size: 20px; }
    .card-title { font-size: 0.9rem; font-weight: 500; }
    .card-rating { font-size: 0.8rem; font-weight: 400; }
  }
`);

class MovieCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [movieCardSheet];

    this._mainTitle = 'Untitled';
    this._remainingTitle = '';
    this._matchedGenres = [];
    this._isRendered = false;
    this._movieId = '';

    this._isFavorite = false;
    this._backendMovieId = null;
  }

  static get observedAttributes() {
    return ['type', 'poster', 'title', 'rating', 'genres', 'media-id'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === 'media-id') this._movieId = newValue;
    if (name === 'type') this._type = newValue;
    if (name === 'title') {
      const { mainTitle, remainingTitle } = this._getTitleParts(newValue || '');
      this._mainTitle = mainTitle;
      this._remainingTitle = remainingTitle;
    }
    if (name === 'genres') {
      this._matchedGenres = this._matchGenres(newValue || '');
    }

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

  _getTitleParts(rawTitle) {
    if (!rawTitle) return { mainTitle: 'Untitled', remainingTitle: '' };
    let cleanTitle = rawTitle.trim().replace(/^(The|A|An)\s+/i, '');
    const regex = /[:\-]/;
    if (regex.test(cleanTitle)) {
      const partes = cleanTitle.split(regex);
      return { mainTitle: partes[0].trim(), remainingTitle: partes.slice(1).join(':').trim() };
    }
    const palabras = cleanTitle.split(' ');
    if (palabras.length > 1) {
      const remainingTitle = palabras.pop();
      const mainTitle = palabras.join(' ');
      return { mainTitle, remainingTitle };
    }
    return { mainTitle: cleanTitle, remainingTitle: '' };
  }

  _matchGenres(genresStr) {
    if (!genresStr || genresStr.trim() === '') return [];
    return genresStr.split(',').map(genre => {
      switch (parseInt(genre.trim())) {
        case 28: return 'Action'; case 12: return 'Adventure'; case 16: return 'Animation';
        case 35: return 'Comedy'; case 80: return 'Crime'; case 99: return 'Documentary';
        case 18: return 'Drama'; case 10751: return 'Family'; case 14: return 'Fantasy';
        case 36: return 'History'; case 27: return 'Horror'; case 10402: return 'Music';
        case 9648: return 'Mystery'; case 10749: return 'Romance'; case 878: return 'Science Fiction';
        case 10770: return 'TV Movie'; case 53: return 'Thriller'; case 10752: return 'War';
        case 37: return 'Western'; default: return '';
      }
    }).filter(Boolean);
  }

  _updateDOM(name, newValue) {
    if (name === 'title') {
      this.shadowRoot.querySelector('.card-title').textContent = this._mainTitle;
      this.shadowRoot.querySelector('.card-subtitle').textContent = this._remainingTitle;
    } else if (name === 'poster') {
      this.shadowRoot.querySelector('.card-bg').src = newValue || '';
    } else if (name === 'rating') {
      this.shadowRoot.querySelector('.card-rating span:first-child').textContent = newValue || '0.0';
    } else if (name === 'genres') {
      this.shadowRoot.querySelector('.card-tags').innerHTML =
        this._matchedGenres.map((genre) => `<span class="tag">${genre}</span>`).join('');
    }
  }

  // --- REVISIÓN OPTIMIZADA DEL ESTADO ---
  async _checkFavoriteState() {
    try {
      const userRaw = localStorage.getItem('userData');
      if (!userRaw) return;
      const user = JSON.parse(userRaw);

      // Usamos el caché global. ¡Solo la primera película hará la petición real!
      const response = await getFavoritesList(user._id);

      // Intentamos localizar el arreglo sin importar cómo lo anidó tu backend
      const movies = response.data?.list?.movies || response.list?.movies || response.movies || [];

      // Búsqueda a prueba de fallos (busca como String tanto en tmdbId como id)
      const foundMovie = movies.find(m =>
        String(m.tmdbId) === String(this._movieId) ||
        String(m.id) === String(this._movieId)
      );

      if (foundMovie) {
        this._isFavorite = true;
        this._backendMovieId = foundMovie._id; // ID de tu base de datos

        const btn = this.shadowRoot.querySelector('.favorite-btn');
        if (btn) btn.classList.add('is-favorite');
      }
    } catch (error) {
      console.warn(`Error al verificar favoritos para ${this._mainTitle}:`, error.message);
    }
  }

  _render() {
    const poster = this.getAttribute('poster') || '';
    const rating = this.getAttribute('rating') || '0.0';

    this.shadowRoot.innerHTML = `
      <div class="movie-card">
        <img class="card-bg" src="${poster}" alt="Poster of ${this._mainTitle}">
        <button class="favorite-btn">
          <span class="icon" id="favorite-icon">favorite</span>
        </button>
        <button class="add-to-list-btn">
          <span class="icon" id="add-to-list-icon">bookmark</span>
        </button>
        <section class="card-content">
          <header class="card-content-header">
            <h2 class="card-title">${this._mainTitle}</h2>
            <h4 class="card-subtitle">${this._remainingTitle}</h4>
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

    // Disparamos la verificación justo después de pintar
    this._checkFavoriteState();

    this.shadowRoot.querySelector('.movie-card').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('movie-clicked', {
        detail: {
          movieId: this._movieId,
          type: this._type || 'movies',
          title: this._mainTitle,
          poster: poster,
          rating: rating,
          genres: this._matchedGenres
        },
        bubbles: true,
        composed: true
      }));
    });

    // EVENTO DEL BOTÓN FAVORITO
    this.shadowRoot.querySelector('.favorite-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      const btn = e.currentTarget;

      try {
        const userRaw = localStorage.getItem('userData');
        const user = userRaw ? JSON.parse(userRaw) : null;

        if (!user || !user.favoritesListId) throw new Error("No hay usuario o no tiene lista de favoritos");

        const listId = user.favoritesListId;

        if (this._isFavorite) {
          // DELETE
          if (!this._backendMovieId) {
             console.warn("Falta _backendMovieId, buscando en backend...");
             const movieData = await apiClient.get(`/tmdb/${this._type}/${this._movieId}`);
             this._backendMovieId = movieData.movie._id;
          }

          await apiClient.delete(`/lists/${listId}/movies/${this._backendMovieId}`);

          this._isFavorite = false;
          btn.classList.remove('is-favorite');
          window.toast({ type: 'success', title: 'Removed from favorites', duration: 2000 });

          // Limpiar caché global para que en el próximo refresh la película ya no aparezca
          favoritesCachePromise = null;

        } else {
          // POST
          const movieData = await apiClient.get(`/tmdb/${this._type}/${this._movieId}`);
          const isSeries = this._type === 'tv' || this._type === 'series';
          const title = isSeries ? movieData.name : movieData.title;
          const genreIds = movieData.genres ? movieData.genres.map(g => g.id) : [];

          this._backendMovieId = movieData.movie._id;

          await apiClient.post(`/lists/${listId}/movies/${this._backendMovieId}`, {
            tmdbId: this._movieId,
            type: this._type,
            title: title,
            poster: movieData.poster_path,
            rating: movieData.vote_average,
            genres: genreIds
          });

          this._isFavorite = true;
          btn.classList.add('is-favorite');
          window.toast({ type: 'success', title: 'Added to favorites!', duration: 2000 });

          // Limpiar caché global para forzar la actualización al recargar
          favoritesCachePromise = null;
        }

      } catch (error) {
        console.error("Error toggling favorite:", error);
        window.toast({ type: 'error', title: 'Failed to update favorites', duration: 2000 });
      }
    });

    this.shadowRoot.querySelector('.add-to-list-btn').addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
}

if (!customElements.get('movie-card')) {
  customElements.define('movie-card', MovieCard);
}

export {};
