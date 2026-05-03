const toastSheet = new CSSStyleSheet();

toastSheet.replaceSync(`
  :host {
    position: fixed;
    bottom: 24px;
    right: 50px;
    z-index: 10000;
    font-family: 'Inter', sans-serif;
    display: flex;
    flex-direction: column;
    gap: 12px;
    pointer-events: none;
  }

  .toast-container {
    pointer-events: auto;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: start;
    gap: 16px;
    width: 100%;
    min-width: 320px;
    max-width: 450px;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid transparent;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    background-color: white;
    animation: toastIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }

  @keyframes toastIn {
    from { transform: translateX(100%) scale(0.9); opacity: 0; }
    to { transform: translateX(0) scale(1); opacity: 1; }
  }

  @keyframes toastOut {
    from { transform: translateX(0) scale(1); opacity: 1; }
    to { transform: translateX(100%) scale(0.9); opacity: 0; }
  }

  .toast-container.hiding {
    animation: toastOut 0.3s ease-in forwards;
  }

  /* Variantes de Color */
  :host([type="success"]) .toast-container { background: #f0fdf4; border-color: #bbf7d0; color: #166534; }
  :host([type="info"]) .toast-container { background: #eff6ff; border-color: #bfdbfe; color: #1e40af; }
  :host([type="warning"]) .toast-container { background: #fffbeb; border-color: #fef3c7; color: #92400e; }
  :host([type="error"]) .toast-container { background: #fef2f2; border-color: #fecaca; color: #991b1b; }

  .icon-box {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 2px;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .title {
    font-weight: 700;
    font-size: 15px;
    margin: 0;
  }

  .message {
    font-size: 14px;
    opacity: 0.9;
    line-height: 1.4;
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: currentColor;
    opacity: 0.5;
    transition: opacity 0.2s;
  }

  .close-btn:hover { opacity: 1; }
`);

class CustomToast extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [toastSheet];
  }

  connectedCallback() {
    this._render();
    this._autoHide();
  }

  _autoHide() {
    const duration = parseInt(this.getAttribute('duration')) || 5000;
    if (duration > 0) {
      setTimeout(() => this.removeToast(), duration);
    }
  }

  removeToast() {
    const container = this.shadowRoot.querySelector('.toast-container');
    if (container) {
      container.classList.add('hiding');
      container.addEventListener('transitionend', () => this.remove());
    }
  }

  _getIcon() {
    const type = this.getAttribute('type') || 'info';
    const icons = {
      success: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`,
      info: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`,
      warning: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`,
      error: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>`
    };
    return icons[type] || icons.info;
  }

  _render() {
    const title = this.getAttribute('title') || 'Notification';
    const message = this.getAttribute('message') || '';

    this.shadowRoot.innerHTML = `
      <div class="toast-container">
          <div class="icon-box">
              ${this._getIcon()}
          </div>
          <div class="content">
              <p class="title">${title}</p>
              <p class="message">${message}</p>
          </div>
          <button class="close-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
          </button>
      </div>
    `;

    this.shadowRoot.querySelector('.close-btn').onclick = () => this.removeToast();
  }
}

if (!customElements.get('custom-toast')) {
  customElements.define('custom-toast', CustomToast);
}

// Helper para invocarla fácilmente
window.toast = (config) => {
  const toast = document.createElement('custom-toast');
  toast.setAttribute('type', config.type || 'info');
  toast.setAttribute('title', config.title || '');
  toast.setAttribute('message', config.message || '');
  toast.setAttribute('duration', config.duration || 5000);
  document.body.appendChild(toast);
}
