const movieModalDetailsSheet = new CSSStyleSheet();

movieModalDetailsSheet.replaceSync(`
:host {
  display: flex;
  gap: 40px;
  margin-bottom: 20px;
  width: 100%;
  height: 100%;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}

* {
  box-sizing: border-box;
}

.poster-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
  flex-shrink: 0;
}

.poster-container img {
  width: 280px;
  aspect-ratio: 2 / 3;
  border-radius: 12px;
  box-shadow: 0 0 60px var(--primary-color-25, rgba(74, 222, 128, 0.25));
  object-fit: cover;
  display: block;
}

.movie-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding-right: 15px;
}

.movie-details > * {
  flex-shrink: 0;
}

/* Estilos de la barra de scroll */
.movie-details::-webkit-scrollbar {
  width: 6px;
}
.movie-details::-webkit-scrollbar-track {
  background: var(--border-color, #3a3f4c);
  border-radius: 10px;
}
.movie-details::-webkit-scrollbar-thumb {
  background: var(--text-secondary, #8b8e98);
  border-radius: 10px;
}
.movie-details::-webkit-scrollbar-thumb:hover {
  background: var(--text-primary, #ffffff);
}

.movie-details h1 {
  font-size: 42px;
  margin-top: 0;
  margin-bottom: 20px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
}

.movie-details h3 {
  font-size: 18px;
  margin-bottom: 15px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
}

.movie-year {
  font-size: 14px;
  color: var(--text-secondary, #8b8e98);
  margin-bottom: 20px;
  font-weight: 400;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.tag {
  background-color: var(--primary-color, #4ade80);
  color: white;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
}

.metadata {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
  font-size: 13px;
  color: var(--text-secondary, #8b8e98);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.imdb-badge {
  background: #f5c518;
  color: black;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.age-badge {
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.icon {
  font-family: 'Material Symbols Outlined';
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

#star-icon {
  font-size: 20px;
  color: #f5c518;
}

/* --- ESTILOS DE LA SINOPSIS --- */
.synopsis {
  color: var(--text-secondary, #8b8e98);
  line-height: 1.6;
  font-size: 14px;
  margin-bottom: 15px;
  max-width: 600px;
  max-height: 4.8em;
  transition: max-height 0.4s ease;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* La clase clamped es la que pone los puntos suspensivos */
.synopsis.clamped {
  -webkit-line-clamp: 3;
}

.synopsis.expanded {
  max-height: 2000px;
}

.read-more {
  color: var(--text-secondary, #8b8e98);
  font-size: 13px;
  margin-bottom: 15px;
  cursor: pointer;
  user-select: none;
  display: none;
  align-items: center;
  gap: 6px;
  width: fit-content;
}

.read-more .icon {
  font-size: 20px;
  color: var(--text-secondary, #8b8e98);
  transition: transform 0.4s ease;
  font-variation-settings: 'FILL' 0;
}

.read-more.open .icon {
  transform: rotate(180deg);
}

.read-more:hover,
.read-more:hover .icon  {
  color: var(--text-primary, #ffffff);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 15px;
}

.btn {
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: inherit;
}

.btn-primary {
  background-color: var(--primary-color, #4ade80);
  color: white;
  gap: 5px;
}

.btn-primary .icon {
  font-size: 16px;
  color: white;
}

.btn-primary:hover {
  filter: brightness(1.2);
}

.btn-secondary {
  background-color: transparent;
  border: 1px solid var(--border-color, #3a3f4c);
  color: var(--text-primary, #ffffff);
  gap: 5px;
}

.btn-secondary .icon {
  font-size: 16px;
  color: var(--text-primary, #ffffff);
  font-variation-settings: 'FILL' 0;
}

.btn-secondary:hover {
  background-color: var(--text-primary, #ffffff);
  color: var(--bg-color, #1f2128);
}

.btn-secondary:hover .icon {
  color: var(--bg-color, #1f2128);
}

.extra-info {
  margin-top: 10px;
  margin-bottom: 50px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid var(--border-color, #3a3f4c);
  padding-top: 25px;
}

.extra-info h3 {
  margin-bottom: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: var(--text-secondary, #8b8e98);
  line-height: 1.5;
}

.info-row .label {
  margin-left: 10px;
  color: var(--text-primary, #ffffff);
  font-weight: 600;
  min-width: 90px;
  flex-shrink: 0;
}

.info-row .trophy {
  font-size: 16px;
  vertical-align: middle;
  margin-right: 4px;
  color: #f5c518;
}

@media (max-width: 970px) {
  :host {
    gap: 30px;
  }
  .movie-details h1 {
    font-size: 32px;
  }
  .poster-container img {
    width: 250px;
  }
  .movie-details {
    height: 375px;
  }
}

@media (max-height: 700px) {
  .poster-container img {
    width: 220px;
  }
}

@media (max-height: 610px) {
  .poster-container img {
    width: 170px;
  }
}

@media (max-width: 700px) {
  :host {
    flex-direction: column;
    align-items: center;
    gap: 25px;
  }

  .poster-container img {
    width: 100%;
    max-width: 250px;
  }

  .movie-details {
    align-items: center;
    height: auto;
    overflow-y: visible;
    padding-right: 0;
  }

  .movie-details h1 {
    font-size: 24px;
    margin-bottom: 15px;
    text-align: center;
  }

  .tags {
    justify-content: center;
  }

  .metadata {
    justify-content: center;
  }

  .actions {
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }

  .btn {
    width: 100%;
    max-width: 350px;
  }

  .synopsis {
    text-align: center;
  }

  .extra-info {
    width: 100%;
    max-width: 350px;
  }

  .extra-info h3 {
    text-align: center;
  }

  .info-row {
    flex-direction: column;
    gap: 2px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    padding-bottom: 8px;
  }

  .info-row .label,
  .info-row span {
    text-align: center;
    margin: 0;
  }

  .info-row:last-child {
    border-bottom: none;
  }
}
`);

