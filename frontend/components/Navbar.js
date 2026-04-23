const navbarSheet = new CSSStyleSheet();

navbarSheet.replaceSync(`
  :host {
    display: block;
    width: 100%;
    background-color: #000;
    color: white;
    font-family: 'Inter', -apple-system, sans-serif;
    height: 60px;
  }

  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    height: 100%;
    max-width: 1400px;
    margin: 0 auto;
  }

  .left-side {
    display: flex;
    align-items: center;
    gap: 40px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    color: white;
  }

  .logo-icon {
    width: 24px;
    height: 24px;
    fill: #00d2ff;
  }

  .app-name {
    font-weight: 800;
    font-size: 20px;
    letter-spacing: -1px;
    margin: 0;
  }

  .nav-links {
    display: flex;
    gap: 30px;
  }

  .nav-link {
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    transition: color 0.2s;
  }

  .link-home { color: #00d2ff; }
  .link-browse { color: #666; } /* Gris apagado para inactivo */

  .nav-link:hover { color: white; }

  .right-side {
    display: flex;
    align-items: center;
    gap: 25px;
  }

  .search-icon {
    width: 26px;
    height: 26px;
    fill: #666;
    cursor: pointer;
    transition: fill 0.2s;
  }

  .search-icon:hover { fill: white; }

  .user-badge {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px;
    border-radius: 30px;
    background-color: #111;
    border: 1px solid #222;
    cursor: pointer;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    background-color: #333;
  }

  .user-name {
    font-weight: 400;
    font-size: 14px;
    color: white;
  }
`);

class Navbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [navbarSheet];
    this._render();
  }

  static get observedAttributes() {
    return ['user-name', 'user-avatar'];
  }

  attributeChangedCallback() {
    this._update();
  }

  _update() {
    const nameElement = this.shadowRoot.querySelector('.user-name');
    const avatarElement = this.shadowRoot.querySelector('.user-avatar');

    if (nameElement) nameElement.textContent = this.getAttribute('user-name') || 'guest';
    if (avatarElement) avatarElement.src = this.getAttribute('user-avatar') || '';
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <nav class="navbar">
        <div class="left-side">
          <a href="#" class="brand">
            <svg class="logo-icon" viewBox="0 -960 960 960">
              <path d="M160-80q-33 0-56.5-23.5T80-160v-480q0-25 13.5-45t36.5-29l506-206 26 66-330 134h468q33 0 56.5 23.5T880-640v480q0 33-23.5 56.5T800-80H160Zm0-80h640v-280H160v280Zm231-69q29-29 29-71t-29-71q-29-29-71-29t-71 29q-29 29-29 71t29 71q29 29 71 29t71-29ZM160-520h480v-80h80v80h80v-120H160v120Zm0 360v-280 280Z"/>
            </svg>
            <h1 class="app-name">CineList</h1>
          </a>
          <div class="nav-links">
            <a href="/frontend/views/home.html" class="nav-link link-home">Inicio</a>
            <a href="/frontend/views/search.html" class="nav-link link-browse">Explorar</a>
            <a href="/frontend/views/my-lists.html" class="nav-link link-browse">Mis Listas</a>
          </div>
        </div>

        <div class="right-side">
          <svg class="search-icon" id="search-btn" viewBox="0 -960 960 960">
            <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/>
          </svg>

          <div class="user-badge" id="user-badge">
            <img class="user-avatar" alt="">
            <span class="user-name"></span>
          </div>
        </div>
      </nav>
    `;

    this.shadowRoot.getElementById('search-btn')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('navbar-search-click', {
        bubbles: true,
        composed: true,
      }));
    });

    this.shadowRoot.getElementById('user-badge')?.addEventListener('click', () => {
      window.location.href = '/frontend/views/profile.html';
    });

    this._update();
  }
}

if (!customElements.get('cine-navbar')) {
  customElements.define('cine-navbar', Navbar);
}
