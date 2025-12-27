/**
 * Endpoints del API
 * 
 * Single Responsibility: Centralizar todas las URLs de endpoints del backend
 * 
 * Clean Architecture:
 * - Infrastructure Layer: URLs concretas de la API (constantes de configuración)
 * - Estas son implementaciones específicas, no abstracciones
 * 
 * NOTA: CORS se maneja exclusivamente en el backend.
 * El frontend solo consume los endpoints.
 */

/**
 * Base path de la API
 */
const API_BASE = '/v1';

/**
 * Endpoints del Dashboard
 */
export const DASHBOARD_ENDPOINTS = {
  CARRERAS: `${API_BASE}/dashboard/carreras`,
  DOCENTES_DESTACADOS: `${API_BASE}/dashboard/docentes-destacados`,
  DOCENTES_PRINCIPALES: `${API_BASE}/dashboard/docentes-principales`,
  ACTIVIDADES: `${API_BASE}/dashboard/actividades`,
  STATS: `${API_BASE}/dashboard/stats`,
};

/**
 * Endpoints de Estudiantes
 */
export const ESTUDIANTES_ENDPOINTS = {
  BASE: `${API_BASE}/estudiantes`,
  BY_ID: (id) => `${API_BASE}/estudiantes/${id}`,
  DOCUMENTOS: (id) => `${API_BASE}/estudiantes/${id}/documentos`,
  DOCUMENTOS_ENTREGADOS: (id) => `${API_BASE}/estudiantes/${id}/documentos-entregados`,
  DATOS_ACADEMICOS: (id) => `${API_BASE}/estudiantes/${id}/datos-academicos`,
};

/**
 * Endpoints de Catálogos
 */
export const CATALOGS_ENDPOINTS = {
  CARRERAS: `${API_BASE}/catalogs/carreras`,
  GESTIONES: `${API_BASE}/catalogs/gestiones`,
  PAISES: `${API_BASE}/catalogs/paises`,
  DEPARTAMENTOS: `${API_BASE}/catalogs/departamentos`,
  PROVINCIAS: (departamentoId) => `${API_BASE}/catalogs/provincias?departamentoId=${departamentoId}`,
  MUNICIPIOS: (provinciaId) => `${API_BASE}/catalogs/municipios?provinciaId=${provinciaId}`,
  IDIOMAS: `${API_BASE}/catalogs/idiomas`,
  TIPOS_DISCAPACIDAD: `${API_BASE}/catalogs/tipos-discapacidad`,
  ESTADOS_CIVILES: `${API_BASE}/catalogs/estados-civiles`,
  DOCUMENTACION_INSCRIPCION: `${API_BASE}/catalogs/documentacion-inscripcion`,
};

