import { apiClient } from '../utils/apiClient.js';

export const reviewService = {
    /**
     * Crea una nueva reseña para una película
     * @param {Object} reviewData { movieId, score, title, body }
     */
    async postReview(reviewData) {
        return await apiClient.post('/reviews', reviewData);
    },

    /**
     * Obtiene todas las reseñas de una película específica
     * @param {String} movieId
     */
    async getMovieReviews(movieId) {
        return await apiClient.get(`/reviews/movie/${movieId}`);
    },

    /**
     * Obtiene la reseña del usuario autenticado para una película específica
     * @param {String} movieId
     */
    async getMyReview(movieId) {
        return await apiClient.get(`/reviews/movie/${movieId}/me`);
    },

    /**
     * Actualiza una reseña existente del usuario
     * @param {String} movieId
     * @param {Object} updateData { score, title, body }
     */
    async updateReview(movieId, updateData) {
        return await apiClient.patch(`/reviews/movie/${movieId}/me`, updateData);
    },

    /**
     * Elimina la reseña del usuario para una película
     * @param {String} movieId
     */
    async deleteReview(movieId) {
        return await apiClient.delete(`/reviews/movie/${movieId}/me`);
    }
};
