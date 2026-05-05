const movieModalHeaderSheet = new CSSStyleSheet();

movieModalHeaderSheet.replaceSync(`
:host {
  display: block;
  margin-bottom: 50px;
  font-family: 'Inter', sans-serif;
}

header {
  display: flex;
  height: 40px;
  justify-content: space-between;
  align-items: center;
}

.close-icon {
  font-family: 'Material Symbols Outlined';
  font-variation-settings: 'FILL' 0, 'wght' 250, 'GRAD' 0, 'opsz' 24;
  font-size: 32px;
  cursor: pointer;
  color: var(--text-secondary, #8b8e98);
  transition: color 0.3s;
}

.close-icon:hover {
  color: var(--text-primary, #ffffff);
}

.nav-links {
  height: 100%;
  display: flex;
  gap: 30px;
  font-size: 14px;
  color: var(--text-secondary, #8b8e98);
  overflow-x: auto;
  white-space: nowrap;
}

/* Oculta la barra de scroll en navegadores webkit */
.nav-links::-webkit-scrollbar {
  display: none;
}

.nav-links a {
  display: flex;
  align-items: center;
  height: 100%;
  color: inherit;
  text-decoration: none;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: var(--text-primary, #ffffff);
}

.nav-links a.active {
  color: var(--text-primary, #ffffff);
  font-weight: 700;
  border-bottom: 2px solid var(--text-primary, #ffffff);
}

@media (max-width: 700px) {
  :host {
    margin-bottom: 30px;
  }

  .nav-links {
    gap: 15px;
    font-size: 12px;
  }
}
`);

class MovieModalHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [movieModalHeaderSheet];
    this.lastActiveTab = null; // Para evitar disparar eventos innecesarios
  }

  // Le decimos al componente a qué atributos debe prestar atención
  static get observedAttributes() {
    return ['active-tab', 'modal-id'];
  }

  // Se ejecuta cada vez que uno de los atributos observados cambia
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'active-tab' && this.shadowRoot.innerHTML !== '') {
        this.lastActiveTab = oldValue; // Guardamos el último valor para comparación futura
        this._updateActiveTab(newValue);
      }
    }
  }

  connectedCallback() {
    this._render();
    this._setupListeners();

    // Leemos el atributo inicial o asignamos 'information' por defecto
    const initialTab = this.getAttribute('active-tab') || 'information';
    this._updateActiveTab(initialTab);
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <header>
        <nav class="nav-links" id="nav-links">
          <a href="#" data-tab="information">Information</a>
          <a href="#" data-tab="reviews">Reviews</a>
          <a href="#" data-tab="similar">Similar</a>
        </nav>
        <span class="close-icon" id="close-icon">close</span>
      </header>
    `;
  }

  // Método interno para pintar la pestaña activa
  _updateActiveTab(tabName) {
    const navLinks = this.shadowRoot.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
      if (link.getAttribute('data-tab') === tabName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  _setupListeners() {
    const navLinks = this.shadowRoot.querySelectorAll('.nav-links a');
    const closeBtn = this.shadowRoot.getElementById('close-icon');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedTab = e.target.getAttribute('data-tab');

        // Actualizamos el atributo (esto disparará attributeChangedCallback automáticamente)
        this.setAttribute('active-tab', selectedTab);

        this.dispatchEvent(new CustomEvent('tab-changed', {
          detail: { tab: selectedTab },
          bubbles: true,
          composed: true
        }));
      });
    });

    closeBtn.addEventListener('click', () => {
      // Obtenemos qué modal debe cerrarse (o enviamos null si no se especificó)
      const targetModal = this.getAttribute('modal-id') || null;

      this.dispatchEvent(new CustomEvent('close-modal', {
        detail: { modalId: targetModal },
        bubbles: true,
        composed: true
      }));
    });
  }
}

if (!customElements.get('movie-modal-header')) {
  customElements.define('movie-modal-header', MovieModalHeader);
}
