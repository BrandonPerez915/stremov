const userReviewCardSheet = new CSSStyleSheet();

userReviewCardSheet.replaceSync(`
:host { display:block; font-family: 'Inter', sans-serif; }
.user-review-card {
  background-color: var(--bg-color);
  border-radius: 16px;
  padding: 18px;
  width: 100%;
  box-shadow: 0 6px 18px rgba(0,0,0,0.35);
  box-sizing: border-box;
}
.card-top {
  display:flex;
  align-items:center;
  gap:12px;
  margin-bottom:12px;
}
.movie-title { font-size:16px; font-weight:700; color:var(--text-primary); margin:0; }
.stars { display:flex; gap:4px; }
.star-icon { color:var(--yellow-100,#f5c518); font-size:20px; }
.numeric-rating { margin-left:auto; color:var(--text-secondary); font-size:13px; }
.review-body { color:var(--text-secondary); font-size:14px; line-height:1.5; margin:0; }
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.55); display:grid; place-items:center; padding:20px; z-index:1000; }
.modal-card { background:var(--bg-color); border-radius:12px; padding:18px; width:100%; max-width:560px; box-shadow:0 12px 30px rgba(0,0,0,0.45); }
.close-modal { position:absolute; right:12px; top:12px; background:none; border:none; cursor:pointer; }
`);

class UserReviewCard extends HTMLElement {
  constructor(){
    super();
    this.attachShadow({mode:'open'});
    this.shadowRoot.adoptedStyleSheets = [userReviewCardSheet];
  }

  static get observedAttributes(){
    return ['rating','review-text','movie-title','date'];
  }

  attributeChangedCallback(){ this._render(); }

  connectedCallback(){ this._render(); this._setupListeners(); }

  _render(){
    const rating = parseInt(this.getAttribute('rating')) || 5;
    const reviewText = this.getAttribute('review-text') || 'No review provided.';
    const movieTitle = this.getAttribute('movie-title') || 'Unknown Movie';
    const date = this.getAttribute('date') || '';

    let starsHTML = '';
    for(let i=0;i<rating;i++) starsHTML += `<span class="icon star-icon">star</span>`;

    this.shadowRoot.innerHTML = `
      <div class="user-review-card">
        <div class="card-top">
          <h3 class="movie-title">${movieTitle}</h3>
          <div class="stars">${starsHTML}</div>
          <div class="numeric-rating">${rating} / 5</div>
        </div>

        <p class="review-body">${reviewText}</p>
      </div>

      <div class="modal-overlay hidden" id="modal">
        <div class="modal-card">
          <button class="close-modal" id="closeModal"><span class="icon">close</span></button>
          <h3 class="movie-title">${movieTitle}</h3>
          <div class="stars">${starsHTML}</div>
          <p style="color:var(--text-secondary); margin-top:12px;">${reviewText}</p>
        </div>
      </div>
    `;
  }

  _setupListeners(){
    // allow opening modal by clicking anywhere on card
    const card = this.shadowRoot.querySelector('.user-review-card');
    const modal = this.shadowRoot.getElementById('modal');
    const close = this.shadowRoot.getElementById('closeModal');
    if(card){
      card.style.cursor = 'pointer';
      card.addEventListener('click', ()=> modal.classList.remove('hidden'));
    }
    if(close) close.addEventListener('click', ()=> modal.classList.add('hidden'));
    if(modal) modal.addEventListener('click', (e)=> { if(e.target===modal) modal.classList.add('hidden'); });
  }
}

if(!customElements.get('user-review-card')){
  customElements.define('user-review-card', UserReviewCard);
}
