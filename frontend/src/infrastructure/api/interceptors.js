/**
 * Interceptors para el API Client
 */

/**
 * Interceptor de request: Agrega token de autenticación
 */
export const requestInterceptor = (config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

/**
 * Interceptor de response: Maneja errores de autenticación
 */
export const responseInterceptor = {
  onFulfilled: (response) => response,
  onRejected: (error) => {
    // Si es 401 (no autorizado), limpiar sesión y redirigir
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
};

