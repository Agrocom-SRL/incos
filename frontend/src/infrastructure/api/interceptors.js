/**
 * Interceptors para el API Client
 * 
 * Single Responsibility: Manejar interceptores de request y response
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Lógica técnica de interceptores HTTP
 * 
 * Funciones:
 * - Request Interceptor: Agrega token de autenticación a cada request
 * - Response Interceptor: Maneja errores de autenticación (401) y redirige al login
 * 
 * NOTA: Estos interceptors están en infrastructure/api/ porque:
 * 1. Son parte de la implementación del cliente HTTP
 * 2. Tienen lógica (no solo configuración estática)
 * 3. Son específicos del cliente HTTP (no son configuración general)
 * 
 * La configuración estática (API_CONFIG) está en config/api/
 * La implementación (client, interceptors) está en api/
 */

import { LocalStorageAdapter } from '@storage/LocalStorageAdapter.js';

/**
 * Interceptor de request: Agrega token de autenticación
 * 
 * Se ejecuta antes de cada request HTTP
 * - Obtiene el token del localStorage
 * - Lo agrega al header Authorization si existe
 * - Si el data es FormData, elimina Content-Type para que el navegador lo establezca automáticamente
 */
export const requestInterceptor = (config) => {
  // Usar adapter en lugar de localStorage directo
  const token = LocalStorageAdapter.getString('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Si el data es FormData, eliminar Content-Type para que el navegador lo establezca con el boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
};

/**
 * Interceptor de response: Maneja errores de autenticación
 * 
 * Se ejecuta después de cada response HTTP
 * - Si es 401 (no autorizado): limpia sesión y redirige al login
 * - Rechaza la promesa para que el error se propague
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
