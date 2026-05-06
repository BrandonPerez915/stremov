class CreateListModal extends HTMLElement {
	constructor() {
		super();
		this.defaultCover = 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/3Qud19bBUrrJAzy0Ilm8gRJlJXP.jpg';
	}

	connectedCallback() {
		if (!this._isRendered) {
			this._render();
			this._isRendered = true;
		}
		this._bindEvents();
	}

	open() {
		const modal = this.querySelector('.modal');
		if (!modal) return;

		modal.classList.remove('hidden');
		modal.setAttribute('aria-hidden', 'false');
	}

	close() {
		const modal = this.querySelector('.modal');
		const form = this.querySelector('#create-list-form');
		if (!modal || !form) return;

		modal.classList.add('hidden');
		modal.setAttribute('aria-hidden', 'true');
		form.reset();
		form.querySelectorAll('custom-input').forEach(input => {
			if (typeof input._updateValue === 'function') input._updateValue('');
			if (typeof input.clearError === 'function') input.clearError();
		});
		const textarea = form.querySelector('custom-textarea');
		if (textarea) textarea.value = '';
	}

	_render() {
		this.innerHTML = `
			<section class="modal hidden" aria-hidden="true">
				<div class="modal__backdrop" data-close-modal></div>

				<div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="create-list-title">
					<div class="modal__header">
						<div>
							<p class="eyebrow">New list</p>
							<h2 id="create-list-title">Create a new list</h2>
						</div>
						<button class="modal__close" type="button" data-close-modal aria-label="Close modal">
							<span class="icon">close</span>
						</button>
					</div>

					<form class="list-form" id="create-list-form">
						<custom-input
							label="List name"
							name="name"
							type="text"
							placeholder="Romance !!"
							icon="movie_filter"
							required></custom-input>

						<custom-textarea
							label="Description"
							placeholder="Describe what this list is about..."
							value=""></custom-textarea>

						<div class="modal__actions">
							<button class="btn btn-secondary" type="button" data-close-modal>Cancel</button>
							<button class="btn btn-primary" type="submit">Create list</button>
						</div>
					</form>
				</div>
			</section>
		`;
	}

	_bindEvents() {
		const modal = this.querySelector('.modal');
		const form = this.querySelector('#create-list-form');
		if (!modal || !form) return;

		if (!this._modalClickHandler) {
			this._modalClickHandler = (event) => {
				if (event.target.hasAttribute('data-close-modal')) {
					this.close();
				}
			};
		}

		if (!this._submitHandler) {
			this._submitHandler = (event) => {
				event.preventDefault();

						const nameInput = form.querySelector('custom-input[name="name"]');
						const descriptionInput = form.querySelector('custom-textarea');

						const name = nameInput?.value.trim();
						const description = descriptionInput?.value.trim() || 'New list created from the modal.';
						// owner: try to use stored user id, else null — backend requires owner per model
						const owner = localStorage.getItem('userId') || null;

				if (!name) {
					if (typeof nameInput?.showError === 'function') {
						nameInput.showError('Add a name for the list');
					}
					return;
				}

						this.dispatchEvent(new CustomEvent('list-created', {
						detail: {
							list: {
								_id: `list_${Date.now()}`,
								name,
								description,
								owner,
								image: null,
								movies: []
							}
						},
						bubbles: true,
						composed: true
					}));

				this.close();
			};
		}

		modal.onclick = this._modalClickHandler;
		form.onsubmit = this._submitHandler;
	}
}

if (!customElements.get('create-list-modal')) {
	customElements.define('create-list-modal', CreateListModal);
}