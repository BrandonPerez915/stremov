const modalSheet = new CSSStyleSheet();

modalSheet.replaceSync(`
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

  .header h2 { margin: 0; font-size: 22px; font-weight: 800; }

  .close-btn {
    cursor: pointer;
    color: #666;
    background: none;
    border: none;
    padding: 5px;
    display: flex;
  }

  .close-btn:hover { color: white; }

  /* Estilos del Formulario */
  .photo-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }

  .avatar-preview {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    object-fit: cover;
    background-color: #222;
  }

  .form { display: flex; flex-direction: column; gap: 15px; }

  .field { display: flex; flex-direction: column; gap: 6px; }

  label { font-size: 11px; font-weight: 700; color: #555; text-transform: uppercase; }

  input, textarea {
    background-color: #1a1a1a;
    border: 1px solid #222;
    border-radius: 10px;
    padding: 12px;
    color: white;
    font-family: inherit;
    outline: none;
  }

  input:focus, textarea:focus { border-color: #00d2ff; }

  textarea { height: 80px; resize: none; }

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
  }

  .help-bubble {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 28px;
    height: 28px;
    background-color: #00d2ff;
    color: #000;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 14px;
  }
`);

class EditProfileModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [modalSheet];
    this._render();
  }

  static get observedAttributes() {
    return ['open', 'name', 'username', 'bio', 'avatar'];
  }

  attributeChangedCallback() {
    this._update();
  }

  open() { this.setAttribute('open', ''); }
  close() { this.removeAttribute('open'); }

  _update() {
    const nameInput = this.shadowRoot.getElementById('input-name');
    const userInput = this.shadowRoot.getElementById('input-user');
    const bioInput = this.shadowRoot.getElementById('input-bio');
    const avatarImg = this.shadowRoot.querySelector('.avatar-preview');

    if (nameInput) nameInput.value = this.getAttribute('name') || '';
    if (userInput) userInput.value = this.getAttribute('username') || '';
    if (bioInput) bioInput.value = this.getAttribute('bio') || '';
    if (avatarImg) avatarImg.src = this.getAttribute('avatar') || '';
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <div class="backdrop"></div>
      <div class="modal-container">
        <div class="header">
          <h2>Edit Profile</h2>
          <button class="close-btn" id="btn-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="photo-section">
          <img class="avatar-preview" alt="User">
        </div>

        <div class="form">
          <div class="field">
            <label>Name</label>
            <input type="text" id="input-name" placeholder="Tu nombre">
          </div>
          <div class="field">
            <label>Username</label>
            <input type="text" id="input-user" placeholder="@username">
          </div>
          <div class="field">
            <label>Bio</label>
            <textarea id="input-bio"></textarea>
          </div>
          <button class="save-btn" id="btn-save">Save Changes</button>
        </div>

        <div class="help-bubble">?</div>
      </div>
    `;

    this.shadowRoot.getElementById('btn-close').onclick = () => this.close();
    this.shadowRoot.querySelector('.backdrop').onclick = () => this.close();

    this.shadowRoot.getElementById('btn-save').onclick = () => {
      const payload = {
        name: this.shadowRoot.getElementById('input-name')?.value || '',
        username: this.shadowRoot.getElementById('input-user')?.value || '',
        bio: this.shadowRoot.getElementById('input-bio')?.value || '',
      };

      this.dispatchEvent(new CustomEvent('profile-save', {
        detail: payload,
        bubbles: true,
        composed: true,
      }));

      this.close();
    };

    this._update();
  }
}

if (!customElements.get('edit-profile-modal')) {
  customElements.define('edit-profile-modal', EditProfileModal);
}
