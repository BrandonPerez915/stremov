const modalListSheet = new CSSStyleSheet();

modalListSheet.replaceSync(`
    :host {
        
        display: none;
        position: fixed;
        top: 0; 
        left: 0; 
        width: 100vw; 
        height: 100vh;
        z-index: 9999;
        font-family: 'Inter', sans-serif;
    }
    
    
    :host([open]) {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .backdrop {
        position: absolute;
        top: 0; 
        left: 0; 
        width: 100%; 
        height: 100%;
        background-color: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(8px);
    }

    .modal-container {
        background-color: #111;
        border: 1px solid #222;
        border-radius: 20px;
        padding: 24px;
        width: 90%;
        max-width: 400px;
        position: relative;
        z-index: 10;
        color: white;
        box-shadow: 0 20px 40px rgba(0,0,0,0.5);
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
    }

    .close-btn {
        background: none; 
        border: none; 
        color: #666; 
        cursor: pointer; 
        padding: 5px;
        transition: color 0.2s ease;
    }

    .close-btn:hover { 
        color: white; 
    }
    
    .lists {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-height: 300px;
        overflow-y: auto;
        margin-bottom: 10px;
    }


    .lists::-webkit-scrollbar { width: 6px; }
    .lists::-webkit-scrollbar-track { background: transparent; }
    .lists::-webkit-scrollbar-thumb { background-color: #333; border-radius: 10px; }

    .list-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 12px;
        border: 1px solid #222;
        border-radius: 10px;
        cursor: pointer;
        transition: border-color 0.2s, background-color 0.2s;
    }

    .list-item:hover { 
        border-color: #00d2ff; 
        background-color: rgba(0, 210, 255, 0.05);
    }

    .list-item input[type="checkbox"] {
        accent-color: #00d2ff;
        width: 18px; 
        height: 18px;
        cursor: pointer;
    }

    .list-name { 
        font-size: 15px; 
        font-weight: 500; 
        color: #ddd;
    }
    
    .done-btn {
        background-color: #00d2ff;
        color: #000;
        border: none;
        border-radius: 10px;
        padding: 14px;
        width: 100%;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        margin-top: 15px;
        transition: transform 0.1s ease, filter 0.2s ease;
    }

    .done-btn:active { transform: scale(0.98); }
    .done-btn:hover { filter: brightness(1.1); }
`);

class AddListModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.adoptedStyleSheets = [modalListSheet];
        this._render();
    }

    
    open() { 
        this.setAttribute('open', ''); 
    }
    
    close() { 
        this.removeAttribute('open'); 
    }

    _render() {
        this.shadowRoot.innerHTML = `
            <div class="backdrop"></div>
            <div class="modal-container">
                <div class="header">
                    <h2>Guardar en...</h2>
                    <button class="close-btn" id="btn-close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <div class="lists">
                    <!-- Ejemplos estáticos de listas -->
                    <label class="list-item">
                        <input type="checkbox">
                        <span class="list-name">Romance !!</span>
                    </label>
                    <label class="list-item">
                        <input type="checkbox">
                        <span class="list-name">Superheroes !!</span>
                    </label>
                    <label class="list-item">
                        <input type="checkbox">
                        <span class="list-name">Para ver el finde</span>
                    </label>
                    <label class="list-item">
                        <input type="checkbox">
                        <span class="list-name">Joyas ocultas</span>
                    </label>
                </div>

                <button class="done-btn" id="btn-done">Listo</button>
            </div>
        `;

        
        this.shadowRoot.getElementById('btn-close').onclick = () => this.close();
        this.shadowRoot.getElementById('btn-done').onclick = () => this.close();
        
        
        this.shadowRoot.querySelector('.backdrop').onclick = () => this.close();
    }
}


if (!customElements.get('add-list-modal')) {
    customElements.define('add-list-modal', AddListModal);
}