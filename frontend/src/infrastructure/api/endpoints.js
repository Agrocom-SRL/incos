/**
 * Endpoints del API
 * 
 * Single Responsibility: Centralizar todas las URLs de endpoints del backend
 * 
 * Clean Architecture:
 * - Infrastructure Layer: URLs concretas de la API (constantes de configuración)
 * - Estas son implementaciones específicas, no abstracciones
 * 
 * Organización por módulos/funcionalidad:
 * - Estudiantes: Endpoints del módulo de estudiantes
 * - Configuración: Endpoints del módulo de configuración
 *   - Académico: Carreras, materias
 *   - Complementario: Discapacidades
 * - Geográficos: Países, departamentos, provincias, municipios
 * - Referencia: Idiomas, estados civiles, tipos de parentesco, documentación
 * 
 * Principio YAGNI: Solo agregamos endpoints cuando se necesiten
 * 
 * NOTA: CORS se maneja exclusivamente en el backend.
 * El frontend solo consume los endpoints.
 */

/**
 * Base path de la API
 */
const API_BASE = '/v1';

// ============================================
// MÓDULO: ESTUDIANTES
// ============================================
export const ESTUDIANTES_ENDPOINTS = {
  BASE: `${API_BASE}/estudiantes`,
  // Futuro: otros endpoints cuando se necesiten
};

// ============================================
// MÓDULO: CONFIGURACIÓN
// ============================================
// Académico
export const CARRERAS_ENDPOINTS = {
  BASE: `${API_BASE}/carreras`,
  // Futuro: otros endpoints cuando se necesiten
};

export const MATERIAS_ENDPOINTS = {
  BASE: `${API_BASE}/materias`,
  // Futuro: otros endpoints cuando se necesiten
};

// Complementario
export const DISCAPACIDAD_ENDPOINTS = {
  BASE: `${API_BASE}/discapacidad`,
  // Futuro: otros endpoints cuando se necesiten
};

// ============================================
// MÓDULO: GEOGRÁFICOS
// ============================================
export const PAISES_ENDPOINTS = {
  BASE: `${API_BASE}/paises`,
};

export const DEPARTAMENTOS_ENDPOINTS = {
  BASE: `${API_BASE}/departamentos`,
};

export const PROVINCIAS_ENDPOINTS = {
  BASE: `${API_BASE}/provincias`,
};

export const MUNICIPIOS_ENDPOINTS = {
  BASE: `${API_BASE}/municipios`,
};

// ============================================
// MÓDULO: REFERENCIA
// ============================================
export const IDIOMAS_ENDPOINTS = {
  BASE: `${API_BASE}/idiomas`,
};

export const ESTADOS_CIVILES_ENDPOINTS = {
  BASE: `${API_BASE}/estados-civiles`,
};

export const TIPOS_PARENTESCO_ENDPOINTS = {
  BASE: `${API_BASE}/tipos-parentesco`,
};

export const DOCUMENTACION_ENDPOINTS = {
  BASE: `${API_BASE}/documentacion`,
};
