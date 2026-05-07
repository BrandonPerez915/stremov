class ListCard extends HTMLElement {
	constructor() {
		super();
		this._data = null;
	}

	connectedCallback() {
		this._render();
	}

	set data(value) {
		this._data = value;
		if (this.isConnected) {
			this._render();
		}
	}

	get data() {
		return this._data;
	}

	_render() {
		const list = this._data || {};
		const listId = list._id || list.id || '';
		const movies = Array.isArray(list.movies) ? list.movies : [];
		const image = list.image || (movies.length ? movies[0].posterUrl : '/assets/img/defaultListImage.jpg');
		const previews = movies.slice(0, 3).map(movie => `
			<span class="movie-chip" title="${movie.title}">
				<img src="${movie.posterUrl}" alt="${movie.title}">
			</span>
		`).join('');

		this.innerHTML = `
			<article class="list-card" tabindex="0" role="link" aria-label="Open list ${list.name || 'Untitled list'}">
				<div class="list-card__cover" style="background-image: linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.55)), url('${image}')"></div>
				<div class="list-card__body">
					<div class="list-card__top">
						<div>
							<h3>${list.name || 'Untitled list'}</h3>
						</div>
						<button class="list-card__menu" type="button" aria-label="List options">
							<span class="icon">more_vert</span>
						</button>
					</div>
					<p class="list-card__description">${list.description || 'No description provided yet.'}</p>
					<div class="list-card__footer">
						<span class="list-card__count">${movies.length} movies</span>
						<div class="list-card__previews">${previews || '<span class="movie-chip movie-chip--empty">+</span>'}</div>
					</div>
				</div>
			</article>
		`;

		const card = this.querySelector('.list-card');
		if (!card) return;

		if (!this._cardClickHandler) {
			this._cardClickHandler = () => {
				if (!listId) return;
				this.dispatchEvent(new CustomEvent('list-clicked', {
					detail: { listId },
					bubbles: true,
					composed: true
				}));
			};
		}

		if (!this._cardKeydownHandler) {
			this._cardKeydownHandler = (event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					this._cardClickHandler();
				}
			};
		}

		card.removeEventListener('click', this._cardClickHandler);
		card.removeEventListener('keydown', this._cardKeydownHandler);
		card.addEventListener('click', this._cardClickHandler);
		card.addEventListener('keydown', this._cardKeydownHandler);
	}
}

if (!customElements.get('list-card')) {
	customElements.define('list-card', ListCard);
}