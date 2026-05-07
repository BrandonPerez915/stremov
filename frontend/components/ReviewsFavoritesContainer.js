const reviewsFavoritesSheet = new CSSStyleSheet();

reviewsFavoritesSheet.replaceSync(`
  :host {
    display: block;
    font-family: 'Inter', sans-serif;
    color: var(--text-primary);
  }

  .container {
    width: 100%;
    margin-top: 40px;
  }

  .tabs-header {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 24px;
  }

  .tab-button {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 16px;
    font-weight: 600;
    padding: 16px 24px;
    cursor: pointer;
    position: relative;
    transition: color 0.3s ease;
    font-family: inherit;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tab-button:hover {
    color: var(--text-primary);
  }

  .tab-button.active {
    color: var(--primary-color);
  }

  .tab-button.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--primary-color);
  }

  .icon {
    font-family: 'Material Symbols Outlined';
    font-size: 20px;
  }

  .tab-content {
    display: none;
  }

  .tab-content.active {
    display: block;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .content-grid {
    display: grid;
    gap: 20px;
  }

  .reviews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
  }

  .movies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: var(--text-secondary);
    font-size: 16px;
  }

  .empty-state-icon {
    font-family: 'Material Symbols Outlined';
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }

  @media (max-width: 768px) {
    .tab-button {
      padding: 14px 16px;
      font-size: 15px;
    }

    .reviews-grid {
      grid-template-columns: 1fr;
    }

    .movies-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
  }
`);

import { getUserReviews, getFavoriteList } from '../scripts/api.js';
import '../components/ReviewCard.js';
import '../components/MovieCard.js';

class ReviewsFavoritesContainer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [reviewsFavoritesSheet];
    this.activeTab = 'reviews';
    this.reviews = [];
    this.favorites = [];
    this.userId = null;
    this.listId = null;
  }

  set data({ userId, listId }) {
    this.userId = userId;
    this.listId = listId;
    this._loadData();
  }

  async _loadData() {
    try {
      const [reviewsResult, favoritesResult] = await Promise.allSettled([
        this.userId ? getUserReviews(this.userId) : Promise.resolve({ reviews: [] }),
        this.listId ? getFavoriteList(this.listId) : Promise.resolve({ movies: [] })
      ]);

      this.reviews = reviewsResult.status === 'fulfilled' 
        ? (reviewsResult.value?.reviews || []) 
        : [];
      
      this.favorites = favoritesResult.status === 'fulfilled' 
        ? (favoritesResult.value?.movies || []) 
        : [];

      this._render();
    } catch (err) {
      console.error('Error loading reviews/favorites:', err);
      this._render();
    }
  }

  _escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  _formatReviewDate(dateValue) {
    if (!dateValue) return 'Fecha desconocida';
    const date = new Date(dateValue);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  _formatReviewScore(score) {
    const num = parseInt(score);
    return isNaN(num) ? 5 : Math.min(Math.max(num, 1), 5);
  }

  _getAvatarUrl(user) {
    return user?.avatarUrl 
      || user?.avatar 
      || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}`;
  }

  _renderReviews() {
    if (!this.reviews.length) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">rate_review</div>
          <p>Todavía no has publicado reviews.</p>
        </div>
      `;
    }

    return `
      <div class="reviews-grid">
        ${this.reviews.map((review) => `
          <review-card
            username="${this._escapeHtml(review.user?.username || 'Usuario')}"
            avatar-src="${this._escapeHtml(this._getAvatarUrl(review.user))}"
            rating="${this._escapeHtml(this._formatReviewScore(review.score))}"
            review-text="${this._escapeHtml(review.body || review.title || 'Sin comentario.')}"
            movie-title="${this._escapeHtml(review.movie?.title || 'Película')}"
            date="${this._escapeHtml(this._formatReviewDate(review.createdAt))}">
          </review-card>
        `).join('')}
      </div>
    `;
  }

  _renderFavorites() {
    if (!this.favorites.length) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">favorite</div>
          <p>Aún no tienes películas favoritas.</p>
        </div>
      `;
    }

    return `
      <div class="movies-grid">
        ${this.favorites.map((movie) => `
          <movie-card
            poster="${this._escapeHtml(movie.posterUrl || movie.poster || '')}"
            title="${this._escapeHtml(movie.title || 'Película')}"
            rating="${this._escapeHtml(movie.imdbScore || movie.rating || '')}"
            media-id="${this._escapeHtml(movie.id || '')}"
            genres="${this._escapeHtml((movie.genres || []).join(','))}">
          </movie-card>
        `).join('')}
      </div>
    `;
  }

  _switchTab(tab) {
    this.activeTab = tab;
    this._render();
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <div class="container">
        <div class="tabs-header">
          <button class="tab-button ${this.activeTab === 'reviews' ? 'active' : ''}" id="reviews-tab">
            <span class="icon">rate_review</span>
            Calificaciones
          </button>
          <button class="tab-button ${this.activeTab === 'favorites' ? 'active' : ''}" id="favorites-tab">
            <span class="icon">favorite</span>
            Favoritos
          </button>
        </div>

        <div class="tab-content ${this.activeTab === 'reviews' ? 'active' : ''}" id="reviews-content">
          <div class="content-grid">
            ${this._renderReviews()}
          </div>
        </div>

        <div class="tab-content ${this.activeTab === 'favorites' ? 'active' : ''}" id="favorites-content">
          <div class="content-grid">
            ${this._renderFavorites()}
          </div>
        </div>
      </div>
    `;

    this._setupListeners();
  }

  _setupListeners() {
    this.shadowRoot.getElementById('reviews-tab')?.addEventListener('click', () => this._switchTab('reviews'));
    this.shadowRoot.getElementById('favorites-tab')?.addEventListener('click', () => this._switchTab('favorites'));

    // Propagar eventos de movie-card
    this.shadowRoot.querySelectorAll('movie-card').forEach((card) => {
      card.addEventListener('movie-clicked', (e) => {
        document.dispatchEvent(new CustomEvent('movie-clicked', { 
          detail: e.detail, 
          bubbles: true, 
          composed: true 
        }));
      });
    });
  }
}

if (!customElements.get('reviews-favorites-container')) {
  customElements.define('reviews-favorites-container', ReviewsFavoritesContainer);
}
