// 1. Definimos la hoja de estilo compartida fuera de la clase
const profileSheet = new CSSStyleSheet();

profileSheet.replaceSync(`
  :host {
    display: block;
    width: 100%;
    font-family: 'Inter', -apple-system, sans-serif;
  }

  .profile-card {
    flex-wrap: wrap;
    gap: 16px;
    background-color: #141415;
    border: 1px solid #3f3f47;
    border-radius: 20px;
    padding: 30px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    color: white;
    box-sizing: border-box;
  }

  .left-content {
    display: flex;
    gap: 25px;
    align-items: center;
  }

  .avatar-container {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    overflow: hidden;
    border: 6px solid #27272a;
    flex-shrink: 0;
  }

  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .info-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  #name {
    font-size: 32px;
    font-weight: 800;
    margin: 0;
    letter-spacing: -1px;
  }

  #handle {
    font-size: 18px;
    color: #666;
    font-weight: 600;
    margin: 0;
  }

  #bio {
    font-size: 16px;
    color: #ccc;
    margin: 12px 0 20px 0;
    max-width: 500px;
    line-height: 1.5;
  }

  .stats-row {
    display: flex;
    gap: 35px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
  }

  .stat-label {
    font-size: 12px;
    font-weight: 700;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .action-btn {
    background-color: #27272a;
    border: 1px solid #3f3f47;
    color: white;
    padding: 10px 18px;
    min-width: 120px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-family: inherit;
    font-weight: 600;
    transition: background-color 0.2s;
  }

  .action-btn.edit { background-color: #27272a; }
  .action-btn.edit:hover { background-color: #3f3f47; }

  .action-btn.follow { background-color: #00cefa; }
  .action-btn.follow:hover { background-color: #0fa9cc; }

  .action-btn.following { 
    background-color: #27272a; 
    border-color: #3f3f47; 
  }

  .action-btn.following:hover { background-color: #3f3f47; }

  .btn-icon {
    width: 18px;
    height: 18px;
    fill: white;
  }
`);

class UserProfileCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [profileSheet];
    this._following = false;
    //this._render();
  }

  connectedCallback() {
    this._render();
  }


  static get observedAttributes() {
    return ['name', 'handle', 'bio', 'ratings', 'favorites', 'following', 'followers', 'avatar', 'is-owner'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) this._update();
  }

  get isOwner() {
    return this.hasAttribute('is-owner') && this.getAttribute('is-owner') !== 'false';
  }

  _update() {
    const nameElement = this.shadowRoot.getElementById('name');
    const handleElement = this.shadowRoot.getElementById('handle');
    const bioElement = this.shadowRoot.getElementById('bio');
    const ratingsElement = this.shadowRoot.getElementById('ratings');
    const favoritesElement = this.shadowRoot.getElementById('favorites');
    const followingElement = this.shadowRoot.getElementById('following');
    const followersElement = this.shadowRoot.getElementById('followers');
    const avatarElement = this.shadowRoot.querySelector('.avatar-img');

    if (nameElement) nameElement.textContent = this.getAttribute('name') || 'Guest';
    if (handleElement) handleElement.textContent = this.getAttribute('handle') || '@username';
    if (bioElement) bioElement.textContent = this.getAttribute('bio') || '';
    if (ratingsElement) ratingsElement.textContent = this.getAttribute('ratings') || '0';
    if (favoritesElement) favoritesElement.textContent = this.getAttribute('favorites') || '0';
    if (followingElement) followingElement.textContent = this.getAttribute('following') || '0';
    if (followersElement) followersElement.textContent = this.getAttribute('followers') || '0';
    if (avatarElement) avatarElement.src = this.getAttribute('avatar') || '';
  }

  _toggleFollow() {
    this._following = !this._following;
    const btn = this.shadowRoot.getElementById('action-btn');
    if (!btn) return;

    if (this._following) {
      btn.className = 'action-btn following';
      btn.innerHTML = `<svg class="btn-icon" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>Following`;
    } else {
      btn.className = 'action-btn follow';
      btn.innerHTML = `<svg class="btn-icon" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>Follow`;
    }

    this.dispatchEvent(new CustomEvent('profile-follow', {
      bubbles: true,
      composed: true,
      detail: { following: this._following },
    }));
  }

  _render() {
    const isOwner = this.isOwner;
    const actionBtn = isOwner
      ? `<button class="action-btn edit" id="action-btn">
           <svg class="btn-icon" viewBox="0 0 24 24">
             <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 00-.12-.61l-2.03-1.58zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
           </svg>
           Edit Profile
         </button>`
      : `<button class="action-btn follow" id="action-btn">
           <svg class="btn-icon" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
           Follow
         </button>`;

    this.shadowRoot.innerHTML = `
      <div class="profile-card">
        <div class="left-content">
          <div class="avatar-container">
            <img class="avatar-img" alt="Profile avatar">
          </div>

          <div class="info-container">
            <h1 id="name"></h1>
            <p id="handle"></p>
            <p id="bio"></p>

            <div class="stats-row">
              <div class="stat-item">
                <span id="ratings" class="stat-value"></span>
                <span class="stat-label">Ratings</span>
              </div>
              <div class="stat-item">
                <span id="favorites" class="stat-value"></span>
                <span class="stat-label">Favorites</span>
              </div>
              <div class="stat-item">
                <span id="following" class="stat-value"></span>
                <span class="stat-label">Following</span>
              </div>
              <div class="stat-item">
                <span id="followers" class="stat-value"></span>
                <span class="stat-label">Followers</span>
              </div>
            </div>
          </div>
        </div>
        
        ${actionBtn}
      </div>
    `;

    const btn = this.shadowRoot.getElementById('action-btn');
    if (isOwner) {
      btn?.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('profile-edit', { bubbles: true, composed: true }));
      });
    } else {
      btn?.addEventListener('click', () => this._toggleFollow());
    }

    this._update();
  }
}

if (!customElements.get('user-profile-card')) {
  customElements.define('user-profile-card', UserProfileCard);
}
