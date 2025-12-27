/**
 * Configuración del API Client
 * 
 * Single Responsibility: Solo define la configuración estática del cliente HTTP
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Configuración técnica del cliente HTTP
 * 
 * NOTA SOBRE CORS:
 * - CORS (Cross-Origin Resource Sharing) se maneja EXCLUSIVAMENTE en el backend
 * - El frontend NO configura CORS
 * - El backend debe incluir headers como:
 *   - Access-Control-Allow-Origin
 *   - Access-Control-Allow-Methods
 *   - Access-Control-Allow-Headers
 * - Si hay problemas de CORS, se solucionan en el backend, no aquí
 */

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};
