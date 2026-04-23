const createListModalSheet = new CSSStyleSheet();

createListModalSheet.replaceSync(`
  :host {
    display: none;
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    z-index: 9999;
    font-family: 'Inter', sans-serif;
  }
  :host([open]) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .backdrop {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
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
  .header h2 { margin: 0; font-size: 22px; font-weight: 800; }
  .close-btn {
    cursor: pointer; color: #666; background: none; border: none; padding: 5px; display: flex; transition: color 0.2s;
  }
  .close-btn:hover { color: white; }
  .form { display: flex; flex-direction: column; gap: 20px; }
  .field { display: flex; flex-direction: column; gap: 8px; }
  label { font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
  input, textarea {
    background-color: #1a1a1a; border: 1px solid #222; border-radius: 10px;
    padding: 14px; color: white; font-size: 15px; font-family: inherit; outline: none; transition: border-color 0.2s;
  }
  input:focus, textarea:focus { border-color: #00d2ff; }
  textarea { height: 100px; resize: vertical; min-height: 80px; max-height: 200px; }
  .create-btn {
    background-color: #00d2ff; color: #000; border: none; border-radius: 10px;
    padding: 14px; font-size: 16px; font-weight: 700; cursor: pointer; margin-top: 10px;
    transition: transform 0.1s, background-color 0.2s;
  }
  .create-btn:active { transform: scale(0.98); }
  .create-btn:hover { background-color: #33dbff; }
`);

class CreateListModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [createListModalSheet];
    this._render();
  }

  open() { 
      this.setAttribute('open', ''); 
      
      const title = this.shadowRoot.getElementById('input-title');
      const desc = this.shadowRoot.getElementById('input-description');
      if(title) title.value = '';
      if(desc) desc.value = '';
  }
  close() { this.removeAttribute('open'); }

  _render() {
    this.shadowRoot.innerHTML = `
      <div class="backdrop"></div>
      <div class="modal-container">
        <div class="header">
          <h2>Crear Nueva Lista</h2>
          <button class="close-btn" id="btn-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="form">
          <div class="field">
            <label>Nombre de la lista</label>
            <input type="text" id="input-title" placeholder="Ej. Favoritas del año">
          </div>
          <div class="field">
            <label>Descripción</label>
            <textarea id="input-description" placeholder="Añade una descripción (opcional)..."></textarea>
          </div>
          <button class="create-btn" id="btn-create">Crear Lista</button>
        </div>
      </div>
    `;

    this.shadowRoot.getElementById('btn-close').onclick = () => this.close();
    this.shadowRoot.querySelector('.backdrop').onclick = () => this.close();

    this.shadowRoot.getElementById('btn-create').onclick = () => {
      const payload = {
        title: this.shadowRoot.getElementById('input-title')?.value || '',
        description: this.shadowRoot.getElementById('input-description')?.value || '',
      };

      if (!payload.title.trim()) {
          alert('Por favor, ingresa un nombre para la lista.');
          return;
      }

      this.dispatchEvent(new CustomEvent('list-create', {
        detail: payload,
        bubbles: true,
        composed: true,
      }));

      this.close();
    };
  }
}

if (!customElements.get('create-list-modal')) {
  customElements.define('create-list-modal', CreateListModal);
}