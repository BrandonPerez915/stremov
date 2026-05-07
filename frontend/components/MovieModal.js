import { apiClient } from '../scripts/utils/apiClient.js';
import './AddToListModal.js';

const movieModalSheet = new CSSStyleSheet();

movieModalSheet.replaceSync(`
  :host {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 9999;
    font-family: 'Inter', sans-serif;
    align-items: center;
    justify-content: center;
  }

  /* Cuando el atributo open está presente, mostramos la modal */
  :host([open]) {
    display: flex;
  }

  .backdrop {
    position: absolute;
    inset: 0;
    background-color: rgba(15, 17, 21, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 1;
    cursor: pointer;
  }

  .modal-container {
    position: relative;
    z-index: 2;
    background-color: var(--bg-color, #1f2128);
    width: 95%;
    max-width: 1100px;
    height: 90vh;
    max-height: 900px;
    border-radius: 20px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--borders-color, #3a3f4c);
    animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes modalFadeIn {
    from { opacity: 0; transform: scale(0.95) translateY(20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  .close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: background 0.2s;
  }

  .close-btn:hover {
    background: rgba(239, 68, 68, 0.8); /* Rojo al hover */
  }

  .close-btn .icon {
    font-family: 'Material Symbols Outlined';
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    font-size: 24px;
  }

  /* --- SISTEMA DE PESTAÑAS (TABS) --- */
  .tabs-header {
    display: flex;
    gap: 30px;
    padding: 20px 40px 0 40px;
    border-bottom: 1px solid var(--borders-color, #3a3f4c);
    flex-shrink: 0;
  }

  .tab-btn {
    background: none;
    border: none;
    color: var(--text-secondary, #8b8e98);
    font-size: 16px;
    font-weight: 600;
    padding: 15px 0;
    cursor: pointer;
    position: relative;
    transition: color 0.3s;
    font-family: inherit;
  }

  .tab-btn:hover {
    color: var(--text-primary, #ffffff);
  }

  .tab-btn.active {
    color: var(--primary-color, #4ade80);
  }

  .tab-btn.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: var(--primary-color, #4ade80);
    border-radius: 3px 3px 0 0;
  }

  .tabs-content {
    flex-grow: 1;
    position: relative;
    overflow: hidden;
    padding: 30px 40px;
  }

  .tab-pane {
    display: none;
    width: 100%;
    height: 100%;
    animation: fadeIn 0.3s ease;
  }

  .tab-pane.active {
    display: block; /* o flex dependiendo del componente hijo */
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* Loader spinner */
  .loader-container {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-color, #1f2128);
    z-index: 50;
  }
  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    border-top-color: var(--primary-color, #4ade80);
    animation: spin 1s ease-in-out infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Esconder elementos hasta que carguen */
  .content-hidden {
    display: none !important;
  }

  @media (max-width: 700px) {
    .tabs-header {
      padding: 15px 20px 0 20px;
      gap: 20px;
    }
    .tabs-content {
      padding: 20px;
    }
    .modal-container {
      height: 95vh;
      width: 100%;
      border-radius: 20px 20px 0 0;
      align-self: flex-end;
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
  }
`);

class MovieModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [movieModalSheet];
    this._currentMovieData = null;
  }

  static get observedAttributes() {
    return ['api-url', 'open'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'api-url' && oldValue !== newValue && newValue) {
      this._fetchMainData();
    }
    if (name === 'open') {
      if (this.hasAttribute('open')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }

  connectedCallback() {
    this._render();
    this._setupListeners();
    if (this.getAttribute('api-url')) {
      this._fetchMainData();
    }
  }

  disconnectedCallback() {
    document.body.style.overflow = '';
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <div class="backdrop" id="backdrop"></div>

      <div class="modal-container">
        <button class="close-btn" id="close-btn" aria-label="Close modal">
          <span class="icon">close</span>
        </button>

        <div id="loader" class="loader-container">
          <div class="spinner"></div>
        </div>

        <div class="tabs-header content-hidden" id="tabs-header">
          <button class="tab-btn active" data-target="info">Information</button>
          <button class="tab-btn" data-target="reviews">Reviews</button>
          <button class="tab-btn" data-target="similar">Similar</button>
        </div>

        <div class="tabs-content content-hidden" id="tabs-content">
          <!-- PANEL DE INFORMACIÓN -->
          <div class="tab-pane active" id="tab-info">
            <movie-modal-details id="details-component"></movie-modal-details>
          </div>

          <!-- PANEL DE RESEÑAS -->
          <div class="tab-pane" id="tab-reviews">
            <movie-modal-reviews id="reviews-component"></movie-modal-reviews>
          </div>

          <!-- PANEL DE SIMILARES -->
          <div class="tab-pane" id="tab-similar">
            <movie-modal-similar id="similar-component"></movie-modal-similar>
          </div>
        </div>
      </div>
    `;
  }

  _setupListeners() {
    // Cerrar modal con el backdrop
    this.shadowRoot.getElementById('backdrop').addEventListener('click', () => {
      this.removeAttribute('open');
      this.remove();
    });

    // Cerrar modal con la X
    this.shadowRoot.getElementById('close-btn').addEventListener('click', () => {
      this.removeAttribute('open');
      this.remove();
    });

    // Lógica de las pestañas
    const tabBtns = this.shadowRoot.querySelectorAll('.tab-btn');
    const tabPanes = this.shadowRoot.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Remover clase active de todos
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        // Añadir clase active al seleccionado
        const targetId = e.target.getAttribute('data-target');
        e.target.classList.add('active');
        this.shadowRoot.getElementById(`tab-${targetId}`).classList.add('active');
      });
    });

    const detailsComponent = this.shadowRoot.getElementById('details-component');
    const reviewsComponent = this.shadowRoot.getElementById('reviews-component');

    // Cambiar a la pestaña de reviews cuando se da click a "Rate" en info
    if (detailsComponent) {
      detailsComponent.addEventListener('action-rate', () => {
        const reviewsBtn = Array.from(tabBtns).find(btn => btn.dataset.target === 'reviews');
        if (reviewsBtn) {
          reviewsBtn.click();
        }
      });

      detailsComponent.addEventListener('action-watchlist', () => {
        this._openAddToListModal();
      });
    }

    // Escuchar el evento de reseña enviada para guardarla
    if (reviewsComponent) {
      reviewsComponent.addEventListener('review-submitted', async (e) => {
        const { rating, text, isUpdate } = e.detail;

        try {
          let result;
          const payload = {
            movieId: this._currentBackendMovieId,
            score: rating,
            title: `Review for ${this._currentMovieTitle || 'Media'}`,
            body: text || 'No description provided.'
          };

          if (isUpdate) {
            // Si el componente indica que ya ha calificado, hacemos un PATCH a la ruta "/movie/:id/me"
            result = await apiClient.patch(`/reviews/movie/${this._currentBackendMovieId}/me`, payload);
          } else {
            // Sino, es reseña nueva y se manda POST
            result = await apiClient.post('/reviews', payload);
          }

          if (window.toast) {
            window.toast({
              type: 'success',
              title: isUpdate ? 'Review updated' : 'Review submitted',
              message: isUpdate ? 'Your changes were saved successfully!' : 'Your review was posted successfully!',
              duration: 3000
            });
          }

          if (reviewsComponent._fetchReviews) {
            reviewsComponent._fetchReviews();
          }
        } catch (error) {
          if (window.toast) {
            window.toast({
              type: 'error',
              title: 'Could not post review',
              message: error.message || 'Please login to rate',
              duration: 3000
            });
          }
        }
      });
    }
  }

  _openAddToListModal() {
    if (!this._currentMovieData?.tmdbId) return;

    const modalId = 'global-add-to-list-modal';
    let modal = document.getElementById(modalId);
    if (!modal) {
      modal = document.createElement('add-to-list-modal');
      modal.id = modalId;
      document.body.appendChild(modal);
    }

    modal.open(this._currentMovieData);
  }

  // Utilidad para convertir minutos a formato "3h 12m"
  _formatRuntime(minutes) {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  async _fetchMainData() {
    const apiUrl = this.getAttribute('api-url');
    if (!apiUrl) return;

    const loader = this.shadowRoot.getElementById('loader');
    const tabsHeader = this.shadowRoot.getElementById('tabs-header');
    const tabsContent = this.shadowRoot.getElementById('tabs-content');

    // Show loader
    if (loader) loader.classList.remove('content-hidden');
    if (tabsHeader) tabsHeader.classList.add('content-hidden');
    if (tabsContent) tabsContent.classList.add('content-hidden');

    try {
      const jsonResponse = await apiClient.get(apiUrl);
      // El backend nuestro devuelve { status: 'success', movie: {...} } y el de serie devuelve la data directa
      const data = jsonResponse.movie || jsonResponse;

      const detailsComponent = this.shadowRoot.getElementById('details-component');
      const reviewsComponent = this.shadowRoot.getElementById('reviews-component');
      const similarComponent = this.shadowRoot.getElementById('similar-component');

      // 1. Formatear y pasar datos al componente de Detalles
      const title = data.title || data.name || 'Unknown';
      const releaseDate = data.releaseDate || data.release_date;
      const year = releaseDate ? releaseDate.substring(0, 4) : '';

      let tags = 'N/A';
      if (data.genres) {
        tags = typeof data.genres[0] === 'string' ? data.genres.join(', ') : data.genres.map(g => g.name).join(', ');
      }

      const rawRating = data.imdbScore || data.vote_average;
      const rating = rawRating ? (Math.round(rawRating * 10) / 10).toString() : 'N/A';
      const duration = data.runtimeFormatted || this._formatRuntime(data.runtime || data.episode_run_time?.[0]);
      const tmdbId = apiUrl.split('/').pop();
      const type = apiUrl.includes('/tmdb/series/') ? 'series' : 'movies';
      this._currentMovieData = {
        tmdbId,
        mongoId: data._id,
        title,
        type
      };

      let country = 'N/A';
      if (data.originCountry && data.originCountry.length > 0) country = data.originCountry.join(', ');
      else if (data.production_countries && data.production_countries.length > 0) country = data.production_countries.map(c => c.name).join(', ');

      let language = 'N/A';
      if (data.languages && data.languages.length > 0) language = data.languages.join(', ');
      else if (data.spoken_languages && data.spoken_languages.length > 0) language = data.spoken_languages.map(l => l.english_name).join(', ');

      const posterSrc = data.posterUrl || (data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : '');

      // Guardamos la ID interna de MongoDB (data._id) para que la reseña se ligue correctamente a nuestra DB
      this._currentBackendMovieId = data._id;
      this._currentMovieTitle = title;

      detailsComponent.setAttribute('movie-title', title);
      detailsComponent.setAttribute('poster-src', posterSrc);
      detailsComponent.setAttribute('year', year);
      detailsComponent.setAttribute('tags', tags);
      detailsComponent.setAttribute('imdb-rating', rating);
      detailsComponent.setAttribute('duration', duration);
      detailsComponent.setAttribute('synopsis', data.overview || 'No synopsis available.');
      detailsComponent.setAttribute('country', country);
      detailsComponent.setAttribute('language', language);

      // TMDB no da badges de edad ni premios directos en la llamada base, ponemos un default
      const rated = data.rated || (data.adult ? '18+' : 'PG-13');
      detailsComponent.setAttribute('age-badge', rated);
      detailsComponent.setAttribute('awards', data.awards || 'See IMDb for awards');
      detailsComponent.setAttribute('released', releaseDate || 'N/A');

      // 2. Autogenerar URLs para los otros componentes
      // (Dado que usamos tu API para el apiClient, construimos la ruta base)
      const isSeries = data.name ? true : false;
      const creditsUrl = isSeries ? `/tmdb/series/${data.id}/credits` : `/tmdb/movies/${data.tmdbId}/credits`;
      const similarUrl = isSeries ? `/tmdb/series/${data.id}/similar` : `/tmdb/movies/${data.tmdbId}/similar`;

      // Asignar las URLs (aunque tengas que crearlas luego en backend para evitar error 404 de los tabs internos)
      detailsComponent.setAttribute('credits-api-url', creditsUrl);

      similarComponent.setAttribute('movie-title', title);
      similarComponent.setAttribute('api-url', similarUrl);
      similarComponent.setAttribute('type', isSeries ? 'series' : 'movie');

      // Asignar títulos al componente de reviews
      reviewsComponent.setAttribute('movie-title', title);
      reviewsComponent.setAttribute('movie-poster', posterSrc);
      reviewsComponent.setAttribute('movie-rating', rating);

      // Asignamos una property (data setter) o la URL al componente para que pueda ir a traer las reviews.
      if (this._currentBackendMovieId) {
        reviewsComponent.setAttribute('movie-id', this._currentBackendMovieId);
      }

      // Hide loader and show content
      if (loader) loader.classList.add('content-hidden');
      if (tabsHeader) tabsHeader.classList.remove('content-hidden');
      if (tabsContent) tabsContent.classList.remove('content-hidden');

    } catch (error) {
      console.error("Error obteniendo datos principales de la película:", error);
      // Hide loader even on error
      if (loader) loader.classList.add('content-hidden');
    }
  }
}

if (!customElements.get('movie-modal')) {
  customElements.define('movie-modal', MovieModal);
}