class MovieModalDetails extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [movieModalDetailsSheet];

    this.checkOverflow = this.checkOverflow.bind(this);
  }

  static get observedAttributes() {
    return [
      'poster-src', 'movie-title', 'year', 'tags', 'imdb-rating',
      'age-badge', 'duration', 'synopsis', 'awards', 'released',
      'country', 'language'
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this._render();
      setTimeout(this.checkOverflow, 100);
    }
  }

  connectedCallback() {
    this._render();
    window.addEventListener('resize', this.checkOverflow);
    setTimeout(this.checkOverflow, 100);
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.checkOverflow);
  }

  _render() {
    const posterSrc = this.getAttribute('poster-src') || '';
    const title = this.getAttribute('movie-title') || 'Unknown Title';
    const year = this.getAttribute('year') || '';
    const tagsRaw = this.getAttribute('tags') || '';
    const imdbRating = this.getAttribute('imdb-rating') || 'N/A';
    const ageBadge = this.getAttribute('age-badge') || 'N/A';
    const duration = this.getAttribute('duration') || 'N/A';
    const synopsisText = this.getAttribute('synopsis') || 'No synopsis available.';
    const awards = this.getAttribute('awards') || 'N/A';
    const released = this.getAttribute('released') || 'N/A';
    const country = this.getAttribute('country') || 'N/A';
    const language = this.getAttribute('language') || 'N/A';

    const tagsArray = tagsRaw.split(',').map(t => t.trim()).filter(t => t);
    const tagsHTML = tagsArray.map(tag => `<span class="tag">${tag}</span>`).join('');

    this.shadowRoot.innerHTML = `
      <div class="poster-container">
        <img src="${posterSrc}" alt="${title} Poster">

        <div class="actions">
          <button class="btn btn-primary" id="btn-rate">
            Rate <span class="icon">thumb_up</span>
          </button>
          <button class="btn btn-secondary" id="btn-watchlist">
            Add to list <span class="icon">bookmark</span>
          </button>
        </div>
      </div>

      <div class="movie-details">
        <h1>${title} <span class="movie-year">${year}</span></h1>

        <div class="tags">
          ${tagsHTML}
        </div>

        <div class="metadata">
          <div class="meta-item">
            <span class="imdb-badge">IMDb</span>
            <span class="icon" id="star-icon">star</span> ${imdbRating} / 10
          </div>
          <div class="meta-item"><span class="age-badge">${ageBadge}</span></div>
          <div class="meta-item"><span class="icon duration-icon">hourglass_top</span> ${duration}</div>
        </div>

        <h3>Synopsis</h3>
        <p class="synopsis clamped" id="synopsis-text">${synopsisText}</p>
        <div class="read-more" id="read-more-btn">
          READ MORE <span class="icon">keyboard_arrow_down</span>
        </div>

        <div class="extra-info">
          <h3>Extra Information</h3>
          <div class="info-row">
            <span class="label">Awards</span>
            <span><span class="icon trophy">emoji_events</span> ${awards}</span>
          </div>

          <div class="info-row">
            <span class="label">Released</span>
            <span>${released}</span>
          </div>

          <div class="info-row">
            <span class="label">Country</span>
            <span>${country}</span>
          </div>

          <div class="info-row">
            <span class="label">Language</span>
            <span>${language}</span>
          </div>
        </div>
      </div>
    `;

    this._setupListeners();
  }

  _setupListeners() {
    this.synopsisEl = this.shadowRoot.getElementById('synopsis-text');
    this.readMoreBtn = this.shadowRoot.getElementById('read-more-btn');

    this.readMoreBtn.addEventListener('click', () => {
      const isExpanded = this.synopsisEl.classList.contains('expanded');

      if (!isExpanded) {
        // --- ABRIENDO ---
        this.synopsisEl.classList.remove('clamped');
        this.synopsisEl.classList.add('expanded');
        this.readMoreBtn.classList.add('open');
        this.readMoreBtn.firstChild.textContent = 'READ LESS ';
      } else {
        // --- CERRANDO ---
        this.synopsisEl.classList.remove('expanded');
        this.readMoreBtn.classList.remove('open');
        this.readMoreBtn.firstChild.textContent = 'READ MORE ';

        // Esperar a la animacion de cierre
        setTimeout(() => {
          if (!this.synopsisEl.classList.contains('expanded')) {
            this.synopsisEl.classList.add('clamped');
          }
        }, 400);
      }
    });

    // Custom events para los botones de rate y watchlist
    this.shadowRoot.getElementById('btn-rate').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('action-rate', { bubbles: true, composed: true }));
    });
    this.shadowRoot.getElementById('btn-watchlist').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('action-watchlist', { bubbles: true, composed: true }));
    });
  }

  checkOverflow() {
    if (!this.synopsisEl || !this.readMoreBtn) return;

    if (!this.synopsisEl.classList.contains('expanded')) {
      if (this.synopsisEl.scrollHeight > this.synopsisEl.clientHeight) {
        this.readMoreBtn.style.display = 'flex';
      } else {
        this.readMoreBtn.style.display = 'none';
      }
    }
  }
}

if (!customElements.get('movie-modal-details')) {
  customElements.define('movie-modal-details', MovieModalDetails);
}
