/**
 * Endpoints del API
 * 
 * Single Responsibility: Centralizar todas las URLs de endpoints del backend
 * 
 * Clean Architecture:
 * - Infrastructure Layer: URLs concretas de la API (constantes de configuración)
 * - Estas son implementaciones específicas, no abstracciones
 * 
 * Principio YAGNI: Empezamos desde cero. Solo agregamos endpoints cuando se necesiten.
 * 
 * NOTA: CORS se maneja exclusivamente en el backend.
 * El frontend solo consume los endpoints.
 */

/**
 * Base path de la API
 */
const API_BASE = '/v1';

/**
 * Endpoints de Estudiantes
 * Se agregarán endpoints según se necesiten
 */
export const ESTUDIANTES_ENDPOINTS = {
  BASE: `${API_BASE}/estudiantes`,
  // Futuro: otros endpoints cuando se necesiten
};

