const followListSheet = new CSSStyleSheet();

followListSheet.replaceSync(`
  :host {
    display: none;
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    z-index: 9999;
    font-family: 'Inter', -apple-system, sans-serif;
  }

  :host([open]) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .backdrop {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background-color: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
  }

  .modal-container {
    background-color: #111;
    border: 1px solid #1e1e1e;
    border-radius: 20px;
    padding: 24px;
    width: 90%;
    max-width: 450px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 10;
    color: white;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes modalIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid #1e1e1e;
    padding-bottom: 15px;
  }

  .header h2 { 
    margin: 0; 
    font-size: 20px; 
    font-weight: 800; 
    text-transform: capitalize;
  }

  .close-btn {
    cursor: pointer;
    color: #666;
    background: none;
    border: none;
    padding: 5px;
    display: flex;
    transition: color 0.2s ease;
  }

  .close-btn:hover { color: white; }

  .user-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    overflow-y: auto;
    padding-right: 5px;
  }

  
  .user-list::-webkit-scrollbar { width: 6px; }
  .user-list::-webkit-scrollbar-track { background: transparent; }
  .user-list::-webkit-scrollbar-thumb { background-color: #333; border-radius: 10px; }

  .user-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .user-avatar {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    object-fit: cover;
    background-color: #222;
  }

  .user-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .user-name {
    font-size: 15px;
    font-weight: 700;
    color: white;
  }

  .user-handle {
    font-size: 13px;
    font-weight: 500;
    color: #888;
  }

  .btn-follow {
    background-color: #00d2ff;
    color: #000;
    border: none;
    border-radius: 20px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.1s ease, filter 0.2s ease;
  }

  .btn-follow:active { transform: scale(0.96); }
  .btn-follow:hover { filter: brightness(1.1); }

  .btn-following {
    background-color: transparent;
    color: #fff;
    border: 1px solid #444;
  }

  .btn-following:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`);

class FollowListModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [followListSheet];
    
    
    this.mockData = {
      followers: [
        { name: "María López", handle: "@mary_cine", avatar: "https://ui-avatars.com/api/?name=Maria+Lopez&background=random", isFollowing: true },
        { name: "Juan Pérez", handle: "@juancho99", avatar: "https://ui-avatars.com/api/?name=Juan+Perez&background=random", isFollowing: false },
        { name: "Cinefilo Master", handle: "@cinemaster", avatar: "https://ui-avatars.com/api/?name=Cinefilo+Master&background=random", isFollowing: false },
        { name: "Ana Sofía", handle: "@anasofia_12", avatar: "https://ui-avatars.com/api/?name=Ana+Sofia&background=random", isFollowing: true }
      ],
      following: [
        { name: "Christopher Nolan", handle: "@nolan_oficial", avatar: "https://ui-avatars.com/api/?name=Christopher+Nolan&background=random", isFollowing: true },
        { name: "María López", handle: "@mary_cine", avatar: "https://ui-avatars.com/api/?name=Maria+Lopez&background=random", isFollowing: true },
        { name: "Denis Villeneuve", handle: "@denis_v", avatar: "https://ui-avatars.com/api/?name=Denis+Villeneuve&background=random", isFollowing: true }
      ]
    };

    this._render();
  }

  
  open(type = 'followers') { 
    this.setAttribute('data-type', type);
    this._updateList(type);
    this.setAttribute('open', ''); 
  }
  
  close() { 
    this.removeAttribute('open'); 
  }

  _updateList(type) {
    const titleEl = this.shadowRoot.getElementById('modal-title');
    const listContainer = this.shadowRoot.getElementById('user-list');
    
    titleEl.textContent = type === 'followers' ? 'Seguidores' : 'Seguidos';
    listContainer.innerHTML = ''; //limpiamos la lista

    const users = this.mockData[type] || [];

    users.forEach(user => {
      const isFollowingClass = user.isFollowing ? 'btn-following' : '';
      const buttonText = user.isFollowing ? 'Siguiendo' : 'Seguir';

      const userHTML = `
        <div class="user-item">
          <img src="${user.avatar}" alt="${user.name}" class="user-avatar">
          <div class="user-info">
            <span class="user-name">${user.name}</span>
            <span class="user-handle">${user.handle}</span>
          </div>
          <button class="btn-follow ${isFollowingClass}">${buttonText}</button>
        </div>
      `;
      listContainer.insertAdjacentHTML('beforeend', userHTML);
    });
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <div class="backdrop"></div>
      <div class="modal-container">
        <div class="header">
          <h2 id="modal-title">Usuarios</h2>
          <button class="close-btn" id="btn-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="user-list" id="user-list">
        </div>
      </div>
    `;

    this.shadowRoot.getElementById('btn-close').onclick = () => this.close();
    this.shadowRoot.querySelector('.backdrop').onclick = () => this.close();
  }
}

if (!customElements.get('follow-list-modal')) {
  customElements.define('follow-list-modal', FollowListModal);
}