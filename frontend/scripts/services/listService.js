import { createList, getList, getUserLists, updateList, deleteList, addMovieToList, removeMovieFromList } from '../api.js';

export const listService = {
    /**
     * Obtiene todas las listas del usuario (favoritos, watchlist, etc.)
     */
    async getUserLists(userId) {
        return await getUserLists(userId);
    },

    /**
     * Crea una nueva lista
     * @param {Object} listData { name, description }
     */
    async createList(listData) {
        return await createList(listData);
    },

    /**
     * Obtiene el contenido de una lista específica
     * @param {String} listId
     */
    async getList(listId) {
        return await getList(listId);
    },

    /**
     * Agrega una película a una lista
     */
    async addMovieToList(listId, movieId) {
        return await addMovieToList({ listId, movieId });
    },

    /**
     * Remueve una película de la lista
     */
    async removeMovieFromList(listId, movieId) {
        return await removeMovieFromList({ listId, movieId });
    },

    /**
     * Actualiza una lista
     */
    async updateList(id, data) {
        return await updateList({ id, data });
    },

    /**
     * Elimina una lista por completo
     */
    async deleteList(listId) {
        return await deleteList(listId);
    }
};
