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
  // Ejemplo de estructura (se implementará cuando se necesite):
  // BASE: `${API_BASE}/estudiantes`,
  // BY_ID: (id) => `${API_BASE}/estudiantes/${id}`,
};

/**
 * Endpoints de Catálogos
 * Se agregarán endpoints según se necesiten
 */
export const CATALOGS_ENDPOINTS = {
  // Ejemplo de estructura (se implementará cuando se necesite):
  // MUNICIPIOS: `${API_BASE}/catalogs/municipios`,
};

