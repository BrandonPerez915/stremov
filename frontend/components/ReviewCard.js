// ReviewCard Component - Hidden by default, opens in modal on click
const reviewCardSheet = new CSSStyleSheet();

reviewCardSheet.replaceSync(`
:host {
  display: block;
  font-family: 'Inter', sans-serif;
}

/* Tarjeta visible por defecto: solo muestra el poster, título y rating de la película */
.review-card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px var(--shadow-color, rgba(0, 0, 0, 0.2));
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}

.review-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px var(--shadow-color, rgba(0, 0, 0, 0.3));
}

.movie-poster {
  aspect-ratio: 260 / 320;
  width: 100%;
  object-fit: cover;
  z-index: 1;
  display: block;
}

.card-content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.movie-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.movie-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star-icon {
  font-size: 16px;
  color: var(--yellow-100, #f5c518);
}

.movie-rating {
  font-size: 13px;
  color: var(--text-secondary);
}

.icon {
  color: var(--text-primary);
  font-family: 'Material Symbols Outlined';
  font-variation-settings:
    'FILL' 0,
    'wght' 200,
    'GRAD' 0,
    'opsz' 24
}

.close-icon {
  font-size: 28px;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.close-icon:hover {
  color: var(--text-primary);
}

/* --- ESTILOS DEL MODAL --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 1000;
  box-sizing: border-box;
}

.modal-overlay.active {
  opacity: 1;
  pointer-events: all;
}

.modal-card {
  background-color: var(--bg-color);
  border-radius: 16px;
  padding: 28px;
  width: 100%;
  max-width: 550px;
  position: relative;
  transform: translateY(20px);
  transition: transform 0.3s ease;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
  box-sizing: border-box;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-overlay.active .modal-card {
  transform: translateY(0);
}

.modal-header {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color, #3a3f4c);
}

.modal-poster {
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.modal-movie-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.modal-rating {
  font-size: 13px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.close-modal {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.review-rating {
  display: flex;
  gap: 4px;
}

.review-rating .star-icon {
  font-size: 14px;
}

.review-score {
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: auto;
}

.review-date {
  font-size: 12px;
  color: var(--text-secondary);
}

.review-body {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 600px) {
  .modal-card {
    padding: 20px;
  }

  .modal-header {
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 20px;
  }

  .modal-poster {
    width: 70px;
    height: 105px;
  }

  .modal-title {
    font-size: 16px;
  }
}
`);


class ReviewCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [reviewCardSheet];
  }

  connectedCallback() {
    this._render();
    this._setupListeners();
  }

  static get observedAttributes() {
    return ['username', 'avatar-src', 'rating', 'review-text', 'movie-title', 'date', 'movie-poster', 'movie-rating'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this._render();
    }
  }

  _render() {
    const username = this.getAttribute('username') || 'Anonymous';
    const avatarSrc = this.getAttribute('avatar-src') || 'https://via.placeholder.com/50';
    const ratingValue = parseInt(this.getAttribute('rating')) || 5;
    const reviewText = this.getAttribute('review-text') || 'No review provided.';
    const movieTitle = this.getAttribute('movie-title') || 'Unknown Movie';
    const date = this.getAttribute('date') || 'Unknown Date';
    const moviePoster = this.getAttribute('movie-poster') || 'https://via.placeholder.com/260x320?text=No+Image';
    const movieRating = parseFloat(this.getAttribute('movie-rating')) || 0;

    // Generar estrellas para la review del usuario
    let userStarsHTML = '';
    for (let i = 1; i <= ratingValue; i++) {
      userStarsHTML += `<span class="icon star-icon">star</span>`;
    }

    // Generar estrellas para el rating global de la película (basado en movieRating / 2 para escala de 5)
    const movieStarCount = Math.round((movieRating / 10) * 5);
    let movieStarsHTML = '';
    for (let i = 1; i <= movieStarCount; i++) {
      movieStarsHTML += `<span class="icon star-icon">star</span>`;
    }

    this.shadowRoot.innerHTML = `
      <div class="review-card" id="reviewCard">
        <img src="${moviePoster}" alt="${movieTitle}" class="movie-poster">
        <div class="card-content">
          <h3 class="movie-title">${movieTitle}</h3>
          <div class="movie-info">
            <div class="stars">${movieStarsHTML}</div>
            <span class="movie-rating">${movieRating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div class="modal-overlay" id="modal">
        <div class="modal-card">
          <button class="close-modal" id="closeModal">
            <span class="icon close-icon">close</span>
          </button>

          <!-- Movie Header -->
          <div class="modal-header">
            <img src="${moviePoster}" alt="${movieTitle}" class="modal-poster">
            <div class="modal-movie-info">
              <h3 class="modal-title">${movieTitle}</h3>
              <div class="modal-rating">
                <div class="stars">${movieStarsHTML}</div>
                <span>${movieRating.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <!-- Review Header (User Info) -->
          <div class="review-header">
            <img src="${avatarSrc}" alt="${username}" class="user-avatar">
            <div class="user-info">
              <p class="user-name">${username}</p>
              <div class="review-rating">
                ${userStarsHTML}
                <span class="review-score">${ratingValue} / 10</span>
              </div>
            </div>
          </div>

          <p class="review-date">${date}</p>

          <!-- Review Body -->
          <p class="review-body">${reviewText}</p>
        </div>
      </div>
    `;

    this.modal = this.shadowRoot.getElementById('modal');
    this.reviewCard = this.shadowRoot.getElementById('reviewCard');
    this.closeModalBtn = this.shadowRoot.getElementById('closeModal');
  }

  _setupListeners() {
    // Abrir modal al hacer click en la tarjeta
    if (this.reviewCard) {
      this.reviewCard.addEventListener('click', () => {
        this.modal.classList.add('active');
      });
    }

    // Cerrar modal al hacer click en el botón de cerrar
    if (this.closeModalBtn) {
      this.closeModalBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.modal.classList.remove('active');
      });
    }

    // Cerrar modal al hacer click fuera de él
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.modal.classList.remove('active');
        }
      });
    }
  }
}

if (!customElements.get('review-card')) {
  customElements.define('review-card', ReviewCard);
}
