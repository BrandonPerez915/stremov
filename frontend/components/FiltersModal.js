const filtersModalSheet = new CSSStyleSheet();

filtersModalSheet.replaceSync(`
  * {
    box-sizing: border-box;
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    font-family: 'Inter', sans-serif;
  }

  .modal-overlay.open {
    opacity: 1;
    pointer-events: auto;
  }

  .modal-content {
    background-color: #2b2b2b;
    border-radius: 12px;
    width: min(450px, 90vw);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
    transform: scale(0.98);
    transition: transform 0.2s ease;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .modal-overlay.open .modal-content {
    transform: scale(1);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 24px 24px 16px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .title-wrapper {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .modal-title {
    color: #ffffff;
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
  }

  .modal-subtitle {
    color: #a0a0a0;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .close-btn {
    background: none;
    border: none;
    color: #a0a0a0;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    transition: color 0.2s ease;
  }

  .close-btn:hover {
    color: #ffffff;
  }

  .modal-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .form-group-label {
    color: #cccccc;
    font-size: 0.85rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding-bottom: 6px;
  }

  .checkbox-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #ffffff;
    font-size: 0.9rem;
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .checkbox-label:hover {
    color: #e50914;
  }

  .checkbox-label input[type="checkbox"] {
    appearance: none;
    background-color: #1a1a1a;
    margin: 0;
    font: inherit;
    color: currentColor;
    width: 1.15em;
    height: 1.15em;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    display: grid;
    place-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .checkbox-label input[type="checkbox"]::before {
    content: "";
    width: 0.65em;
    height: 0.65em;
    transform: scale(0);
    transition: 120ms transform ease-in-out;
    box-shadow: inset 1em 1em white;
    background-color: white;
    transform-origin: center;
    clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
  }

  .checkbox-label input[type="checkbox"]:checked {
    background-color: #e50914;
    border-color: #e50914;
  }

  .checkbox-label input[type="checkbox"]:checked::before {
    transform: scale(1);
  }

  .modal-footer {
    padding: 16px 24px 24px 24px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .btn {
    padding: 10px 18px;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    font-family: inherit;
    transition: opacity 0.2s ease, background-color 0.2s ease;
  }

  .btn:hover {
    opacity: 0.9;
  }

  .btn-clear {
    background-color: transparent;
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .btn-apply {
    background-color: #ffffff;
    color: #141414;
  }
`);

class FiltersModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [filtersModalSheet];
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
  }

  open() {
    const overlay = this.shadowRoot.querySelector('.modal-overlay');
    overlay?.classList.add('open');
  }

  close() {
    const overlay = this.shadowRoot.querySelector('.modal-overlay');
    overlay?.classList.remove('open');
  }

  render() {
    this.shadowRoot.innerHTML = `
      <div class="modal-overlay" id="overlay">
        <div class="modal-content">
          <div class="modal-header">
            <div class="title-wrapper">
              <h2 class="modal-title">Filters</h2>
              <span class="modal-subtitle">SEARCH PREFERENCES</span>
            </div>
            <button class="close-btn" id="close-btn">✕</button>
          </div>

          <div class="modal-body">

            <div class="form-group">
              <div class="form-group-label">Type</div>
              <div class="checkbox-grid">
                <label class="checkbox-label"><input type="checkbox" name="type" value="movies" checked> Movies</label>
                <label class="checkbox-label"><input type="checkbox" name="type" value="series" checked> Series</label>
              </div>
            </div>

            <div class="form-group">
              <div class="form-group-label">Genre</div>
              <div class="checkbox-grid">
                <label class="checkbox-label"><input type="checkbox" name="genre" value="action" checked> Action</label>
                <label class="checkbox-label"><input type="checkbox" name="genre" value="comedy" checked> Comedy</label>
                <label class="checkbox-label"><input type="checkbox" name="genre" value="drama" checked> Drama</label>
                <label class="checkbox-label"><input type="checkbox" name="genre" value="horror" checked> Horror</label>
                <label class="checkbox-label"><input type="checkbox" name="genre" value="scifi" checked> Sci-Fi</label>
                <label class="checkbox-label"><input type="checkbox" name="genre" value="documentary" checked> Documentary</label>
              </div>
            </div>

            <div class="form-group">
              <div class="form-group-label">People</div>
              <div class="checkbox-grid">
                <label class="checkbox-label"><input type="checkbox" name="people" value="users" checked> Users</label>
                <label class="checkbox-label"><input type="checkbox" name="people" value="actors" checked> Actors</label>
                <label class="checkbox-label"><input type="checkbox" name="people" value="directors" checked> Directors</label>
              </div>
            </div>

          </div>

          <div class="modal-footer">
            <button class="btn btn-clear" id="clear-btn">Clear</button>
            <button class="btn btn-apply" id="apply-btn">Apply Filters</button>
          </div>
        </div>
      </div>
    `;
  }

  setupListeners() {
    const closeBtn = this.shadowRoot.getElementById('close-btn');
    const overlay = this.shadowRoot.getElementById('overlay');
    const clearBtn = this.shadowRoot.getElementById('clear-btn');
    const applyBtn = this.shadowRoot.getElementById('apply-btn');

    // Cerrar el modal con el botón X
    closeBtn?.addEventListener('click', () => this.close());

    // Cerrar al hacer click fuera del contenido (en el overlay)
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.close();
      }
    });

    // Limpiar todos los checkboxes
    clearBtn?.addEventListener('click', () => {
      const checkboxes = this.shadowRoot.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(cb => cb.checked = false);
    });

    // Función auxiliar para obtener valores seleccionados
    const getCheckedValues = (name) => {
      const checkedBoxes = this.shadowRoot.querySelectorAll(`input[name="${name}"]:checked`);
      return Array.from(checkedBoxes).map(cb => cb.value);
    };

    // Aplicar filtros y despachar evento personalizado
    applyBtn?.addEventListener('click', () => {
      const filters = {
        type: getCheckedValues('type'),
        genre: getCheckedValues('genre'),
        people: getCheckedValues('people')
      };

      this.dispatchEvent(new CustomEvent('filters-applied', {
        detail: filters,
        bubbles: true,
        composed: true
      }));

      this.close();
    });
  }
}

if (!customElements.get('filters-modal')) {
  customElements.define('filters-modal', FiltersModal);
}
