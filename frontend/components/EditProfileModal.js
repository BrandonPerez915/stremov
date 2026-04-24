const modalSheet = new CSSStyleSheet();

modalSheet.replaceSync(`
  :host {
    
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    font-family: 'Inter', -apple-system, sans-serif;
  }

  
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

  .change-link {
    color: #00d2ff;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
  }
  
  .change-link:hover {
    color: white;
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

  .form-actions {
    display: flex;
    gap: 10px;
    margin-top: 10px;
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
    flex: 1;
  }

  .delete-btn {
  background-color: transparent;
  color: #ff4d4d;
  border: 1px solid #ff4d4d;
  border-radius: 10px;
  padding: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  flex: 1;
  transition: background-color 0.2s;
}

.delete-btn:hover {
  background-color: rgba(255, 77, 77, 0.1);
}

.confirm-overlay {
  display: none;
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 20px;
  z-index: 20;
  align-items: center;
  justify-content: center;
}

.confirm-overlay.visible {
  display: flex;
}

.confirm-box {
  background-color: #1a1a1a;
  border: 1px solid #333;
  border-radius: 16px;
  padding: 28px 24px;
  text-align: center;
  width: 80%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.confirm-box p {
  margin: 0;
  font-size: 15px;
  color: #ccc;
  line-height: 1.5;
}

.confirm-box strong {
  color: white;
  font-size: 18px;
}

.confirm-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.confirm-cancel {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #444;
  background: transparent;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.confirm-delete {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background-color: #ff4d4d;
  color: white;
  font-weight: 700;
  cursor: pointer;
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
          <h2>Editar Perfil</h2>
          <button class="close-btn" id="btn-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="photo-section">
          <img class="avatar-preview" alt="User">
          <span class="change-link">Cambiar foto</span>
          <input type="file" id="input-photo" accept="image/*" style="display: none;">
        </div>

        <div class="form">
          <div class="field">
            <label>Nombre</label>
            <input type="text" id="input-name" placeholder="Tu nombre">
          </div>
          <div class="field">
            <label>Usuario</label>
            <input type="text" id="input-user" placeholder="@username">
          </div>
          <div class="field">
            <label>Bio</label>
            <textarea id="input-bio"></textarea>
          </div>
          <div class="form-actions">
            <button class="delete-btn" id="btn-delete">Eliminar Usuario</button>
            <button class="save-btn" id="btn-save">Guardar Cambios</button>
          </div>

          <div class="confirm-overlay" id="confirm-overlay">
            <div class="confirm-box">
              <strong>¿Eliminar cuenta?</strong>
              <p>Esta acción es permanente y no se puede deshacer.</p>
              <div class="confirm-actions">
                <button class="confirm-cancel" id="btn-cancel-delete">Cancelar</button>
                <button class="confirm-delete">Eliminar</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    const changeLink = this.shadowRoot.querySelector('.change-link');
    const inputPhoto = this.shadowRoot.getElementById('input-photo');
    const avatarPreview = this.shadowRoot.querySelector('.avatar-preview');

    changeLink.addEventListener('click', () => {
      inputPhoto.click();
    });

    inputPhoto.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          avatarPreview.src = event.target.result; //muestra la foto en el circulito
        };
        reader.readAsDataURL(file);
      }
    });

    this.shadowRoot.getElementById('btn-close').onclick = () => this.close();
    this.shadowRoot.querySelector('.backdrop').onclick = () => this.close();

    this.shadowRoot.getElementById('btn-save').onclick = () => {
      const payload = {
        name: this.shadowRoot.getElementById('input-name')?.value || '',
        username: this.shadowRoot.getElementById('input-user')?.value || '',
        bio: this.shadowRoot.getElementById('input-bio')?.value || '',
        avatar: this.shadowRoot.querySelector('.avatar-preview')?.src || ''
      };

      this.dispatchEvent(new CustomEvent('profile-save', {
        detail: payload,
        bubbles: true,
        composed: true,
      }));

      this.close();
    };

    this.shadowRoot.getElementById('btn-delete').onclick = () => {
      this.shadowRoot.getElementById('confirm-overlay').classList.add('visible');
    };

    this.shadowRoot.getElementById('btn-cancel-delete').onclick = () => {
      this.shadowRoot.getElementById('confirm-overlay').classList.remove('visible');
    };

    this.shadowRoot.querySelector('.confirm-delete').onclick = () => {
      window.location.href = '../views/landing.html';
    };

    this._update();
  }
}

if (!customElements.get('edit-profile-modal')) {
  customElements.define('edit-profile-modal', EditProfileModal);
}
