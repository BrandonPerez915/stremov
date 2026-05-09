import { updateReview, deleteReview } from '../scripts/api.js';

const userReviewCardSheet = new CSSStyleSheet();

userReviewCardSheet.replaceSync(`
  :host {
    display: block;
    font-family: 'Inter', sans-serif;
  }

  /*  Card  */
  .review-card {
    display: flex;
    gap: 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border-color, #3a3f4c);
    border-radius: 18px;
    padding: 16px;
    transition: border-color 0.2s ease;
    cursor: pointer;
  }

  .review-card:hover { border-color: rgba(255,255,255,0.18); }

  /*  Poster  */
  .movie-poster {
    flex-shrink: 0;
    width: 64px;
    height: 96px;
    border-radius: 10px;
    object-fit: cover;
    box-shadow: 0 4px 14px rgba(0,0,0,0.4);
  }

  /*  Body  */
  .card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }

  .movie-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary, #fff);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /*  Stars  */
  .stars-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .stars {
    display: flex;
    gap: 2px;
  }

  .star {
    font-family: 'Material Symbols Outlined';
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    font-size: 16px;
    color: #f5c518;
  }

  .score-label {
    font-size: 12px;
    color: var(--text-secondary, #888);
  }

  /*  Review text  */
  .review-text {
    font-size: 13px;
    color: var(--text-secondary, #8b8e98);
    line-height: 1.5;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .review-date {
    font-size: 11px;
    color: var(--text-secondary, #888);
    opacity: 0.7;
    margin-top: auto;
  }

  /*  Actions (own profile)  */
  .card-actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }

  .action-btn {
    background: none;
    border: 1px solid var(--border-color, #3a3f4c);
    border-radius: 8px;
    color: var(--text-secondary, #888);
    cursor: pointer;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    font-family: 'Material Symbols Outlined';
    font-variation-settings: 'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24;
    font-size: 18px;
  }

  .action-btn:hover { color: var(--text-primary, #fff); border-color: rgba(255,255,255,0.3); }
  .action-btn.danger:hover { color: #ef4444; border-color: #ef4444; background: rgba(239,68,68,0.08); }

  /*  Edit modal overlay  */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(6px);
    z-index: 9999;
    display: grid;
    place-items: center;
    padding: 24px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }

  .modal-overlay.open {
    opacity: 1;
    pointer-events: auto;
  }

  .modal-panel {
    background: var(--bg-color, #1f2128);
    border: 1px solid var(--border-color, #3a3f4c);
    border-radius: 20px;
    padding: 28px;
    width: min(460px, 100%);
    display: flex;
    flex-direction: column;
    gap: 18px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    transform: translateY(8px);
    transition: transform 0.2s ease;
  }

  .modal-overlay.open .modal-panel { transform: translateY(0); }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .modal-header h3 { margin: 0; font-size: 18px; color: var(--text-primary, #fff); }

  .modal-close {
    background: none;
    border: 1px solid var(--border-color, #3a3f4c);
    border-radius: 50%;
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-secondary, #888);
    font-family: 'Material Symbols Outlined';
    font-size: 18px;
  }

  .modal-close:hover { color: var(--text-primary, #fff); }

  /* Interactive stars in modal */
  .star-row-interactive {
    display: flex;
    justify-content: center;
    gap: 10px;
    padding: 4px 0;
  }

  .star-interactive {
    font-family: 'Material Symbols Outlined';
    font-size: 32px;
    cursor: pointer;
    color: var(--border-color, #3a3f4c);
    font-variation-settings: 'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24;
    transition: color 0.15s ease, transform 0.1s ease;
    user-select: none;
  }

  .star-interactive:hover { transform: scale(1.15); }
  .star-interactive.filled {
    color: #f5c518;
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  /* Textarea */
  .review-textarea {
    width: 100%;
    min-height: 100px;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border-color, #3a3f4c);
    border-radius: 12px;
    color: var(--text-primary, #fff);
    padding: 12px 14px;
    font-family: inherit;
    font-size: 14px;
    resize: vertical;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.15s ease;
  }

  .review-textarea:focus { border-color: var(--primary-color, #3e5eff); }
  .review-textarea::placeholder { color: var(--text-secondary, #888); }

  /* Modal buttons */
  .modal-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .btn {
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    font-family: inherit;
    transition: opacity 0.15s ease;
  }

  .btn:hover:not(:disabled) { opacity: 0.85; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-primary { background: var(--primary-color, #3e5eff); color: white; }
  .btn-secondary { background: transparent; border: 1px solid var(--border-color, #3a3f4c); color: var(--text-primary, #fff); }
  .btn-danger { background: rgba(239,68,68,0.12); border: 1px solid #ef4444; color: #ef4444; }

  /* Confirm delete modal */
  .confirm-text {
    color: var(--text-secondary, #888);
    font-size: 14px;
    line-height: 1.6;
    margin: 0;
  }
`);

class UserReviewCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [userReviewCardSheet];

    this._editOpen    = false;
    this._deleteOpen  = false;
    this._editScore   = 0;
    this._editText    = ''; //texto temporal del textarea
    this._textDirty   = false; // Flag: ha modificado el textarea
    this._saving      = false;
    this._deleting    = false;
  }

  static get observedAttributes() {
    return ['rating', 'review-text', 'movie-title', 'movie-poster',
            'movie-tmdb-id', 'movie-type', 'date', 'own-profile', 'review-id'];
  }

  attributeChangedCallback() { if (this.isConnected) this._render(); }
  connectedCallback() { this._render(); }

  //  Helpers 
  _attr(name, fallback = '') { return this.getAttribute(name) ?? fallback; }

  _starsHTML(score, max = 5) {
    // Convertir score 1-10 a 5 estrellas para display
    const filled = score;
    return Array.from({ length: 5 }, (_, i) =>
      `<span class="star" style="${i >= filled ? 'color:var(--border-color,#3a3f4c);font-variation-settings:"FILL" 0' : ''}">star</span>`
    ).join('');
  }

  //  Render 
  _render() {
    const rating     = parseInt(this._attr('rating', '0'));
    const text       = this._attr('review-text');
    const title      = this._attr('movie-title', 'Unknown movie');
    const poster     = this._attr('movie-poster', '');
    const date       = this._attr('date');
    const isOwn      = this.hasAttribute('own-profile');

    this.shadowRoot.innerHTML = `
      <div class="review-card" id="card">
        <img class="movie-poster" src="${poster}" alt="${title}">

        <div class="card-body">
          <div class="card-top">
            <h3 class="movie-title" title="${title}">${title}</h3>
            ${isOwn ? `
              <div class="card-actions">
                <button class="action-btn" id="edit-btn" title="Edit review">edit</button>
                <button class="action-btn danger" id="delete-btn" title="Delete review">delete</button>
              </div>
            ` : ''}
          </div>

          <div class="stars-row">
            <div class="stars">${this._starsHTML(rating)}</div>
            <span class="score-label">${rating}/5</span>
          </div>

          ${text ? `<p class="review-text">${text}</p>` : ''}
          ${date ? `<span class="review-date">${date}</span>` : ''}
        </div>
      </div>

      <!-- Edit modal -->
      ${this._editOpen ? this._editModalHTML(rating, text) : ''}

      <!-- Delete confirm modal -->
      ${this._deleteOpen ? this._deleteModalHTML(title) : ''}
    `;

    this._bindEvents();
  }

  _editModalHTML(currentRating, currentText) {
    // Convertir score 1-10 a estrellas 1-5 para el editor
    this._editScore = this._editScore || this._scoreToStars(currentRating);
    // Si ya interactuó con el textarea (_textDirty), usar _editText (puede estar vacío)
    // Si no ha interactuado, usar currentText original
    const textValue = this._textDirty ? this._editText : (currentText || '');
    
    const stars = Array.from({ length: 5 }, (_, i) => {
      const val = i + 1;
      const filled = val <= this._editScore;
      return `<span class="star-interactive${filled ? ' filled' : ''}" data-value="${val}">star</span>`;
    }).join('');

    return `
      <div class="modal-overlay open" id="edit-overlay">
        <div class="modal-panel">
          <div class="modal-header">
            <h3>Edit review</h3>
            <button class="modal-close" id="edit-close">close</button>
          </div>

          <div class="star-row-interactive" id="star-row">${stars}</div>

          <textarea
            class="review-textarea"
            id="edit-textarea"
            placeholder="Write your thoughts... (optional)"
          >${textValue}</textarea>

          <div class="modal-actions">
            <button class="btn btn-secondary" id="edit-cancel">Cancel</button>
            <button class="btn btn-primary" id="edit-save" ${this._saving ? 'disabled' : ''}>
              ${this._saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _deleteModalHTML(title) {
    return `
      <div class="modal-overlay open" id="delete-overlay">
        <div class="modal-panel">
          <div class="modal-header">
            <h3>Delete review</h3>
            <button class="modal-close" id="delete-close">close</button>
          </div>
          <p class="confirm-text">
            Are you sure you want to delete your review for <strong>${title}</strong>?
            This action cannot be undone.
          </p>
          <div class="modal-actions">
            <button class="btn btn-secondary" id="delete-cancel">Cancel</button>
            <button class="btn btn-danger" id="delete-confirm" ${this._deleting ? 'disabled' : ''}>
              ${this._deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ── Events ───────────────────────────────────────────────────────
  _bindEvents() {
    const card = this.shadowRoot.getElementById('card');

    // Click en la card → abrir movie modal
    card?.addEventListener('click', (e) => {
      // No propagar si viene de los botones de acción
      if (e.target.closest('.card-actions')) return;

      const tmdbId = this._attr('movie-tmdb-id');
      const type   = this._attr('movie-type', 'movies');
      if (!tmdbId) return;

      document.dispatchEvent(new CustomEvent('movie-clicked', {
        detail: { movieId: tmdbId, type },
        bubbles: true,
        composed: true
      }));
    });

    // Edit button
    this.shadowRoot.getElementById('edit-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      // Resetear a estrellas actuales (1-5) al abrir
      this._editScore = parseInt(this._attr('rating', '0'));
      this._editText = ''; // Limpiar texto temporal
      this._textDirty = false; // Resetear flag
      this._editOpen  = true;
      this._render();
    });

    // Delete button
    this.shadowRoot.getElementById('delete-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._deleteOpen = true;
      this._render();
    });

    //  Edit modal events 
    this.shadowRoot.getElementById('edit-close')?.addEventListener('click', () => {
      this._editOpen = false; this._editText = ''; this._textDirty = false; this._render();
    });
    this.shadowRoot.getElementById('edit-cancel')?.addEventListener('click', () => {
      this._editOpen = false; this._editText = ''; this._textDirty = false; this._render();
    });
    this.shadowRoot.getElementById('edit-overlay')?.addEventListener('click', (e) => {
      if (e.target === this.shadowRoot.getElementById('edit-overlay')) {
        this._editOpen = false; this._editText = ''; this._textDirty = false; this._render();
      }
    });

    // Interactive stars
    this.shadowRoot.querySelectorAll('.star-interactive').forEach(star => {
      star.addEventListener('click', () => {
        // Guardar el texto actual del textarea antes de re-renderizar
        const textarea = this.shadowRoot.getElementById('edit-textarea');
        if (textarea) {
          this._editText = textarea.value;
          this._textDirty = true; // Marcar que el usuario ya interactuó
        }
        
        this._editScore = parseInt(star.dataset.value);
        this._render();
      });
    });

    // Save edit
    this.shadowRoot.getElementById('edit-save')?.addEventListener('click', () => this._handleSave());

    //  Delete modal events 
    this.shadowRoot.getElementById('delete-close')?.addEventListener('click', () => {
      this._deleteOpen = false; this._render();
    });
    this.shadowRoot.getElementById('delete-cancel')?.addEventListener('click', () => {
      this._deleteOpen = false; this._render();
    });
    this.shadowRoot.getElementById('delete-overlay')?.addEventListener('click', (e) => {
      if (e.target === this.shadowRoot.getElementById('delete-overlay')) {
        this._deleteOpen = false; this._render();
      }
    });
    this.shadowRoot.getElementById('delete-confirm')?.addEventListener('click', () => this._handleDelete());
  }

  async _handleSave() {
    const movieId = this._attr('review-id');
    if (!movieId) return;

    const textarea = this.shadowRoot.getElementById('edit-textarea');
    const body     = textarea?.value.trim() || '';

    if (!this._editScore) {
      window.toast?.({ type: 'error', title: 'Please select a score', duration: 2500 });
      return;
    }

    this._saving = true;
    // NO renderizar aquí - evita el flash del texto viejo

    try {
      await updateReview(movieId, { score: this._editScore, body });

      // Actualizar atributo con el score real (1-10)
      this.setAttribute('rating', this._editScore);
      if (body) this.setAttribute('review-text', body);

      // LUEGO cerrar modal y re-renderizar
      this._editOpen = false;
      this._editText = ''; // Limpiar texto temporal
      this._textDirty = false; // Resetear flag
      this._saving   = false;
      this._render();

      window.toast?.({ type: 'success', title: 'Review updated', duration: 2500 });

      // Notify parent to refresh if needed
      this.dispatchEvent(new CustomEvent('review-updated', {
        detail: { movieId, score: this._editScore, body },
        bubbles: true, composed: true
      }));
    } catch (err) {
      this._saving = false;
      this._render();
      window.toast?.({ type: 'error', title: 'Could not save', message: err.message, duration: 3000 });
    }
  }

  async _handleDelete() {
    const movieId = this._attr('review-id');
    if (!movieId) return;

    this._deleting = true;
    this._render();

    try {
      await deleteReview(movieId);

      window.toast?.({ type: 'success', title: 'Review deleted', duration: 2500 });

      this.dispatchEvent(new CustomEvent('review-deleted', {
        detail: { movieId },
        bubbles: true, composed: true
      }));

      // Remove card from DOM
      this.remove();
    } catch (err) {
      this._deleting = false;
      this._render();
      window.toast?.({ type: 'error', title: 'Could not delete', message: err.message, duration: 3000 });
    }
  }
}

if (!customElements.get('user-review-card')) {
  customElements.define('user-review-card', UserReviewCard);
}