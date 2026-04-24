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
export const ESTUDIANTES_ENDPOINTS = {
  ...createCRUDEndpoints('/estudiantes'),
  /** GET — Estudiantes sin beca vigente (preliminar=1 o q + limit) para asignar beca */
  BUSCAR_ASIGNACION_BECA: `${API_BASE}/estudiantes/buscar-asignacion-beca`,
  /** GET — Excel estadística inscritos (query gestion_id opcional) */
  EXPORT_ESTADISTICA_INSCRITOS: `${API_BASE}/estudiantes/export/estadistica-inscritos`,
  /** GET — Excel lista inscritos por carrera (query carrera_id requerido; gestion_id opcional) */
  EXPORT_LISTA_INSCRITOS_POR_CARRERA: `${API_BASE}/estudiantes/export/lista-inscritos-por-carrera`,
  // Endpoint específico para generar acta de compromiso
  GENERATE_ACTA_COMPROMISO: (studentId) => `${API_BASE}/estudiantes/${studentId}/documentos/acta-compromiso`,
  // Endpoint específico para generar declaración jurada (formulario/boleta)
  GENERATE_DECLARACION_JURADA: (studentId) => `${API_BASE}/estudiantes/${studentId}/documentos/declaracion-jurada`,
};
export const BECAS_DESCUENTOS_ENDPOINTS = createCRUDEndpoints('/becas-descuentos');
export const ESTUDIANTES_BECAS_ENDPOINTS = {
  ...createCRUDEndpoints('/estudiantes'),
  // Endpoint para listar todas las becas asignadas a estudiantes
  LIST_ALL: `${API_BASE}/estudiantes/becas`,
  // Endpoint para eliminar una beca asignada (DELETE /v1/estudiantes/becas/:id)
  DELETE: (becaId) => `${API_BASE}/estudiantes/becas/${becaId}`,
  // Endpoint específico para becas de un estudiante
  BY_STUDENT_ID: (studentId) => `${API_BASE}/estudiantes/${studentId}/scholarships`,
  BY_STUDENT_AND_ID: (studentId, becaId) => `${API_BASE}/estudiantes/${studentId}/scholarships/${becaId}`,
};

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
export const GESTIONES_ENDPOINTS = createCRUDEndpoints('/gestiones');

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
export const INSCRIPCIONES_ENDPOINTS = {
  ...createCRUDEndpoints('/inscripciones'),
  // Endpoint específico para generar formulario de inscripción (se usará desde el módulo de inscripciones)
  GENERATE_FORMULARIO: (studentId) => `${API_BASE}/inscripciones/${studentId}/generar-formulario`,
};

// ============================================
// MÓDULO: PAGOS
// ============================================
export const METODOS_PAGO_ENDPOINTS = createCRUDEndpoints('/metodos-pago');
export const BANCOS_AUTORIZADOS_ENDPOINTS = createCRUDEndpoints('/bancos-autorizados');
export const CUENTAS_PAGO_ENDPOINTS = createCRUDEndpoints('/cuentas-pago');
export const CONFIGURACION_APORTES_ENDPOINTS = createCRUDEndpoints('/configuracion-aportes');
export const PAGOS_APORTES_ENDPOINTS = {
  ...createCRUDEndpoints('/pagos-aportes'),
  UPDATE_CUOTA: (cuotaId) =>
    `${API_BASE}/pagos-aportes/cuotas/${encodeURIComponent(String(cuotaId))}`,
  // Estado del aporte para el formulario de registro (estudiante_id, gestion_id opcional)
  ESTADO_REGISTRO: `${API_BASE}/pagos-aportes/estado-registro`,
  BUSCAR_ESTUDIANTES_REGISTRO: `${API_BASE}/pagos-aportes/buscar-estudiantes-registro`,
  // Endpoint específico para generar/obtener recibo de pago
  GENERATE_RECIBO: (paymentId) => `${API_BASE}/pagos-aportes/${encodeURIComponent(String(paymentId))}/recibo`,
  EXPORT_LISTA_POR_CARRERA: `${API_BASE}/pagos-aportes/export/lista-por-carrera`,
};

// ============================================
// MÓDULO: AUTENTICACIÓN (JWT, sesión)
// Backend: router.use('/auth', ...) bajo /api/v1 → base pública '/api/v1/auth'
// (ver backend/src/presentation/routes/index.js → endpoints.auth)
// ============================================
const AUTH_BASE = `${API_BASE}/auth`;

export const AUTH_ENDPOINTS = {
  LOGIN: `${AUTH_BASE}/login`,
  ME: `${AUTH_BASE}/me`,
  LOGOUT: `${AUTH_BASE}/logout`,
};

// ============================================
// MÓDULO: SEGURIDAD (usuarios del sistema, roles, catálogo de permisos)
// ============================================
export const USUARIOS_SEG_ENDPOINTS = {
  ...createCRUDEndpoints('/usuarios'),
  PERMISOS: (usuarioId) => `${API_BASE}/usuarios/${usuarioId}/permisos`,
  PERMISO_OVERRIDE: (usuarioId, overrideId) =>
    `${API_BASE}/usuarios/${usuarioId}/permisos/${overrideId}`,
  ESTADO: (usuarioId) => `${API_BASE}/usuarios/${usuarioId}/estado`,
  PASSWORD: (usuarioId) => `${API_BASE}/usuarios/${usuarioId}/password`,
  /** GET query, limit — permiso seguridad.usuario.crear */
  ALTA_BUSCAR_ESTUDIANTES: `${API_BASE}/usuarios/alta/buscar-estudiantes`,
  ALTA_BUSCAR_DOCENTES: `${API_BASE}/usuarios/alta/buscar-docentes`,
};

export const ROLES_SEG_ENDPOINTS = {
  BASE: `${API_BASE}/roles`,
  PERMISOS: (rolId) => `${API_BASE}/roles/${rolId}/permisos`,
  PERMISOS_GRILLA: (rolId, dominio) =>
    `${API_BASE}/roles/${rolId}/permisos-grilla?${new URLSearchParams({ dominio }).toString()}`,
};

export const PERMISOS_CATALOGO_ENDPOINTS = {
  BASE: `${API_BASE}/permisos`,
  withQuery: (params) => {
    const q = new URLSearchParams(params).toString();
    return `${API_BASE}/permisos${q ? `?${q}` : ''}`;
  },
};

/**
 * Rutas definidas aquí con prefijo `/v1` (API_BASE) encajan con axios: baseURL termina en `/api`.
 * Para `fetch` con `getApiBaseUrl()` (…/api/v1), convierte `/v1/foo` → `/foo`.
 */
export function toFetchPathFromV1(pathOrUrl) {
  if (pathOrUrl == null || pathOrUrl === '') return '/';
  const p = String(pathOrUrl).startsWith('/') ? String(pathOrUrl) : `/${pathOrUrl}`;
  if (!p.startsWith('/v1')) return p;
  const rest = p.slice(4);
  return rest.startsWith('/') ? rest : `/${rest}`;
}