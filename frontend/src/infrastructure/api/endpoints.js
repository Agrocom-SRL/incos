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
 * - Académico: Paralelos, horarios
 * - Inscripciones: Endpoints del módulo de inscripciones
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

/**
 * Factory function para generar endpoints CRUD genéricos
 * 
 * @param {string} basePath - Ruta base del recurso (ej: '/estudiantes')
 * @returns {Object} Objeto con todos los endpoints CRUD
 * 
 * Patrones generados:
 * - BASE: Ruta base para listar (GET) y crear (POST)
 * - BY_ID: Ruta con ID para obtener (GET), actualizar (PUT/PATCH) y eliminar (DELETE)
 * - BULK: Operaciones en lote (opcional)
 * - SEARCH: Búsqueda avanzada (opcional)
 * 
 * Ejemplos de uso:
 * GET    /v1/estudiantes           -> Listar todos
 * POST   /v1/estudiantes           -> Crear uno nuevo
 * GET    /v1/estudiantes/:id       -> Obtener por ID
 * PUT    /v1/estudiantes/:id       -> Actualizar completo
 * PATCH  /v1/estudiantes/:id       -> Actualizar parcial
 * DELETE /v1/estudiantes/:id       -> Eliminar
 * POST   /v1/estudiantes/bulk      -> Crear múltiples
 * DELETE /v1/estudiantes/bulk      -> Eliminar múltiples
 * GET    /v1/estudiantes/search    -> Búsqueda avanzada
 */
const createCRUDEndpoints = (basePath) => {
  const fullPath = `${API_BASE}${basePath}`;
  
  return {
    // Operaciones básicas CRUD
    BASE: fullPath,                           // GET: listar, POST: crear
    BY_ID: (id) => `${fullPath}/${id}`,      // GET, PUT, PATCH, DELETE con ID específico
    
    // Operaciones en lote (bulk operations)
    BULK: `${fullPath}/bulk`,                 // POST: crear múltiples, DELETE: eliminar múltiples
    
    // Búsqueda y filtros
    SEARCH: `${fullPath}/search`,             // GET: búsqueda avanzada con query params
    
    // Helpers para construcción dinámica
    withId: (id) => `${fullPath}/${id}`,
    withParams: (params) => {
      const queryString = new URLSearchParams(params).toString();
      return `${fullPath}${queryString ? `?${queryString}` : ''}`;
    },
  };
};

// ============================================
// MÓDULO: ESTUDIANTES
// ============================================
export const ESTUDIANTES_ENDPOINTS = createCRUDEndpoints('/estudiantes');

// ============================================
// MÓDULO: CONFIGURACIÓN
// ============================================
// Académico
export const CARRERAS_ENDPOINTS = createCRUDEndpoints('/carreras');
export const MATERIAS_ENDPOINTS = createCRUDEndpoints('/materias');

// Complementario
export const DISCAPACIDAD_ENDPOINTS = createCRUDEndpoints('/discapacidad');

// ============================================
// MÓDULO: ACADÉMICO
// ============================================
export const PARALELOS_ENDPOINTS = {
  ...createCRUDEndpoints('/paralelos'),
  // Endpoint específico para obtener horarios de un paralelo
  SCHEDULE: (id) => `${API_BASE}/paralelos/${id}/schedule`,
};

// ============================================
// MÓDULO: GEOGRÁFICOS
// ============================================
export const PAISES_ENDPOINTS = createCRUDEndpoints('/paises');
export const DEPARTAMENTOS_ENDPOINTS = createCRUDEndpoints('/departamentos');
export const PROVINCIAS_ENDPOINTS = createCRUDEndpoints('/provincias');
export const MUNICIPIOS_ENDPOINTS = createCRUDEndpoints('/municipios');

// ============================================
// MÓDULO: REFERENCIA
// ============================================
export const IDIOMAS_ENDPOINTS = createCRUDEndpoints('/idiomas');
export const ESTADOS_CIVILES_ENDPOINTS = createCRUDEndpoints('/estados-civiles');
export const TIPOS_PARENTESCO_ENDPOINTS = createCRUDEndpoints('/tipos-parentesco');
export const DOCUMENTACION_ENDPOINTS = createCRUDEndpoints('/documentacion');

// ============================================
// MÓDULO: INSCRIPCIONES
// ============================================
export const INSCRIPCIONES_ENDPOINTS = createCRUDEndpoints('/inscripciones');
