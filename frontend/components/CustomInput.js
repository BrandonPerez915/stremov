const inputSheet = new CSSStyleSheet();

// Extraemos los estilos de tu CSS global que pertenecen únicamente al input
inputSheet.replaceSync(`
  :host {
    display: block;
    margin-bottom: 10px;
    font-family: 'Inter', sans-serif;
  }

  label {
    display: block;
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 10px;
    font-weight: 400;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .icon {
    position: absolute;
    left: 15px;
    color: var(--text-secondary);
    width: 18px;
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

  .input-wrapper:active .icon,
  .input-wrapper:focus-within .icon,
  input:not(:placeholder-shown) ~ .icon {
    color: var(--primary-color);
  }

  input {
    width: 100%;
    padding: var(--input-padding, 16px 16px 16px 45px);
    background: transparent;
    border: 1px solid var(--borders-color);
    border-radius: 6px;
    color: var(--text-primary);
    font-size: 16px;
    outline: none;
    transition: border 0.3s ease;
    font-family: inherit;
  }

  input:focus {
    border-color: var(--primary-color);
  }

  /* Esto es para sobreescribir los defectos por default al autocompletar */
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px var(--bg-color, #121212) inset !important;
    -webkit-text-fill-color: var(--text-primary) !important;
    border: 1px solid var(--borders-color) !important;
    transition: background-color 5000s ease-in-out 0s;
  }

  /* --- Estados de Error --- */
  .error-text {
    color: var(--red-100);
    font-size: 12px;
    font-weight: 500;
    margin-left: 6px;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(-5px); }
    to { opacity: 1; transform: translateX(0); }
  }

  :host([invalid]) input {
    border-color: var(--red-100) !important;
  }

  :host([invalid]) .icon {
    color: var(--red-100) !important;
  }
`);

class CustomInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [inputSheet];
  }

  connectedCallback() {
    this._render();
    this._setupListeners();
  }

  _render() {
    const label = this.getAttribute('label') || '';
    const type = this.getAttribute('type') || 'text';
    const name = this.getAttribute('name') || '';
    const placeholder = this.getAttribute('placeholder') || ' ';
    const icon = this.getAttribute('icon') || '';
    const required = this.hasAttribute('required') ? 'required' : '';
    const minlength = this.getAttribute('minlength') ? `minlength="${this.getAttribute('minlength')}"` : '';

    const labelHTML = label ? `<label>${label}<span class="error-container"></span></label>` : '';

    this.shadowRoot.innerHTML = `
      <div class="form-group">
        ${labelHTML}
        <div class="input-wrapper">
          <input
            type="${type}"
            name="${name}"
            placeholder="${placeholder}"
            ${required}
            ${minlength}
          >
          <span class="icon">${icon}</span>
        </div>
      </div>
    `;

    this.inputEl = this.shadowRoot.querySelector('input');
    this.errorContainer = this.shadowRoot.querySelector('.error-container');
  }

  _setupListeners() {
    // Cuando el usuario escribe se limpia el error automáticamente
    this.inputEl.addEventListener('input', () => this.clearError());
  }

  _updateValue(newValue) {
    this.inputEl.value = newValue;
  }

  showError(message) {
    // El error solo se muestra si el input tiene label
    if(!this.errorContainer) return;

    this.setAttribute('invalid', '');
    this.errorContainer.innerHTML = `<span class="error-text">- ${message}</span>`;
  }

  clearError() {
    // Si no hay contenedor de error, no se puede limpiar el error
    if(!this.errorContainer) return;

    this.removeAttribute('invalid');
    this.errorContainer.innerHTML = '';
  }

  // Exponer las propiedades nativas
  get value() { return this.inputEl.value; }
  get validity() { return this.inputEl.validity; }
  checkValidity() { return this.inputEl.checkValidity(); }
}

if (!customElements.get('custom-input')) {
  customElements.define('custom-input', CustomInput);
}
