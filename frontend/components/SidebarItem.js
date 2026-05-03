const sidebarItemSheet = new CSSStyleSheet();

sidebarItemSheet.replaceSync(`
  :host {
    display: block;
  }

  a {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    color: var(--text-primary, #ffffff);
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;
    font-family: 'Inter', sans-serif;
  }

  a:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  :host([active]) a {
    background-color: var(--primary-color, #3e5eff);
    color: white;
  }

  /* Configuración del icono Material Symbols */
  .icon {
    font-family: 'Material Symbols Outlined';
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    font-variation-settings: 'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24;
  }
`);

class SidebarItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [sidebarItemSheet];
  }

  connectedCallback() {
    this._render();
  }

  _render() {
    const icon = this.getAttribute('icon') || '';
    const text = this.getAttribute('text') || '';
    const href = this.getAttribute('href') || '#';

    this.shadowRoot.innerHTML = `
      <a href="${href}">
        <span class="icon">${icon}</span>
        <span class="text">${text}</span>
      </a>
    `;
  }
}

if (!customElements.get('sidebar-item')) {
  customElements.define('sidebar-item', SidebarItem);
}
