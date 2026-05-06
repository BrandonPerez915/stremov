import { apiClient } from '../utils/apiClient.js';

export const movieService = {
    /**
     * Obtiene los detalles completos de una película por su ID
     * @param {String} movieId - ID local o de TMDB
     */
    async getMovieDetails(movieId) {
        return await apiClient.get(`/tmdb/movies/${movieId}`);
    },

    /**
     * Busca películas por término de búsqueda
     * @param {String} query - Nombre de la película
     * @param {Number} page - Número de página para paginación
     */
    async searchMovies(query, page = 1) {
        return await apiClient.get(`/tmdb/movies/search?q=${encodeURIComponent(query)}&page=${page}`);
    },

    /**
     * Obtiene el listado de películas populares
     * @param {Number} page - Página actual
     */
    async getPopularMovies(page = 1) {
        return await apiClient.get(`/tmdb/movies/popular?page=${page}`);
    },

    /**
     * Obtiene el reparto (cast) y equipo técnico de una película
     * @param {String} movieId
     */
    async getMovieCredits(movieId) {
        return await apiClient.get(`/tmdb/movies/${movieId}/credits`);
    },

    /**
     * Obtiene una lista de películas similares
     * @param {String} movieId
     */
    async getSimilarMovies(movieId) {
        return await apiClient.get(`/tmdb/movies/${movieId}/similar`);
    }
};
