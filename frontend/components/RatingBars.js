const ratingBarsSheet = new CSSStyleSheet();

ratingBarsSheet.replaceSync(`
:host {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: 'Inter', sans-serif;
  width: 100%;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.star-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 400;
  color: var(--text-secondary, #6b7280);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  padding: 4px 8px;
  width: 45px;
  box-sizing: border-box;
}

.star-label .icon {
  font-size: 18px;
  color: var(--text-secondary, #6b7280);
  font-family: 'Material Symbols Outlined';
  font-variation-settings: 'FILL' 1;
}

.bar-track {
  flex-grow: 1;
  height: 8px;
  background-color: var(--border-color, #e5e7eb);
  border-radius: 10px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.4s ease-out;
}

.bar-fill {
  background-color: var(--primary-color, #3b82f6);
}

.bar-count {
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
  width: 35px;
  text-align: right;
}
`);

class RatingBars extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [ratingBarsSheet];
  }

  static get observedAttributes() {
    return ['ratings'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && name === 'ratings') {
      this._render();
    }
  }

  connectedCallback() {
    this._render();
  }

  // Utilidad para convertir 14000 en 14k, 3100 en 3.1k, etc.
  _formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    }
    return num;
  }

  _render() {
    // Obtenemos las calificaciones: se esperan 5 valores (De 5 estrellas a 1 estrella)
    const ratingsStr = this.getAttribute('ratings') || "0,0,0,0,0";
    const ratings = ratingsStr.split(',').map(s => parseInt(s.trim()) || 0);

    // Asegurarnos de que siempre haya 5 elementos
    while(ratings.length < 5) ratings.push(0);

    // Calcular el total
    const totalRating = ratings.reduce((sum, val) => sum + val, 0);

    let html = '';

    for (let i = 0; i < 5; i++) {
      const stars = 5 - i;
      const value = ratings[i];
      const percentage = totalRating > 0 ? (value / totalRating) * 100 : 0; // La barra más grande tendrá 100%
      const formattedValue = this._formatNumber(value);

      html += `
        <div class="bar-row">
          <div class="star-label">${stars} <span class="icon">star</span></div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${percentage}%;"></div>
          </div>
          <div class="bar-count">(${formattedValue})</div>
        </div>
      `;
    }

    this.shadowRoot.innerHTML = html;
  }
}

if (!customElements.get('rating-bars')) {
  customElements.define('rating-bars', RatingBars);
}
