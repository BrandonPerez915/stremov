const playlistModalSheet = new CSSStyleSheet();

playlistModalSheet.replaceSync(`
  :host {
    /* La modal empieza oculta por defecto */
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    font-family: 'Inter', -apple-system, sans-serif;
  }

  /* Si el atributo "open" está presente, mostramos la modal */
  :host([open]) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
  }

  .modal-container {
    background-color: #111;
    border: 1px solid #1e1e1e;
    border-radius: 20px;
    padding: 24px;
    width: 90%;
    max-width: 500px;
    position: relative;
    z-index: 10;
    color: white;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes modalIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    border-bottom: 1px solid #1e1e1e;
    padding-bottom: 15px;
  }

  .header h2 { 
    margin: 0; 
    font-size: 22px; 
    font-weight: 800; 
  }

  .close-btn {
    cursor: pointer;
    color: #666;
    background: none;
    border: none;
    padding: 5px;
    display: flex;
    transition: color 0.2s ease;
  }

  .close-btn:hover { color: white; }

  /* Estilos del Formulario */
  .form { 
    display: flex; 
    flex-direction: column; 
    gap: 20px; 
  }

  .field { 
    display: flex; 
    flex-direction: column; 
    gap: 8px; 
  }

  label { 
    font-size: 12px; 
    font-weight: 700; 
    color: #888; 
    text-transform: uppercase; 
    letter-spacing: 0.5px;
  }

  input, textarea {
    background-color: #1a1a1a;
    border: 1px solid #222;
    border-radius: 10px;
    padding: 14px;
    color: white;
    font-size: 15px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s ease;
  }

  input:focus, textarea:focus { 
    border-color: #00d2ff; 
  }

  textarea { 
    height: 100px; 
    resize: vertical; 
    min-height: 80px;
    max-height: 200px;
  }

  .save-btn {
    background-color: #00d2ff;
    color: #000;
    border: none;
    border-radius: 10px;
    padding: 14px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    margin-top: 10px;
    transition: transform 0.1s ease, background-color 0.2s ease;
  }

  .save-btn:active {
    transform: scale(0.98);
  }

  .save-btn:hover {
    background-color: #33dbff;
  }
`);

class EditPlaylistModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [playlistModalSheet];
    this._render();
  }

  static get observedAttributes() {
    return ['open', 'list-title', 'list-description'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this._update();
    }
  }

  open() { this.setAttribute('open', ''); }
  close() { this.removeAttribute('open'); }

  _update() {
    const titleInput = this.shadowRoot.getElementById('input-title');
    const descInput = this.shadowRoot.getElementById('input-description');

   
    if (titleInput && !this.hasAttribute('user-typing')) {
        titleInput.value = this.getAttribute('list-title') || '';
    }
    if (descInput && !this.hasAttribute('user-typing')) {
        descInput.value = this.getAttribute('list-description') || '';
    }
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <div class="backdrop"></div>
      <div class="modal-container">
        <div class="header">
          <h2>Editar Lista</h2>
          <button class="close-btn" id="btn-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="form">
          <div class="field">
            <label>Nombre de la lista</label>
            <input type="text" id="input-title" placeholder="Ej. Pelis para llorar">
          </div>
          <div class="field">
            <label>Descripción</label>
            <textarea id="input-description" placeholder="Añade una descripción a tu lista..."></textarea>
          </div>
          <button class="save-btn" id="btn-save">Guardar Cambios</button>
        </div>
      </div>
    `;

    
    this.shadowRoot.getElementById('btn-close').onclick = () => this.close();
    this.shadowRoot.querySelector('.backdrop').onclick = () => this.close();

    
    const inputs = this.shadowRoot.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => this.setAttribute('user-typing', ''));
        input.addEventListener('blur', () => this.removeAttribute('user-typing'));
    });

    
    this.shadowRoot.getElementById('btn-save').onclick = () => {
      const payload = {
        title: this.shadowRoot.getElementById('input-title')?.value || '',
        description: this.shadowRoot.getElementById('input-description')?.value || '',
      };

      
      this.dispatchEvent(new CustomEvent('playlist-save', {
        detail: payload,
        bubbles: true,
        composed: true,
      }));

      this.close();
    };

    this._update();
  }
}

if (!customElements.get('edit-playlist-modal')) {
  customElements.define('edit-playlist-modal', EditPlaylistModal);
}