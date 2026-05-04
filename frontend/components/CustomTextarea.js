const customTextareaSheet = new CSSStyleSheet();

customTextareaSheet.replaceSync(`
:host {
  display: block;
  width: 100%;
  font-family: 'Inter', sans-serif;
}

.textarea-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  box-sizing: border-box;
}

.textarea-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #374151);
  display: flex;
  align-items: center;
  gap: 6px;
}

textarea {
  width: 100%;
  height: 100px;
  padding: 12px 14px;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  background-color: var(--bg-color, #ffffff);
  color: var(--text-primary, #1f2937);
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s, background-color 0.2s;
}

textarea::placeholder {
  color: #9ca3af;
}

textarea:focus {
  border-color: var(--primary-color, #3b82f6);
  background-color: var(--border-color, #f3f4f6);
}
`);

class CustomTextarea extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [customTextareaSheet];
    this._value = '';
  }

  static get observedAttributes() {
    return ['label', 'placeholder', 'value'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'value') {
        this._value = newValue;
        if (this.textarea && this.textarea.value !== newValue) {
          this.textarea.value = newValue;
        }
      } else {
        // Re-renderizar si se cambia el label o el placeholder
        this._render();
      }
    }
  }

  connectedCallback() {
    this._value = this.getAttribute('value') || '';
    this._render();
  }

  get value() {
    return this._value;
  }

  set value(val) {
    this.setAttribute('value', val);
  }

  _render() {
    const label = this.getAttribute('label') || '';
    const placeholder = this.getAttribute('placeholder') || '';

    const labelHtml = label ? `<label class="textarea-label">${label}</label>` : '';

    this.shadowRoot.innerHTML = `
      <div class="textarea-group">
        ${labelHtml}
        <textarea placeholder="${placeholder}">${this._value}</textarea>
      </div>
    `;

    this.textarea = this.shadowRoot.querySelector('textarea');

    // Se escucha al input y se crea un custom event para propagar el cambio
    this.textarea.addEventListener('input', (e) => {
      this._value = e.target.value;

      this.dispatchEvent(new CustomEvent('textarea-changed', {
        detail: { value: this._value },
        bubbles: true,
        composed: true
      }));
    });
  }
}

if (!customElements.get('custom-textarea')) {
  customElements.define('custom-textarea', CustomTextarea);
}
