/**
 * YourListsView.js
 * Ruta: frontend/components/YourListsView.js
 */

import { listService } from '../scripts/services/listService.js';

class YourListsView extends HTMLElement {
  constructor() {
    super();
    this.listsData = [];
  }

  connectedCallback() {
    if (!this._isRendered) {
      this._render();
      this._isRendered = true;
    }

    this._cacheElements();
    this._bindEvents();
    this.loadLists();
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._handleKeydown);
  }

	_isLoggedIn() {
		return !!localStorage.getItem('jwtToken');
		//!! para convertir a booleano ya que getItem puede devolver null o el string
	}

  _render() {
    this.innerHTML = `
      <main class="lists-page">
        <section class="lists-hero">
          <div class="lists-hero__copy">
            <p class="eyebrow">My collections</p>
            <h1>Manage your lists in one place</h1>
            <p class="lists-hero__description">
              Review your saved lists, create new collections.
            </p>
          </div>

          ${this._isLoggedIn() ? `
						<button class="create-list-btn" id="open-create-list-modal" type="button">
							<span class="icon">add</span>
							Create List
						</button>
					` : ''}
        </section>

        <section class="lists-grid-section">
          <div class="section-header">
            <div>
              <h2>Your lists</h2>
              <p id="lists-subtitle">Loading your lists...</p>
            </div>
          </div>

          <div class="lists-grid" id="lists-grid">
            ${this._skeletonHTML()}
          </div>
        </section>

        <create-list-modal id="create-list-modal"></create-list-modal>
      </main>
    `;
  }

  _skeletonHTML() {
    return Array.from({ length: 3 }, () => `
      <article class="list-card list-card--skeleton">
        <div class="list-card__cover"></div>
        <div class="list-card__body">
          <div class="skeleton-line skeleton-line--title"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
        </div>
      </article>
    `).join('');
  }

  _cacheElements() {
    this.listsGrid    = this.querySelector('#lists-grid');
    this.modal        = this.querySelector('#create-list-modal');
    this.openModalBtn = this.querySelector('#open-create-list-modal');
    this.subtitle     = this.querySelector('#lists-subtitle');
  }

  _getUserId() {
    try {
      const raw = localStorage.getItem('userData');
      if (raw) return JSON.parse(raw)?._id || JSON.parse(raw)?.id || null;
    } catch {}
    return null;
  }

  _bindEvents() {
    if (!this._openModalHandler) {
      this._openModalHandler = () => this.modal?.open();
    }

    if (!this._listCreatedHandler) {
      //createListModal emite { list: { name, description, ... } }
      this._listCreatedHandler = async (event) => {
        const listData = event.detail?.list || event.detail || {};
        const name = listData.name;
        const description = listData.description;

        if (!name) return;

        try {
          const response = await listService.createList({ name, description });
          // El backend responde con { status, list: { id, name, description, movies } }
          const newList = response.list || response;
          this.listsData = [newList, ...this.listsData];
          this._renderLists();
          window.toast?.({
            type: 'success',
            title: 'List created',
            message: `"${newList.name}" is ready.`
          });
        } catch (error) {
          console.error('Error creating list:', error);
          window.toast?.({
            type: 'error',
            title: 'Error',
            message: error.message || 'Could not create list.'
          });
        }
      };
    }

    if (!this._listClickedHandler) {
      this._listClickedHandler = (event) => {
        const listId = event.detail?.listId;
        if (!listId) return;
        window.location.href = `/list/${listId}`;
      };
    }

    if (!this._handleKeydown) {
      this._handleKeydown = (event) => {
        if (event.key === 'Escape') this.modal?.close();
      };
    }

    //limpiar antes de volver a añadir — evita listeners duplicados
    this.openModalBtn?.removeEventListener('click', this._openModalHandler);
    this.modal?.removeEventListener('list-created', this._listCreatedHandler);
    this.listsGrid?.removeEventListener('list-clicked', this._listClickedHandler);
    document.removeEventListener('keydown', this._handleKeydown);

    this.openModalBtn?.addEventListener('click', this._openModalHandler);
    this.modal?.addEventListener('list-created', this._listCreatedHandler);
    this.listsGrid?.addEventListener('list-clicked', this._listClickedHandler);
    document.addEventListener('keydown', this._handleKeydown);
  }

  _renderLists() {
    if (!this.listsGrid) return;

    this.listsGrid.innerHTML = '';

    if (!this.listsData.length) {
      this.listsGrid.innerHTML = `
        <article class="empty-state">
          <h3>No lists yet</h3>
          <p>Create your first list to start organizing movies.</p>
        </article>
      `;
      if (this.subtitle) this.subtitle.textContent = '0 lists found.';
      return;
    }

    if (this.subtitle) {
      this.subtitle.textContent = `${this.listsData.length} list${this.listsData.length !== 1 ? 's' : ''} found.`;
    }

    this.listsData.forEach((list, index) => {
      const listCard = document.createElement('list-card');
      listCard.data = { ...list };
      listCard.style.setProperty('--card-delay', `${index * 80}ms`);
      this.listsGrid.appendChild(listCard);
    });
  }

  async loadLists() {
    const userId = this._getUserId();

    if (!userId) {
      this._showError('No user session found. Please log in.');
      return;
    }

    try {
      const data = await listService.getUserLists(userId);
      // El backend responde con { status, total, lists: [] }
      this.listsData = Array.isArray(data)
        ? data
        : (Array.isArray(data?.lists) ? data.lists : []);
    } catch (error) {
      console.error('Error loading user lists:', error);
      this._showError(error.message);
      return;
    }

    this._renderLists();
  }

  _showError(message = 'Could not load lists.') {
    if (!this.listsGrid) return;
    this.listsGrid.innerHTML = `
      <article class="empty-state empty-state--error">
        <h3>Something went wrong</h3>
        <p>${message}</p>
      </article>
    `;
    this.listsGrid.querySelector('#retry-btn')?.addEventListener('click', () => {
      this.listsGrid.innerHTML = this._skeletonHTML();
      this.loadLists();
    });
  }
}

if (!customElements.get('your-lists-view')) {
  customElements.define('your-lists-view', YourListsView);
}