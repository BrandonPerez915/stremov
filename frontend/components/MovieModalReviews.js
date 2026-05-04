const movieModalReviewsSheet = new CSSStyleSheet();

movieModalReviewsSheet.replaceSync(`
:host {
  display: block;
  width: 100%;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}

* {
  box-sizing: border-box;
}

h1.reviews-title {
  padding-bottom: 30px;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.reviews-layout {
  border-top: 1px solid var(--border-color);
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
  color: var(--text-primary);
}

.star-main {
  font-family: 'Material Symbols Outlined';
  font-size: 36px;
  font-variation-settings: 'FILL' 1;
  color: var(--yellow-100);
}

.subtitle {
  color: var(--text-secondary);
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
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  filter: brightness(1.1);
}

.btn-secondary {
  background-color: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  margin-top: 10px;
}

.btn-secondary:hover {
  background-color: var(--text-primary);
  color: var(--bg-color);
}

.form-hidden {
  display: none !important;
}

.rate-review-icon {
  font-family: 'Material Symbols Outlined';
  font-size: 20px;
}

.reviews-list {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  /* Añadimos scroll a la lista de reseñas para que el modal no crezca infinitamente */
  max-height: 600px;
  overflow-y: auto;
  padding-right: 10px;
}

/* Estilos de la barra de scroll */
.reviews-list::-webkit-scrollbar { width: 6px; }
.reviews-list::-webkit-scrollbar-track { background: var(--border-color); border-radius: 10px; }
.reviews-list::-webkit-scrollbar-thumb { background: var(--text-secondary); border-radius: 10px; }
.reviews-list::-webkit-scrollbar-thumb:hover { background: var(--text-primary); }

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
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 40px;
  }

  .reviews-list {
    max-height: none;
    overflow-y: visible;
    padding-right: 0;
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
      'overall-rating',
      'total-ratings',
      'total-reviews',
      'bar-distribution', /* String separado por comas (ej. "3100,14000,...") */
      'reviews-data'      /* JSON stringificado con el array de reviews */
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this._render();
    }
  }

  connectedCallback() {
    this._render();
  }

  _render() {
    const movieTitle = this.getAttribute('movie-title') || 'Unknown Title';
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

              <button id="submit-rate-btn" class="btn-secondary">Submit Review</button>
            </div>
          </div>
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
    const toggleBtn = this.shadowRoot.getElementById('toggle-rate-btn');
    const formContainer = this.shadowRoot.getElementById('rate-form-container');
    const starsInput = this.shadowRoot.getElementById('interactive-stars');
    const customTextarea = this.shadowRoot.getElementById('review-textarea');
    const submitBtn = this.shadowRoot.getElementById('submit-rate-btn');

    // Toggle del formulario
    toggleBtn.addEventListener('click', () => {
      formContainer.classList.toggle('form-hidden');

      if (formContainer.classList.contains('form-hidden')) {
        toggleBtn.innerHTML = this.hasRated
          ? `Edit Rating <span class='rate-review-icon'>edit</span>`
          : `Rate This <span class='rate-review-icon'>trending_up</span>`;
      } else {
        toggleBtn.textContent = 'Cancel';
      }
    });

    // Escuchar el componente de estrellas interno
    starsInput.addEventListener('rating-changed', (e) => {
      this.currentSelectedRating = e.detail.rating;
    });

    // Enviar formulario
    submitBtn.addEventListener('click', () => {
      if (this.currentSelectedRating === 0) {
        alert('Please select a star rating.');
        return;
      }

      this.hasRated = true;
      formContainer.classList.add('form-hidden');
      toggleBtn.innerHTML = `Edit Rating <span class='rate-review-icon'>edit</span>`;

      const reviewText = customTextarea.value;

      // Custom event para cuando se envia una reseña
      this.dispatchEvent(new CustomEvent('review-submitted', {
        detail: {
          rating: this.currentSelectedRating,
          text: reviewText
        },
        bubbles: true,
        composed: true
      }));

      // TODO: Enviar la data al backend, y al recibir
      // respuesta positiva, actualizarías el atributo 'reviews-data' para que
      // la nueva tarjeta aparezca en la lista automáticamente.
    });
  }
}

if (!customElements.get('movie-modal-reviews')) {
  customElements.define('movie-modal-reviews', MovieModalReviews);
}
