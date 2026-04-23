const playlistHeaderSheet = new CSSStyleSheet();

playlistHeaderSheet.replaceSync(`
  :host {
    display: block;
    width: 100%;
    font-family: 'Inter', -apple-system, sans-serif;
    padding: 30px 20px;
    box-sizing: border-box;
  }

  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    max-width: 1400px;
    margin: 0 auto;
    border-bottom: 1px solid #222;
    padding-bottom: 20px;
  }

  .info-section {
    flex: 1;
    padding-right: 20px;
  }

  #title {
    color: #ffffff;
    font-size: 42px;
    font-weight: 800;
    margin: 0 0 12px 0;
    letter-spacing: -1px;
    line-height: 1.1;
  }

  #description {
    color: #a0a0a0;
    font-size: 16px;
    font-weight: 400;
    margin: 0;
    line-height: 1.5;
    max-width: 800px;
  }

  .actions-section {
    display: flex;
    align-items: center;
  }

  .btn-edit {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: transparent;
    color: #00d2ff;
    border: 1px solid rgba(0, 210, 255, 0.3);
    border-radius: 8px;
    padding: 10px 18px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-edit:hover {
    background-color: rgba(0, 210, 255, 0.1);
    box-shadow: 0 0 10px rgba(0, 210, 255, 0.1);
  }

  .btn-edit:active {
    transform: scale(0.96);
  }

  .icon {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }

  /* Responsivo para pantallas pequeñas */
  @media (max-width: 600px) {
    .header-container {
      flex-direction: column;
      gap: 20px;
    }
    
    #title {
      font-size: 32px;
    }
  }
`);

class PlaylistHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [playlistHeaderSheet];
    this._render();
  }

  static get observedAttributes() {
    return ['list-title', 'list-description'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this._updateContent();
    }
  }

  _updateContent() {
    const title = this.getAttribute('list-title') || 'Lista sin título';
    const description = this.getAttribute('list-description') || 'Sin descripción disponible.';

    const titleElement = this.shadowRoot.getElementById('title');
    const descElement = this.shadowRoot.getElementById('description');

    if (titleElement) titleElement.textContent = title;
    if (descElement) descElement.textContent = description;
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <div class="header-container">
        <div class="info-section">
          <h1 id="title"></h1>
          <p id="description"></p>
        </div>
        <div class="actions-section">
          <button class="btn-edit" id="edit-btn">
            <svg class="icon" viewBox="0 -960 960 960">
              <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
            </svg>
            Editar Info
          </button>
        </div>
      </div>
    `;

    this.shadowRoot.getElementById('edit-btn')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('edit-playlist', {
        bubbles: true,
        composed: true,
        detail: {
          currentTitle: this.getAttribute('list-title'),
          currentDescription: this.getAttribute('list-description')
        }
      }));
    });

    this._updateContent();
  }
}

if (!customElements.get('playlist-header')) {
  customElements.define('playlist-header', PlaylistHeader);
}