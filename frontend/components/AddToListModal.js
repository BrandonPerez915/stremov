const addToListModalSheet = new CSSStyleSheet();

addToListModalSheet.replaceSync(`
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(6px);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    font-family: 'Inter', sans-serif;
  }

  .overlay.open {
    opacity: 1;
    pointer-events: auto;
  }

  .panel {
    background: var(--bg-color, #1f2128);
    border: 1px solid var(--border-color, #3a3f4c);
    border-radius: 20px;
    padding: 28px;
    width: min(420px, 90vw);
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 24px 60px rgba(0,0,0,0.5);
    transform: translateY(8px) scale(0.98);
    transition: transform 0.2s ease;
  }

  .overlay.open .panel {
    transform: translateY(0) scale(1);
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 6px;
  }

  .panel-header h3 {
    color: var(--text-primary, #fff);
    font-size: 1.1rem;
    margin: 0;
  }

  .movie-subtitle {
    color: var(--text-secondary, #888);
    font-size: 0.85rem;
    margin: 0 0 20px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .close-btn {
    background: none;
    border: none;
    color: var(--text-secondary, #888);
    cursor: pointer;
    font-size: 22px;
    font-family: 'Material Symbols Outlined';
    font-variation-settings: 'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24;
    line-height: 1;
    padding: 0;
    flex-shrink: 0;
  }

  .close-btn:hover { color: var(--text-primary, #fff); }

  .lists-container {
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-right: 4px;
  }

  .lists-container::-webkit-scrollbar { width: 4px; }
  .lists-container::-webkit-scrollbar-track { background: transparent; }
  .lists-container::-webkit-scrollbar-thumb {
    background: var(--border-color, #3a3f4c);
    border-radius: 4px;
  }

  .list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid var(--border-color, #3a3f4c);
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
    background: transparent;
    width: 100%;
    font-family: inherit;
    text-align: left;
  }

  .list-item:hover { background: rgba(255,255,255,0.04); }

  .list-item.in-list {
    border-color: var(--primary-color, #3e5eff);
    background: color-mix(in srgb, var(--primary-color) 10%, transparent);
  }

  .list-item-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .list-name {
    color: var(--text-primary, #fff);
    font-size: 0.95rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .list-count {
    color: var(--text-secondary, #888);
    font-size: 0.78rem;
  }

  .list-check {
    font-family: 'Material Symbols Outlined';
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    font-size: 22px;
    color: var(--primary-color, #3e5eff);
    opacity: 0;
    transition: opacity 0.15s ease;
    flex-shrink: 0;
  }

  .list-item.in-list .list-check { opacity: 1; }

  .empty-state {
    text-align: center;
    color: var(--text-secondary, #888);
    padding: 24px;
    font-size: 0.9rem;
  }

  .loading {
    text-align: center;
    color: var(--text-secondary, #888);
    padding: 24px;
    font-size: 0.9rem;
  }
`);

class AddToListModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [addToListModalSheet];
    this._mongoId    = null;
    this._tmdbId     = null;
    this._type       = 'movies'; // 'movies' | 'series'
    this._movieTitle = '';
    this._lists      = [];
    this._inListIds  = new Set();
  }

  connectedCallback() {
    this._render();
  }

  // movieData: { tmdbId, mongoId?, title, type }
  async open(movieData) {
    this._tmdbId     = movieData.tmdbId;
    this._mongoId    = movieData.mongoId || null;
    this._movieTitle = movieData.title || 'this title';
    this._type       = movieData.type || 'movies';

    const overlay = this.shadowRoot.querySelector('.overlay');
    overlay?.classList.add('open');
    document.body.style.overflow = 'hidden';

    await this._loadData();
  }

  close() {
    const overlay = this.shadowRoot.querySelector('.overlay');
    overlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <div class="overlay" id="overlay">
        <div class="panel">
          <div class="panel-header">
            <h3>Add to list</h3>
            <button class="close-btn" id="close-btn">close</button>
          </div>
          <p class="movie-subtitle" id="movie-subtitle"></p>
          <div class="lists-container" id="lists-container">
            <div class="loading">Loading your lists...</div>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.getElementById('close-btn')
      ?.addEventListener('click', () => this.close());

    this.shadowRoot.getElementById('overlay')
      ?.addEventListener('click', (e) => {
        if (e.target === this.shadowRoot.getElementById('overlay')) this.close();
      });
  }

  async _loadData() {
    const container = this.shadowRoot.getElementById('lists-container');
    const subtitle  = this.shadowRoot.getElementById('movie-subtitle');

    if (subtitle)   subtitle.textContent = this._movieTitle;
    if (container)  container.innerHTML = '<div class="loading">Loading your lists...</div>';

    try {
      // 1. findOrCreate en MongoDB si no tenemos el _id aún
      // La ruta depende de si es película o serie
      if (!this._mongoId && this._tmdbId) {
        const isSeries = this._type === 'series';
        const endpoint = isSeries
          ? `/api/tmdb/series/${this._tmdbId}`
          : `/api/tmdb/movies/${this._tmdbId}`;

        const res  = await fetch(endpoint);
        const data = await res.json();
        // Ambos endpoints devuelven { status, movie: {...} }
        this._mongoId = data.movie?._id || null;
      }

      if (!this._mongoId) {
        if (container) container.innerHTML = '<div class="empty-state">Could not find this title in our database.</div>';
        return;
      }

      // 2. Obtener listas del usuario sin Favoritos
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userId   = userData._id || userData.id;

      if (!userId) {
        if (container) container.innerHTML = '<div class="empty-state">Please log in to manage your lists.</div>';
        return;
      }

      const token    = localStorage.getItem('jwtToken');
      const headers  = token ? { 'Authorization': `Bearer ${token}` } : {};
      const listsRes = await fetch(`/api/lists/user/${userId}`, { headers });
      const listsData = await listsRes.json();

      this._lists = (listsData.lists || []).filter(l => l.name !== 'Favorites');

      // 3. Detectar en cuáles listas ya está
      this._inListIds = new Set();
      this._lists.forEach(list => {
        const movies = Array.isArray(list.movies) ? list.movies : [];
        const inList = movies.some(m => {
          const id = m._id || m.id || m;
          return id.toString() === this._mongoId.toString();
        });
        if (inList) this._inListIds.add(list._id || list.id);
      });

      this._renderLists();
    } catch (error) {
      console.error('AddToListModal error:', error);
      if (container) container.innerHTML = '<div class="empty-state">Something went wrong. Please try again.</div>';
    }
  }

  _renderLists() {
    const container = this.shadowRoot.getElementById('lists-container');
    if (!container) return;

    if (!this._lists.length) {
      container.innerHTML = '<div class="empty-state">You have no lists yet. Create one first!</div>';
      return;
    }

    container.innerHTML = '';

    this._lists.forEach(list => {
      const listId    = list._id || list.id;
      const isInList  = this._inListIds.has(listId);
      const movieCount = Array.isArray(list.movies) ? list.movies.length : 0;

      const btn = document.createElement('button');
      btn.className = `list-item${isInList ? ' in-list' : ''}`;
      btn.innerHTML = `
        <div class="list-item-info">
          <span class="list-name">${list.name}</span>
          <span class="list-count">${movieCount} movie${movieCount !== 1 ? 's' : ''}</span>
        </div>
        <span class="list-check">check_circle</span>
      `;

      btn.addEventListener('click', () => this._toggleMovie(listId, btn, movieCount));
      container.appendChild(btn);
    });
  }

  async _toggleMovie(listId, btn, currentCount) {
    const isInList = btn.classList.contains('in-list');
    const token    = localStorage.getItem('jwtToken');
    const headers  = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    try {
      if (isInList) {
        await fetch(`/api/lists/${listId}/movies/${this._mongoId}`, { method: 'DELETE', headers });
        btn.classList.remove('in-list');
        this._inListIds.delete(listId);
      } else {
        await fetch(`/api/lists/${listId}/movies/${this._mongoId}`, { method: 'POST', headers });
        btn.classList.add('in-list');
        this._inListIds.add(listId);
      }

      // Actualizar contador visualmente
      const countEl  = btn.querySelector('.list-count');
      const newCount = isInList ? currentCount - 1 : currentCount + 1;
      if (countEl) countEl.textContent = `${newCount} movie${newCount !== 1 ? 's' : ''}`;

      window.toast?.({
        type:     'success',
        title:    isInList ? 'Removed from list' : 'Added to list',
        message:  isInList ? 'Removed successfully.' : 'Added successfully.',
        duration: 2000
      });

      // Emitir evento global para que otras vistas (listDetail) puedan reaccionar
      document.dispatchEvent(new CustomEvent('list-membership-changed', {
        detail: {
          listId,
          movieId: this._mongoId,
          action: isInList ? 'removed' : 'added'
        }
      }));

    } catch (error) {
      console.error('Toggle error:', error);
      window.toast?.({ type: 'error', title: 'Error', message: 'Could not update list.', duration: 3000 });
    }
  }
}

if (!customElements.get('add-to-list-modal')) {
  customElements.define('add-to-list-modal', AddToListModal);
}