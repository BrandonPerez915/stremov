class YourListsView extends HTMLElement {
	constructor() {
		super();
		this.listsData = [];
		this.defaultCover = 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/3Qud19bBUrrJAzy0Ilm8gRJlJXP.jpg';
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

					<button class="create-list-btn" id="open-create-list-modal" type="button">
						<span class="icon">add</span>
						Create List
					</button>
				</section>

				<section class="lists-grid-section">
					<div class="section-header">
						<div>
							<h2>Your lists</h2>
							<p>Simulated data loaded from <span>mocks/userLists.json</span>.</p>
						</div>
					</div>

					<div class="lists-grid" id="lists-grid">
						<article class="list-card list-card--skeleton">
							<div class="list-card__cover"></div>
							<div class="list-card__body">
								<div class="skeleton-line skeleton-line--title"></div>
								<div class="skeleton-line"></div>
								<div class="skeleton-line"></div>
							</div>
						</article>
					</div>
				</section>

				<create-list-modal id="create-list-modal"></create-list-modal>
			</main>
		`;
	}

	_cacheElements() {
		this.listsGrid = this.querySelector('#lists-grid');
		this.modal = this.querySelector('#create-list-modal');
		this.openModalBtn = this.querySelector('#open-create-list-modal');
	}

	_bindEvents() {
		if (!this._openModalHandler) {
			this._openModalHandler = () => this.modal?.open();
		}

		if (!this._listCreatedHandler) {
			this._listCreatedHandler = (event) => {
				if (!event.detail?.list) return;
				this.listsData = [event.detail.list, ...this.listsData];
				this.renderLists();
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
				if (event.key === 'Escape' && this.modal && !this.modal.querySelector('.modal')?.classList.contains('hidden')) {
					this.modal.close();
				}
			};
		}

		this.openModalBtn?.removeEventListener('click', this._openModalHandler);
		this.modal?.removeEventListener('list-created', this._listCreatedHandler);
		this.listsGrid?.removeEventListener('list-clicked', this._listClickedHandler);
		document.removeEventListener('keydown', this._handleKeydown);

		this.openModalBtn?.addEventListener('click', this._openModalHandler);
		this.modal?.addEventListener('list-created', this._listCreatedHandler);
		this.listsGrid?.addEventListener('list-clicked', this._listClickedHandler);
		document.addEventListener('keydown', this._handleKeydown);
	}

	renderLists() {
		if (!this.listsGrid) return;

		this.listsGrid.innerHTML = '';

		if (!this.listsData.length) {
			this.listsGrid.innerHTML = `
				<article class="empty-state">
					<h3>No lists yet</h3>
					<p>Create your first list to start organizing movies.</p>
				</article>
			`;
			return;
		}

		this.listsData.forEach((list, index) => {
			const listCard = document.createElement('list-card');
			// pass the original list object; ListCard will choose the proper cover
			listCard.data = { ...list };
			listCard.style.setProperty('--card-delay', `${index * 80}ms`);
			this.listsGrid.appendChild(listCard);
		});
	}

	async loadLists() {
		try {
			const response = await fetch('../mocks/userLists.json');
			const data = await response.json();
			this.listsData = Array.isArray(data.lists) ? data.lists : [];
		} catch (error) {
			console.error('Error loading lists mock:', error);
			this.listsData = [];
		}

		this.renderLists();
	}
}

if (!customElements.get('your-lists-view')) {
	customElements.define('your-lists-view', YourListsView);
}