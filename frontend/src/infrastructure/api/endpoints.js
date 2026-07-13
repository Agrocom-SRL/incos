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
// MÓDULO: DOCENTES
// ============================================
export const DOCENTES_ENDPOINTS = {
  ...createCRUDEndpoints('/docentes'),
  /** GET — identidad del docente AUTENTICADO ({ id, nombreCompleto }); portal del docente */
  MIS_DATOS: `${API_BASE}/docentes/mis-datos`,
  /** GET — roster de estudiantes por curso del docente AUTENTICADO (gestión vigente) */
  MIS_ESTUDIANTES: `${API_BASE}/docentes/mis-estudiantes`,
  /** GET (query) / POST — asignaciones docente ↔ curso ↔ plan habilitado */
  ASIGNACIONES: `${API_BASE}/docentes/asignaciones`,
  /** PATCH — actualizar asignación docente */
  ASIGNACION_BY_ID: (asignacionId) => `${API_BASE}/docentes/asignaciones/${asignacionId}`,
  /** POST — alta/reasignación por curso (upsert) */
  ASIGNAR_CURSO: `${API_BASE}/docentes/asignaciones/curso`,
  /** GET — catálogo de planes habilitados (asignación docente) */
  PLANES_HABILITADOS: `${API_BASE}/docentes/planes-habilitados`,
  /** GET — periodos del plan de estudios del plan habilitado (query gestionPlanId) */
  PERIODOS_DISPONIBLES: `${API_BASE}/docentes/periodos-disponibles`,
  /** GET — paralelos por carrera del plan y periodo (query gestionPlanId, periodoId) */
  PARALELOS_DISPONIBLES: `${API_BASE}/docentes/paralelos-disponibles`,
  /** GET — cursos ofertados en un paralelo (query paraleloId) */
  CURSOS_POR_PARALELO: `${API_BASE}/docentes/cursos-por-paralelo`,
  /** GET — cursos del plan de estudios del plan habilitado (query gestionPlanId) */
  CURSOS_DISPONIBLES: `${API_BASE}/docentes/cursos-disponibles`,
  /** GET — bloques de horario + aula de un curso */
  CURSO_HORARIOS: (cursoId) => `${API_BASE}/docentes/cursos/${cursoId}/horarios`,
  /** GET — IDs de docentes con choque en los bloques de un curso (?cursoId=X) */
  CONFLICTO_BLOQUES: (cursoId) => `${API_BASE}/docentes/conflicto-bloques?cursoId=${cursoId}`,
  CARGA_GESTION: (docenteId) => `${API_BASE}/docentes/${docenteId}/carga-gestion`,
  COLORES_EN_USO: `${API_BASE}/docentes/colores-en-uso`,
  COLORES_SUGERIDOS: `${API_BASE}/docentes/colores-sugeridos`,
  COLOR: (docenteId) => `${API_BASE}/docentes/${docenteId}/color`,
};

