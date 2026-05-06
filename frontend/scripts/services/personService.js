import { apiClient } from '../utils/apiClient.js';

export const personService = {
    /**
     * Obtiene el listado de personas (actores/directores) populares desde TMDB
     * @param {Number} page - Número de página para la paginación
     */
    async getPopularPersons(page = 1) {
        return await apiClient.get(`/tmdb/persons/popular?page=${page}`);
    },

    /**
     * Obtiene los detalles biográficos de una persona y sincroniza con la DB local
     * @param {String|Number} personId - ID de la persona en TMDB
     */
    async getPersonDetails(personId) {
        return await apiClient.get(`/tmdb/persons/${personId}`);
    },

    /**
     * Obtiene la filmografía completa (créditos de cast y crew) de una persona
     * @param {String|Number} personId - ID de la persona en TMDB
     */
    async getPersonCredits(personId) {
        return await apiClient.get(`/tmdb/persons/${personId}/credits`);
    },

    /**
     * Busca personas en el catálogo global por nombre
     * @param {String} query - Nombre del actor o director a buscar
     * @param {Number} page - Número de página para los resultados
     */
    async searchPersons(query, page = 1) {
        return await apiClient.get(`/tmdb/persons/search?q=${encodeURIComponent(query)}&page=${page}`);
    }
};
