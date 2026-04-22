const movieCardSheet = new CSSStyleSheet();

movieCardSheet.replaceSync(`
  :host {
    display: inline-block;
    font-family: 'Inter', sans-serif;
    margin: 10px;
  }

  .movie-card {
    background-color: #121212;
    border-radius: 18px;
    padding: 14px;
    color: white;
    width: 100%;
    min-width: 200px;
    box-sizing: border-box;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .movie-card:hover .poster-container {
    border-color: #00d2ff;
    box-shadow: 0 4px 20px rgba(0, 210, 255, 0.3);
  }

  .movie-card:hover .poster-container::after {
    opacity: 1;
  }

  .movie-card:hover #poster {
    transform: scale(1.1);
  }

  .poster-container {
    position: relative;
    width: 100%;
    aspect-ratio: 2 / 3;
    overflow: hidden;
    border-radius: 14px;
    margin-bottom: 14px;
    background-color: #1e1e1e;
    border: 2px solid transparent;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }

  .poster-container::after {
    content: '';
    position: absolute;
    inset: 0;
    box-shadow: inset 0 -80px 50px -20px rgba(0, 0, 0, 0.9);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    z-index: 2;
  }

  #poster {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.4s ease;
    z-index: 1;
  }

  .movie-details {
    padding: 0 4px;
  }

  #movie-title {
    font-weight: 700;
    font-size: 24px;
    margin: 0 0 6px 0;
    letter-spacing: -0.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .metadata {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    color: #a0a0a0;
  }

  .star-icon {
    width: 18px;
    height: 18px;
    fill: #00d2ff;
    margin-right: 8px;
  }

  .separator {
    margin: 0 8px;
    font-size: 18px;
    color: #444;
  }
`);

class MovieCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [movieCardSheet];
    this._render();
  }

  static get observedAttributes() {
    return ['title', 'rating', 'year', 'poster'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this._updateContent();
    }
  }

  _updateContent() {
    const poster = this.getAttribute('poster') || '';
    const title = this.getAttribute('title') || 'Untitled';
    const rating = this.getAttribute('rating') || '0.0';
    const year = this.getAttribute('year') || '----';

    const posterElement = this.shadowRoot.getElementById('poster');
    const titleElement = this.shadowRoot.getElementById('movie-title');
    const ratingElement = this.shadowRoot.getElementById('movie-rating');
    const yearElement = this.shadowRoot.getElementById('movie-year');

    if (posterElement) posterElement.src = poster;
    if (titleElement) titleElement.textContent = title;
    if (ratingElement) ratingElement.textContent = rating;
    if (yearElement) yearElement.textContent = year;
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <div class="movie-card">
        <div class="poster-container">
          <img id="poster" alt="Movie Poster" />
        </div>
        <div class="movie-details">
          <h3 id="movie-title"></h3>
          <div class="metadata">
            <svg class="star-icon" viewBox="0 0 24 24">
              <path d="M12 1.74l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.27L12 1.74z"/>
            </svg>
            <span id="movie-rating"></span>
            <span class="separator">&bull;</span>
            <span id="movie-year"></span>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('.movie-card')?.addEventListener('click', () => {
      window.location.href = `/frontend/views/movie.html?id=${this.dataset.imdbId}`;
    });

    this._updateContent();
  }
}

if (!customElements.get('movie-card')) {
  customElements.define('movie-card', MovieCard);
}
