import { apiClient } from '../utils/apiClient.js';

export const listService = {
    /**
     * Obtiene todas las listas del usuario (favoritos, watchlist, etc.)
     */
    async getUserLists() {
        return await apiClient.get('/lists');
    },

    /**
     * Crea una nueva lista
     * @param {Object} listData { name, description }
     */
    async createList(listData) {
        return await apiClient.post('/lists', listData);
    },

    /**
     * Obtiene el contenido de una lista específica
     * @param {String} listId
     */
    async getList(listId) {
        return await apiClient.get(`/lists/${listId}`);
    },

    /**
     * Agrega una película/serie a una lista
     */
    async addToList(listId, mediaId, mediaType = 'movie') {
        return await apiClient.post(`/lists/${listId}/items`, { mediaId, mediaType });
    },

    /**
     * Remueve un item de la lista
     */
    async removeFromList(listId, itemId) {
        return await apiClient.delete(`/lists/${listId}/items/${itemId}`);
    },

    /**
     * Elimina una lista por completo
     */
    async deleteList(listId) {
        return await apiClient.delete(`/lists/${listId}`);
    }
};
