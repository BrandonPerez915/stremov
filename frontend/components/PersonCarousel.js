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
    padding: 10px 70px 50px 70px;
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

class PersonCarousel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [personCarouselSheet];
  }

  static get observedAttributes() {
    return ['title', 'api-url', 'filter-department'];
  }

  connectedCallback() {
    this._render();
    this._fetchAndPopulate();
  }

  _render() {
    const title = this.getAttribute('title') || 'Cast & Crew';

    this.shadowRoot.innerHTML = `
      <div class="carousel-wrapper">
        <h1>${title}</h1>
        <button class="carousel-btn left" id="btn-left">
          <span class="icon">chevron_left</span>
        </button>

        <div class="person-row" id="person-list">
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
    const list = this.shadowRoot.getElementById('person-list');
    const btnLeft = this.shadowRoot.getElementById('btn-left');
    const btnRight = this.shadowRoot.getElementById('btn-right');

    btnLeft.addEventListener('click', () => {
      // 160px de tarjeta + 30px de gap
      list.scrollBy({ left: -190, behavior: 'smooth' });
    });

    btnRight.addEventListener('click', () => {
      list.scrollBy({ left: 190, behavior: 'smooth' });
    });
  }

  async _fetchAndPopulate() {
    const apiUrl = this.getAttribute('api-url');
    const filterDept = this.getAttribute('filter-department'); // Ej: "Directing"
    const listElement = this.shadowRoot.getElementById('person-list');

    if (!apiUrl) return;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      let peopleList = data.cast || data.results || [];

      if (filterDept) {
        peopleList = peopleList.filter(person => person.known_for_department === filterDept);
      }

      peopleList.forEach(person => {
        const card = document.createElement('person-profile-card');

        const imgSrc = person.profile_path
          ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
          : 'https://images.unsplash.com/photo-1544502062-f82887f03d1c?auto=format&fit=crop&w=400&q=80';

        const name = person.name || 'Unknown';
        const character = person.character || 'Himself/Herself';
        const role = person.known_for_department || person.job || 'Actor';
        const popularity = person.popularity ? (Math.round(person.popularity * 10) / 10).toString() : '0.0';

        card.setAttribute('img-src', imgSrc);
        card.setAttribute('name', name);
        card.setAttribute('character', character);
        card.setAttribute('role', role);
        card.setAttribute('popularity', popularity);

        listElement.appendChild(card);
      });

    } catch (error) {
      console.error("Error cargando el JSON en el carrusel de personas:", error);
    }
  }
}

if (!customElements.get('person-carousel')) {
  customElements.define('person-carousel', PersonCarousel);
}
