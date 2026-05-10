import { getUser, followUser, unfollowUser } from '../scripts/api.js';

const userProfileCardSheet = new CSSStyleSheet();

userProfileCardSheet.replaceSync(`
  :host {
    display: block;
    font-family: 'Inter', sans-serif;
    color: var(--text-primary);
  }

  /* ---- Layout principal ---- */
  .profile-shell {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .profile-header-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    padding: 32px 0 24px 0;
    flex-wrap: wrap;
  }

  .profile-identity {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;
  }

  .profile-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--primary-color);
    flex-shrink: 0;
  }

  .profile-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .profile-name {
    font-size: 26px;
    font-weight: 700;
    margin: 0;
    line-height: 1.1;
  }

  .profile-email {
    color: var(--text-secondary);
    font-size: 14px;
    margin: 0;
  }

  /* ---- Stats (followers / following) ---- */
  .profile-stats {
    display: flex;
    gap: 20px;
    margin-top: 8px;
    flex-wrap: wrap;
  }

  .profile-stat {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    background: none;
    border: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
    padding: 8px 14px;
    border-radius: 12px;
    transition: background 0.15s ease;
  }

  .profile-stat:hover {
    background: rgba(255,255,255,0.06);
  }

  .profile-stat strong {
    font-size: 18px;
    font-weight: 700;
    line-height: 1;
  }

  .profile-stat span {
    font-size: 12px;
    color: var(--text-secondary);
  }

  /* ---- Botones de acción ---- */
  .profile-actions {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }

  .btn {
    padding: 10px 22px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    font-family: inherit;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
  }

  .btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-primary {
    background: var(--primary-color);
    color: white;
  }

  .btn-primary:hover:not(:disabled) { filter: brightness(1.1); }

  .btn-secondary {
    background: rgba(255,255,255,0.06);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
  }

  .btn-secondary:hover:not(:disabled) {
    background: rgba(255,255,255,0.1);
  }

  .btn-unfollow {
    background: rgba(255,255,255,0.06);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
  }

  .btn-unfollow:hover:not(:disabled) {
    background: rgba(239,68,68,0.12);
    border-color: #ef4444;
    color: #ef4444;
  }

  .icon {
    font-family: 'Material Symbols Outlined';
    font-size: 18px;
    font-variation-settings: 'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24;
  }

  /* ---- Divisor ---- */
  .profile-divider {
    height: 1px;
    background: var(--border-color);
    margin: 0;
  }

  /* ---- Estado de carga / error ---- */
  .loading-state,
  .error-state {
    padding: 40px 0;
    text-align: center;
    color: var(--text-secondary);
    font-size: 15px;
  }

  .loading-state .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--border-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    margin: 0 auto 16px;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* ---- Modal de seguidores/siguiendo ---- */
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
    background: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 24px;
    width: min(520px, 100%);
    max-height: min(75vh, 700px);
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.4);
    transform: translateY(8px);
    transition: transform 0.2s ease;
    overflow: hidden;
  }

  .modal-overlay.open .modal-panel { transform: translateY(0); }

  .modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .modal-header h3 { margin: 0; font-size: 18px; }
  .modal-header p { margin: 6px 0 0; color: var(--text-secondary); font-size: 13px; line-height: 1.5; }

  .modal-close {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid var(--border-color);
    background: transparent;
    color: var(--text-primary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Material Symbols Outlined';
    font-size: 18px;
  }

  .modal-list {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .modal-user-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    cursor: pointer;
    transition: background 0.15s ease;
    text-decoration: none;
    color: inherit;
  }

  .modal-user-item:hover { background: rgba(255,255,255,0.07); }

  .modal-user-avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .modal-user-name { font-size: 14px; font-weight: 600; }
  .modal-user-handle { font-size: 12px; color: var(--text-secondary); }
  .modal-empty { text-align: center; color: var(--text-secondary); padding: 20px; font-size: 14px; }

  @media (max-width: 600px) {
    .profile-header-row { flex-direction: column; }
    .profile-actions { width: 100%; }
    .btn { flex: 1; justify-content: center; }
    .profile-name { font-size: 22px; }
    .profile-avatar { width: 80px; height: 80px; }
  }
`);

class UserProfileCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [userProfileCardSheet];

    this._profileUser  = null;   //datos del perfil mostrado
    this._isOwnProfile = false;
    this._isFollowing  = false;
    this._isLoading    = true;
    this._followLoading = false;
    this._socialModal  = null;   //'followers' | 'following' | null
  }

  static get observedAttributes() {
    return ['username'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'username' && oldValue !== newValue) {
      this._load();
    }
  }

  connectedCallback() {
    this._load();
  }

  //Carga de datos
  async _load() {
    const username = this.getAttribute('username');
    if (!username) return;

    this._isLoading = true;
    this._render();

    try {
      const response = await getUser(username);
      const user = response?.user
        || (Array.isArray(response?.users)
          ? response.users.find(u => u?.username === username) || response.users[0]
          : null);

      if (!user) {
        throw new Error('User not found in profile response');
      }

      this._profileUser = user;

      //Determinar si es el perfil propio
      const myUsername = this._getMyUsername();
      this._isOwnProfile = !!myUsername && myUsername === user.username;

      //Determinar si ya seguimos a este usuario
      if (!this._isOwnProfile) {
        const myId = this._getMyId();
        this._isFollowing = Array.isArray(user.followers) &&
          user.followers.some(f => {
            const id = f._id || f.id || f;
            return String(id) === String(myId);
          });
      }
    } catch (err) {
      console.error('UserProfileCard: error loading user', err);
      this._profileUser = null;
    }

    this._isLoading = false;
    this._render();
  }

  _getMyUsername() {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) return '';
      const payload = token.split('.')[1];
      const padded = payload.padEnd(payload.length + (4 - payload.length % 4) % 4, '=');
      const decoded = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(
        Array.from(decoded, c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      )).username || '';
    } catch { return ''; }
  }

  _getMyId() {
    try {
      const raw = localStorage.getItem('userData');
      if (!raw) return null;
      const u = JSON.parse(raw);
      return u._id || u.id || null;
    } catch { return null; }
  }

  _getStoredUser() {
    try {
      const raw = localStorage.getItem('userData');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  _getAvatarUrl(user) {
    return user?.avatarUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=3a3f4c&color=fff&size=100`;
  }

  //Render
  _render() {
    if (this._isLoading) {
      this.shadowRoot.innerHTML = `
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading profile...</p>
        </div>
        ${this._modalHTML()}
      `;
      this._bindModalEvents();
      return;
    }

    if (!this._profileUser) {
      this.shadowRoot.innerHTML = `
        <div class="error-state">
          <p>Could not load this profile.</p>
        </div>
      `;
      return;
    }

    const u = this._profileUser;
    const followers = Array.isArray(u.followers) ? u.followers.length : 0;
    const following = Array.isArray(u.following) ? u.following.length : 0;
    const isLoggedIn = !!localStorage.getItem('jwtToken');

    const actionButtons = this._isOwnProfile
      ? `<button class="btn btn-primary" id="edit-profile-btn">
           <span class="icon">edit</span> Edit profile
         </button>`
      : isLoggedIn
        ? this._isFollowing
          ? `<button class="btn btn-unfollow" id="follow-btn" ${this._followLoading ? 'disabled' : ''}>
               <span class="icon">person_remove</span>
               ${this._followLoading ? 'Loading...' : 'Unfollow'}
             </button>`
          : `<button class="btn btn-primary" id="follow-btn" ${this._followLoading ? 'disabled' : ''}>
               <span class="icon">person_add</span>
               ${this._followLoading ? 'Loading...' : 'Follow'}
             </button>`
        : `<button class="btn btn-secondary" id="login-to-follow-btn">
             <span class="icon">login</span> Sign in to follow
           </button>`;

    this.shadowRoot.innerHTML = `
      <div class="profile-shell">
        <div class="profile-header-row">
          <div class="profile-identity">
            <img
              class="profile-avatar"
              src="${this._getAvatarUrl(u)}"
              alt="Avatar of ${u.username}">
            <div class="profile-info">
              <h1 class="profile-name">${u.username}</h1>
              ${u.email && this._isOwnProfile ? `<p class="profile-email">${u.email}</p>` : ''}
              <div class="profile-stats">
                <button class="profile-stat" id="following-btn">
                  <strong>${following}</strong>
                  <span>Following</span>
                </button>
                <button class="profile-stat" id="followers-btn">
                  <strong>${followers}</strong>
                  <span>Followers</span>
                </button>
              </div>
            </div>
          </div>

          <div class="profile-actions">
            ${actionButtons}
          </div>
        </div>

        <div class="profile-divider"></div>
      </div>

      ${this._modalHTML()}
    `;

    this._bindEvents();
    this._bindModalEvents();
  }

  //Eventos
  _bindEvents() {
    this.shadowRoot.getElementById('edit-profile-btn')?.addEventListener('click', () => {
      window.location.href = '/profileConfig';
    });

    this.shadowRoot.getElementById('follow-btn')?.addEventListener('click', () => this._toggleFollow());
    this.shadowRoot.getElementById('login-to-follow-btn')?.addEventListener('click', () => {
      window.location.href = '/login';
    });

    this.shadowRoot.getElementById('following-btn')?.addEventListener('click', () => {
      this._socialModal = 'following';
      this._openModal();
    });
    this.shadowRoot.getElementById('followers-btn')?.addEventListener('click', () => {
      this._socialModal = 'followers';
      this._openModal();
    });
  }

  async _toggleFollow() {
    if (this._followLoading) return;
    this._followLoading = true;
    this._render();

    try {
      const username = this._profileUser.username;
      if (this._isFollowing) {
        await unfollowUser(username);
        this._isFollowing = false;
        //Remover del array local por ID
        if (Array.isArray(this._profileUser.followers)) {
          const myId = this._getMyId();
          this._profileUser.followers = this._profileUser.followers.filter(f => {
            const id = f._id || f.id || f;
            return String(id) !== String(myId);
          });
        }
        window.toast?.({ type: 'info', title: `Unfollowed ${username}`, duration: 2000 });
      } else {
        await followUser(username);
        this._isFollowing = true;
        //Agregar al array local con objeto completo (no solo el ID)
        if (Array.isArray(this._profileUser.followers)) {
          const myUser = this._getStoredUser();
          if (myUser) {
            this._profileUser.followers.push({
              _id: myUser._id || myUser.id,
              username: myUser.username,
              avatarUrl: myUser.avatarUrl || localStorage.getItem('avatarUrl') || null
            });
          }
        }
        window.toast?.({ type: 'success', title: `Now following ${username}!`, duration: 2000 });
      }
    } catch (err) {
      window.toast?.({ type: 'error', title: 'Could not update follow status', message: err.message, duration: 3000 });
    }

    this._followLoading = false;
    this._render();
  }

  //Modal de seguidores/siguiendo
  _modalHTML() {
    if (!this._socialModal || !this._profileUser) return '';

    const type = this._socialModal;
    const users = type === 'following'
      ? (Array.isArray(this._profileUser.following) ? this._profileUser.following : [])
      : (Array.isArray(this._profileUser.followers) ? this._profileUser.followers : []);

    const copy = type === 'following'
      ? { title: 'Following', subtitle: `People ${this._profileUser.username} follows.`, empty: 'Not following anyone yet.' }
      : { title: 'Followers', subtitle: `People who follow ${this._profileUser.username}.`, empty: 'No followers yet.' };

    const usersHTML = users.length
      ? users
          .filter(u => u && (u.username || u._id))  //filtrar entradas inválidas
          .map(u => {
            const name = u.username || null;
            //Si no hay username (entrada solo con ID), no podemos navegar al perfil
            if (!name) return '';
            const avatar = u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3a3f4c&color=fff&size=80`;
            return `
              <a class="modal-user-item" href="/user/${name}">
                <img class="modal-user-avatar" src="${avatar}" alt="${name}">
                <div>
                  <div class="modal-user-name">${name}</div>
                  <div class="modal-user-handle">@${name}</div>
                </div>
              </a>
            `;
          }).join('')
      : `<p class="modal-empty">${copy.empty}</p>`;

    return `
      <div class="modal-overlay open" id="social-modal">
        <div class="modal-panel">
          <div class="modal-header">
            <div>
              <h3>${copy.title}</h3>
              <p>${copy.subtitle}</p>
            </div>
            <button class="modal-close" id="modal-close-btn">close</button>
          </div>
          <div class="modal-list">
            ${usersHTML}
          </div>
        </div>
      </div>
    `;
  }

  _openModal() {
    //Re-render para incluir el modal en el DOM
    this._render();
  }

  _bindModalEvents() {
    this.shadowRoot.getElementById('modal-close-btn')?.addEventListener('click', () => {
      this._socialModal = null;
      this._render();
    });

    this.shadowRoot.getElementById('social-modal')?.addEventListener('click', (e) => {
      if (e.target === this.shadowRoot.getElementById('social-modal')) {
        this._socialModal = null;
        this._render();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._socialModal) {
        this._socialModal = null;
        this._render();
      }
    }, { once: true });
  }
}

if (!customElements.get('user-profile-card')) {
  customElements.define('user-profile-card', UserProfileCard);
}