export const ASIGNACIONES_DOCENTES_ENDPOINTS = {
  BASE: `${API_BASE}/asignaciones-docentes`,
  BY_ID: (id) => `${API_BASE}/asignaciones-docentes/${id}`,
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
  /** GET — Ficha completa (solo lectura) del estudiante autenticado (portal del estudiante). */
  MIS_DATOS: `${API_BASE}/estudiantes/mis-datos`,
  /** GET — Historial académico (kardex/transcript FORM-SIE-ITT-04) del estudiante. */
  HISTORIAL_ACADEMICO: (studentId) => `${API_BASE}/estudiantes/${studentId}/historial-academico`,
  /** GET — Exporta el historial académico del estudiante a Excel (.xlsx). */
  HISTORIAL_ACADEMICO_EXPORT: (studentId) =>
    `${API_BASE}/estudiantes/${studentId}/historial-academico/export`,
  /** GET — Exporta el historial académico del estudiante a PDF (FORM-SIE-ITT-04). */
  HISTORIAL_ACADEMICO_EXPORT_PDF: (studentId) =>
    `${API_BASE}/estudiantes/${studentId}/historial-academico/export-pdf`,
};
export const BECAS_DESCUENTOS_ENDPOINTS = {
  ...createCRUDEndpoints('/becas-descuentos'),
  ESTADO: (id) => `${API_BASE}/becas-descuentos/${id}/estado`, // PATCH: activar/desactivar
};
export const ESTUDIANTES_BECAS_ENDPOINTS = {
  ...createCRUDEndpoints('/estudiantes'),
  // Endpoint para listar todas las becas asignadas a estudiantes
  LIST_ALL: `${API_BASE}/estudiantes/becas`,
  /** GET — detalle de una fila del listado (asignación por ID de estudiantes_becas) */
  DETALLE_ASIGNACION: (asignacionId) => `${API_BASE}/estudiantes/becas/${asignacionId}`,
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
export const CARRERAS_ENDPOINTS = {
  ...createCRUDEndpoints('/carreras'),
  IMAGEN: `${API_BASE}/carreras/imagen`,
};
export const MATERIAS_ENDPOINTS = createCRUDEndpoints('/materias');
export const PLANES_ESTUDIOS_ENDPOINTS = {
  ...createCRUDEndpoints('/planes-estudios'),
  MATRIZ: (id) => `${API_BASE}/planes-estudios/${id}/matriz`,
  VALIDAR: (id) => `${API_BASE}/planes-estudios/${id}/validar`,
  MARCAR_VIGENTE: (id) => `${API_BASE}/planes-estudios/${id}/marcar-vigente`,
  CLONAR: (id) => `${API_BASE}/planes-estudios/${id}/clonar`,
  PERIODOS: (planId) => `${API_BASE}/planes-estudios/${planId}/periodos`,
  ASIGNATURAS: (planId) => `${API_BASE}/planes-estudios/${planId}/asignaturas`,
};

// Periodos del plan a nivel de recurso propio (PUT/DELETE por :id);
// la lista/creación por plan vive en PLANES_ESTUDIOS_ENDPOINTS.PERIODOS(planId)
export const PERIODOS_ENDPOINTS = {
  BY_ID: (id) => `${API_BASE}/periodos/${id}`,
};

export const ASIGNATURAS_PLAN_ENDPOINTS = {
  BASE: `${API_BASE}/asignaturas-plan`,
  BY_ID: (id) => `${API_BASE}/asignaturas-plan/${id}`,
  PRERREQUISITOS: (asignaturaId) => `${API_BASE}/asignaturas-plan/${asignaturaId}/prerrequisitos`,
  ES_PRERREQUISITO_DE: (asignaturaId) => `${API_BASE}/asignaturas-plan/${asignaturaId}/es-prerrequisito-de`,
};

export const PRERREQUISITOS_ENDPOINTS = {
  BASE: `${API_BASE}/prerrequisitos`,
  BY_ID: (id) => `${API_BASE}/prerrequisitos/${id}`,
};

// Complementario
export const DISCAPACIDAD_ENDPOINTS = {
  ...createCRUDEndpoints('/discapacidad'),
  ESTADO: (id) => `${API_BASE}/discapacidad/${id}/estado`, // PATCH: activar/desactivar
};

// Actividades (catálogo maestro reutilizable entre gestiones)
export const ACTIVIDADES_ENDPOINTS = {
  ...createCRUDEndpoints('/actividades'),
  ESTADO: (id) => `${API_BASE}/actividades/${id}/estado`, // PATCH: activar/desactivar
};

/**
 * CRUD de administración del catálogo Tipos de evaluación (CFG → Recursos académicos).
 * Distinto de `CALIFICACIONES_ENDPOINTS.TIPOS_EVALUACION` (combo GET-only del cuaderno).
 */
export const TIPOS_EVALUACION_ENDPOINTS = {
  ...createCRUDEndpoints('/tipos-evaluacion'),
  ESTADO: (id) => `${API_BASE}/tipos-evaluacion/${id}/estado`, // PATCH: activar/desactivar
};

// ============================================
// MÓDULO: ACADÉMICO
// ============================================
export const PARALELOS_ENDPOINTS = {
  ...createCRUDEndpoints('/paralelos'),
  // PATCH: activar/desactivar el paralelo maestro (CFG → Recursos académicos)
  ESTADO: (id) => `${API_BASE}/paralelos/${id}/estado`,
  // Endpoint específico para obtener horarios de un paralelo
  SCHEDULE: (id) => `${API_BASE}/paralelos/${id}/schedule`,
  // PUT /v1/paralelos/:id/schedule — persistir plan semanal
  SCHEDULE_PUT: (id) => `${API_BASE}/paralelos/${id}/schedule`,
  DASHBOARD_PARALELOS_ESTADO: `${API_BASE}/paralelos/dashboard/paralelos-estado`,
  DASHBOARD_ASIGNATURAS_SIN_CURSO: `${API_BASE}/paralelos/dashboard/asignaturas-sin-curso`,
  DASHBOARD_CAPACIDAD_TURNO: `${API_BASE}/paralelos/dashboard/capacidad-turno`,
  DASHBOARD_HORARIOS_PENDIENTES: `${API_BASE}/paralelos/dashboard/horarios-pendientes`,
  DASHBOARD_HORARIOS_PUBLICACION: `${API_BASE}/paralelos/dashboard/horarios-publicacion`,
  PARALELOS_GESTION_BY_PARALELO: (id) => `${API_BASE}/paralelos/${id}/paralelos-gestion`,
};

export const AULAS_HORARIOS_ENDPOINTS = {
  BLOQUES: `${API_BASE}/aulas/horarios`,
  PATCH_AULA: (cursoHorarioId) => `${API_BASE}/aulas/horarios/${cursoHorarioId}/aula`,
};
export const GESTIONES_ENDPOINTS = {
  ...createCRUDEndpoints('/gestiones'),
  MARCAR_VIGENTE: (id) => `${API_BASE}/gestiones/${id}/marcar-vigente`,
  RENOVAR_OFERTA: (id) => `${API_BASE}/gestiones/${id}/renovar-oferta`,
  PLANES_HABILITADOS: (id) => `${API_BASE}/gestiones/${id}/planes-habilitados`,
  CARGA_DOCENTES: (id) => `${API_BASE}/gestiones/${id}/carga-docentes`,
  CONFLICTOS: (id) => `${API_BASE}/gestiones/${id}/conflictos`,
  PUBLICAR_TODOS: (id) => `${API_BASE}/gestiones/${id}/publicar-todos`,
};

export const GESTIONES_PLANES_ENDPOINTS = {
  BASE: `${API_BASE}/gestiones-planes`,
  ESTADO: (id) => `${API_BASE}/gestiones-planes/${id}/estado`,
  PARALELOS_GESTION: (id) => `${API_BASE}/gestiones-planes/${id}/paralelos-gestion`,
  GENERAR_PARALELOS: (id) => `${API_BASE}/gestiones-planes/${id}/generar-paralelos-gestion`,
};

export const PARALELOS_GESTION_ENDPOINTS = {
  BY_ID: (id) => `${API_BASE}/paralelos-gestion/${id}`,
  ESTADO: (id) => `${API_BASE}/paralelos-gestion/${id}/estado`,
  CAMBIAR_TURNO: (id) => `${API_BASE}/paralelos-gestion/${id}/cambiar-turno`,
  OFERTA_CURSOS: (id) => `${API_BASE}/paralelos-gestion/${id}/oferta-cursos`,
  GENERAR_OFERTA: (id) => `${API_BASE}/paralelos-gestion/${id}/generar-oferta`,
  VALIDAR_OFERTA: (id) => `${API_BASE}/paralelos-gestion/${id}/validar-oferta`,
  COBERTURA_DOCENTE: (id) => `${API_BASE}/paralelos-gestion/${id}/cobertura-docente`,
  GRILLA_HORARIO: (id) => `${API_BASE}/paralelos-gestion/${id}/grilla-horario`,
  CONFLICTOS: (id) => `${API_BASE}/paralelos-gestion/${id}/conflictos`,
  PUBLICAR: (id) => `${API_BASE}/paralelos-gestion/${id}/publicar`,
};

export const OFERTA_CURSOS_ENDPOINTS = {
  BASE: `${API_BASE}/oferta-cursos`,
  ESTADO: (id) => `${API_BASE}/oferta-cursos/${id}/estado`,
  BY_ID: (id) => `${API_BASE}/oferta-cursos/${id}`,
};

export const AULAS_CATALOGO_ENDPOINT = `${API_BASE}/aulas/catalogo`;

/**
 * CRUD de administración del catálogo Aulas (CFG → Recursos académicos).
 * Distinto de `AULAS_CATALOGO_ENDPOINT` (picker GET-only de Institucional/Oferta).
 */
export const AULAS_ENDPOINTS = {
  ...createCRUDEndpoints('/aulas'),
  ESTADO: (id) => `${API_BASE}/aulas/${id}/estado`, // PATCH: activar/desactivar
};

export const HORARIOS_DOCENTE_ENDPOINTS = {
  GRILLA_CONFLICTOS: (docenteId, gestionId) => {
    const q = new URLSearchParams();
    if (gestionId != null) q.set('gestion_id', String(gestionId));
    const qs = q.toString();
    return `${API_BASE}/horarios/docentes/${docenteId}/grilla-conflictos${qs ? `?${qs}` : ''}`;
  },
};

export const ASIGNACION_HORARIOS_ENDPOINTS = {
  BASE: `${API_BASE}/asignacion-horarios`,
  BY_ID: (id) => `${API_BASE}/asignacion-horarios/${id}`,
  BULK: `${API_BASE}/asignacion-horarios/bulk`,
};

export const CONFLICTOS_ENDPOINTS = {
  VALIDAR: `${API_BASE}/conflictos/validar`,
};

// ============================================
// MÓDULO: CALIFICACIONES (Académico)
// ============================================
export const ASISTENCIA_ENDPOINTS = {
  COORDINACION_DOCENTES: `${API_BASE}/asistencia/coordinacion/docentes`,
  MIS_CURSOS: `${API_BASE}/asistencia/mis-cursos`,
  COORDINACION_DOCENTE_CURSOS: (docenteId) =>
    `${API_BASE}/asistencia/coordinacion/docentes/${docenteId}/cursos`,
  // Toma de asistencia (modelo sesiones_clase)
  CALENDARIO: (asignacionId) => `${API_BASE}/asistencia/cursos/${asignacionId}/calendario`,
  PLANILLA: (asignacionId) => `${API_BASE}/asistencia/cursos/${asignacionId}/planilla`,
  REGISTRO_CERRAR: (asignacionId) =>
    `${API_BASE}/asistencia/cursos/${asignacionId}/registro/cerrar`,
  REGISTRO_REABRIR: (asignacionId) =>
    `${API_BASE}/asistencia/cursos/${asignacionId}/registro/reabrir`,
  SESIONES_ESPECIALES: (asignacionId) =>
    `${API_BASE}/asistencia/cursos/${asignacionId}/sesiones-especiales`,
  SESION_ESPECIAL_ELIMINAR: (asignacionId, fecha) =>
    `${API_BASE}/asistencia/cursos/${asignacionId}/sesiones-especiales/${fecha}`,
  // Licencias estudiantiles (página dentro de Asistencia · ACA-ASI-LIC)
  LICENCIAS: `${API_BASE}/asistencia/licencias`,
  LICENCIA_BY_ID: (id) => `${API_BASE}/asistencia/licencias/${id}`,
  /** PUT — editar una licencia PENDIENTE (motivo, detalle, rango). */
  LICENCIA_UPDATE: (id) => `${API_BASE}/asistencia/licencias/${id}`,
  LICENCIA_DECISION: (id) => `${API_BASE}/asistencia/licencias/${id}/decision`,
  /** PUT — cancelar una licencia PENDIENTE o APROBADA. */
  LICENCIA_CANCEL: (id) => `${API_BASE}/asistencia/licencias/${id}/cancel`,
  /** Inscripción vigente del estudiante (resuelve estudiante → inscripcionId para la solicitud). */
  LICENCIA_INSCRIPCION_VIGENTE: (estudianteId) =>
    `${API_BASE}/asistencia/licencias/inscripcion-vigente?estudianteId=${estudianteId}`,
};

export const CALIFICACIONES_ENDPOINTS = {
  COORDINACION_DOCENTES: `${API_BASE}/calificaciones/coordinacion/docentes`,
  CENTRALIZADOR: `${API_BASE}/calificaciones/centralizador`,
  MIS_CURSOS: `${API_BASE}/calificaciones/mis-cursos`,
  COORDINACION_DOCENTE_CURSOS: (docenteId) =>
    `${API_BASE}/calificaciones/coordinacion/docentes/${docenteId}/cursos`,
  TIPOS_EVALUACION: `${API_BASE}/calificaciones/tipos-evaluacion`,
  POLITICA: `${API_BASE}/calificaciones/politica`,
  POLITICA_CATALOGO: `${API_BASE}/calificaciones/politica/catalogo`,
  GESTION_BIMESTRES: `${API_BASE}/calificaciones/gestion-bimestres`,
  GESTION_CRONOGRAMA: `${API_BASE}/calificaciones/gestion-cronograma`,
  CRONOGRAMA_ADMIN: `${API_BASE}/calificaciones/cronograma`,
  CRONOGRAMA_ADMIN_BY_ID: (id) => `${API_BASE}/calificaciones/cronograma/${id}`,
  GESTION_BIMESTRES_INICIAR: `${API_BASE}/calificaciones/gestion-bimestres/iniciar`,
  GESTION_BIMESTRES_VALIDAR_CIERRE: (numero) =>
    `${API_BASE}/calificaciones/gestion-bimestres/bimestre/${numero}/validar-cierre`,
  GESTION_BIMESTRES_CERRAR: (numero) =>
    `${API_BASE}/calificaciones/gestion-bimestres/bimestre/${numero}/cerrar`,
  GESTION_BIMESTRES_ABRIR: (numero) =>
    `${API_BASE}/calificaciones/gestion-bimestres/bimestre/${numero}/abrir`,
  GESTION_PERIODOS: `${API_BASE}/calificaciones/gestion-bimestres/periodos`,
  GESTION_PERIODO_BY_ID: (id) => `${API_BASE}/calificaciones/gestion-bimestres/periodos/${id}`,
  GESTION_PERIODO_FECHAS: (id) =>
    `${API_BASE}/calificaciones/gestion-bimestres/periodos/${id}/fechas`,
  REGISTRO_NOTAS: (asignacionId) =>
    `${API_BASE}/calificaciones/asignaciones/${asignacionId}/notas`,
  CUADERNO_BIMESTRE: (asignacionId, bimestre) =>
    `${API_BASE}/calificaciones/asignaciones/${asignacionId}/cuaderno/${bimestre}`,
  CUADERNO_EVALUACIONES: (asignacionId, bimestre) =>
    `${API_BASE}/calificaciones/asignaciones/${asignacionId}/cuaderno/${bimestre}/evaluaciones`,
  CUADERNO_EVALUACION: (asignacionId, bimestre, evaluacionId) =>
    `${API_BASE}/calificaciones/asignaciones/${asignacionId}/cuaderno/${bimestre}/evaluaciones/${evaluacionId}`,
  CUADERNO_EVALUACION_NOTAS: (asignacionId, bimestre, evaluacionId) =>
    `${API_BASE}/calificaciones/asignaciones/${asignacionId}/cuaderno/${bimestre}/evaluaciones/${evaluacionId}/notas`,
  CUADERNO_NOTA: (asignacionId, bimestre) =>
    `${API_BASE}/calificaciones/asignaciones/${asignacionId}/cuaderno/${bimestre}/notas`,
  CUADERNO_GUARDAR: (asignacionId, bimestre) =>
    `${API_BASE}/calificaciones/asignaciones/${asignacionId}/cuaderno/${bimestre}/guardar`,
  BIMESTRE_CONSOLIDADO: (asignacionId, bimestre) =>
    `${API_BASE}/calificaciones/asignaciones/${asignacionId}/bimestre/${bimestre}/consolidado`,
  BIMESTRE_REABRIR: (asignacionId, bimestre) =>
    `${API_BASE}/calificaciones/asignaciones/${asignacionId}/bimestre/${bimestre}/reabrir`,
  BIMESTRE_CERRAR: (asignacionId, bimestre) =>
    `${API_BASE}/calificaciones/asignaciones/${asignacionId}/bimestre/${bimestre}/cerrar`,
  EXPORT_REGISTRO_PEDAGOGICO: (asignacionId, bimestre) =>
    `${API_BASE}/calificaciones/asignaciones/${asignacionId}/bimestre/${bimestre}/export/registro-pedagogico`,
  EXPORT_CENTRALIZADOR: (paraleloGestionId, bimestre) =>
    `${API_BASE}/calificaciones/centralizador/${paraleloGestionId}/bimestre/${bimestre}/export`,
  EXPORT_CENTRALIZADOR_CARRERA: (paraleloGestionId, bimestre) =>
    `${API_BASE}/calificaciones/centralizador/carrera-de/${paraleloGestionId}/bimestre/${bimestre}/export`,
  CENTRALIZADOR_OBSERVACION: (paraleloGestionId, bimestre, estudianteId) =>
    `${API_BASE}/calificaciones/centralizador/${paraleloGestionId}/bimestre/${bimestre}/observaciones/${estudianteId}`,
  EXPORT_BOLETIN_ESTUDIANTE: (paraleloGestionId, estudianteId) =>
    `${API_BASE}/calificaciones/centralizador/${paraleloGestionId}/estudiante/${estudianteId}/boletin`,
  /** GET — Boletín del estudiante autenticado (portal del estudiante). */
  MI_BOLETIN: `${API_BASE}/calificaciones/mi-boletin`,
  /** GET — Boletín del estudiante autenticado en PDF (descarga binaria). */
  MI_BOLETIN_PDF: `${API_BASE}/calificaciones/mi-boletin/pdf`,
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
export const IDIOMAS_ENDPOINTS = {
  ...createCRUDEndpoints('/idiomas'),
  ESTADO: (id) => `${API_BASE}/idiomas/${id}/estado`, // PATCH: activar/desactivar
};
export const ESTADOS_CIVILES_ENDPOINTS = {
  ...createCRUDEndpoints('/estados-civiles'),
  ESTADO: (id) => `${API_BASE}/estados-civiles/${id}/estado`, // PATCH: activar/desactivar
};
export const TIPOS_PARENTESCO_ENDPOINTS = {
  ...createCRUDEndpoints('/tipos-parentesco'),
  ESTADO: (id) => `${API_BASE}/tipos-parentesco/${id}/estado`, // PATCH: activar/desactivar
};
export const DOCUMENTACION_ENDPOINTS = {
  ...createCRUDEndpoints('/documentacion'),
  ESTADO: (id) => `${API_BASE}/documentacion/${id}/estado`, // PATCH: activar/desactivar
};

// ============================================
// MÓDULO: INSCRIPCIONES
// ============================================
export const INSCRIPCIONES_ENDPOINTS = {
  ...createCRUDEndpoints('/inscripciones'),
  // Endpoint específico para generar formulario de inscripción (se usará desde el módulo de inscripciones)
  GENERATE_FORMULARIO: (studentId) => `${API_BASE}/inscripciones/${studentId}/generar-formulario`,
  HISTORIAL_PREVIO: (inscripcionId) =>
    `${API_BASE}/inscripciones/${encodeURIComponent(String(inscripcionId))}/historial-previo`,
  ACTIVAR_CURSADO: (inscripcionId) =>
    `${API_BASE}/inscripciones/${encodeURIComponent(String(inscripcionId))}/activar-cursado`,
};

// ============================================
// MÓDULO: PAGOS
// ============================================
export const METODOS_PAGO_ENDPOINTS = {
  ...createCRUDEndpoints('/metodos-pago'),
  ESTADO: (id) => `${API_BASE}/metodos-pago/${id}/estado`, // PATCH: activar/desactivar
};
export const BANCOS_AUTORIZADOS_ENDPOINTS = {
  ...createCRUDEndpoints('/bancos-autorizados'),
  ESTADO: (id) => `${API_BASE}/bancos-autorizados/${id}/estado`, // PATCH: activar/desactivar
};
export const CUENTAS_PAGO_ENDPOINTS = {
  ...createCRUDEndpoints('/cuentas-pago'),
  ESTADO: (id) => `${API_BASE}/cuentas-pago/${id}/estado`, // PATCH: activar/desactivar
};
export const CONFIGURACION_APORTES_ENDPOINTS = createCRUDEndpoints('/configuracion-aportes');
export const PAGOS_APORTES_ENDPOINTS = {
  ...createCRUDEndpoints('/pagos-aportes'),
  // Portal del estudiante: sus aportes (resumen + lista) y el detalle (pagos realizados)
  MIS_APORTES: `${API_BASE}/pagos-aportes/mis-aportes`,
  MIS_APORTES_DETALLE: (cabeceraId) =>
    `${API_BASE}/pagos-aportes/mis-aportes/${encodeURIComponent(String(cabeceraId))}`,
  UPDATE_CUOTA: (cuotaId) =>
    `${API_BASE}/pagos-aportes/cuotas/${encodeURIComponent(String(cuotaId))}`,
  DELETE_CUOTA: (cuotaId) =>
    `${API_BASE}/pagos-aportes/cuotas/${encodeURIComponent(String(cuotaId))}`,
  // Estado del aporte para el formulario de registro (estudiante_id, gestion_id opcional)
  ESTADO_REGISTRO: `${API_BASE}/pagos-aportes/estado-registro`,
  BUSCAR_ESTUDIANTES_REGISTRO: `${API_BASE}/pagos-aportes/buscar-estudiantes-registro`,
  // Endpoint específico para generar/obtener recibo de pago
  GENERATE_RECIBO: (paymentId) => `${API_BASE}/pagos-aportes/${encodeURIComponent(String(paymentId))}/recibo`,
  EXPORT_LISTA_POR_CARRERA: `${API_BASE}/pagos-aportes/export/lista-por-carrera`,
  // Reporte read-only: planilla de control de becas por carrera (query gestion_id opcional)
  REPORTE_BECAS_POR_CARRERA: `${API_BASE}/pagos-aportes/reportes/becas-por-carrera`,
  // Exportación Excel de la planilla de becas por carrera (blob xlsx, gestion_id opcional)
  EXPORT_REPORTE_BECAS_POR_CARRERA: `${API_BASE}/pagos-aportes/reportes/becas-por-carrera/export`,
  // Reporte read-only: planilla de cuentas por cobrar por carrera y paralelo (query gestion_id opcional)
  REPORTE_CUENTAS_POR_COBRAR: `${API_BASE}/pagos-aportes/reportes/cuentas-por-cobrar`,
  // Exportación Excel de la planilla de cuentas por cobrar (blob xlsx, gestion_id opcional)
  EXPORT_REPORTE_CUENTAS_POR_COBRAR: `${API_BASE}/pagos-aportes/reportes/cuentas-por-cobrar/export`,
  // Compromiso de pago VIGENTE de una cabecera de aporte (GET vigente / POST upsert)
  COMPROMISO_BY_PAGO: (pagoAporteId) =>
    `${API_BASE}/pagos-aportes/${encodeURIComponent(String(pagoAporteId))}/compromiso`,
  // Compromiso de pago por su id (PUT actualizar / DELETE anular)
  COMPROMISO_BY_ID: (id) =>
    `${API_BASE}/pagos-aportes/compromiso/${encodeURIComponent(String(id))}`,
};

// ============================================
// MÓDULO: DASHBOARD
// ============================================
export const DASHBOARD_ENDPOINTS = {
  RESUMEN: `${API_BASE}/dashboard/resumen`,
  /** GET — resumen personal del estudiante autenticado (portal del estudiante). */
  MI_RESUMEN: `${API_BASE}/dashboard/mi-resumen`,
  /** GET — resumen personal del docente autenticado (portal del docente). */
  MI_RESUMEN_DOCENTE: `${API_BASE}/dashboard/mi-resumen-docente`,
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
  ME_PASSWORD: `${AUTH_BASE}/me/password`,
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
  BY_ID: (rolId) => `${API_BASE}/roles/${rolId}`,
  PERMISOS: (rolId) => `${API_BASE}/roles/${rolId}/permisos`,
  PERMISOS_GRILLA: (rolId, dominio) =>
    `${API_BASE}/roles/${rolId}/permisos-grilla?${new URLSearchParams({ dominio }).toString()}`,
  /** GET paginado — usuarios con este rol (ficha de detalle). Query: page, limit, search, sort. */
  USUARIOS: (rolId, params = {}) => {
    const safeParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value === undefined || value === null || value === '') return acc;
      acc[key] = String(value);
      return acc;
    }, {});
    const query = new URLSearchParams(safeParams).toString();
    return `${API_BASE}/roles/${rolId}/usuarios${query ? `?${query}` : ''}`;
  },
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
