import { getUser, getFavoriteList, getUserReviews } from './api.js';

import '../components/MovieCard.js';
import '../components/ReviewCard.js';
import '../components/MovieModalHeader.js';
import '../components/MovieModalDetails.js';
import '../components/MovieModalReviews.js';
import '../components/MovieModalSimilar.js';
import '../components/MovieModal.js';

const container = document.getElementById('profile-content');

let currentUser = null;
let favorites = [];
let reviews = [];

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
                <div class="profile-stat">
                  <strong>${following}</strong>
                  <span>Seguidos</span>
                </div>
                <div class="profile-stat">
                  <strong>${followers}</strong>
                  <span>Seguidores</span>
                </div>
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

        <div class="profile-content-grid">
          <section class="profile-section">
            <h2 class="section-title">
              <span class="icon">favorite</span>
              Películas favoritas
            </h2>
            ${renderFavoriteCards()}
          </section>

          <section class="profile-section">
            <h2 class="section-title">
              <span class="icon">rate_review</span>
              Reviews propias
            </h2>
            ${renderReviewCards()}
          </section>
        </div>
      </section>
    </div>
  `;

  document.getElementById('edit-profile-btn')?.addEventListener('click', () => {
    window.location.href = '/profileConfig';
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

loadProfileData();