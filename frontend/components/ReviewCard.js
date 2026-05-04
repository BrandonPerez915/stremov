const reviewCardSheet = new CSSStyleSheet();

reviewCardSheet.replaceSync(`
:host {
  display: block;
  font-family: 'Inter', sans-serif;
}

.review-card {
  background-color: var(--bg-color);
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  min-width: 280px;
  box-shadow: 0 4px 12px var(--shadow-color, rgba(0, 0, 0, 0.2));
  box-sizing: border-box;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.user-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
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

.stars {
  display: flex;
  gap: 2px;
}

.star-icon {
  font-size: 24px;
  color: var(--yellow-100, #f5c518);
}

.close-icon {
  font-size: 32px;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.close-icon:hover {
  color: var(--text-primary);
}

.icon-small {
  font-size: 16px;
  color: var(--primary-color);
  vertical-align: middle;
}

.numeric-rating {
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: auto;
}

.review-text {
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.5;
  margin: 0 0 16px 0;

  display: -webkit-box;
  -webkit-line-clamp: 5;
  line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.read-more-btn {
  display: none;
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 1px solid transparent;
  transition: border-color 0.3s ease;
  padding: 0;
  font-family: inherit;
  align-items: center;
  gap: 4px;
}

.read-more-btn:hover {
  border-color: var(--primary-color);
}

.read-more-btn .icon-arrow {
  font-size: 20px;
  transition: transform 0.3s ease;
  color: var(--primary-color);
}

.read-more-btn:hover,
.read-more-btn:hover .icon-arrow {
  filter: brightness(1.2);
}

/* --- ESTILOS DEL MODAL --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
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
  padding: 24px;
  width: 100%;
  max-width: 450px;
  position: relative;
  transform: translateY(20px);
  transition: transform 0.3s ease;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  box-sizing: border-box;
}

.modal-overlay.active .modal-card {
  transform: translateY(0);
}

.close-modal {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.extra-info {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
  border-bottom: 1px solid var(--border-color, #3a3f4c);
  padding-bottom: 15px;
}

.tag {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: transparent;
  color: var(--primary-color);
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid var(--border-color, #3a3f4c);
}

.modal-card .review-text {
  -webkit-line-clamp: unset;
  line-clamp: unset;
  overflow: visible;
  margin-bottom: 0;
}

@media (max-width: 400px) {
  .numeric-rating {
    display: none;
  }
}
`);

class ReviewCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [reviewCardSheet];

    // Binding para que no se pierda el contexto en el event listener de 'resize'
    this.checkTruncation = this.checkTruncation.bind(this);
  }

  connectedCallback() {
    this._render();
    this._setupListeners();

    // Necesitamos un pequeño timeout para asegurar que el texto se haya renderizado antes de calcular su altura
    setTimeout(this.checkTruncation, 50);
    window.addEventListener('resize', this.checkTruncation);
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.checkTruncation);
  }

  // Si necesitamos que cambie dinámicamente si le cambian un atributo desde JS
  static get observedAttributes() {
    return ['username', 'avatar-src', 'rating', 'review-text', 'movie-title', 'date'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this._render();
      setTimeout(this.checkTruncation, 50);
    }
  }

  _render() {
    // Obtenemos los atributos, con valores por defecto por si no se proveen
    const username = this.getAttribute('username') || 'Anonymous User';
    const avatarSrc = this.getAttribute('avatar-src') || 'https://via.placeholder.com/50';
    const ratingValue = parseInt(this.getAttribute('rating')) || 5;
    const reviewText = this.getAttribute('review-text') || 'No review provided.';
    const movieTitle = this.getAttribute('movie-title') || 'Unknown Movie';
    const date = this.getAttribute('date') || 'Unknown Date';

    // Generamos las estrellas dinámicamente según el rating (1 a 5)
    let starsHTML = '';
    for (let i = 1; i <= ratingValue; i++) {
      starsHTML += `<span class="icon star-icon">star</span>`;
    }

    this.shadowRoot.innerHTML = `
      <div class="review-card">
        <div class="card-header">
          <img src="${avatarSrc}" alt="${username}" class="avatar">
          <div class="user-info">
            <h3>${username}</h3>
            <div class="stars">${starsHTML}</div>
          </div>
          <span class="numeric-rating">${ratingValue} / 5</span>
        </div>

        <p class="review-text" id="reviewContent">${reviewText}</p>

        <button class="read-more-btn" id="readMoreBtn">
          Read full review <span class="icon icon-arrow">chevron_right</span>
        </button>
      </div>

      <!-- Modal oculto -->
      <div class="modal-overlay" id="modal">
        <div class="modal-card">
          <button class="close-modal" id="closeModal"><span class="icon close-icon">close</span></button>

          <div class="card-header">
            <img src="${avatarSrc}" alt="${username}" class="avatar">
            <div class="user-info">
              <h3>${username}</h3>
              <div class="stars">${starsHTML}</div>
            </div>
          </div>

          <div class="extra-info">
            <span class="tag"><span class="icon icon-small">videocam</span> Movie: ${movieTitle}</span>
            <span class="tag"><span class="icon icon-small">calendar_today</span> ${date}</span>
          </div>

          <p class="review-text" id="modalReviewContent">${reviewText}</p>
        </div>
      </div>
    `;

    // Reasignamos las referencias a los elementos tras el render
    this.reviewTextEl = this.shadowRoot.getElementById("reviewContent");
    this.readMoreBtn = this.shadowRoot.getElementById("readMoreBtn");
    this.modal = this.shadowRoot.getElementById("modal");
    this.closeModalBtn = this.shadowRoot.getElementById("closeModal");
  }

  _setupListeners() {
    this.readMoreBtn.addEventListener("click", () => {
      this.modal.classList.add("active");
    });

    this.closeModalBtn.addEventListener("click", () => {
      this.modal.classList.remove("active");
    });

    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.modal.classList.remove("active");
      }
    });
  }

  checkTruncation() {
    if (!this.reviewTextEl || !this.readMoreBtn) return;

    // Si la altura del texto oculto es mayor a la altura de la caja visible, mostramos el botón
    if (this.reviewTextEl.scrollHeight > this.reviewTextEl.clientHeight) {
      this.readMoreBtn.style.display = "flex";
    } else {
      this.readMoreBtn.style.display = "none";
    }
  }
}

if (!customElements.get('review-card')) {
  customElements.define('review-card', ReviewCard);
}
