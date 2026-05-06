const movieModalSheet = new CSSStyleSheet();

movieModalSheet.replaceSync(`
  :host {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 9999;
    font-family: 'Inter', sans-serif;
    align-items: center;
    justify-content: center;
  }

  /* Cuando el atributo open está presente, mostramos la modal */
  :host([open]) {
    display: flex;
  }

  .backdrop {
    position: absolute;
    inset: 0;
    background-color: rgba(15, 17, 21, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 1;
    cursor: pointer;
  }

  .modal-container {
    position: relative;
    z-index: 2;
    background-color: var(--bg-color, #1f2128);
    width: 95%;
    max-width: 1100px;
    height: 90vh;
    max-height: 900px;
    border-radius: 20px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--borders-color, #3a3f4c);
    animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes modalFadeIn {
    from { opacity: 0; transform: scale(0.95) translateY(20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  .close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: background 0.2s;
  }

  .close-btn:hover {
    background: rgba(239, 68, 68, 0.8); /* Rojo al hover */
  }

  .close-btn .icon {
    font-family: 'Material Symbols Outlined';
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    font-size: 24px;
  }

  /* --- SISTEMA DE PESTAÑAS (TABS) --- */
  .tabs-header {
    display: flex;
    gap: 30px;
    padding: 20px 40px 0 40px;
    border-bottom: 1px solid var(--borders-color, #3a3f4c);
    flex-shrink: 0;
  }

  .tab-btn {
    background: none;
    border: none;
    color: var(--text-secondary, #8b8e98);
    font-size: 16px;
    font-weight: 600;
    padding: 15px 0;
    cursor: pointer;
    position: relative;
    transition: color 0.3s;
    font-family: inherit;
  }

  .tab-btn:hover {
    color: var(--text-primary, #ffffff);
  }

  .tab-btn.active {
    color: var(--primary-color, #4ade80);
  }

  .tab-btn.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: var(--primary-color, #4ade80);
    border-radius: 3px 3px 0 0;
  }

  .tabs-content {
    flex-grow: 1;
    position: relative;
    overflow: hidden;
    padding: 30px 40px;
  }

  .tab-pane {
    display: none;
    width: 100%;
    height: 100%;
    animation: fadeIn 0.3s ease;
  }

  .tab-pane.active {
    display: block; /* o flex dependiendo del componente hijo */
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @media (max-width: 700px) {
    .tabs-header {
      padding: 15px 20px 0 20px;
      gap: 20px;
    }
    .tabs-content {
      padding: 20px;
    }
    .modal-container {
      height: 95vh;
      width: 100%;
      border-radius: 20px 20px 0 0;
      align-self: flex-end;
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
  }
`);

class MovieModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [movieModalSheet];
  }

  static get observedAttributes() {
    return ['api-url', 'open'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'api-url' && oldValue !== newValue && newValue) {
      this._fetchMainData();
    }
    if (name === 'open') {
      if (this.hasAttribute('open')) {
        document.body.style.overflow = 'hidden'; // Bloquea el scroll de la página de fondo
      } else {
        document.body.style.overflow = '';
      }
    }
  }

  connectedCallback() {
    this._render();
    this._setupListeners();
    if (this.getAttribute('api-url')) {
      this._fetchMainData();
    }
  }

  disconnectedCallback() {
    document.body.style.overflow = ''; // Limpieza de seguridad
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <div class="backdrop" id="backdrop"></div>

      <div class="modal-container">
        <button class="close-btn" id="close-btn" aria-label="Close modal">
          <span class="icon">close</span>
        </button>

        <div class="tabs-header" id="tabs-header">
          <button class="tab-btn active" data-target="info">Information</button>
          <button class="tab-btn" data-target="reviews">Reviews</button>
          <button class="tab-btn" data-target="similar">Similar</button>
        </div>

        <div class="tabs-content">
          <!-- PANEL DE INFORMACIÓN -->
          <div class="tab-pane active" id="tab-info">
            <movie-modal-details id="details-component"></movie-modal-details>
          </div>

          <!-- PANEL DE RESEÑAS -->
          <div class="tab-pane" id="tab-reviews">
            <movie-modal-reviews id="reviews-component"></movie-modal-reviews>
          </div>

          <!-- PANEL DE SIMILARES -->
          <div class="tab-pane" id="tab-similar">
            <movie-modal-similar id="similar-component"></movie-modal-similar>
          </div>
        </div>
      </div>
    `;
  }

  _setupListeners() {
    // Cerrar modal con el backdrop
    this.shadowRoot.getElementById('backdrop').addEventListener('click', () => {
      this.removeAttribute('open');
    });

    // Cerrar modal con la X
    this.shadowRoot.getElementById('close-btn').addEventListener('click', () => {
      this.removeAttribute('open');
    });

    // Lógica de las pestañas
    const tabBtns = this.shadowRoot.querySelectorAll('.tab-btn');
    const tabPanes = this.shadowRoot.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Remover clase active de todos
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        // Añadir clase active al seleccionado
        const targetId = e.target.getAttribute('data-target');
        e.target.classList.add('active');
        this.shadowRoot.getElementById(`tab-${targetId}`).classList.add('active');
      });
    });
  }

  // Utilidad para convertir minutos a formato "3h 12m"
  _formatRuntime(minutes) {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  async _fetchMainData() {
    const apiUrl = this.getAttribute('api-url');
    if (!apiUrl) return;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      const detailsComponent = this.shadowRoot.getElementById('details-component');
      const reviewsComponent = this.shadowRoot.getElementById('reviews-component');
      const similarComponent = this.shadowRoot.getElementById('similar-component');

      // 1. Formatear y pasar datos al componente de Detalles
      const title = data.title || data.name || 'Unknown';
      const year = data.release_date ? data.release_date.substring(0, 4) : '';
      const tags = data.genres ? data.genres.map(g => g.name).join(', ') : 'N/A';
      const rating = data.vote_average ? (Math.round(data.vote_average * 10) / 10).toString() : 'N/A';
      const duration = this._formatRuntime(data.runtime || data.episode_run_time?.[0]);
      const country = data.production_countries ? data.production_countries.map(c => c.name).join(', ') : 'N/A';
      const language = data.spoken_languages ? data.spoken_languages.map(l => l.english_name).join(', ') : 'N/A';
      const posterSrc = data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : '';

      detailsComponent.setAttribute('movie-title', title);
      detailsComponent.setAttribute('poster-src', posterSrc);
      detailsComponent.setAttribute('year', year);
      detailsComponent.setAttribute('tags', tags);
      detailsComponent.setAttribute('imdb-rating', rating);
      detailsComponent.setAttribute('duration', duration);
      detailsComponent.setAttribute('synopsis', data.overview || 'No synopsis available.');
      detailsComponent.setAttribute('country', country);
      detailsComponent.setAttribute('language', language);

      // TMDB no da badges de edad ni premios directos en la llamada base, ponemos un default
      detailsComponent.setAttribute('age-badge', data.adult ? '18+' : 'PG-13');
      detailsComponent.setAttribute('awards', 'See IMDb for awards');
      detailsComponent.setAttribute('released', data.release_date || 'N/A');

      // 2. Autogenerar URLs para los otros componentes
      // Parseamos la URL para inyectar /credits, /similar y /reviews antes de los query parameters (?api_key=...)
      const urlObj = new URL(apiUrl, window.location.origin); // Se provee un origen por si la ruta es relativa
      const basePath = urlObj.pathname; // Ej: /3/movie/872585
      const queryParams = urlObj.search; // Ej: ?api_key=XXX&language=en-US

      const isAbsolute = apiUrl.startsWith('http');
      const baseHost = isAbsolute ? urlObj.origin : '';

      const creditsUrl = `${baseHost}${basePath}/credits${queryParams}`;
      const similarUrl = `${baseHost}${basePath}/similar${queryParams}`;
      // const reviewsUrl = `${baseHost}${basePath}/reviews${queryParams}`; // Si tu modal-reviews lo soporta

      // Asignar las URLs autogeneradas
      detailsComponent.setAttribute('credits-api-url', creditsUrl);

      similarComponent.setAttribute('movie-title', title);
      similarComponent.setAttribute('api-url', similarUrl);
      similarComponent.setAttribute('type', data.name ? 'series' : 'movie');

      // Asignar títulos al componente de reviews (asumiendo su estructura)
      reviewsComponent.setAttribute('movie-title', title);

    } catch (error) {
      console.error("Error obteniendo datos principales de la película:", error);
    }
  }
}

if (!customElements.get('movie-modal')) {
  customElements.define('movie-modal', MovieModal);
}
