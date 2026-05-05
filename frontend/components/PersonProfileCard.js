const personProfileCardSheet = new CSSStyleSheet();

personProfileCardSheet.replaceSync(`
/* Contenedor principal que envuelve el texto y la imagen */
.profile-card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px; /* Espacio entre el texto y la foto */
  width: 100%;
  min-width: 130px;
  max-width: 200px;
  font-family: 'Inter', sans-serif;
}

/* --- Parte Superior: Texto fuera de la imagen --- */
.profile-text-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  padding: 0 4px;
  box-sizing: border-box;
}

.cast-name-modern {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  /* Ahora usa la variable de texto para adaptarse al tema oscuro/claro */
  color: var(--text-primary, #ffffff);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.cast-character-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.cast-character-prefix {
  font-size: 12px;
  color: var(--text-secondary, #888888);
  font-weight: 400;
}

.cast-character-modern {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

/* --- Contenedor de la Imagen (Mantiene el diseño anterior) --- */
.profile-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 12px 24px var(--shadow-color, rgba(0,0,0,0.3));
  border: 1px solid color-mix(in srgb, var(--border-color) 30%, transparent);
}

.cast-photo-modern {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cast-bottom-blur-layer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 35%;

  background: linear-gradient(
    to top,
    color-mix(in srgb, var(--bg-color) 80%, transparent) 0%,
    transparent 100%
  );

  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  -webkit-mask-image: linear-gradient(to top, black 40%, transparent 100%);
  mask-image: linear-gradient(to top, black 40%, transparent 100%);

  pointer-events: none;
}

/* --- Parte Inferior: Rol y Popularidad (Sobre el blur) --- */
.cast-bottom-info {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.cast-role-modern {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #ffffff); /* Se adapta gracias al fondo difuminado */
  text-transform: capitalize;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cast-popularity-badge {
  display: flex;
  align-items: center;
  gap: 4px;

  background: color-mix(in srgb, var(--bg-color) 80%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid color-mix(in srgb, var(--border-color) 40%, transparent);

  padding: 6px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.cast-popularity-badge .icon {
  font-family: 'Material Symbols Outlined';
  font-size: 16px;
  color: var(--primary-color);
  font-variation-settings: 'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24;
}

@media (max-width: 150px) {
  .cast-name-modern { font-size: 15px; }
  .cast-bottom-info { left: 10px; right: 10px; }
  .cast-role-modern { font-size: 11px; }
  .cast-popularity-badge { padding: 4px 8px; font-size: 11px; }
  .cast-popularity-badge .icon { font-size: 14px; }
}
`);

class PersonProfileCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [personProfileCardSheet];
  }

  static get observedAttributes() {
    return ['img-src', 'name', 'character', 'role', 'popularity', 'job'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this._render();
    }
  }

  connectedCallback() {
    this._render();
  }

  _render() {
    const imgSrc = this.getAttribute('img-src') || 'https://via.placeholder.com/400x533';
    const name = this.getAttribute('name') || 'Unknown';
    const character = this.getAttribute('character');
    const job = this.getAttribute('job');
    const role = this.getAttribute('role') || 'Actor';
    const popularity = this.getAttribute('popularity') || '0.0';

    this.shadowRoot.innerHTML = `
      <div class="profile-card-wrapper">

        <!-- TEXTO FUERA Y ARRIBA DE LA IMAGEN -->
        <div class="profile-text-header">
          <h3 class="cast-name-modern" title="${name}">${name}</h3>
          ${ character ? `
          <div class="cast-character-wrapper">
            <span class="cast-character-prefix">as</span>
            <span class="cast-character-modern">${character}</span>
          </div>
          ` : '' }
          ${ job && !character ? `
          <div class="cast-character-wrapper">
            <span class="cast-character-prefix">as</span>
            <span class="cast-character-modern">${job}</span>
          </div>
          ` : '' }
        </div>

        <!-- CONTENEDOR DE LA IMAGEN (Con sus efectos y botones) -->
        <div class="profile-image-container">
          <img src="${imgSrc}" alt="${name}" class="cast-photo-modern">

          <div class="cast-bottom-blur-layer"></div>

          <div class="cast-bottom-info">
            <span class="cast-role-modern">${role}</span>

            <div class="cast-popularity-badge">
              <span class="icon">trending_up</span>
              <span>${popularity}</span>
            </div>
          </div>
        </div>

      </div>
    `;
  }
}

if (!customElements.get('person-profile-card')) {
  customElements.define('person-profile-card', PersonProfileCard);
}
