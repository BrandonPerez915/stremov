const starsInputSheet = new CSSStyleSheet();

starsInputSheet.replaceSync(`
:host {
  display: block;
}

.rate-stars {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 10px 0 20px 0;
}

.star-icon {
  font-family: 'Material Symbols Outlined';
  font-size: 36px;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  font-variation-settings: 'FILL' 0;
  transition: color 0.2s, transform 0.1s;
  user-select: none; /* Evita que el texto se seleccione al hacer doble clic rápido */
}

.star-icon:hover {
  transform: scale(1.1);
}

.star-icon.filled {
  color: #f5c518; /* Amarillo */
  font-variation-settings: 'FILL' 1;
}
`);

class StarsInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [starsInputSheet];
    this._value = 0;
  }

  static get observedAttributes() {
    return ['value'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'value' && oldValue !== newValue) {
      this._value = parseInt(newValue) || 0;
      this._updateStars();
    }
  }

  connectedCallback() {
    this._value = parseInt(this.getAttribute('value')) || 0;
    this._render();
    this._setupListeners();
    this._updateStars();
  }

  // Getter y Setter para poder acceder desde JS fácilmente: element.value = 4
  get value() {
    return this._value;
  }

  set value(val) {
    this.setAttribute('value', val);
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <div class="rate-stars">
        <span class="star-icon" data-value="1">star</span>
        <span class="star-icon" data-value="2">star</span>
        <span class="star-icon" data-value="3">star</span>
        <span class="star-icon" data-value="4">star</span>
        <span class="star-icon" data-value="5">star</span>
      </div>
    `;
    this.stars = this.shadowRoot.querySelectorAll('.star-icon');
  }

  _setupListeners() {
    this.stars.forEach(star => {
      star.addEventListener('click', (e) => {
        const rating = parseInt(e.target.getAttribute('data-value'));

        // Actualizamos el atributo, lo que disparará el attributeChangedCallback
        this.value = rating;

        // Emitimos un evento personalizado para que el padre se entere del cambio
        this.dispatchEvent(new CustomEvent('rating-changed', {
          detail: { rating: this.value },
          bubbles: true,
          composed: true
        }));
      });
    });
  }

  _updateStars() {
    if (!this.stars) return;

    this.stars.forEach(star => {
      const starValue = parseInt(star.getAttribute('data-value'));
      if (starValue <= this._value) {
        star.classList.add('filled');
      } else {
        star.classList.remove('filled');
      }
    });
  }
}

if (!customElements.get('stars-input')) {
  customElements.define('stars-input', StarsInput);
}
