const customHeaderSheet = new CSSStyleSheet();

customHeaderSheet.replaceSync(`
:host {
  width: 100%;
  display: flex;
  justify-content: center;
  font-family: 'Inter', sans-serif;
}

.custom-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 20px 5px 20px;
  width: 100%;
  height: fit-content;
  min-width: 200px;
}

#header-right-side {
  flex: 0.8;
  max-width: 800px;
  justify-content: flex-end !important;
}

/* Cuando hide-search está activo, el lado derecho no se va al centro */
:host([hide-search]) #header-right-side {
  flex: 0 0 auto;
}

#header-right-side,
#header-left-side {
  width: fit-content;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
  position: relative;
}

.icon {
  color: var(--text-primary, #ffffff);
  font-family: 'Material Symbols Outlined';
  font-variation-settings: 'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24;
}

.header-icon {
  height: fit-content;
  font-size: 28px;
  cursor: pointer;
  position: relative;
  width: 28px;
  opacity: 1;
  transition: opacity 0.3s ease, color 0.3s ease;
}

.header-icon:hover .notification-badge { background-color: var(--red-75); }
.header-icon:hover { color: var(--text-secondary, #b3b3b3); }

.notification-badge {
  position: absolute;
  margin: 0;
  width: 10px;
  height: 10px;
  top: 3px;
  right: 3px;
  background-color: var(--red-100, #e50914);
  color: white;
  border-radius: 100%;
  font-size: 8px;
  transition: background-color 0.3s ease;
}

.profile-wrapper {
  position: relative;
  flex-shrink: 0;
}

.profile-pic {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid transparent;
  flex-shrink: 0;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.profile-pic:hover {
  border-color: var(--primary-color, #e50914);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #e50914) 25%, transparent);
}

.profile-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  min-width: 210px;
  background-color: var(--bg-color, #141414);
  border: 1px solid var(--border-color, #333);
  border-radius: 14px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
  z-index: 9000;
  overflow: hidden;
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
  transform-origin: top right;
}

.profile-dropdown.open {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.dropdown-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--border-color, #333);
}

.dropdown-user-info img {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.dropdown-user-info .user-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.dropdown-user-info .user-name {
  font-size: 14px;
  font-weight: 400;
  color: var(--text-primary, #fff);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-user-info .user-email {
  font-size: 12px;
  color: var(--text-secondary, #b3b3b3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-section { padding: 8px; }

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #fff);
  cursor: pointer;
  transition: background-color 0.15s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  font-family: 'Inter', sans-serif;
  text-decoration: none;
}

.dropdown-item:hover {
  background-color: color-mix(in srgb, var(--text-primary, #fff) 6%, transparent);
}

.dropdown-item .item-icon {
  font-family: 'Material Symbols Outlined';
  font-variation-settings: 'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24;
  font-size: 20px;
  color: var(--text-secondary, #b3b3b3);
  flex-shrink: 0;
}

.dropdown-divider {
  height: 1px;
  background-color: var(--border-color, #333);
  margin: 4px 8px;
}

.dropdown-item.danger { color: var(--red-100, #e50914); }
.dropdown-item.danger:hover { font-weight: 800; }
.dropdown-item.danger .item-icon { color: var(--red-100, #e50914); }
.dropdown-item.danger:hover {
  background-color: color-mix(in srgb, var(--red-100, #e50914) 10%, transparent);
}

.logout-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.logout-modal-overlay.open {
  opacity: 1;
  pointer-events: auto;
}

.logout-modal {
  background: var(--bg-color, #141414);
  border: 1px solid var(--border-color, #333);
  border-radius: 16px;
  padding: 28px;
  width: min(400px, 90vw);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
  transform: translateY(8px) scale(0.98);
  transition: transform 0.2s ease;
  font-family: 'Inter', sans-serif;
}

.logout-modal-overlay.open .logout-modal {
  transform: translateY(0) scale(1);
}

.logout-modal h3 {
  color: var(--text-primary, #fff);
  font-size: 1.2rem;
  margin: 0 0 10px 0;
}

.logout-modal p {
  color: var(--text-secondary, #b3b3b3);
  font-size: 0.95rem;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.logout-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.logout-modal-actions button {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-family: 'Inter', sans-serif;
  transition: opacity 0.2s ease;
}

.logout-modal-actions button:hover { opacity: 0.85; }

.btn-cancel {
  background: transparent;
  border: 1px solid var(--border-color, #333) !important;
  color: var(--text-primary, #fff);
}

.btn-confirm-logout {
  background: var(--red-100, #e50914);
  color: white;
}

custom-input {
  width: 100%;
  opacity: 1;
  overflow: hidden;
  transition: width 0.3s ease, opacity 0.3s ease, margin 0.3s ease;
}

/* para ocultar search cuando hide-search está activo */
:host([hide-search]) custom-input,
:host([hide-search]) #search-icon,
:host([hide-search]) #close-icon,
:host([hide-search]) #filter-icon {
  display: none !important;
}

label { display: none; }

.hidden-icon {
  width: 0 !important;
  opacity: 0;
  pointer-events: none;
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  flex: 0 0 0 !important;
  overflow: hidden;
  position: absolute;
}

#close-icon, #search-icon, #menu-icon { display: none; }

@media(max-width: 900px) {
  #header-right-side {
    flex: 1;
    justify-content: flex-end;
  }

  custom-input {
    width: 0;
    opacity: 0;
    pointer-events: none;
    margin: 0;
  }

  custom-input.visible {
    flex: 1;
    opacity: 1;
    pointer-events: auto;
    margin: 0;
  }

  #close-icon {
    display: block;
    position: absolute;
    right: 80px;
    top: 50%;
    transform: translateY(-50%);
    margin-top: 0;
    z-index: 10;
  }

  #search-icon, #menu-icon { display: block; }

  /* en pantallas pequeñas si hide-search activo, tampoco se ve el ícono de búsqueda */
  :host([hide-search]) #search-icon { display: none !important; }
}
`);

class CustomHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [customHeaderSheet];
    this.onSearch = null;
    this._dropdownOpen = false;
    this._boundCloseDropdown = this._closeDropdown.bind(this);
  }

  static get observedAttributes() {
    return ['img-src', 'username', 'hide-search'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (this.shadowRoot.innerHTML) {
        this._render();
        this._setupListeners();
      }
    }
  }

  connectedCallback() {
    this._render();
    this._setupListeners();
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._boundCloseDropdown);
  }

  _isLoggedIn() {
    return !!localStorage.getItem('jwtToken');
  }

  _getStoredUser() {
    try {
      const raw = localStorage.getItem('userData');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  _getAvatarUrl() {
    const attrSrc = this.getAttribute('img-src');
    if (attrSrc) return attrSrc;

    if (this._isLoggedIn()) {
      const storedAvatar = localStorage.getItem('avatarUrl');
      if (storedAvatar) {
        if (storedAvatar.startsWith('/avatars/')) {
          return `${storedAvatar}?t=${Date.now()}`;
        }
        return storedAvatar;
      }

      const user = this._getStoredUser();
      if (user?.username) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=3a3f4c&color=fff&size=100`;
      }
    }

    return 'https://ui-avatars.com/api/?name=Guest&background=3a3f4c&color=888&size=100';
  }

  refresh() {
    this._render();
    this._setupListeners();
  }

  _render() {
    const inputPlaceholder = this.getAttribute('placeholder') || 'Input your search...';
    const onSearchCallback = this.getAttribute('on-search') || null;
    const hasNotifications = this.hasAttribute('has-notifications');
    const isLoggedIn = this._isLoggedIn();
    const imgSrc = this._getAvatarUrl();

    this.onSearch = onSearchCallback ? new Function('searchTerm', onSearchCallback) : null;
    const notificationsHTML = hasNotifications ? `<span class="notification-badge"></span>` : '';
    const dropdownContent = isLoggedIn
      ? this._renderAuthDropdown(imgSrc)
      : this._renderGuestDropdown();

    this.shadowRoot.innerHTML = `
      <header class="custom-header">
        <div id="header-left-side">
          <span id="menu-icon" class="icon header-icon">menu</span>
        </div>
        <div id="header-right-side">
          <custom-input
            id="search-input"
            type="text"
            placeholder="${inputPlaceholder}"
            icon="search">
          </custom-input>

          <span id="filter-icon" class="icon header-icon" title="Filters">tune</span>

          <span id="close-icon" class="icon header-icon hidden-icon">close</span>
          <span id="search-icon" class="icon header-icon">search</span>

          <div class="profile-wrapper">
            <img id="profile-pic" class="profile-pic" src="${imgSrc}" alt="Profile">
            <div class="profile-dropdown" id="profile-dropdown">
              ${dropdownContent}
            </div>
          </div>
        </div>
      </header>

      <div class="logout-modal-overlay" id="logout-modal-overlay">
        <div class="logout-modal">
          <h3>Sign out</h3>
          <p>Are you sure you want to sign out of your account?</p>
          <div class="logout-modal-actions">
            <button class="btn-cancel" id="logout-cancel">Cancel</button>
            <button class="btn-confirm-logout" id="logout-confirm">Sign out</button>
          </div>
        </div>
      </div>
    `;
  }

  _renderAuthDropdown(imgSrc) {
    const storedUser = this._getStoredUser();
    const name = storedUser?.username || this.getAttribute('username') || 'My Account';
    const email = storedUser?.email || this.getAttribute('email') || '';

    return `
      <div class="dropdown-user-info">
        <img src="${imgSrc}" alt="${name}">
        <div class="user-text">
          <span class="user-name">${name}</span>
          ${email ? `<span class="user-email">${email}</span>` : 'No email'}
        </div>
      </div>
      <div class="dropdown-section">
        <button class="dropdown-item" id="dd-profile">
          <span class="item-icon">manage_accounts</span>
          Profile Settings
        </button>
      </div>
      <div class="dropdown-divider"></div>
      <div class="dropdown-section">
        <button class="dropdown-item danger" id="dd-logout">
          <span class="item-icon">logout</span>
          Sign Out
        </button>
      </div>
    `;
  }

  _renderGuestDropdown() {
    return `
      <div class="dropdown-section">
        <button class="dropdown-item" id="dd-login">
          <span class="item-icon">login</span>
          Sign In
        </button>
      </div>
    `;
  }

  _toggleDropdown() {
    this._dropdownOpen = !this._dropdownOpen;
    const dropdown = this.shadowRoot.getElementById('profile-dropdown');
    dropdown?.classList.toggle('open', this._dropdownOpen);
  }

  _closeDropdown() {
    this._dropdownOpen = false;
    const dropdown = this.shadowRoot.getElementById('profile-dropdown');
    dropdown?.classList.remove('open');
  }

  _openLogoutModal() {
    const overlay = this.shadowRoot.getElementById('logout-modal-overlay');
    overlay?.classList.add('open');
  }

  _closeLogoutModal() {
    const overlay = this.shadowRoot.getElementById('logout-modal-overlay');
    overlay?.classList.remove('open');
  }

  _doLogout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('avatarUrl');
    window.location.href = '/home';
  }

  _setupListeners() {
    const menuIcon        = this.shadowRoot.querySelector('#menu-icon');
    const searchIcon      = this.shadowRoot.querySelector('#search-icon');
    const filterIcon      = this.shadowRoot.querySelector('#filter-icon');
    const closeIcon       = this.shadowRoot.querySelector('#close-icon');
    const searchInput     = this.shadowRoot.querySelector('#search-input');
    const profilePic      = this.shadowRoot.getElementById('profile-pic');
    const sidebar         = document.querySelector('custom-sidebar');
    const backdrop        = document.querySelector('.backdrop');

    // Sidebar toggle en móvil
    menuIcon?.addEventListener('click', () => {
      sidebar?.classList.add('open');
      sidebar?.classList.remove('closed');
      backdrop?.classList.remove('hidden');
    });

    // Lógica para abrir el Modal de Filtros
    filterIcon?.addEventListener('click', () => {
      let filtersModal = document.querySelector('filters-modal');
      // Si no existe el componente en el DOM, lo creamos
      if (!filtersModal) {
        filtersModal = document.createElement('filters-modal');
        document.body.appendChild(filtersModal);
      }
      filtersModal.open();
    });

    // Search toggle (ACTUALIZADO para ocultar también el icono de filtros)
    const toggleIcons = () => {
      menuIcon?.classList.toggle('hidden-icon');
      searchIcon?.classList.toggle('hidden-icon');
      filterIcon?.classList.toggle('hidden-icon'); // <-- Esto oculta el filtro en móviles
      closeIcon?.classList.toggle('hidden-icon');
    };

    searchIcon?.addEventListener('click', () => {
      toggleIcons();
      searchInput?.classList.add('visible');
      setTimeout(() => {
        const inner = searchInput?.shadowRoot?.querySelector('input');
        if (inner) inner.focus();
      }, 50);
    });

    closeIcon?.addEventListener('click', () => {
      toggleIcons();
      searchInput?.classList.remove('visible');
      if (typeof searchInput?._updateValue === 'function') {
        searchInput._updateValue('');
      }
    });

    searchInput?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        const innerInput = searchInput?.shadowRoot?.querySelector('input');
        const query = innerInput?.value.trim();
        if (query && typeof this.onSearch === 'function') {
          this.onSearch(query);
        }
        this.dispatchEvent(new CustomEvent('header-search', {
          detail: { query: query || '' },
          bubbles: true,
          composed: true
        }));
      }
    });

    // Dropdown de perfil
    profilePic?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._toggleDropdown();
    });

    // Listeners del dropdown según estado de auth
    const isLoggedIn = this._isLoggedIn();

    if (isLoggedIn) {
      this.shadowRoot.getElementById('dd-profile')?.addEventListener('click', () => {
        this._closeDropdown();
        window.location.href = '/profile';
      });

      this.shadowRoot.getElementById('dd-logout')?.addEventListener('click', () => {
        this._closeDropdown();
        this._openLogoutModal();
      });
    } else {
      this.shadowRoot.getElementById('dd-login')?.addEventListener('click', () => {
        window.location.href = '/login';
      });
    }

    // Modal de logout
    this.shadowRoot.getElementById('logout-cancel')?.addEventListener('click', () => {
      this._closeLogoutModal();
    });

    this.shadowRoot.getElementById('logout-confirm')?.addEventListener('click', () => {
      this._doLogout();
    });

    // Cerrar logout modal al hacer click en el overlay
    this.shadowRoot.getElementById('logout-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target === this.shadowRoot.getElementById('logout-modal-overlay')) {
        this._closeLogoutModal();
      }
    });

    // Cerrar dropdown al hacer click fuera
    document.removeEventListener('click', this._boundCloseDropdown);
    document.addEventListener('click', this._boundCloseDropdown);
  }
}

if (!customElements.get('custom-header')) {
  customElements.define('custom-header', CustomHeader);
}
