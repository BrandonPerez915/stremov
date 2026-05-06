const BASE_URL = '/api';

export const apiClient = {
  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;

    // Configurar los headers por defecto y adjuntar el Token JWT si existe
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = localStorage.getItem('jwtToken');
    if (token) {
      // Conecta la sesión del usuario al backend
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        // Lanza un error estandarizado para CustomToast
        throw {
          status: response.status,
          message: data?.message || 'Error en la petición al servidor'
        };
      }

        return data;
    } catch (error) {
      console.error(`[API Error] ${endpoint}:`, error);
      throw error;
    }
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(body), ...options });
  },

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...options });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
};
