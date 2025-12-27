/**
 * API Client - Cliente HTTP para comunicación con el backend
 * 
 * Single Responsibility: Solo configura y proporciona el cliente HTTP
 * Dependency Inversion: Usa abstracciones (interceptors) en lugar de lógica directa
 */

import axios from 'axios';
import { API_CONFIG } from '@config/api';
import { requestInterceptor, responseInterceptor } from './interceptors.js';

// Crear instancia de Axios con configuración
const apiClient = axios.create(API_CONFIG);

// Configurar interceptors
apiClient.interceptors.request.use(requestInterceptor);
apiClient.interceptors.response.use(
  responseInterceptor.onFulfilled,
  responseInterceptor.onRejected
);

export default apiClient;
