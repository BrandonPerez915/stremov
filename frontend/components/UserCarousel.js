import { apiClient } from '../scripts/utils/apiClient.js';

const userCarouselSheet = new CSSStyleSheet();

userCarouselSheet.replaceSync(`
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

  .user-row {
    width: 100%;
    padding: 10px 70px 50px 20px;
    display: flex;
    gap: 24px; /* Un gap intermedio para perfiles */
    overflow-x: auto;
    scroll-behavior: smooth;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    scroll-padding: 0 70px;
    box-sizing: border-box;
  }

  .user-row::-webkit-scrollbar {
    display: none;
  }

  /* Las tarjetas de usuario inyectadas dinámicamente */
  user-profile-card {
    flex: 0 0 auto;
    scroll-snap-align: start;
    width: 180px; /* Tamaño adaptado para tarjetas de usuario */
  }
`);

class UserCarousel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [userCarouselSheet];
    this._directData = null;
  }

  static get observedAttributes() {
    return ['title', 'api-url', 'json-data'];
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
      if (name === 'api-url' || name === 'json-data') {
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

    if (!this.shadowRoot.getElementById('user-list')) {
      this.shadowRoot.innerHTML = `
        <div class="carousel-wrapper">
          <h1 id="carousel-title" style="display: ${title ? 'block' : 'none'};">${title || ''}</h1>
          <div class="user-row" id="user-list">
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
    const listElement = this.shadowRoot.getElementById('user-list');

    if (!listElement) return;

    let rawData = null;

    try {
      if (this._directData) {
        rawData = this._directData;
      } else if (jsonString) {
        rawData = JSON.parse(jsonString);
      } else if (apiUrl) {
        rawData = await apiClient.get(apiUrl);
      } else {
        return;
      }

      // Normalizar la data dependiendo de la respuesta de tu API
      let userList = [];
      if (Array.isArray(rawData)) {
        userList = rawData;
      } else if (rawData && rawData.users) {
        userList = rawData.users; // Por si tu API devuelve { users: [...] }
      } else if (rawData && rawData.data) {
        userList = rawData.data; // Por si usa formato de paginación
      }

      listElement.innerHTML = '';

      userList.forEach(user => {
        const card = document.createElement('user-profile-card');

        // Adaptación de los datos típicos de tu esquema de usuario
        const username = user.username || user.name || 'Usuario';
        const avatar = user.avatarUrl || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}`;

        // Calcular seguidores (soporta tanto un array de IDs como un contador numérico directo)
        let followersCount = 0;
        if (Array.isArray(user.followers)) {
          followersCount = user.followers.length;
        } else if (user.followersCount !== undefined) {
          followersCount = user.followersCount;
        }

        card.setAttribute('username', username);
        card.setAttribute('avatar', avatar);
        card.setAttribute('followers', followersCount);

        // Si tienes el ID, es muy útil para navegar al perfil del usuario
        if (user._id || user.id) {
          card.setAttribute('user-id', user._id || user.id);
        }

        listElement.appendChild(card);
      });

    } catch (error) {
      console.error("Error cargando los datos en el carrusel de usuarios:", error);
    }
  }
}

if (!customElements.get('user-carousel')) {
  customElements.define('user-carousel', UserCarousel);
}
