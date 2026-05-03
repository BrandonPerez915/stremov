const heroBannerSheet = new CSSStyleSheet();

heroBannerSheet.replaceSync(`
  :host {
    display: block;
    width: 100%;
    font-family: 'Inter', sans-serif;
  }

  .icon {
    font-family: 'Material Symbols Outlined';
    font-variation-settings: 'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24;
    display: inline-block;
  }

  .hero-banner {
    position: relative;
    width: 100%;
    height: calc(100dvh - 280px);
    max-height: 500px;
    margin-bottom: 40px;
    overflow: hidden;
    color: white;
    display: flex;
    align-items: center;
    padding: 0 60px;
    box-sizing: border-box;

    /* Variable inicializada dinámicamente desde JS */
    background: linear-gradient(
        to right,
        rgba(8, 12, 20, 0.95) 0%,
        rgba(8, 12, 20, 0.7) 40%,
        rgba(8, 12, 20, 0) 100%
      ),
      var(--hero-bg) center/cover no-repeat;

    transition: background 0.5s ease-in-out;
  }

  .hero-content {
    position: relative;
    top: -60px;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    max-width: 70%;
  }

  .live-badge {
    margin-top: 20px;
    background-color: var(--primary-color, rgb(62, 94, 255));
    color: white;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 20px;
  }

  .stat-icon, .star-icon, .bookmark-icon {
    font-size: 24px;
  }

  .star-icon {
    color: var(--yellow-100, rgb(255, 196, 0));
  }

  .hero-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 20px 0;
    line-height: 1.1;
  }

  .hero-meta {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .imdb-badge {
    background-color: var(--yellow-100, rgb(255, 196, 0));
    color: #000;
    font-weight: 800;
    font-size: 0.8rem;
    padding: 3px 6px;
    border-radius: 4px;
  }

  .meta-text {
    font-size: 1.1rem;
    font-weight: 500;
  }

  .hero-carousel {
    position: absolute;
    bottom: 40px;
    right: 40px;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 2;
  }

  .thumbnails-container {
    display: flex;
    gap: 10px;
  }

  .thumbnail {
    width: 130px;
    height: 75px;
    object-fit: cover;
    border-radius: 8px;
    border: 2px solid transparent;
    cursor: pointer;
    transition: border-color 0.3s ease, transform 0.3s ease;
  }

  .thumbnail:hover,
  .thumbnail.active {
    border-color: white;
    transform: translateY(-5px);
  }

  @media (max-width: 900px) {
    .hero-banner {
      padding: 40px 30px;
    }
    .hero-content {
      max-width: 100%;
    }

  }

  @media (max-width: 640px) {
    .hero-carousel {
      display: none;
    }
  }
`);

class HeroBanner extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [heroBannerSheet];
    this._isRendered = false;
  }

  static get observedAttributes() {
    return ['title', 'rating', 'badge-text', 'images'];
  }

  connectedCallback() {
    if (!this._isRendered) {
      this._render();
      this._isRendered = true;
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this._isRendered) {
      this._render();
    }
  }

  _render() {
    const title = this.getAttribute('title') || 'Untitled';
    const rating = this.getAttribute('rating') || '0.0';
    const badgeText = this.getAttribute('badge-text') || 'TRENDING';

    const imagesAttr = this.getAttribute('images') || '';
    const images = imagesAttr ? imagesAttr.split(',').map(url => url.trim()) : [];
    const firstImage = images.length > 0 ? images[0] : '';

    this.shadowRoot.innerHTML = `
      <div class="hero-banner" style="--hero-bg: url('${firstImage}')">
        <div class="hero-content">
          <div class="live-badge">
            <span class="icon stat-icon">stat_2</span>
            ${badgeText}
          </div>

          <h1 class="hero-title">${title}</h1>

          <div class="hero-meta">
            <span class="imdb-badge">IMDb</span>
            <span class="icon star-icon">star</span>
            <span class="meta-text">${rating}</span>
          </div>
        </div>

        <div class="hero-carousel">
          <div class="thumbnails-container">
            ${images.map((src, index) => `
              <img
                class="thumbnail ${index === 0 ? 'active' : ''}"
                src="${src}"
                alt="Scene ${index + 1}"
                data-src="${src}"
              >
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this._attachEvents();
  }

  _attachEvents() {
    const banner = this.shadowRoot.querySelector('.hero-banner');
    const thumbnails = this.shadowRoot.querySelectorAll('.thumbnail');

    thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', (e) => {
        thumbnails.forEach(t => t.classList.remove('active'));

        e.target.classList.add('active');

        const newSrc = e.target.dataset.src;
        banner.style.setProperty('--hero-bg', `url('${newSrc}')`);
      });
    });
  }
}

if (!customElements.get('hero-banner')) {
  customElements.define('hero-banner', HeroBanner);
}
