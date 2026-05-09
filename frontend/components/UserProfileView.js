import { getUser, updateUser, deleteUser, logout, getFavoriteList, getFollowers, getFollowing } from '../scripts/api.js';

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

  /* Tarjeta de Perfil */
  .profile-card {
    width: 100%;
    display: grid;
    gap: 24px;
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border-color);
    border-radius: 28px;
    padding: 28px;
    box-shadow: 0 24px 55px rgba(0,0,0,0.25);
    margin-bottom: 24px;
  }

  .profile-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
  .profile-summary { display: flex; flex-direction: column; gap: 20px; }
  .profile-header { display: flex; flex-direction: column; align-items: flex-start; gap: 18px; margin-bottom: 0; text-align: left; }

  .avatar-container { position: relative; width: 140px; height: 140px; }
  .profile-pic { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 4px solid var(--primary-color); box-shadow: 0 20px 40px rgba(0,0,0,0.18); }

  .edit-avatar-btn {
    position: absolute; bottom: 0; right: 0; background: var(--primary-color); border: none; border-radius: 50%;
    width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  }

  .user-info-brief { display: flex; flex-direction: column; gap: 8px; }
  .user-info-brief h1 { margin: 0; font-size: 30px; font-weight: 700; }
  .user-email-sub { color: var(--text-secondary); font-size: 15px; margin: 0; }

  .status-pill { display: inline-flex; align-items: center; justify-content: center; padding: 6px 14px; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary); font-size: 13px; margin-top: 0; }

  /* Estadísticas Sociales */
  .profile-stats { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 6px; }
  .profile-stat { min-width: 132px; padding: 12px 16px; border-radius: 18px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
  .profile-stat-button { display: inline-flex; flex-direction: column; align-items: flex-start; gap: 0; text-align: left; cursor: pointer; color: inherit; font: inherit; transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease; appearance: none; }
  .profile-stat-button:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.16); transform: translateY(-2px); }
  .profile-stat-button:focus-visible, .social-modal-close:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  .profile-stat strong { display: block; font-size: 22px; line-height: 1; }
  .profile-stat span { display: block; margin-top: 6px; color: var(--text-secondary); font-size: 13px; }

  /* Detalles de Perfil */
  .details-card { background: rgba(255,255,255,0.04); border: 1px solid var(--border-color); border-radius: 22px; padding: 24px; }
  .details-card h2 { font-size: 18px; margin-bottom: 22px; color: var(--text-primary); }
  .detail-row { display: grid; grid-template-columns: 140px 1fr; gap: 16px; align-items: center; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .detail-row:last-child { border-bottom: none; }
  .detail-label { color: var(--text-secondary); font-size: 14px; }
  .detail-value, .detail-value strong { font-weight: 600; color: var(--text-primary); text-align: right; }
  .password-dots { letter-spacing: 0.22em; }

  input[type='text'], input[type='email'] { 
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
  }

  /* Botones Generales */
  .actions { display: flex; gap: 12px; margin-top: 22px; justify-content: center; flex-wrap: wrap; }
  .btn { padding: 12px 24px; border-radius: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit; border: none; }
  .btn-primary { background: var(--primary-color); color: white; }
  .btn-secondary { background: rgba(255,255,255,0.06); border: 1px solid var(--border-color); color: var(--text-primary); }
  .btn-danger { background: rgba(214,69,69,0.12); border: 1px solid #d64545; color: var(--text-primary); }
  .btn:hover { opacity: 0.95; transform: translateY(-1px); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* Estructura de Modales (Reusables) */
  .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: grid; place-items: center; padding: 24px; z-index: 10000; backdrop-filter: blur(4px); }
  .modal-backdrop.social { background: rgba(0,0,0,0.58); backdrop-filter: blur(8px); z-index: 12000; }

  .modal-card { background: var(--bg-color, #1f2128); border: 1px solid var(--border-color); border-radius: 24px; padding: 28px; box-shadow: 0 18px 45px rgba(0,0,0,0.35); }
  .modal-card.confirm { width: min(500px, 100%); }
  .modal-card.social { width: min(560px, 100%); max-height: min(78vh, 760px); display: flex; flex-direction: column; gap: 18px; padding: 24px; overflow: hidden; }

  .confirm-modal h2 { margin: 0 0 12px; font-size: 22px; }
  .confirm-modal p { color: var(--text-secondary); margin: 0 0 24px; line-height: 1.7; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 12px; flex-wrap: wrap; }

  /* Modal Social Específica */
  .social-modal-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
  .social-modal-header h2 { margin: 0; font-size: 22px; }
  .social-modal-header p { margin: 8px 0 0; color: var(--text-secondary); line-height: 1.5; }

  .social-modal-close { flex-shrink: 0; width: 42px; height: 42px; border-radius: 50%; border: 1px solid var(--border-color); background: rgba(255,255,255,0.05); color: var(--text-primary); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
  .social-users-list { overflow: auto; display: grid; gap: 12px; padding-right: 4px; }

  .social-user-item { display: flex; align-items: center; gap: 14px; padding: 12px 14px; border-radius: 18px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
  .social-user-avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
  .social-user-meta { display: flex; flex-direction: column; min-width: 0; }
  .social-user-name { font-size: 15px; line-height: 1.3; }
  .social-user-handle, .social-empty { color: var(--text-secondary); font-size: 14px; }
  .social-empty { margin: 4px 0 0; padding: 18px; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.12); }

  .icon { font-family: 'Material Symbols Outlined'; font-size: 20px; }

  @media (max-width: 720px) {
    :host { padding: 16px; }
    .profile-card { padding: 20px; }
    .avatar-container { width: 120px; height: 120px; }
    .details-card { padding: 20px; }
    .detail-row { grid-template-columns: 1fr; text-align: left; }
    .detail-value { text-align: left; }
  }
`);

class UserProfileView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [userProfileSheet];

    // Estados UI
    this.isEditing = false;
    this.isSaving = false;
    this.showLogoutModal = false;
    this.showDeleteModal = false;
    this.socialModalType = null;
    this.hasAuth = !!localStorage.getItem('jwtToken');
    this._saveError = '';

    // Estados Data
    const storedUser = JSON.parse(localStorage.getItem('userData') || '{}');
    const tokenUsername = this._getUsernameFromToken();
    const initialUsername = storedUser.username || tokenUsername || 'User';

    this.originalUsername = initialUsername;
    this.userData = {
      username: initialUsername,
      email: storedUser.email || '',
      avatarUrl: localStorage.getItem('avatarUrl') || storedUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(initialUsername)}`,
      accountStatus: ''
    };
    this.favorites = [];
    this.followers = [];
    this.following = [];
    this.userObjId = null;
  }

  _getUsernameFromToken() {
    const token = localStorage.getItem('jwtToken');
    if (!token) return '';
    try {
      const payload = token.split('.')[1];
      const padded = payload.padEnd(payload.length + (4 - (payload.length % 4)) % 4, '=');
      const decoded = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(Array.from(decoded, c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''))).username || '';
    } catch { return ''; }
  }

  async connectedCallback() {
    // 1. Construir la estructura maestra UNA SOLA VEZ.
    this._renderBaseStructure();

    // 2. Llenar el perfil de inmediato con datos locales (Skeleton/Cache).
    this._updateProfileDOM();

    if (this.hasAuth) {
      await this._loadUserData();
      // 3. Volver a llenar el perfil con datos reales del servidor, SIN destruir el DOM maestro.
      this._updateProfileDOM();
    }
  }

  async _loadUserData() {
    const tokenUsername = this._getUsernameFromToken();
    if (!tokenUsername) return;

    try {
      const { user } = await getUser(tokenUsername);
      if (user) {
        this.userData.username = user.username || this.userData.username;
        this.userData.email = user.email || this.userData.email;
        this.userData.avatarUrl = user.avatarUrl || this.userData.avatarUrl;         this.originalUsername = user.username || this.originalUsername;
        this.originalUsername = user.username || this.originalUsername;
        this.userObjId = user._id || user.id;

        //actualizamos el localStorage para que se sincronice con datos del servidor
        //lo que faltaba y la razón del por qué fallaba cuando hacíamos edit profile y después no se encontraban listas
        localStorage.setItem('avatarUrl', this.userData.avatarUrl);
        const storedData = JSON.parse(localStorage.getItem('userData') || '{}');
        localStorage.setItem('userData', JSON.stringify({
          ...storedData,
          username: this.userData.username,
          email: this.userData.email,
          avatarUrl: this.userData.avatarUrl,
        }));

        try {
          const favRes = await getFavoriteList(this.userObjId);
          this.favorites = favRes?.list?.movies || favRes?.movies || [];
        } catch (err) { this.favorites = []; }

        const socialResults = await Promise.allSettled([
          getFollowers(user.username), getFollowing(user.username)
        ]);

        this.followers = socialResults[0].status === 'fulfilled' 
          ? (socialResults[0].value?.followers || []) 
          : (Array.isArray(user.followers) ? user.followers : []);
        this.following = socialResults[1].status === 'fulfilled' 
          ? (socialResults[1].value?.following || []) 
          : (Array.isArray(user.following) ? user.following : []);
      }
    } catch (err) {
      console.warn('Could not load profile data', err);
    }
  }

  // ==========================================
  // LÓGICA DE RENDERIZADO POR SECCIONES
  // ==========================================

  // Crea el "cascarón" de la vista para evitar problemas de destrucción del DOM.
  _renderBaseStructure() {
    this.shadowRoot.innerHTML = `
      <div id="profile-section-root"></div>

      <div id="modals-root"></div>
    `;
  }

  // Actualiza estrictamente la tarjeta del perfil
  _updateProfileDOM() {
    const root = this.shadowRoot.getElementById('profile-section-root');
    if (!root) return;

    if (!this.hasAuth) {
      root.innerHTML = `
        <div class="profile-card">
          <div class="profile-header">
            <div class="avatar-container">
              <img src="${this.userData.avatarUrl}" class="profile-pic" alt="Guest">
            </div>
            <div class="user-info-brief">
              <h1>Welcome</h1>
              <p class="user-email-sub">Sign in or register to access your profile.</p>
            </div>
          </div>
          <div class="details-card">
            <h2>No active session</h2>
            <p>To edit your profile, log out, or delete your account, you must first log in.</p>
          </div>
          <div class="actions">
            <button class="btn btn-primary" id="login-btn">Login</button>
            <button class="btn btn-secondary" id="register-btn">Register</button>
          </div>
        </div>
      `;
    } else {
      root.innerHTML = `
        <div class="profile-card">
          <div class="profile-grid">
            <aside class="profile-summary">
              <div class="profile-header">
                <div class="avatar-container">
                  <img src="${this.userData.avatarUrl}" class="profile-pic" alt="Avatar of ${this.userData.username}">
                  ${this.isEditing ? `<button class="edit-avatar-btn" id="avatar-edit-btn"><span class="icon">edit</span></button>` : ''}
                  <input id="avatar-input" type="file" accept="image/*" style="display:none;">
                </div>
                <div class="user-info-brief">
                  <h1>${this.userData.username}</h1>
                  <p class="user-email-sub">${this.userData.email}</p>
                  ${this.userData.accountStatus ? `<span class="status-pill">${this.userData.accountStatus}</span>` : ''}
                  <div class="profile-stats">
                    <button type="button" class="profile-stat profile-stat-button" id="following-stat-btn">
                      <strong>${Array.isArray(this.following) ? this.following.length : 0}</strong>
                      <span>Seguidos</span>
                    </button>
                    <button type="button" class="profile-stat profile-stat-button" id="followers-stat-btn">
                      <strong>${Array.isArray(this.followers) ? this.followers.length : 0}</strong>
                      <span>Seguidores</span>
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            <section class="details-card">
              <h2>Personal details</h2>
              <div class="detail-row">
                <span class="detail-label">Username</span>
                ${this.isEditing
                  ? `<input type="text" id="edit-name" value="${this.userData.username}">`
                  : `<strong class="detail-value">${this.userData.username}</strong>`}
              </div>
              <div class="detail-row">
                <span class="detail-label">Email</span>
                ${this.isEditing
                  ? `<input type="email" id="edit-email" value="${this.userData.email}">`
                  : `<strong class="detail-value">${this.userData.email}</strong>`}
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
                 <button class="btn btn-primary" id="save-btn" ${this.isSaving ? 'disabled' : ''}>
                   ${this.isSaving ? 'Saving...' : 'Save'}
                 </button>`
              : `<button class="btn btn-primary" id="edit-btn">Edit profile</button>`
            }
            <button class="btn btn-secondary" id="logout-btn">Logout</button>
            <button class="btn btn-danger" id="delete-btn">Delete account</button>
          </div>
          ${this._saveError ? `<p class="error-msg">${this._saveError}</p>` : ''}
        </div>
      `;
    }

    this._attachProfileListeners();
  }

  // Actualiza estrictamente el contenedor de las modales. Las modales se construyen o destruyen de verdad del DOM.
  _updateModalsDOM() {
    const root = this.shadowRoot.getElementById('modals-root');
    if (!root) return;

    let html = '';

    if (this.showLogoutModal) {
      html += `
        <div class="modal-backdrop" id="logout-backdrop">
          <div class="modal-card confirm" role="dialog" aria-modal="true">
            <h2>Logout</h2>
            <p>Are you sure you want to log out?</p>
            <div class="modal-actions">
              <button class="btn btn-secondary" id="logout-cancel">Cancel</button>
              <button class="btn btn-primary" id="logout-confirm">Confirm</button>
            </div>
          </div>
        </div>
      `;
    }

    if (this.showDeleteModal) {
      html += `
        <div class="modal-backdrop" id="delete-backdrop">
          <div class="modal-card confirm" role="dialog" aria-modal="true">
            <h2>Delete account</h2>
            <p>Are you sure? This action cannot be undone.</p>
            <div class="modal-actions">
              <button class="btn btn-secondary" id="delete-cancel">Cancel</button>
              <button class="btn btn-danger" id="delete-confirm">Confirm</button>
            </div>
          </div>
        </div>
      `;
    }

    if (this.socialModalType) {
      const type = this.socialModalType;
      const copy = type === 'following'
        ? { title: 'Seguidos', subtitle: 'Usuarios que este perfil sigue actualmente.', empty: 'Aún no sigues a nadie.' }
        : { title: 'Seguidores', subtitle: 'Usuarios que siguen este perfil.', empty: 'Todavía nadie sigue a este usuario.' };

      const users = type === 'following' ? this.following : this.followers;
      const usersMarkup = users.length
        ? users.map((user) => `
          <article class="social-user-item">
            <img src="${user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'User')}`}" class="social-user-avatar" alt="Avatar">
            <div class="social-user-meta">
              <strong class="social-user-name">${user.username || 'Usuario'}</strong>
              <span class="social-user-handle">@${user.username || 'usuario'}</span>
            </div>
          </article>
        `).join('')
        : `<p class="social-empty">${copy.empty}</p>`;

      html += `
        <div class="modal-backdrop social" id="social-backdrop">
          <section class="modal-card social" role="dialog" aria-modal="true">
            <div class="social-modal-header">
              <div>
                <h2>${copy.title}</h2>
                <p>${copy.subtitle}</p>
              </div>
              <button class="social-modal-close" id="social-modal-close" aria-label="Cerrar modal">
                <span class="icon">close</span>
              </button>
            </div>
            <div class="social-users-list">
              ${usersMarkup}
            </div>
          </section>
        </div>
      `;
    }

    root.innerHTML = html;
    this._attachModalsListeners();
  }

  // ==========================================
  // GESTIÓN DE EVENTOS
  // ==========================================

_attachProfileListeners() {
    this.shadowRoot.getElementById('edit-btn')?.addEventListener('click', () => {
      this.isEditing = true;
      this._saveError = '';
      this._updateProfileDOM();
    });
    this.shadowRoot.getElementById('cancel-btn')?.addEventListener('click', () => {
      this.isEditing = false;
      this._saveError = '';
      this._updateProfileDOM();
    });
    this.shadowRoot.getElementById('save-btn')?.addEventListener('click', () => this._handleSave());
 
    this.shadowRoot.getElementById('logout-btn')?.addEventListener('click', () => { this.showLogoutModal = true; this._updateModalsDOM(); });
    this.shadowRoot.getElementById('delete-btn')?.addEventListener('click', () => { this.showDeleteModal = true; this._updateModalsDOM(); });
 
    this.shadowRoot.getElementById('followers-stat-btn')?.addEventListener('click', () => { this.socialModalType = 'followers'; this._updateModalsDOM(); });
    this.shadowRoot.getElementById('following-stat-btn')?.addEventListener('click', () => { this.socialModalType = 'following'; this._updateModalsDOM(); });
 
    this.shadowRoot.getElementById('avatar-edit-btn')?.addEventListener('click', () => this.shadowRoot.getElementById('avatar-input')?.click());
    this.shadowRoot.getElementById('avatar-input')?.addEventListener('change', (e) => this._handleAvatarChange(e));
 
    this.shadowRoot.getElementById('login-btn')?.addEventListener('click', () => window.location.href = '/login');
    this.shadowRoot.getElementById('register-btn')?.addEventListener('click', () => window.location.href = '/register');
  }

  _attachModalsListeners() {
    // Escuchadores de Logout Modal
    this.shadowRoot.getElementById('logout-cancel')?.addEventListener('click', () => { this.showLogoutModal = false; this._updateModalsDOM(); });
    this.shadowRoot.getElementById('logout-confirm')?.addEventListener('click', () => { if (this.hasAuth) logout(); });

    // Escuchadores de Delete Modal
    this.shadowRoot.getElementById('delete-cancel')?.addEventListener('click', () => { this.showDeleteModal = false; this._updateModalsDOM(); });
    this.shadowRoot.getElementById('delete-confirm')?.addEventListener('click', async () => {
      try { await deleteUser(this.userData.username); logout(); } catch (err) { alert('Deletion failed: ' + err.message); }
    });

    // Escuchadores de Social Modal
    this.shadowRoot.getElementById('social-modal-close')?.addEventListener('click', () => { this.socialModalType = null; this._updateModalsDOM(); });

    // Cerrar modales haciendo click fuera del cuadro
    const backdrops = ['logout-backdrop', 'delete-backdrop', 'social-backdrop'];
    backdrops.forEach(id => {
      this.shadowRoot.getElementById(id)?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
          this.showLogoutModal = false;
          this.showDeleteModal = false;
          this.socialModalType = null;
          this._updateModalsDOM();
        }
      });
    });
  }

  // ==========================================
  // ACCIONES DE DATOS
  // ==========================================

  async _handleSave() {
    const newName = this.shadowRoot.querySelector('#edit-name').value.trim();
    const newEmail = this.shadowRoot.querySelector('#edit-email').value.trim();

    if (!newName || !newEmail) {
      this._saveError = 'Username and email are required.';
      this._updateProfileDOM();
      return;
    }
 
    this.isSaving = true;
    this._saveError = '';
    this._updateProfileDOM();

    try {
      await updateUser({ username: this.originalUsername, data: { username: newName, email: newEmail, avatarUrl: this.userData.avatarUrl } });
      this.userData.username = newName;
      this.userData.email = newEmail;
      this.originalUsername = newName;

      //sincronizar localStorage
      const storedData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      localStorage.setItem('userData', JSON.stringify({
        ...storedData,
        username: newName,
        email: newEmail,
        avatarUrl: this.userData.avatarUrl,
      }));
 
      //actualizar el header
      const header = document.querySelector('custom-header');
      if (header && typeof header.refresh === 'function') header.refresh();
 
      this.isEditing = false;
      window.toast?.({
        type: 'success',
        title: 'Profile updated',
        message: 'Your changes have been saved.',
        duration: 3000
      });
    } catch (err) {
      alert("Update failed: " + err.message);
    } finally { //para que siempre se ejecute, haya error o no
      this.isSaving = false;
      this._updateProfileDOM();
    }
  }

  _handleAvatarChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      this.userData.avatarUrl = dataUrl;
      
      //actualizar UI
      localStorage.setItem('avatarUrl', dataUrl);
      const storedData = JSON.parse(localStorage.getItem('userData') || '{}');
      localStorage.setItem('userData', JSON.stringify({ ...storedData, avatarUrl: dataUrl }));
 
      this._updateProfileDOM();
    };
    reader.readAsDataURL(file);
  }
}

customElements.define('user-profile-view', UserProfileView);
