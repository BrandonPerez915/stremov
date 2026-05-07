const userProfileSheet = new CSSStyleSheet();

userProfileSheet.replaceSync(`
  :host {
    display: block;
    font-family: 'Inter', sans-serif;
    color: var(--text-primary);
    padding: 24px;
    max-width: 760px;
    margin: 0 auto;
    box-sizing: border-box;
    
  }

  .profile-card {
    width: 100%;
    display: grid;
    gap: 24px;
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border-color);
    border-radius: 28px;
    padding: 28px;
    box-shadow: 0 24px 55px rgba(0,0,0,0.25);
  }

  .profile-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .profile-summary {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .profile-header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
    margin-bottom: 0;
    text-align: left;
  }

  .avatar-container {
    position: relative;
    width: 140px;
    height: 140px;
  }

  .profile-pic {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid var(--primary-color);
    box-shadow: 0 20px 40px rgba(0,0,0,0.18);
  }

  .edit-avatar-btn {
    position: absolute;
    bottom: 0;
    right: 0;
    background: var(--primary-color);
    border: none;
    border-radius: 50%;
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  }

  .user-info-brief {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .user-info-brief h1 {
    margin: 0;
    font-size: 30px;
    font-weight: 700;
  }

  .user-email-sub {
    color: var(--text-secondary);
    font-size: 15px;
    margin: 0;
  }

  .status-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 14px;
    border-radius: 999px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    color: var(--text-secondary);
    font-size: 13px;
    margin-top: 0;
  }

  .details-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border-color);
    border-radius: 22px;
    padding: 24px;
  }

  .details-card h2 {
    font-size: 18px;
    margin-bottom: 22px;
    color: var(--text-primary);
  }

  .detail-row {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 16px;
    align-items: center;
    padding: 14px 0;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .detail-row:last-child {
    border-bottom: none;
  }

  .detail-label {
    color: var(--text-secondary);
    font-size: 14px;
  }

  .detail-value,
  .detail-value strong {
    font-weight: 600;
    color: var(--text-primary);
    text-align: right;
  }

  .password-dots {
    letter-spacing: 0.22em;
  }

  input[type='text'],
  input[type='email'] {
    width: 100%;
    max-width: 360px;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 10px 12px;
    border-radius: 14px;
    font-family: inherit;
    font-size: 15px;
    min-height: 42px;
    min-width: 0;
  }

  .detail-row:last-child {
    border-bottom: none;
  }

  .detail-label {
    color: var(--text-secondary);
    font-size: 14px;
  }

  .detail-value,
  .detail-value strong {
    font-weight: 600;
    color: var(--text-primary);
    text-align: right;
  }

  .actions {
    display: flex;
    gap: 12px;
    margin-top: 22px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .btn {
    padding: 12px 24px;
    border-radius: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
    border: none;
  }

  .btn-primary { background: var(--primary-color); color: white; }
  .btn-secondary { background: rgba(255,255,255,0.06); border: 1px solid var(--border-color); color: var(--text-primary); }
  .btn-danger { background: rgba(214,69,69,0.12); border: 1px solid #d64545; color: var(--text-primary); }
  .btn:hover { opacity: 0.95; transform: translateY(-1px); }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.55);
    display: grid;
    place-items: center;
    padding: 24px;
    z-index: 10000;
  }

  .confirm-modal {
    width: min(500px, 100%);
    background: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 24px;
    padding: 28px;
    box-shadow: 0 18px 45px rgba(0,0,0,0.35);
  }

  .confirm-modal h2 {
    margin: 0 0 12px;
    font-size: 22px;
  }

  .confirm-modal p {
    color: var(--text-secondary);
    margin: 0 0 24px;
    line-height: 1.7;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    flex-wrap: wrap;
  }

  .hidden { display: none; }

  .favorites-section {
    margin-top: 20px;
    max-width: 100%;
  }

  .favorites-section h2 {
    margin: 6px 0 12px;
    color: var(--text-primary);
    font-size: 18px;
  }

  .favorites-grid {
    display: flex;
    gap: 14px;
    overflow-x: auto;
    padding: 8px 6px;
    align-items: flex-start;
  }

  .favorites-empty {
    color: var(--text-secondary);
    margin: 6px 0 0;
  }

  .icon { font-family: 'Material Symbols Outlined'; font-size: 20px; }

  @media (max-width: 720px) {
    :host { padding: 16px; }
    .profile-card { padding: 20px; }
    .avatar-container { width: 120px; height: 120px; }
    .details-card,
    .user-details { padding: 20px; }
    .detail-row { grid-template-columns: 1fr; text-align: left; }
    .detail-value { text-align: left; }
  }
`);

import { getUser, updateUser, deleteUser, logout, getFavoriteList } from '../scripts/api.js';

