const movieModalSimilarSheet = new CSSStyleSheet();

movieModalSimilarSheet.replaceSync(`
:host {
  display: block;
  width: 100%;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}

* {
  box-sizing: border-box;
}

h1.similar-title {
  padding-bottom: 30px;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 30px;
  width: 100%;
  border-top: 1px solid var(--border-color);
  padding: 40px 0;
}

/* Las movie-cards inyectadas dinámicamente */
movie-card {
  width: 100%;
  display: block;
}

/* Tipografía responsiva heredada del componente original */
@media (max-width: 970px) {
  h1.similar-title {
    font-size: 32px;
  }
}

@media (max-width: 700px) {
  h1.similar-title {
    font-size: 24px;
    margin-bottom: 20px;
    text-align: center;
  }

  /* Ajuste del grid para móviles pequeños */
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
}
`);

class MovieModalSimilar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [movieModalSimilarSheet];
  }

  static get observedAttributes() {
    return ['movie-title', 'api-url', 'type'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this._render();
      if (name === 'api-url' || name === 'type') {
        this._fetchAndPopulate();
      }
    }
  }

  connectedCallback() {
    this._render();
    this._fetchAndPopulate();
  }

  _render() {
    const title = this.getAttribute('movie-title') || 'Title';

    this.shadowRoot.innerHTML = `
      <h1 class="similar-title">${title} - Similar Titles</h1>

      <div class="movie-grid" id="similar-grid">
        <!-- Las movie-cards se insertarán aquí dinámicamente -->
      </div>
    `;
  }

  async _fetchAndPopulate() {
    const apiUrl = this.getAttribute('api-url');
    const type = this.getAttribute('type') || 'movie'; // 'movie' o 'series'
    const gridElement = this.shadowRoot.getElementById('similar-grid');

    if (!apiUrl || !gridElement) return;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      const results = data.results || [];

      if (results.length === 0) {
        gridElement.innerHTML = `<p style="color: var(--text-secondary, #8b8e98); grid-column: 1 / -1;">No similar items found.</p>`;
        return;
      }

      // Limpiar el grid antes de inyectar por si hay un re-render
      gridElement.innerHTML = '';

      results.forEach(item => {
        // Evitar items sin póster para no romper el diseño del grid
        if (!item.poster_path) return;

        const card = document.createElement('movie-card');

        // Dependiendo si es película o serie la API devuelve title o name
        const cardTitle = type === 'series' ? item.name : item.title;

        // Formatear géneros (máximo 2 para no sobresaturar la tarjeta)
        let genres = 'Unknown';
        if (item.genre_ids && item.genre_ids.length > 0) {
          genres = item.genre_ids.slice(0, 2).join(',');
        }

        card.setAttribute('title', cardTitle);
        card.setAttribute('poster', `https://image.tmdb.org/t/p/w500${item.poster_path}`);
        card.setAttribute('rating', Math.round(item.vote_average * 10) / 10);
        card.setAttribute('genres', genres);

        // Data attribute crucial para que tu componente movie-card maneje el redireccionamiento al hacer clic
        // card.dataset.imdbId = item.id;

        gridElement.appendChild(card);
      });

    } catch (error) {
      console.error("Error cargando el JSON en el modal similar:", error);
      gridElement.innerHTML = `<p style="color: #ef4444; grid-column: 1 / -1;">Failed to load similar movies.</p>`;
    }
  }
}

if (!customElements.get('movie-modal-similar')) {
  customElements.define('movie-modal-similar', MovieModalSimilar);
}
