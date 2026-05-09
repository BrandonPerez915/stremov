import { apiClient } from '../scripts/utils/apiClient.js';
import './CustomTextarea.js';
import './StarsInput.js';

const movieModalReviewsSheet = new CSSStyleSheet();

movieModalReviewsSheet.replaceSync(`
:host {
  display: block;
  width: 100%;
  height: 100%; /* FIX: Obliga al componente a respetar el alto de la modal */
  overflow-y: auto; /* FIX: Activa el scroll vertical en toda la vista de reseñas */
  overflow-x: hidden;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
  padding-right: 15px; /* Espacio para que la barra de scroll no pise el contenido */
}

* {
  box-sizing: border-box;
}

/* Estilos de la barra de scroll movidos al contenedor principal */
:host::-webkit-scrollbar { width: 6px; }
:host::-webkit-scrollbar-track { background: var(--border-color, #3a3f4c); border-radius: 10px; }
:host::-webkit-scrollbar-thumb { background: var(--text-secondary, #8b8e98); border-radius: 10px; }
:host::-webkit-scrollbar-thumb:hover { background: var(--text-primary, #ffffff); }

h1.reviews-title {
  padding-bottom: 30px;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary, #ffffff);
}

.reviews-layout {
  border-top: 1px solid var(--border-color, #3a3f4c);
  display: flex;
  gap: 50px;
  width: 100%;
  padding: 40px 0;
}

.reviews-sidebar {
  flex: 0 0 320px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.overall-rating {
  text-align: center;
}

.overall-rating h2 {
  font-size: 48px;
  font-weight: 600;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-primary, #ffffff);
}

.star-main {
  font-family: 'Material Symbols Outlined';
  font-size: 36px;
  font-variation-settings: 'FILL' 1;
  color: var(--yellow-100, #f5c518);
}

.subtitle {
  color: var(--text-secondary, #8b8e98);
  font-size: 13px;
  margin: 0;
}

.rate-product-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.btn-primary, .btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background-color: var(--primary-color, #4ade80);
  color: white;
}

.btn-primary:hover {
  filter: brightness(1.1);
}

.btn-secondary {
  background-color: transparent;
  color: var(--text-primary, #ffffff);
  border: 1px solid var(--border-color, #3a3f4c);
  margin-top: 10px;
}

.btn-secondary:hover {
  background-color: var(--text-primary, #ffffff);
  color: var(--bg-color, #1f2128);
}

.form-hidden {
  display: none !important;
}

.rate-review-icon {
  font-family: 'Material Symbols Outlined';
  font-size: 20px;
}

.reviews-list {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  /* FIX: Eliminamos el max-height y el overflow interno para que el scroll fluya en todo el modal */
}

review-card {
  width: 100%;
}

@media (max-width: 850px) {
  .reviews-layout {
    flex-direction: column;
    padding: 20px 0;
  }

  .reviews-sidebar {
    flex: none;
    width: 100%;
    border-bottom: 1px solid var(--border-color, #3a3f4c);
    padding-bottom: 40px;
  }

  h1.reviews-title {
    font-size: 24px;
    text-align: center;
  }
}
`);

