import { apiClient } from '../utils/apiClient.js';

export const seriesService = {
    /**
     * Busca series de televisión por término de búsqueda
     * @param {String} query - Nombre de la serie
     * @param {Number} page - Número de página para paginación
     */
    async searchSeries(query, page = 1) {
        return await apiClient.get(`/tmdb/series/search?q=${encodeURIComponent(query)}&page=${page}`);
    },

    /**
     * Obtiene las series de TV populares actualmente
     * @param {Number} page - Página actual
     */
    async getPopularSeries(page = 1) {
        return await apiClient.get(`/tmdb/series/popular?page=${page}`);
    },

    /**
     * Obtiene los detalles de una serie específica y genera el caché en la DB local
     * @param {String|Number} tmdbId - ID de la serie en TMDB
     * @returns {Promise<Object>} Objeto de la serie normalizado (id, name, etc.)
     */
    async getSeriesDetails(tmdbId) {
        return await apiClient.get(`/tmdb/series/${tmdbId}`);
    },

    /**
     * Obtiene el reparto (cast) y equipo técnico de una serie
     * @param {String|Number} tmdbId
     */
    async getSeriesCredits(tmdbId) {
        return await apiClient.get(`/tmdb/series/${tmdbId}/credits`);
    },

    /**
     * Obtiene una lista de series similares a la consultada
     * @param {String|Number} tmdbId
     */
    async getSimilarSeries(tmdbId) {
        return await apiClient.get(`/tmdb/series/${tmdbId}/similar`);
    }
};
