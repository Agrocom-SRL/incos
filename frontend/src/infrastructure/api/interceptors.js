/**
 * Interceptors para el API Client
 */

import { LocalStorageAdapter } from '../storage/LocalStorageAdapter.js';

/**
 * Interceptor de request: Agrega token de autenticación
 */
export const requestInterceptor = (config) => {
  // Usar adapter en lugar de localStorage directo
  const token = LocalStorageAdapter.getString('authToken');
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
      // Usar adapter en lugar de localStorage directo
      LocalStorageAdapter.remove('authToken');
      LocalStorageAdapter.remove('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
};

