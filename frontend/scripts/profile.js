import { getUser, getFavoriteList, getUserReviews } from './api.js';

import '../components/MovieCard.js';
import '../components/ReviewCard.js';
import '../components/MovieModalHeader.js';
import '../components/MovieModalDetails.js';
import '../components/MovieModalReviews.js';
import '../components/MovieModalSimilar.js';
import '../components/MovieModal.js';
import '../components/ReviewsFavoritesContainer.js';

const container = document.getElementById('profile-content');

let currentUser = null;
let favorites = [];
let reviews = [];
let activeSocialModal = null;

function decodeJwtUsername(token) {
  if (!token) return '';

  try {
    const tokenPayload = token.split('.')[1];
    const padded = tokenPayload.padEnd(tokenPayload.length + (4 - (tokenPayload.length % 4)) % 4, '=');
    const decoded = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
    const json = decodeURIComponent(Array.from(decoded, (char) => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2)).join(''));
    const parsed = JSON.parse(json);
    return parsed.username || '';
  } catch {
    return '';
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getAvatarUrl(user) {
  return user?.avatarUrl
    || user?.avatar
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}`;
}

function getProfileStats() {
  return {
    followers: Array.isArray(currentUser?.followers) ? currentUser.followers.length : 0,
    following: Array.isArray(currentUser?.following) ? currentUser.following.length : 0
  };
}

function getSocialUsers(type) {
  if (type === 'following') {
    return Array.isArray(currentUser?.following) ? currentUser.following : [];
  }

  return Array.isArray(currentUser?.followers) ? currentUser.followers : [];
}

function getSocialCopy(type) {
  return type === 'following'
    ? {
        title: 'Seguidos',
        subtitle: 'Usuarios que este perfil sigue actualmente.',
        empty: 'Aún no sigues a nadie.'
      }
    : {
        title: 'Seguidores',
        subtitle: 'Usuarios que siguen este perfil.',
        empty: 'Todavía nadie sigue a este usuario.'
      };
}

function renderSocialList(type) {
  const users = getSocialUsers(type);
  const copy = getSocialCopy(type);

  if (!users.length) {
    return `<p class="social-empty">${copy.empty}</p>`;
  }

  return `
    <div class="social-users-list">
      ${users.map((user) => `
        <article class="social-user-item">
          <img
            src="${escapeHtml(getAvatarUrl(user))}"
            alt="Avatar de ${escapeHtml(user?.username || 'Usuario')}"
            class="social-user-avatar">
          <div class="social-user-meta">
            <strong class="social-user-name">${escapeHtml(user?.username || 'Usuario')}</strong>
            <span class="social-user-handle">@${escapeHtml(user?.username || 'usuario')}</span>
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

function renderSocialModal() {
  if (!activeSocialModal) return '';

  const copy = getSocialCopy(activeSocialModal);

  return `
    <div class="social-modal-backdrop" id="social-modal-backdrop">
      <section class="social-modal" role="dialog" aria-modal="true" aria-labelledby="social-modal-title">
        <div class="social-modal-header">
          <div>
            <h2 id="social-modal-title">${copy.title}</h2>
            <p>${copy.subtitle}</p>
          </div>
          <button class="social-modal-close" id="social-modal-close" type="button" aria-label="Cerrar modal">
            <span class="icon">close</span>
          </button>
        </div>
        ${renderSocialList(activeSocialModal)}
      </section>
    </div>
  `;
}

function formatReviewDate(dateValue) {
  if (!dateValue) return '';

  return new Date(dateValue).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function formatReviewScore(score) {
  const parsed = Number(score || 0);
  if (!parsed) return 1;
  return Math.max(1, Math.min(5, Math.round(parsed / 2)));
}

function renderFavoriteCards() {
  if (!favorites.length) {
    return '<p class="favorites-empty empty-state">Aún no tienes películas favoritas.</p>';
  }

  return `
    <div class="favorites-grid">
      ${favorites.map((movie) => `
        <movie-card
          poster="${escapeHtml(movie.posterUrl || movie.poster || '')}"
          title="${escapeHtml(movie.title || '')}"
          rating="${escapeHtml(movie.imdbScore || movie.rating || '')}"
          media-id="${escapeHtml(movie.id || movie._id || '')}"
          genres="${escapeHtml((movie.genres || []).join(','))}">
        </movie-card>
      `).join('')}
    </div>
  `;
}

function renderReviewCards() {
  if (!reviews.length) {
    return '<p class="reviews-empty empty-state">Todavía no has publicado reviews.</p>';
  }

  const avatarUrl = getAvatarUrl(currentUser);

  return `
    <div class="reviews-grid">
      ${reviews.map((review) => `
        <review-card
          username="${escapeHtml(currentUser?.username || 'Usuario')}"
          avatar-src="${escapeHtml(avatarUrl)}"
          rating="${escapeHtml(formatReviewScore(review.score))}"
          review-text="${escapeHtml(review.body || review.title || 'Sin comentario.') }"
          movie-title="${escapeHtml(review.movie?.title || 'Película') }"
          movie-poster="${escapeHtml(review.movie?.posterUrl || 'https://via.placeholder.com/300x450?text=No+Image')}"
          movie-rating="${review.movie?.imdbScore || 0}"
          date="${escapeHtml(formatReviewDate(review.createdAt))}">
        </review-card>
      `).join('')}
    </div>
  `;
}

function renderProfile() {
  const avatarUrl = getAvatarUrl(currentUser);
  const { followers, following } = getProfileStats();

  container.innerHTML = `
    <div class="profile-container">
      <section class="profile-shell">
        <div class="profile-header-row">
          <div class="profile-identity">
            <img src="${escapeHtml(avatarUrl)}" alt="Avatar" class="profile-avatar">
            <div class="profile-info">
              <h1 class="profile-name">${escapeHtml(currentUser?.username || 'Usuario')}</h1>
              <p class="profile-email">${escapeHtml(currentUser?.email || '')}</p>
              <div class="profile-stats">
                <button class="profile-stat profile-stat-button" type="button" data-social-type="following">
                  <strong>${following}</strong>
                  <span>Seguidos</span>
                </button>
                <button class="profile-stat profile-stat-button" type="button" data-social-type="followers">
                  <strong>${followers}</strong>
                  <span>Seguidores</span>
                </button>
              </div>
            </div>
          </div>

          <div class="profile-actions">
            <button class="btn btn-primary" id="edit-profile-btn" type="button">
              <span class="icon">edit</span>
              Editar perfil
            </button>
          </div>
        </div>

        <div class="profile-divider"></div>
      </section>
    </div>

    <reviews-favorites-container id="reviews-favorites"></reviews-favorites-container>

    ${renderSocialModal()}
  `;

  document.getElementById('edit-profile-btn')?.addEventListener('click', () => {
    window.location.href = '/profileConfig';
  });

  document.querySelectorAll('[data-social-type]').forEach((button) => {
    button.addEventListener('click', () => {
      activeSocialModal = button.getAttribute('data-social-type');
      renderProfile();
    });
  });

  document.getElementById('social-modal-close')?.addEventListener('click', () => {
    activeSocialModal = null;
    renderProfile();
  });

  document.getElementById('social-modal-backdrop')?.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) {
      activeSocialModal = null;
      renderProfile();
    }
  });

  document.querySelectorAll('movie-card').forEach((card) => {
    card.addEventListener('movie-clicked', (event) => {
      document.dispatchEvent(new CustomEvent('movie-clicked', {
        detail: event.detail,
        bubbles: true,
        composed: true
      }));
    });
  });

  // Pasar el userId al componente de pestañas para que cargue reviews y favoritos
  const containerEl = document.getElementById('reviews-favorites');
  if (containerEl) {
    const userId = currentUser?._id || currentUser?.id;
    containerEl.data = { userId, listId: userId };
  }
}

function renderNoAuth() {
  container.innerHTML = `
    <div class="profile-container">
      <section class="profile-shell">
        <div class="no-auth-container">
          <p class="no-auth-message">Debes iniciar sesión para ver tu perfil</p>
          <div class="no-auth-actions">
            <button class="btn btn-primary" type="button" id="login-btn">
              <span class="icon">login</span>
              Iniciar sesión
            </button>
            <button class="btn btn-secondary" type="button" id="register-btn">
              <span class="icon">person_add</span>
              Registrarse
            </button>
          </div>
        </div>
      </section>
    </div>
  `;

  document.getElementById('login-btn')?.addEventListener('click', () => {
    window.location.href = '/login';
  });

  document.getElementById('register-btn')?.addEventListener('click', () => {
    window.location.href = '/register';
  });
}

async function loadProfileData() {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    renderNoAuth();
    return;
  }

  try {
    const username = decodeJwtUsername(token);
    if (!username) {
      renderNoAuth();
      return;
    }

    const { user } = await getUser(username);
    currentUser = user || JSON.parse(localStorage.getItem('userData') || '{}');

    const userId = currentUser?._id || currentUser?.id;

    const [favoritesResult, reviewsResult] = await Promise.allSettled([
      userId ? getFavoriteList(userId) : Promise.resolve({ movies: [] }),
      userId ? getUserReviews(userId) : Promise.resolve({ reviews: [] })
    ]);

    favorites = favoritesResult.status === 'fulfilled' ? (favoritesResult.value?.movies || []) : [];
    reviews = reviewsResult.status === 'fulfilled' ? (reviewsResult.value?.reviews || []) : [];

    renderProfile();
  } catch (error) {
    console.warn('Error loading profile:', error);
    renderNoAuth();
  }
}

document.addEventListener('movie-clicked', (event) => {
  const { movieId, type } = event.detail || {};
  if (!movieId) return;

  const modal = document.createElement('movie-modal');
  const endpoint = type === 'series' ? 'series' : 'movies';
  modal.setAttribute('api-url', `/tmdb/${endpoint}/${movieId}`);
  modal.setAttribute('open', '');
  document.body.appendChild(modal);
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && activeSocialModal) {
    activeSocialModal = null;
    renderProfile();
  }
});

loadProfileData();