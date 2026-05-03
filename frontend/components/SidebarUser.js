const sidebarUserSheet = new CSSStyleSheet();

sidebarUserSheet.replaceSync(`
  :host {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: 'Inter', sans-serif;
    width: 100%;
    cursor: pointer;
    padding: 4px 0;
    transition: opacity 0.2s ease;
  }

  :host(:hover) {
    opacity: 0.8;
  }

  img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0; /* Evita que la imagen se aplaste */
  }

  /* Contenedor para agrupar nombre + icono */
  .name-container {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0; /* Permite que el contenedor se encoja para el truncado */
    flex: 1;
  }

  .user-name {
    font-size: 0.85rem;
    color: var(--text-primary, #eee);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    /* Quitamos flex: 1 de aquí para que ocupe solo lo necesario */
    width: fit-content;
    max-width: 100%;
  }

  .verified-icon {
    color: var(--green-100, #22c55e);
    font-size: 16px;
    flex-shrink: 0; /* El icono nunca debe ocultarse ni encogerse */
    font-family: 'Material Symbols Outlined';
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
`);

class SidebarUser extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [sidebarUserSheet];
  }

  connectedCallback() {
    this._render();
  }

  _render() {
    const src = this.getAttribute('img-src') || '';
    const name = this.getAttribute('name') || 'Usuario';
    const isVerified = this.hasAttribute('verified');

    const statusHtml = isVerified
      ? `<span class="verified-icon">verified</span>`
      : '';

    this.shadowRoot.innerHTML = `
      <img src="${src}" alt="${name}">
      <div class="name-container">
        <span class="user-name">${name}</span>
        ${statusHtml}
      </div>
    `;
  }
}

if (!customElements.get('sidebar-user')) {
  customElements.define('sidebar-user', SidebarUser);
}
