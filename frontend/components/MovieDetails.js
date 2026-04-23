const detailsSheet = new CSSStyleSheet();
detailsSheet.replaceSync(`
    :host {
        display: block;
        font-family: 'Inter', sans-serif;
        color: white;
    }

    .header {
        display: flex;
        align-items: baseline;
        gap: 15px;
        margin-bottom: 15px;
        flex-wrap: wrap;
    }

    h1 {
        font-size: 48px;
        font-weight: 800;
        margin: 0;
        letter-spacing: -1px;
        line-height: 1.1;
    }

    .year {
        font-size: 24px;
        color: #666;
        font-weight: 500;
    }

    .meta-row {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 40px;
        font-size: 14px;
        color: #a0a0a0;
        font-weight: 500;
        flex-wrap: wrap;
    }

    .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .icon-star { fill: #00d2ff; width: 16px; height: 16px; }
    .icon-stroke { stroke: #888; fill: none; width: 16px; height: 16px; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

    .section {
        margin-bottom: 30px;
    }

    .label {
        font-size: 12px;
        font-weight: 700;
        color: #666;
        letter-spacing: 1px;
        text-transform: uppercase;
        margin-bottom: 10px;
    }

    .content {
        font-size: 16px;
        line-height: 1.6;
        color: #e0e0e0;
        margin: 0;
    }

    .cast-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    .cast-pill {
        border: 1px solid #333;
        background-color: transparent;
        color: #bbb;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 500;
        transition: border-color 0.2s, color 0.2s;
    }

    .cast-pill:hover {
        border-color: #00d2ff;
        color: white;
    }
`);

class MovieDetails extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.adoptedStyleSheets = [detailsSheet];
        this._render();
    }

    static get observedAttributes() {
        return ['title', 'year', 'rating', 'duration', 'release', 'director', 'synopsis', 'cast'];
    }

    attributeChangedCallback() {
        this._update();
    }

    _update() {
        const titleEl = this.shadowRoot.getElementById('title');
        const yearEl = this.shadowRoot.getElementById('year');
        const ratingEl = this.shadowRoot.getElementById('rating');
        const durationEl = this.shadowRoot.getElementById('duration');
        const releaseEl = this.shadowRoot.getElementById('release');
        const directorEl = this.shadowRoot.getElementById('director');
        const synopsisEl = this.shadowRoot.getElementById('synopsis');
        const castContainer = this.shadowRoot.getElementById('cast-container');

        if(titleEl) titleEl.textContent = this.getAttribute('title') || 'Título Desconocido';
        if(yearEl) yearEl.textContent = this.getAttribute('year') || '';
        if(ratingEl) ratingEl.textContent = this.getAttribute('rating') || '-.-';
        if(durationEl) durationEl.textContent = this.getAttribute('duration') || '-- min';
        if(releaseEl) releaseEl.textContent = 'Released ' + (this.getAttribute('release') || '----');
        if(directorEl) directorEl.textContent = this.getAttribute('director') || 'Desconocido';
        if(synopsisEl) synopsisEl.textContent = this.getAttribute('synopsis') || 'Sin sinopsis disponible.';

        if(castContainer) {
            castContainer.innerHTML = '';
            const castString = this.getAttribute('cast') || '';
            if (castString) {
                const actors = castString.split(',').map(a => a.trim());
                actors.forEach(actor => {
                    const span = document.createElement('span');
                    span.className = 'cast-pill';
                    span.textContent = actor;
                    castContainer.appendChild(span);
                });
            }
        }
    }

    _render() {
        this.shadowRoot.innerHTML = `
            <div class="header">
                <h1 id="title"></h1>
                <span id="year" class="year"></span>
            </div>

            <div class="meta-row">
                <span class="meta-item">
                    <svg class="icon-star" viewBox="0 0 24 24"><path d="M12 1.74l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.27L12 1.74z"/></svg>
                    <span id="rating"></span>
                </span>
                <span class="meta-item">
                    <svg class="icon-stroke" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span id="duration"></span>
                </span>
                <span class="meta-item">
                    <svg class="icon-stroke" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span id="release"></span>
                </span>
            </div>

            <div class="section">
                <div class="label">Directed By</div>
                <p id="director" class="content"></p>
            </div>

            <div class="section">
                <div class="label">Synopsis</div>
                <p id="synopsis" class="content"></p>
            </div>

            <div class="section">
                <div class="label">Cast</div>
                <div id="cast-container" class="cast-list"></div>
            </div>
        `;
        this._update();
    }
}

if (!customElements.get('movie-details')) {
    customElements.define('movie-details', MovieDetails);
}