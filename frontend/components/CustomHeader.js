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
}

#header-right-side,
#header-left-side {
  width: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  position: relative;
}

.icon {
  color: var(--text-primary);
  font-family: 'Material Symbols Outlined';
  font-variation-settings:
    'FILL' 0,
    'wght' 200,
    'GRAD' 0,
    'opsz' 24
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

.header-icon:hover .notification-badge {
  background-color: var(--red-75);
}

.header-icon:hover {
  color: var(--text-secondary);
}

.notification-badge {
  position: absolute;
  margin: 0;
  width: 10px;
  height: 10px;

  top: 3px;
  right: 3px;
  background-color: var(--red-100);
  color: white;
  border-radius: 100%;
  font-size: 8px;
  transition: background-color 0.3s ease;
}

.profile-pic {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid transparent;
  flex-shrink: 0;
}

custom-input {
  width: 100%;
  opacity: 1;
  overflow: hidden;
  transition: width 0.3s ease, opacity 0.3s ease, margin 0.3s ease;
}

label {
  display: none;
}

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

#close-icon,
#search-icon,
#menu-icon {
  display: none;
}

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

    right: 75px;
    top: 50%;
    transform: translateY(-50%);
    margin-top: 0;
    z-index: 10;
  }

  #search-icon,
  #menu-icon {
    display: block;
  }
}
`);

class CustomHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [customHeaderSheet];
  }

  connectedCallback() {
    this._render();
    this._setupListeners();
  }

  _render() {
    const inputPlaceholder = this.getAttribute('placeholder') || 'Input your search...';
    const imgSrc = this.getAttribute('img-src') || '';
    const hasNotifications = this.hasAttribute('has-notifications');
    const notificationsHTML = hasNotifications ? `<span class="notification-badge"></span>` : '';

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

          <span id="close-icon" class="icon header-icon hidden-icon">close</span>
          <span id="search-icon" class="icon header-icon">search</span>
          <span id="notifications-icon" class="icon header-icon">notifications ${notificationsHTML}</span>

          <img class="profile-pic" src="${imgSrc}" alt="Profile">
        </div>
      </header>
    `;
  }

  _setupListeners() {
    const menuIcon = this.shadowRoot.querySelector('#menu-icon');
    const searchIcon = this.shadowRoot.querySelector('#search-icon');
    const notificationsIcon = this.shadowRoot.querySelector('#notifications-icon');
    const closeIcon = this.shadowRoot.querySelector('#close-icon');
    const searchInput = this.shadowRoot.querySelector('#search-input');
    const sidebar = document.querySelector('custom-sidebar');
    const backdrop = document.querySelector('.backdrop');

    // Mostrar el sidebar en móvil
    menuIcon.addEventListener('click', () => {
      if (sidebar && backdrop) {
        sidebar.classList.add('open');
        sidebar.classList.remove('closed');
        backdrop.classList.remove('hidden');
      }
    });

    const toggleIcons = () => {
      menuIcon.classList.toggle('hidden-icon');
      notificationsIcon.classList.toggle('hidden-icon');
      searchIcon.classList.toggle('hidden-icon');
      closeIcon.classList.toggle('hidden-icon');
    };

    // Mostrar la barra de búsqueda en móvil
    searchIcon.addEventListener('click', () => {
      toggleIcons();
      searchInput.classList.add('visible');

      setTimeout(() => {
        const inner = searchInput.shadowRoot ? searchInput.shadowRoot.querySelector('input') : searchInput;
        if(inner) inner.focus();
      }, 50);
    });

    // Ocultar la barra de búsqueda en móvil
    closeIcon.addEventListener('click', () => {
      toggleIcons();
      searchInput.classList.remove('visible');

      if (typeof searchInput._updateValue === 'function') {
        searchInput._updateValue('');
      } else {
        searchInput.value = '';
      }

      this._dispatchSearch();
    });

    // Búsqueda al presionar "Enter"
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this._dispatchSearch();
      }
    });
  }

  // Lógica centralizada para lanzar el evento de búsqueda
  _dispatchSearch() {
    const searchInput = this.shadowRoot.querySelector('#search-input');
    const value = searchInput.value ? searchInput.value.trim() : '';

    const searchEvent = new CustomEvent('header-search', {
      detail: { query: value },
      bubbles: true,
      composed: true
    });

    this.dispatchEvent(searchEvent);
  }
}

if (!customElements.get('custom-header')) {
  customElements.define('custom-header', CustomHeader);
}
