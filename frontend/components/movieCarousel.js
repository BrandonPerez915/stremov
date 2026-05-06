import { apiClient } from '../scripts/utils/apiClient.js';

const mediaCarouselSheet = new CSSStyleSheet();

mediaCarouselSheet.replaceSync(`
  :host {
    display: block;
    width: 100%;
    font-family: 'Inter', sans-serif;
  }

  .carousel-wrapper {
    position: relative;
    width: 100%;
    margin-bottom: 30px;
    border-bottom: 1px solid var(--borders-color, #3a3f4c);
  }

  h1 {
    color: var(--text-primary, #ffffff);
    font-size: 24px;
    padding-left: 30px;
    margin: 0 0 20px 0;
    font-weight: 600;
  }

  .media-row {
    width: 100%;
    padding: 10px 70px 50px 20px;
    display: flex;
    gap: 40px;
    overflow-x: auto;
    scroll-behavior: smooth;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    scroll-padding: 0 70px;
    box-sizing: border-box;
  }

  .media-row::-webkit-scrollbar {
    display: none;
  }

  movie-card {
    flex: 0 0 auto;
    scroll-snap-align: start;
    width: 250px;
  }
`);

class MediaCarousel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [mediaCarouselSheet];
    this._directData = null;
  }

  static get observedAttributes() {
    return ['title', 'api-url', 'type', 'json-data'];
  }

  set data(value) {
    this._directData = value;
    this._loadAndPopulate();
  }

  get data() {
    return this._directData;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'title') {
        this._render();
      }
      if (name === 'api-url' || name === 'json-data' || name === 'type') {
        this._loadAndPopulate();
      }
    }
  }

  connectedCallback() {
    this._render();
    this._loadAndPopulate();
  }

  _render() {
    const title = this.getAttribute('title');

    if (!this.shadowRoot.getElementById('media-list')) {
      this.shadowRoot.innerHTML = `
        <div class="carousel-wrapper">
          <h1 id="carousel-title" style="display: ${title ? 'block' : 'none'};">${title || ''}</h1>
          <div class="media-row" id="media-list">
          </div>
        </div>
      `;
    } else {
      const titleEl = this.shadowRoot.getElementById('carousel-title');
      if (titleEl) {
        titleEl.textContent = title || '';
        titleEl.style.display = title ? 'block' : 'none';
      }
    }
  }

  async _loadAndPopulate() {
    const apiUrl = this.getAttribute('api-url');
    const jsonString = this.getAttribute('json-data');
    const type = this.getAttribute('type') || 'movies';
    const listElement = this.shadowRoot.getElementById('media-list');

    if (!listElement) return;

    let rawData = null;

    try {
      if (this._directData) {
        rawData = this._directData;
      }
      else if (jsonString) {
        rawData = JSON.parse(jsonString);
      }
      else if (apiUrl) {
        rawData = await apiClient.get(apiUrl);
      } else {
        return;
      }

      let mediaList = [];
      if (Array.isArray(rawData)) {
        mediaList = rawData;
      } else if (rawData && rawData.results) {
        mediaList = rawData.results;
      }

      listElement.innerHTML = '';

      mediaList.forEach(media => {
        const card = document.createElement('movie-card');

        const imgSrc = media.poster_path
          ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
          : 'https://images.unsplash.com/photo-1544502062-f82887f03d1c?auto=format&fit=crop&w=400&q=80';

        const title = media.title || media.name || 'Unknown';
        const year = (media.release_date || media.first_air_date || '').substring(0, 4);
        const rating = media.vote_average ? (Math.round(media.vote_average * 10) / 10).toString() : '0.0';

        card.setAttribute('poster', imgSrc);
        card.setAttribute('title', title);
        card.setAttribute('rating', rating);
        card.setAttribute('type', type);
        card.setAttribute('media-id', media.id);

        listElement.appendChild(card);
      });

    } catch (error) {
      console.error("Error loading data for media carousel:", error);
    }
  }
}

if (!customElements.get('media-carousel')) {
  customElements.define('media-carousel', MediaCarousel);
}
