const sidebarSheet = new CSSStyleSheet();

sidebarSheet.replaceSync(`
  :host {
    display: block;
    width: 260px;
    height: 100dvh;
    background-color: var(--bg-color);
    color: var(--text-primary);
    border-right: 1px solid var(--border-color);
    flex-shrink: 0;
    box-sizing: border-box;
  }

  .icon {
    color: var(--text-secondary);
    width: 18px;
    font-family: 'Material Symbols Outlined';
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    font-variation-settings: 'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24;
  }

  #close-icon {
    display: none;
  }

  .sidebar {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 24px;
    overflow-y: auto;
    box-sizing: border-box;
    position: relative;
    z-index: 1000;
  }

  .sidebar::-webkit-scrollbar {
    width: 0;
    display: none;
  }

  .header {
    height: fit-content;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 40px;
  }

  .logo {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -1px;
    opacity: 0.8;
    user-select: none;
  }

  .menu-section {
    margin-bottom: 30px;
  }

  .section-title {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    margin-bottom: 16px;
    letter-spacing: 1px;
  }

  .nav-menu, .following-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .load-more-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.85rem;
    cursor: pointer;
    margin-top: 10px;
    transition: color 0.2s;
    padding: 5px 0;
  }

  .load-more-btn:hover {
    color: var(--text-primary);
  }

  @media (max-width: 900px) {
    #close-icon {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #close-icon:hover {
      color: var(--text-primary);
    }
  }
`);

class CustomSidebar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [sidebarSheet];
  }

  connectedCallback() {
    this._render();
    this._setupListeners();
  }

  _render() {
    const followingUsersInfo = this.getAttribute('following-users-info') || '[]'
    const followingUsers = JSON.parse(followingUsersInfo);

    this.shadowRoot.innerHTML = `
      <aside class="sidebar">
        <div class="header">
          <span class="logo">■ stremov</span>
          <span id="close-icon" class="icon">close</span>
        </div>

        <section class="menu-section">
          <h3 class="section-title">News Feed</h3>
          <nav class="nav-menu" id="main-nav">
            <sidebar-item icon="home" text="Home" href="/home" active></sidebar-item>
            <sidebar-item icon="video_library" text="Your Lists" href="/your-lists"></sidebar-item>
            <sidebar-item icon="group" text="Social" href="#"></sidebar-item>
            <sidebar-item icon="trending_up" text="Ranking" href="#"></sidebar-item>
            <sidebar-item icon="settings" text="Settings" href="#"></sidebar-item>
          </nav>
        </section>

        <section class="menu-section">
          <h3 class="section-title">Following</h3>
          <div class="following-list">
            ${
              followingUsers.map(user => `
                <sidebar-user
                  name="${user.name}"
                  img-src="${user.imgSrc}"
                  ${user.verified ? 'verified' : ''}
                ></sidebar-user>
              `).join('')
            }
          </div>
          <button class="load-more-btn">
            See more
          </button>
        </section>
      </aside>
    `;
  }

  _setupListeners() {
    const closeIcon = this.shadowRoot.querySelector('#close-icon');
    const backdrop = document.querySelector('.backdrop');

    closeIcon.addEventListener('click', () => {
      this.classList.remove('open');
      this.classList.add('closed');
      backdrop.classList.add('hidden');
    });

    backdrop.addEventListener('click', () => {
      this.classList.remove('open');
      this.classList.add('closed');
      backdrop.classList.add('hidden');
    });
  }
}

if (!customElements.get('custom-sidebar')) {
  customElements.define('custom-sidebar', CustomSidebar);
}