class MovieModalReviews extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [movieModalReviewsSheet];

    // Variables de estado interno
    this.hasRated = false;
    this.currentSelectedRating = 0;
  }

  static get observedAttributes() {
    return [
      'movie-title',
      'movie-poster',
      'movie-rating',
      'overall-rating',
      'total-ratings',
      'total-reviews',
      'bar-distribution',
      'reviews-data',
      'movie-id'
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'movie-id' && newValue) {
        this._fetchReviews();
      } else {
        this._render();
      }
    }
  }

  connectedCallback() {
    this._render();
    if (this.hasAttribute('movie-id')) {
      this._fetchReviews();
    }
  }

  async _fetchReviews() {
    const movieId = this.getAttribute('movie-id');
    if (!movieId) return;

    try {
      const isLoggedIn = !!localStorage.getItem('jwtToken');

      if (isLoggedIn) {
        try {
          // Cargar la reseña personal si existe (para modo de edición)
          const myReviewData = await apiClient.get(`/reviews/movie/${movieId}/me`);
          if (myReviewData && myReviewData.review) {
            this.hasRated = true;
            this.currentSelectedRating = myReviewData.review.score;
            this._myReviewText = myReviewData.review.body;
          } else {
            this.hasRated = false;
            this.currentSelectedRating = 0;
            this._myReviewText = '';
          }
        } catch (err) {
          console.warn("Personal review fetch err (might not exist):", err);
          this.hasRated = false;
          this.currentSelectedRating = 0;
          this._myReviewText = '';
        }
      } else {
        this.hasRated = false;
        this.currentSelectedRating = 0;
        this._myReviewText = '';
      }

      // Cargar reseñas globales
      const data = await apiClient.get(`/reviews/movie/${movieId}`);
      if (data && data.status === 'success') {
        const remoteReviews = data.reviews.map(r => ({
          username: r.user.username,
          avatarSrc: r.user.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
          rating: r.score,
          date: new Date(r.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          text: r.body
        }));

        this.setAttribute('reviews-data', JSON.stringify(remoteReviews));
        this.setAttribute('overall-rating', data.average ? data.average.toString() : '0.0');
        this.setAttribute('total-ratings', data.total.toString());
        this.setAttribute('total-reviews', data.total.toString());
        this.setAttribute('bar-distribution', data.distribution || '0,0,0,0,0');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }

  _render() {
    const movieTitle = this.getAttribute('movie-title') || 'Unknown Title';
    const moviePoster = this.getAttribute('movie-poster') || 'https://via.placeholder.com/260x320?text=No+Image';
    const movieRating = this.getAttribute('movie-rating') || '0';
    const overallRating = this.getAttribute('overall-rating') || '0.0';
    const totalRatings = this.getAttribute('total-ratings') || '0';
    const totalReviews = this.getAttribute('total-reviews') || '0';
    const barDistribution = this.getAttribute('bar-distribution') || '0,0,0,0,0';

    // Intentar parsear las reseñas pasadas por atributo
    let reviews = [];
    try {
      const dataStr = this.getAttribute('reviews-data');
      if (dataStr) {
        reviews = JSON.parse(dataStr);
      }
    } catch (e) {
      console.error("Error parseando reviews-data:", e);
    }

    // Generar el HTML de las tarjetas dinámicamente
    const reviewsHTML = reviews.map(review => `
      <review-card
        username="${review.username}"
        avatar-src="${review.avatarSrc}"
        rating="${review.rating}"
        date="${review.date}"
        movie-title="${movieTitle}"
        movie-poster="${moviePoster}"
        movie-rating="${movieRating}"
        review-text="${review.text.replace(/"/g, '&quot;')}">
      </review-card>
    `).join('');

    this.shadowRoot.innerHTML = `
      <h1 class="reviews-title">${movieTitle} - User Reviews</h1>

      <div class="reviews-layout">

        <!-- SIDEBAR -->
        <aside class="reviews-sidebar">
          <div class="overall-rating">
            <h2>${overallRating} <span class="star-main">star</span></h2>
            <p class="subtitle">${totalRatings} Ratings and ${totalReviews} Reviews</p>
          </div>

          <rating-bars ratings="${barDistribution}"></rating-bars>

          ${(() => {
            const isLoggedIn = !!localStorage.getItem('jwtToken');
            if (isLoggedIn) {
              return `
                <div class="rate-product-section">
                  <button id="toggle-rate-btn" class="btn-primary">
                    Rate This <span class='rate-review-icon'>trending_up</span>
                  </button>

                  <div id="rate-form-container" class="form-hidden">
                    <stars-input id="interactive-stars" value="0"></stars-input>

                    <custom-textarea
                      id="review-textarea"
                      label="Your Review"
                      placeholder="Input your review here...">
                    </custom-textarea>

                    <div style="display:flex;flex-direction:column;gap:8px;margin-top:4px;">
                      <button id="submit-rate-btn" class="btn-secondary" style="width:100%">Submit Review</button>
                      ${this.hasRated ? `<button id="delete-rate-btn" class="btn-secondary" style="width:100%;color:#ef4444;border-color:#ef4444">Delete review</button>` : ''}
                    </div>
                  </div>

                  <!-- Delete confirm modal -->
                  <div id="delete-confirm-overlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(6px);z-index:99999;display:none;align-items:center;justify-content:center;padding:24px;">
                    <div style="background:var(--bg-color,#1f2128);border:1px solid var(--border-color,#3a3f4c);border-radius:18px;padding:28px;width:min(400px,100%);display:flex;flex-direction:column;gap:18px;box-shadow:0 20px 50px rgba(0,0,0,0.5);">
                      <h3 style="margin:0;font-size:18px;color:var(--text-primary,#fff)">Delete review</h3>
                      <p style="margin:0;color:var(--text-secondary,#888);font-size:14px;line-height:1.6">Are you sure you want to delete your review? This action cannot be undone.</p>
                      <div style="display:flex;gap:10px;justify-content:flex-end; align-items:flex-end;">
                        <button id="delete-confirm-cancel" class="btn-secondary" style="padding:10px 18px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;background:transparent;border:1px solid var(--border-color,#3a3f4c);color:var(--text-primary,#fff);font-family:inherit;">Cancel</button>
                        <button id="delete-confirm-ok" style="padding:10px 18px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;background:rgba(239,68,68,0.12);border:1px solid #ef4444;color:#ef4444;font-family:inherit;">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            } else {
              return `
                <div class="rate-product-section">
                  <p style="text-align: center; color: var(--text-secondary); margin-bottom: 10px; font-size: 14px;">Sign in to leave a review.</p>
                  <button id="login-to-rate-btn" class="btn-primary">
                    Login / Register
                  </button>
                </div>
              `;
            }
          })()}
        </aside>

        <!-- LISTA DE RESEÑAS -->
        <main class="reviews-list">
          ${reviewsHTML || '<p style="color: var(--text-secondary); text-align: center;">No reviews yet. Be the first to rate!</p>'}
        </main>
      </div>
    `;

    this._setupListeners();
  }

  _setupListeners() {
    const isLoggedIn = !!localStorage.getItem('jwtToken');

    if (!isLoggedIn) {
      const loginBtn = this.shadowRoot.getElementById('login-to-rate-btn');
      if (loginBtn) {
        loginBtn.addEventListener('click', () => {
          window.location.href = '/login';
        });
      }
      return;
    }

    const toggleBtn = this.shadowRoot.getElementById('toggle-rate-btn');
    const formContainer = this.shadowRoot.getElementById('rate-form-container');
    const starsInput = this.shadowRoot.getElementById('interactive-stars');
    const customTextarea = this.shadowRoot.getElementById('review-textarea');
    const submitBtn = this.shadowRoot.getElementById('submit-rate-btn');

    // Inicializar valores según la reseña previa cargada (si la hay)
    if (this.hasRated) {
      toggleBtn.innerHTML = `Edit Rating <span class='rate-review-icon'>edit</span>`;
      if (starsInput) starsInput.setAttribute('value', this.currentSelectedRating.toString());
      if (customTextarea && this._myReviewText) customTextarea.setAttribute('value', this._myReviewText);
    }

    // Toggle del formulario
    toggleBtn.addEventListener('click', () => {
      formContainer.classList.toggle('form-hidden');

      if (formContainer.classList.contains('form-hidden')) {
        toggleBtn.innerHTML = this.hasRated
          ? `Edit Rating <span class='rate-review-icon'>edit</span>`
          : `Rate This <span class='rate-review-icon'>trending_up</span>`;
      } else {
        toggleBtn.textContent = 'Cancel';
        // Render current local component values
        if (starsInput) starsInput.setAttribute('value', this.currentSelectedRating.toString());
      }
    });

    // Escuchar el componente de estrellas interno
    starsInput?.addEventListener('rating-changed', (e) => {
      this.currentSelectedRating = e.detail.rating;
    });

    // Enviar formulario
    submitBtn.addEventListener('click', () => {
      if (this.currentSelectedRating === 0) {
        alert('Please select a star rating.');
        return;
      }

      // Variable isUpdate para que MovieModal sepa que metodo usar
      const isUpdate = this.hasRated;
      this.hasRated = true;
      formContainer.classList.add('form-hidden');
      toggleBtn.innerHTML = `Edit Rating <span class='rate-review-icon'>edit</span>`;

      const reviewText = customTextarea.value || customTextarea.getAttribute('value');

      // Custom event para cuando se envia una reseña
      this.dispatchEvent(new CustomEvent('review-submitted', {
        detail: {
          rating: this.currentSelectedRating,
          text: reviewText,
          isUpdate: isUpdate
        },
        bubbles: true,
        composed: true
      }));
    });

    //delete review boton
    const deleteRateBtn = this.shadowRoot.getElementById('delete-rate-btn');
    const deleteOverlay = this.shadowRoot.getElementById('delete-confirm-overlay');
    const deleteCancelBtn = this.shadowRoot.getElementById('delete-confirm-cancel');
    const deleteOkBtn = this.shadowRoot.getElementById('delete-confirm-ok');

    deleteRateBtn?.addEventListener('click', () => {
      if (deleteOverlay) deleteOverlay.style.display = 'flex';
    });

    deleteCancelBtn?.addEventListener('click', () => {
      if (deleteOverlay) deleteOverlay.style.display = 'none';
    });

    deleteOkBtn?.addEventListener('click', () => {
      if (deleteOverlay) deleteOverlay.style.display = 'none';
      formContainer.classList.add('form-hidden');
      this.hasRated = false;
      this.currentSelectedRating = 0;
      toggleBtn.innerHTML = `Rate This <span class='rate-review-icon'>trending_up</span>`;

      this.dispatchEvent(new CustomEvent('review-deleted', {
        bubbles: true,
        composed: true
      }));
    });
  }
}

if (!customElements.get('movie-modal-reviews')) {
  customElements.define('movie-modal-reviews', MovieModalReviews);
}