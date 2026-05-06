import { apiClient } from '../utils/apiClient.js';

export const userService = {
    /**
     * Inicia sesión en la aplicación
     * @param {Object} credentials { username, password }
     */
    async login(credentials) {
        return await apiClient.post('/login', credentials);
    },

    /**
     * Registra un nuevo usuario
     * @param {Object} userData { username, email, password }
     */
    async register(userData) {
        return await apiClient.post('/users', userData);
    },

    /**
     * Cierra la sesión del usuario eliminando el token JWT del almacenamiento local
     */
    logout() {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
        window.location.reload();
    },

    /**
     * Obtiene el perfil público de un usuario
     * @param {String} username
     */
    async getUserProfile(username) {
        return await apiClient.get(`/users/${username}`);
    },

    /**
     * Sigue a un usuario específico
     * @param {String} username - Nombre del usuario a seguir
     */
    async followUser(username) {
        return await apiClient.post(`/users/${username}/follow`);
    },

    /**
     * Deja de seguir a un usuario
     * @param {String} username
     */
    async unfollowUser(username) {
        return await apiClient.delete(`/users/${username}/follow`);
    }
};
