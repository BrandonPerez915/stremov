import { apiClient } from '../scripts/utils/apiClient.js';

const personCarouselSheet = new CSSStyleSheet();

personCarouselSheet.replaceSync(`
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

  .person-row {
    width: 100%;
    padding: 10px 70px 50px 20px;
    display: flex;
    gap: 30px; /* Un poco menos de gap que las películas para que se vean unidos */
    overflow-x: auto;
    scroll-behavior: smooth;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    scroll-padding: 0 70px;
    box-sizing: border-box;
  }

  .person-row::-webkit-scrollbar {
    display: none;
  }

  /* Las tarjetas de persona inyectadas dinámicamente */
  person-profile-card {
    flex: 0 0 auto;
    scroll-snap-align: start;
    width: 160px; /* Tamaño ideal que respeta el min-width y max-width de tu tarjeta */
  }
`);

class PersonCarousel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [personCarouselSheet];
    this._directData = null; // Almacenará los datos si se pasan por JS
  }

  static get observedAttributes() {
    // Añadido 'json-data' para detectar cuando se inyecta desde el HTML
    return ['title', 'api-url', 'filter-department', 'json-data'];
  }

  // Getter y Setter para inyectar datos directamente desde JS
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
      if (name === 'api-url' || name === 'json-data' || name === 'filter-department') {
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

    // Solo creamos la estructura si no existe para no borrar las tarjetas en un re-render del título
    if (!this.shadowRoot.getElementById('person-list')) {
      this.shadowRoot.innerHTML = `
        <div class="carousel-wrapper">
          <h1 id="carousel-title" style="display: ${title ? 'block' : 'none'};">${title || ''}</h1>
          <div class="person-row" id="person-list">
            <!-- Las tarjetas se insertarán aquí dinámicamente -->
          </div>
        </div>
      `;
    } else {
      // Si ya existe, solo actualizamos el título
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
    const filterDept = this.getAttribute('filter-department'); // Ej: "Directing"
    const listElement = this.shadowRoot.getElementById('person-list');

    if (!listElement) return;

    let rawData = null;

    try {
      // Prioridad 1: Datos pasados directamente por JavaScript (element.data = ...)
      if (this._directData) {
        rawData = this._directData;
      }
      // Prioridad 2: Datos pasados en el atributo HTML (json-data='[...]')
      else if (jsonString) {
        rawData = JSON.parse(jsonString);
      }
      // Prioridad 3: Fetch a una API URL
      else if (apiUrl) {
        rawData = await apiClient.get(apiUrl);
      } else {
        return; // Si no hay datos por ningún medio, salimos
      }

      // Normalizar la data (soporta arreglos directos o el formato de TMDB)
      let peopleList = [];
      if (Array.isArray(rawData)) {
        peopleList = rawData;
      } else if (rawData && rawData.cast) {
        peopleList = rawData.cast; // Generalmente para películas/series
      } else if (rawData && rawData.results) {
        peopleList = rawData.results; // Generalmente para búsquedas de personas
      }

      // Filtrar por departamento si el atributo está presente
      if (filterDept) {
        peopleList = peopleList.filter(person => person.known_for_department === filterDept);
      }

      // Limpiar el contenedor antes de agregar las nuevas tarjetas
      listElement.innerHTML = '';

      peopleList.forEach(person => {
        const card = document.createElement('person-profile-card');

        const imgSrc = person.profile_path
          ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
          : 'https://images.unsplash.com/photo-1544502062-f82887f03d1c?auto=format&fit=crop&w=400&q=80';

        const name = person.name || 'Unknown';
        const character = person.character;
        const job = person.job;
        const role = person.known_for_department || person.job || 'Actor';
        const popularity = person.popularity ? (Math.round(person.popularity * 10) / 10).toString() : '0.0';

        card.setAttribute('img-src', imgSrc);
        card.setAttribute('name', name);
        if (character) card.setAttribute('character', character);
        if (job) card.setAttribute('job', job);
        card.setAttribute('role', role);
        card.setAttribute('popularity', popularity);

        listElement.appendChild(card);
      });

    } catch (error) {
      console.error("Error cargando los datos en el carrusel de personas:", error);
    }
  }
}

if (!customElements.get('person-carousel')) {
  customElements.define('person-carousel', PersonCarousel);
}