class UserProfileView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [userProfileSheet];
    this.isEditing = false;
    this.showLogoutModal = false;
    this.showDeleteModal = false;
    this.hasAuth = !!localStorage.getItem('jwtToken');

    const storedUser = JSON.parse(localStorage.getItem('userData') || '{}');
    const tokenUsername = this._getUsernameFromToken();
    const initialUsername = storedUser.username || tokenUsername || 'User';

    this.originalUsername = initialUsername;
    this.userData = {
      username: initialUsername,
      email: storedUser.email || '',
      avatar: storedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(initialUsername)}`,
      accountStatus: ''
    };
    this.favorites = [];
  }

  _getUsernameFromToken() {
    const token = localStorage.getItem('jwtToken');
    if (!token) return '';

    try {
      const payload = token.split('.')[1];
      const padded = payload.padEnd(payload.length + (4 - (payload.length % 4)) % 4, '=');
      const decoded = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
      const json = decodeURIComponent(Array.from(decoded, char => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const parsed = JSON.parse(json);
      return parsed.username || '';
    } catch {
      return '';
    }
  }

  async connectedCallback() {
    await this._loadUserData();
    this._render();
  }

  async _loadUserData() {
    if (!this.hasAuth) return;

    const tokenUsername = this._getUsernameFromToken();
    if (!tokenUsername) return;

    try {
      const { user } = await getUser(tokenUsername);
      if (user) {
        this.userData.username = user.username || this.userData.username;
        this.userData.email = user.email || this.userData.email;
        this.userData.avatar = user.avatarUrl || this.userData.avatar;
        this.originalUsername = user.username || this.originalUsername;
        localStorage.setItem('userData', JSON.stringify(this.userData));
        // Cargar lista de favoritos del usuario (si existe)
        try {
          const favRes = await getFavoriteList(user._id || user.id);
          this.favorites = favRes?.movies || [];
        } catch (err) {
          this.favorites = [];
        }
      }
    } catch (err) {
      console.warn('Could not load profile data', err);
    }
  }

  // --- Backend logic ---
  async _handleSave() {
    const newName = this.shadowRoot.querySelector('#edit-name').value.trim();
    const newEmail = this.shadowRoot.querySelector('#edit-email').value.trim();

    try {
      await updateUser({ 
        username: this.originalUsername, 
        data: { username: newName, email: newEmail } 
      });
      this.userData.username = newName;
      this.userData.email = newEmail;
      this.originalUsername = newName;
      localStorage.setItem('userData', JSON.stringify(this.userData));
      this.isEditing = false;
      this._render();
    } catch (err) {
      alert("Update failed: " + err.message);
    }
  }

  async _handleDeleteAccount() {
    if (!this.hasAuth) return;

    try {
      await deleteUser(this.userData.username);
      logout();
    } catch (err) {
      alert("Account deletion failed: " + err.message);
    }
  }

  _handleLogout() {
    if (!this.hasAuth) return;
    logout();
  }

  _handleLogin() {
    window.location.href = '/login';
  }

  _handleRegister() {
    window.location.href = '/register';
  }

  _handleAvatarChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.userData.avatar = reader.result;
      localStorage.setItem('userData', JSON.stringify(this.userData));
      this._render();
    };
    reader.readAsDataURL(file);
  }

  _openLogoutModal() {
    this.showLogoutModal = true;
    this._render();
  }

  _closeLogoutModal() {
    this.showLogoutModal = false;
    this._render();
  }

  _openDeleteModal() {
    this.showDeleteModal = true;
    this._render();
  }

  _closeDeleteModal() {
    this.showDeleteModal = false;
    this._render();
  }

  _render() {
    const isAuthenticated = this.hasAuth;
    const profileSection = isAuthenticated ? `
      <div class="profile-grid">
        <aside class="profile-summary">
          <div class="profile-header">
            <div class="avatar-container">
              <img src="${this.userData.avatar}" class="profile-pic" alt="Avatar of ${this.userData.username}">
              ${this.isEditing ? `<button class="edit-avatar-btn" id="avatar-edit-btn"><span class="icon">edit</span></button>` : ''}
              <input id="avatar-input" type="file" accept="image/*" class="hidden">
            </div>
            <div class="user-info-brief">
              <div class="name-row">
                <h1>${this.userData.username}</h1>
              </div>
              <p class="user-email-sub">${this.userData.email}</p>
              ${this.userData.accountStatus ? `<span class="status-pill">${this.userData.accountStatus}</span>` : ''}
            </div>
          </div>
        </aside>

        <section class="details-card">
          <h2>Personal details</h2>
          <div class="detail-row">
            <span class="detail-label">Username</span>
            ${this.isEditing ? `<input type="text" id="edit-name" value="${this.userData.username}">` : `<strong class="detail-value">${this.userData.username}</strong>`}
          </div>
          <div class="detail-row">
            <span class="detail-label">Email</span>
            ${this.isEditing ? `<input type="email" id="edit-email" value="${this.userData.email}">` : `<strong class="detail-value">${this.userData.email}</strong>`}
          </div>
          <div class="detail-row">
            <span class="detail-label">Password</span>
            <strong class="detail-value password-dots">••••••••</strong>
          </div>
        </section>
      </div>

      <div class="actions">
        ${this.isEditing
          ? `<button class="btn btn-secondary" id="cancel-btn">Cancel</button>
             <button class="btn btn-primary" id="save-btn">Save</button>`
          : `<button class="btn btn-primary" id="edit-btn">Edit profile</button>`
        }
        <button class="btn btn-secondary" id="logout-btn">Logout</button>
        <button class="btn btn-danger" id="delete-btn">Delete account</button>
      </div>
    ` : `
      <div class="profile-header">
        <div class="avatar-container">
          <img src="${this.userData.avatar}" class="profile-pic" alt="Guest">
        </div>
        <div class="user-info-brief">
          <h1>Welcome</h1>
          <p class="user-email-sub">Sign in or register to access your profile.</p>
        </div>
      </div>

      <div class="details-card no-auth-card">
        <h2>No active session</h2>
        <p>To edit your profile, log out, or delete your account, you must first log in.</p>
      </div>

      <div class="actions">
        <button class="btn btn-primary" id="login-btn">Login</button>
        <button class="btn btn-secondary" id="register-btn">Register</button>
      </div>
    `;

    this.shadowRoot.innerHTML = `
      <div class="profile-card">
        ${profileSection}
      </div>

      <div class="favorites-section">
        <h2>Favoritos</h2>
        ${this.favorites && this.favorites.length ? `
          <div class="favorites-grid">
            ${this.favorites.map((m) => `
              <movie-card poster="${m.posterUrl || m.poster || ''}" title="${(m.title||'').replace(/"/g,'&quot;')}" rating="${m.imdbScore || m.rating || ''}" media-id="${m.id || ''}" genres="${(m.genres || []).join(',')}"></movie-card>
            `).join('')}
          </div>
        ` : `<p class="favorites-empty">Aún no tienes favoritos.</p>`}
      </div>

      <div id="logout-modal" class="modal-backdrop ${this.showLogoutModal ? '' : 'hidden'}">
        <div class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="logout-title">
          <h2 id="logout-title">Logout</h2>
          <p>Are you sure you want to log out? You will be redirected to the home page without being logged in.</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" id="logout-cancel">Cancel</button>
            <button class="btn btn-primary" id="logout-confirm">Confirm</button>
          </div>
        </div>
      </div>

      <div id="delete-modal" class="modal-backdrop ${this.showDeleteModal ? '' : 'hidden'}">
        <div class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <h2 id="delete-title">Delete account</h2>
          <p>Are you sure you want to delete your account? This action cannot be undone.</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" id="delete-cancel">Cancel</button>
            <button class="btn btn-danger" id="delete-confirm">Confirm</button>
          </div>
        </div>
      </div>
    `;
    this._setupListeners();
  }

  _setupListeners() {
    this.shadowRoot.getElementById('edit-btn')?.addEventListener('click', () => { this.isEditing = true; this._render(); });
    this.shadowRoot.getElementById('cancel-btn')?.addEventListener('click', () => { this.isEditing = false; this._render(); });
    this.shadowRoot.getElementById('save-btn')?.addEventListener('click', () => this._handleSave());
    this.shadowRoot.getElementById('logout-btn')?.addEventListener('click', () => this._openLogoutModal());
    this.shadowRoot.getElementById('delete-btn')?.addEventListener('click', () => this._openDeleteModal());
    this.shadowRoot.getElementById('avatar-edit-btn')?.addEventListener('click', () => this.shadowRoot.getElementById('avatar-input')?.click());
    this.shadowRoot.getElementById('avatar-input')?.addEventListener('change', (event) => this._handleAvatarChange(event));
    this.shadowRoot.getElementById('login-btn')?.addEventListener('click', () => this._handleLogin());
    this.shadowRoot.getElementById('register-btn')?.addEventListener('click', () => this._handleRegister());

    this.shadowRoot.getElementById('logout-cancel')?.addEventListener('click', () => this._closeLogoutModal());
    this.shadowRoot.getElementById('logout-confirm')?.addEventListener('click', () => this._handleLogout());

    this.shadowRoot.getElementById('delete-cancel')?.addEventListener('click', () => this._closeDeleteModal());
    this.shadowRoot.getElementById('delete-confirm')?.addEventListener('click', () => this._handleDeleteAccount());

    // Re-emitir el evento movie-clicked al documento para que las vistas manejen el modal
    this.shadowRoot.querySelectorAll('movie-card').forEach((card) => {
      card.addEventListener('movie-clicked', (e) => {
        document.dispatchEvent(new CustomEvent('movie-clicked', { detail: e.detail, bubbles: true, composed: true }));
      });
    });
  }
}

customElements.define('user-profile-view', UserProfileView);