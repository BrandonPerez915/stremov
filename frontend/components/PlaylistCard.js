const playlistCardSheet = new CSSStyleSheet();

playlistCardSheet.replaceSync(`
  :host {
    display: block;
    font-family: 'Inter', sans-serif;
    height: 100%;
  }

  .playlist-card {
    background-color: #1a1a1a;
    border: 1px solid #222;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .playlist-card:hover {
    transform: translateY(-5px);
    border-color: rgba(0, 210, 255, 0.5);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
  }

  .cover-container {
    width: 100%;
    aspect-ratio: 16 / 9;
    position: relative;
    background-color: #222;
    overflow: hidden;
  }

  .cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .playlist-card:hover .cover-image {
    transform: scale(1.05);
  }

  .info {
    padding: 20px;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  .title {
    color: white;
    font-size: 20px;
    font-weight: 800;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
  }

  .description {
    color: #a0a0a0;
    font-size: 14px;
    margin: 0 0 15px 0;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .meta {
    margin-top: auto;
    display: flex;
    align-items: center;
    gap: 6px;
    color: #666;
    font-size: 13px;
    font-weight: 600;
  }

  .icon {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }
`);

class PlaylistCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [playlistCardSheet];
    this._render();
  }

  static get observedAttributes() {
    return ['title', 'description', 'count', 'cover', 'list-id'];
  }

  attributeChangedCallback() {
    this._updateContent();
  }

  _updateContent() {
    const titleEl = this.shadowRoot.getElementById('title');
    const descEl = this.shadowRoot.getElementById('description');
    const countEl = this.shadowRoot.getElementById('count');
    const coverEl = this.shadowRoot.getElementById('cover');

    if (titleEl) titleEl.textContent = this.getAttribute('title') || 'Sin título';
    if (descEl) descEl.textContent = this.getAttribute('description') || 'Sin descripción';
    if (countEl) countEl.textContent = `${this.getAttribute('count') || '0'} películas`;
    
    if (coverEl) {
      coverEl.src = this.getAttribute('cover') || 'https://via.placeholder.com/400x225/222222/666666?text=Sin+Portada';
    }
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <div class="playlist-card">
        <div class="cover-container">
          <img id="cover" class="cover-image" alt="Portada de la lista" />
        </div>
        <div class="info">
          <h3 id="title" class="title"></h3>
          <p id="description" class="description"></p>
          <div class="meta">
            <svg class="icon" viewBox="0 0 24 24">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/>
            </svg>
            <span id="count"></span>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('.playlist-card').addEventListener('click', () => {
      const listId = this.getAttribute('list-id') || '1';
      window.location.href = `/frontend/views/playlists.html?id=${listId}`;
    });

    this._updateContent();
  }
}

if (!customElements.get('playlist-card')) {
  customElements.define('playlist-card', PlaylistCard);
}