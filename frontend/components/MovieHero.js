const movieHeroSheet = new CSSStyleSheet();

movieHeroSheet.replaceSync(`
  :host {
    display: block;
    width: 100%;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .hero-container {
    position: relative;
    width: 100%;
    height: 500px;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%);
    display: flex;
    align-items: center;
    padding: 0 5%;
    box-sizing: border-box;
  }

  .content {
    max-width: 600px;
    color: white;
    z-index: 2;
  }

  .badge {
    display: inline-block;
    padding: 6px 16px;
    border-radius: 20px;
    border: 1px solid rgba(0, 210, 255, 0.3);
    background: rgba(0, 210, 255, 0.1);
    color: #00d2ff;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 20px;
  }

  h1 {
    font-size: 80px;
    margin: 0 0 20px 0;
    font-weight: 800;
    line-height: 1;
  }

  p {
    font-size: 18px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 35px;
  }

  .actions {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
  }

  .meta {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 20px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 14px;
    font-weight: 600;
  }

  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
  }

  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px 32px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    border: none;
    transition: transform 0.2s ease, filter 0.2s ease;
  }

  .btn:active {
    transform: scale(0.96);
  }

  .btn-secondary {
    background-color: rgba(255, 255, 255, 0.1);
    color: #fff;
    backdrop-filter: blur(10px);
  }

  .btn-secondary:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`);

class MovieHero extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [movieHeroSheet];
    this._render();
  }

  static get observedAttributes() {
    return ['background', 'badge', 'title', 'description', 'year', 'rating', 'genre'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this._updateContent();
    }
  }

  _updateContent() {
    const container = this.shadowRoot.querySelector('.hero-container');
    const badge = this.shadowRoot.getElementById('badge');
    const title = this.shadowRoot.getElementById('title');
    const description = this.shadowRoot.getElementById('description');
    const year = this.shadowRoot.getElementById('year');
    const rating = this.shadowRoot.getElementById('rating');
    const genre = this.shadowRoot.getElementById('genre');

    if (container) container.style.backgroundImage = `url(${this.getAttribute('background') || ''})`;
    if (badge) badge.textContent = this.getAttribute('badge') || 'Movie of the day';
    if (title) title.textContent = this.getAttribute('title') || 'Untitled';
    if (description) description.textContent = this.getAttribute('description') || '';
    if (year) year.textContent = this.getAttribute('year') || '----';
    if (rating) rating.textContent = `${this.getAttribute('rating') || '0.0'}/5`;
    if (genre) genre.textContent = this.getAttribute('genre') || 'Movie';
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <div class="hero-container">
        <div class="overlay">
          <div class="content">
            <div id="badge" class="badge"></div>
            <h1 id="title"></h1>
            <p id="description"></p>
            <div class="meta">
              <span id="year"></span>
              <span class="dot"></span>
              <span id="rating"></span>
              <span class="dot"></span>
              <span id="genre"></span>
            </div>
            <div class="actions">
              <button class="btn btn-secondary">
                <svg viewBox="0 -960 960 960" fill="#e3e3e3"><path d="M440-280h80v-240h-80v240Zm68.5-331.5Q520-623 520-640t-11.5-28.5Q497-680 480-680t-28.5 11.5Q440-657 440-640t11.5 28.5Q463-600 480-600t28.5-11.5ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                Detalles
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    this._updateContent();
  }
}

if (!customElements.get('movie-hero')) {
  customElements.define('movie-hero', MovieHero);
}
