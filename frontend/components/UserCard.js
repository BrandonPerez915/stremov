import { apiClient } from "../scripts/utils/apiClient.js";

const userCardSheet = new CSSStyleSheet();

userCardSheet.replaceSync(`
  :host {
    display: block;
    font-family: 'Inter', sans-serif;
    box-sizing: border-box;
  }

  .card {
    background-color: #f4f5f6;
    border-radius: 16px;
    padding: 20px;
    max-width: 300px;
    min-width: 220px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    color: #1a1a1a;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border: 1px solid rgba(0, 0, 0, 0.03);
  }

  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .top-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    width: 100%;
    gap: 12px;
  }

  .avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    background-color: #e5e7eb;
    flex-shrink: 0;
  }

  .follow-btn {
    background-color: #3b82f6;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
    font-family: inherit;
    white-space: nowrap;
  }

  .follow-btn:hover {
    background-color: #2563eb;
  }

  .follow-btn:active {
    transform: scale(0.96);
  }

  /* Estado visual cuando ya lo sigues (Unfollow) */
  .follow-btn.following {
    background-color: #fca5a5;
    color: #991b1b;
  }

  .follow-btn.following:hover {
    background-color: #f87171;
    color: white;
  }

  .name {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 20px 0;
    color: #18181b;
    display: block;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .stats-container {
    display: flex;
    gap: 20px;
    width: 100%;
    align-items: center;
  }

  .stat {
    display: flex;
    align-items: baseline;
    gap: 5px;
  }

  .stat-value {
    font-size: 16px;
    font-weight: 700;
    color: #18181b;
  }

  .stat-label {
    font-size: 13px;
    font-weight: 500;
    color: #6b7280;
  }
`);

class UserCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [userCardSheet];
    this._user = null;
  }

  set user(data) {
    this._user = data;
    this._render();
  }

  get user() {
    return this._user;
  }

  connectedCallback() {
    this._render();
  }

  _setupListeners() {
    const btn = this.shadowRoot.querySelector('.follow-btn');
    const card = this.shadowRoot.querySelector('.card');

    card.addEventListener('click', () => {
      const username = this._user ? this._user.username : this.getAttribute('name');
      if (username) {
        this.dispatchEvent(new CustomEvent('user-click', {
          detail: { username: username },
          bubbles: true,
          composed: true
        }));
      }
    });

    if (btn) {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();

        const username = this._user ? this._user.username : this.getAttribute('name');
        if (!username) return;

        const isFollowing = btn.classList.contains('following');

        btn.classList.toggle('following');
        btn.textContent = isFollowing ? 'Follow' : 'Unfollow';

        try {
          if (isFollowing) {
            await apiClient.delete(`/users/${encodeURIComponent(username)}/follow`);
          } else {
            await apiClient.post(`/users/${encodeURIComponent(username)}/follow`);
          }

          this.dispatchEvent(new CustomEvent('toggle-follow', {
            detail: { isFollowing: !isFollowing, username: username },
            bubbles: true,
            composed: true
          }));

        } catch (error) {
          console.error('Error al actualizar el estado de seguimiento:', error);
          btn.classList.toggle('following');
          btn.textContent = isFollowing ? 'Unfollow' : 'Follow';
        }
      });
    }
  }

  _render() {
    let name = this.getAttribute('name') || 'Unknown User';
    let avatar = this.getAttribute('avatar') || '';
    let followersCount = this.getAttribute('followers') || '0';
    let followingCount = this.getAttribute('following') || '0';
    let isFollowingAttr = this.hasAttribute('is-following');

    // 1. OBTENER ID DEL USUARIO LOGUEADO (A prueba de fallos)
    let currentUserId = null;
    try {
      const rawData = localStorage.getItem('userData');
      if (rawData) {
        const sessionData = JSON.parse(rawData);
        // Toma el ID sin importar si tu backend lo guardó como "id" o "_id"
        const extractedId = sessionData._id || sessionData.id;
        if (extractedId) currentUserId = String(extractedId);
      }
    } catch (error) {
      console.warn("UserCard: Error leyendo userData del localStorage");
    }

    // --- LOGS PARA DEPURACIÓN (Abre la consola F12 de tu navegador para verlos) ---
    console.log(`[UserCard] Renderizando tarjeta para: ${this._user?.username || name}`);
    console.log(`[UserCard] ID del usuario logueado en LocalStorage:`, currentUserId);
    console.log(`[UserCard] Lista de followers recibida de la API:`, this._user?.followers);

    // 2. VERIFICAR SEGUIMIENTO
    if (this._user) {
      name = this._user.username || name;
      avatar = this._user.avatarUrl || avatar;
      followersCount = this._user.followers ? this._user.followers.length : 0;
      followingCount = this._user.following ? this._user.following.length : 0;

      // Solo verificamos si tenemos el ID del usuario actual y si hay seguidores
      if (currentUserId && Array.isArray(this._user.followers)) {

        isFollowingAttr = this._user.followers.some(follower => {
          let followerId = '';

          if (follower && typeof follower === 'object') {
             // Si el backend hizo .populate(), es un objeto con _id
             // Si es un ObjectId nativo de Mongoose, String() extrae su valor hexadecimal
             followerId = follower._id ? String(follower._id) : String(follower);
          } else {
             // Si el backend no hizo populate, es un string plano
             followerId = String(follower);
          }

          return followerId === currentUserId;
        });

        console.log(`[UserCard] ¿Match encontrado? (isFollowing):`, isFollowingAttr);
      }
    }

    const finalAvatar = (avatar && avatar.trim() !== '')
      ? avatar
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e5e7eb&color=18181b&size=150`;

    this.shadowRoot.innerHTML = `
      <div class="card">
        <div class="top-section">
          <img
            class="avatar"
            src="${finalAvatar}"
            alt="Avatar de ${name}"
            onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e5e7eb&color=18181b&size=150'"
          >
          <button class="follow-btn ${isFollowingAttr ? 'following' : ''}">
            ${isFollowingAttr ? 'Unfollow' : 'Follow'}
          </button>
        </div>

        <h1 class="name" title="${name}">${name}</h1>

        <div class="stats-container">
          <div class="stat">
            <span class="stat-value">${followersCount}</span>
            <span class="stat-label">Followers</span>
          </div>
          <div class="stat">
            <span class="stat-value">${followingCount}</span>
            <span class="stat-label">Following</span>
          </div>
        </div>
      </div>
    `;

    this._setupListeners();
  }
}

if (!customElements.get('user-card')) {
  customElements.define('user-card', UserCard);
}
