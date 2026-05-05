const movieCarouselSheet = new CSSStyleSheet();

movieCarouselSheet.replaceSync(`
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

  .movie-row {
    width: 100%;
    padding: 10px 70px 50px 70px;
    display: flex;
    gap: 50px;
    overflow-x: auto;
    scroll-behavior: smooth;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    scroll-padding: 0 70px;
    box-sizing: border-box;
  }

  .movie-row::-webkit-scrollbar {
    display: none;
  }

  /* Las movie-cards inyectadas dinámicamente */
  movie-card {
    flex: 0 0 auto;
    scroll-snap-align: start;
    width: 100%;
  }

  /* Teléfonos grandes / Tablets pequeñas (2 películas exactas) */
  @media (min-width: 530px) {
    movie-card { width: calc((100% - 50px) / 2); }
  }

  /* Tablets (3 películas exactas) */
  @media (min-width: 1010px) {
    movie-card { width: calc((100% - 100px) / 3); }
  }

  /* Laptops / Desktop (4 películas exactas) */
  @media (min-width: 1230px) {
    movie-card { width: calc((100% - 150px) / 4); }
  }

  /* Monitores grandes (5 películas exactas) */
  @media (min-width: 1450px) {
    movie-card { width: calc((100% - 200px) / 5); }
  }

  .carousel-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    background: rgba(205, 205, 205, 0.1);
    color: white;
    border: 1px solid var(--bg-color, #1f2128);
    border-radius: 12px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: all 0.2s ease-in-out;
  }

  .carousel-btn:hover {
    background: var(--primary-color, #3b82f6);
    transform: translateY(-50%) scale(1.1);
  }

  .carousel-btn.left { left: 15px; }
  .carousel-btn.right { right: 15px; }

  .icon {
    font-family: 'Material Symbols Outlined';
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    font-size: 38px;
    color: white;
  }

  @media (max-width: 600px) {
    .carousel-btn { display: none; }
  }
`);

class MovieCarousel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [movieCarouselSheet];
  }

  static get observedAttributes() {
    return ['title', 'api-url', 'type'];
  }

  connectedCallback() {
    this._render();
    this._fetchAndPopulate();
  }

  _render() {
    const title = this.getAttribute('title') || 'Trending';

    this.shadowRoot.innerHTML = `
      <div class="carousel-wrapper">
        <h1>${title}</h1>
        <button class="carousel-btn left" id="btn-left">
          <span class="icon">chevron_left</span>
        </button>

        <div class="movie-row" id="movie-list">
          <!-- Las tarjetas se insertarán aquí dinámicamente -->
        </div>

        <button class="carousel-btn right" id="btn-right">
          <span class="icon">chevron_right</span>
        </button>
      </div>
    `;

    this._setupListeners();
  }

  _setupListeners() {
    const list = this.shadowRoot.getElementById('movie-list');
    const btnLeft = this.shadowRoot.getElementById('btn-left');
    const btnRight = this.shadowRoot.getElementById('btn-right');

    btnLeft.addEventListener('click', () => {
      // Ajuste: scrollBy 100px como tenías originalmente, aunque puedes aumentarlo (ej. 300) para saltos más grandes
      list.scrollBy({ left: -100, behavior: 'smooth' });
    });

    btnRight.addEventListener('click', () => {
      list.scrollBy({ left: 100, behavior: 'smooth' });
    });
  }

  async _fetchAndPopulate() {
    const apiUrl = this.getAttribute('api-url');
    const type = this.getAttribute('type') || 'movie'; // 'movie' o 'series'
    const listElement = this.shadowRoot.getElementById('movie-list');

    if (!apiUrl) return;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      data.results.forEach(item => {
        const card = document.createElement('movie-card');

        // Dependiendo si es película o serie, la API suele devolver 'title' o 'name'
        const title = type === 'series' ? item.name : item.title;

        card.setAttribute('title', title);
        card.setAttribute('poster', `https://image.tmdb.org/t/p/w500${item.poster_path}`);
        card.setAttribute('rating', Math.round(item.vote_average * 10) / 10);

        // Lógica original de géneros
        if (item.genre_ids.length > 1) {
          card.setAttribute('genres', `${item.genre_ids[0]}, ${item.genre_ids[1]}`);
        } else if (item.genre_ids.length === 1) {
          card.setAttribute('genres', `${item.genre_ids[0]}`);
        } else {
          card.setAttribute('genres', 'Unknown');
        }

        listElement.appendChild(card);
      });

    } catch (error) {
      console.error("Error cargando el JSON en el carrusel:", error);
    }
  }
}

if (!customElements.get('movie-carousel')) {
  customElements.define('movie-carousel', MovieCarousel);
}
