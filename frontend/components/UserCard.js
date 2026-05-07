const userCardSheet = new CSSStyleSheet();

userCardSheet.replaceSync(`
  :host {
    display: block;
    font-family: 'Inter', sans-serif;
    background-color: #f4f5f6; /* Fondo claro tipo UI limpia */
    border-radius: 20px;
    padding: 32px 40px;
    max-width: 600px;
    box-sizing: border-box;
    color: #1a1a1a;
  }

  .top-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
  }

  .avatar {
    width: 130px;
    height: 130px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    background-color: #e5e7eb;
  }

  .follow-btn {
    background-color: #3b82f6; /* Azul moderno */
    color: white;
    border: none;
    padding: 12px 28px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
    font-family: inherit;
  }

  .follow-btn:hover {
    background-color: #2563eb;
  }

  .follow-btn:active {
    transform: scale(0.96);
  }

  /* Estado visual cuando ya lo sigues */
  .follow-btn.following {
    background-color: #e5e7eb;
    color: #374151;
  }

  .follow-btn.following:hover {
    background-color: #d1d5db;
  }

  .name {
    font-size: 42px;
    font-weight: 700;
    margin: 0 0 40px 0;
    letter-spacing: -0.03em;
    color: #18181b;
  }

  .stats-container {
    display: flex;
    gap: 32px;
  }

  .stat {
    font-size: 20px;
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  .stat-value {
    font-weight: 700;
    color: #18181b;
  }

  .stat-label {
    font-weight: 500;
    color: #6b7280;
  }

  @media (max-width: 500px) {
    :host {
      padding: 24px;
    }
    .avatar {
      width: 100px;
      height: 100px;
    }
    .name {
      font-size: 32px;
      margin-bottom: 32px;
    }
    .stat {
      font-size: 18px;
    }
  }
`);

class UserCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [userCardSheet];
  }

  connectedCallback() {
    this._render();
    this._setupListeners();
  }

  _setupListeners() {
    const btn = this.shadowRoot.querySelector('.follow-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        const isFollowing = btn.classList.contains('following');

        // Toggle visual
        if (isFollowing) {
          btn.classList.remove('following');
          btn.textContent = 'Follow';
        } else {
          btn.classList.add('following');
          btn.textContent = 'Following';
        }

        // Emitir evento para que tu lógica superior reaccione
        this.dispatchEvent(new CustomEvent('toggle-follow', {
          detail: { isFollowing: !isFollowing },
          bubbles: true,
          composed: true
        }));
      });
    }
  }

  _render() {
    // Tomamos datos de los atributos o usamos los valores por defecto del diseño
    const name = this.getAttribute('name') || 'Tobias Whetton';
    const avatar = this.getAttribute('avatar') || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80';
    const followers = this.getAttribute('followers') || '321';
    const following = this.getAttribute('following') || '30';
    const isFollowingAttr = this.hasAttribute('is-following');

    this.shadowRoot.innerHTML = `
      <div class="top-section">
        <img class="avatar" src="${avatar}" alt="Avatar de ${name}">
        <button class="follow-btn ${isFollowingAttr ? 'following' : ''}">
          ${isFollowingAttr ? 'Following' : 'Follow'}
        </button>
      </div>

      <h1 class="name">${name}</h1>

      <div class="stats-container">
        <div class="stat">
          <span class="stat-value">${followers}</span>
          <span class="stat-label">Followers</span>
        </div>
        <div class="stat">
          <span class="stat-value">${following}</span>
          <span class="stat-label">Following</span>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('user-card')) {
  customElements.define('user-card', UserCard);
}
