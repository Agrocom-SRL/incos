import { body, param, query } from 'express-validator';
import { listValidator } from '../common/list.validator.js';
import {
  ESTADOS_PROYECTO_GRADO_VALUES,
  ROLES_INTEGRANTE_TUTORIA_VALUES,
  ESTADOS_INTEGRANTE_TUTORIA_VALUES,
  TIPOS_BITACORA_TUTORIA_VALUES,
  ESTADOS_BITACORA_TUTORIA_VALUES,
  ESTADOS_REVISION_AVANCE_VALUES,
  TRIBUNAL_ACTA_DEFENSA_MIEMBROS,
} from '../../../domain/constants/titulacion.constants.js';

/**
 * Validators del módulo Titulación (proyectos de grado, módulo TIT)
 *
 * Shape raíz: proyectos_grado (22-modalidades-grado.sql); satélites del
 * schema 23 (integrantes, bitácora, avances, dictámenes).
 */

/** Param :integranteId (rutas anidadas). */
export const integranteIdValidator = [
  param('integranteId')
    .notEmpty()
    .withMessage('El ID del integrante es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del integrante debe ser un número entero mayor a 0')
    .toInt(),
];

/** Param :entradaId (rutas anidadas de bitácora). */
export const entradaIdValidator = [
  param('entradaId')
    .notEmpty()
    .withMessage('El ID de la entrada es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID de la entrada debe ser un número entero mayor a 0')
    .toInt(),
];

/** Param :avanceId (rutas anidadas de avances). */
export const avanceIdValidator = [
  param('avanceId')
    .notEmpty()
    .withMessage('El ID del avance es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del avance debe ser un número entero mayor a 0')
    .toInt(),
];

/** Param :dictamenId (rutas anidadas de dictámenes). */
export const dictamenIdValidator = [
  param('dictamenId')
    .notEmpty()
    .withMessage('El ID del dictamen es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del dictamen debe ser un número entero mayor a 0')
    .toInt(),
];

/** Param :actaId (rutas anidadas de acta de defensa). */
export const actaIdValidator = [
  param('actaId')
    .notEmpty()
    .withMessage('El ID del acta es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del acta debe ser un número entero mayor a 0')
    .toInt(),
];

export const listProyectosGradoValidator = [
  ...listValidator,
  query('gestionId').optional().isInt({ min: 1 }).withMessage('gestionId debe ser un entero positivo'),
  query('carreraId').optional().isInt({ min: 1 }).withMessage('carreraId debe ser un entero positivo'),
  query('modalidadId').optional().isInt({ min: 1 }).withMessage('modalidadId debe ser un entero positivo'),
  query('tutorId').optional().isInt({ min: 1 }).withMessage('tutorId debe ser un entero positivo'),
  query('estado')
    .optional()
    .isIn(ESTADOS_PROYECTO_GRADO_VALUES)
    .withMessage(`estado debe ser uno de: ${ESTADOS_PROYECTO_GRADO_VALUES.join(', ')}`),
];

export const exportBitacoraMensualValidator = [
  query('mes')
    .notEmpty()
    .withMessage('mes es requerido')
    .matches(/^\d{4}-\d{2}$/)
    .withMessage('mes debe tener formato YYYY-MM'),
  query('gestionId').optional().isInt({ min: 1 }).withMessage('gestionId debe ser un entero positivo'),
  query('tutorId').optional().isInt({ min: 1 }).withMessage('tutorId debe ser un entero positivo'),
];

export const createProyectoGradoValidator = [
  body('titulo')
    .notEmpty()
    .withMessage('titulo es requerido')
    .isString()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('titulo debe tener entre 5 y 500 caracteres'),
  body('modalidadId')
    .notEmpty()
    .withMessage('modalidadId es requerido')
    .isInt({ min: 1 })
    .withMessage('modalidadId debe ser un entero positivo'),
  body('carreraId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('carreraId debe ser un entero positivo'),
  body('gestionId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('gestionId debe ser un entero positivo'),
  body('estudianteIds')
    .isArray({ min: 1 })
    .withMessage('estudianteIds debe ser un array con al menos un estudiante'),
  body('estudianteIds.*').isInt({ min: 1 }).withMessage('cada estudianteId debe ser un entero positivo'),
  body('titularEstudianteId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('titularEstudianteId debe ser un entero positivo'),
  body('descripcion').optional({ nullable: true }).isString(),
  body('objetivos').optional({ nullable: true }).isString(),
  body('alcance').optional({ nullable: true }).isString(),
  body('metodologia').optional({ nullable: true }).isString(),
  body('fechaPresentacionPerfil')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('fechaPresentacionPerfil debe ser una fecha válida (YYYY-MM-DD)'),
];

export const updateProyectoGradoValidator = [
  body('titulo')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('titulo debe tener entre 5 y 500 caracteres'),
  body('modalidadId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('modalidadId debe ser un entero positivo'),
  body('carreraId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('carreraId debe ser un entero positivo'),
  body('gestionId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('gestionId debe ser un entero positivo'),
  body('descripcion').optional({ nullable: true }).isString(),
  body('objetivos').optional({ nullable: true }).isString(),
  body('alcance').optional({ nullable: true }).isString(),
  body('metodologia').optional({ nullable: true }).isString(),
  body('notaPerfil').optional({ nullable: true }).isFloat({ min: 0, max: 100 }).withMessage('notaPerfil debe estar entre 0 y 100'),
  body('notaPredefensa').optional({ nullable: true }).isFloat({ min: 0, max: 100 }).withMessage('notaPredefensa debe estar entre 0 y 100'),
  body('notaDefensa').optional({ nullable: true }).isFloat({ min: 0, max: 100 }).withMessage('notaDefensa debe estar entre 0 y 100'),
  body('notaFinal').optional({ nullable: true }).isFloat({ min: 0, max: 100 }).withMessage('notaFinal debe estar entre 0 y 100'),
];

export const asignarTutorValidator = [
  body('tutorId')
    .notEmpty()
    .withMessage('tutorId es requerido')
    .isInt({ min: 1 })
    .withMessage('tutorId debe ser un entero positivo'),
  body('numeroInforme')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('numeroInforme no debe superar los 50 caracteres'),
  body('fechaEmision')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('fechaEmision debe ser una fecha válida (YYYY-MM-DD)'),
  body('destinatario')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 150 })
    .withMessage('destinatario no debe superar los 150 caracteres'),
];

export const transicionProyectoValidator = [
  body('estado')
    .notEmpty()
    .withMessage('estado (destino de la transición) es requerido')
    .isIn(ESTADOS_PROYECTO_GRADO_VALUES)
    .withMessage(`estado debe ser uno de: ${ESTADOS_PROYECTO_GRADO_VALUES.join(', ')}`),
  body('fecha')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('fecha debe ser una fecha válida (YYYY-MM-DD)'),
  body('nota').optional({ nullable: true }).isFloat({ min: 0, max: 100 }).withMessage('nota debe estar entre 0 y 100'),
  body('observaciones').optional({ nullable: true }).isString(),
  body('numeroInforme')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('numeroInforme no debe superar los 50 caracteres'),
  body('contenido').optional({ nullable: true }).isString(),
  body('destinatario')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 150 })
    .withMessage('destinatario no debe superar los 150 caracteres'),
];

export const addIntegranteValidator = [
  body('estudianteId')
    .notEmpty()
    .withMessage('estudianteId es requerido')
    .isInt({ min: 1 })
    .withMessage('estudianteId debe ser un entero positivo'),
  body('rol')
    .optional()
    .isIn(ROLES_INTEGRANTE_TUTORIA_VALUES)
    .withMessage(`rol debe ser uno de: ${ROLES_INTEGRANTE_TUTORIA_VALUES.join(', ')}`),
  body('fechaIncorporacion')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('fechaIncorporacion debe ser una fecha válida (YYYY-MM-DD)'),
  body('observaciones').optional({ nullable: true }).isString(),
];

export const updateIntegranteValidator = [
  body('rol')
    .optional()
    .isIn(ROLES_INTEGRANTE_TUTORIA_VALUES)
    .withMessage(`rol debe ser uno de: ${ROLES_INTEGRANTE_TUTORIA_VALUES.join(', ')}`),
  body('estado')
    .optional()
    .isIn(ESTADOS_INTEGRANTE_TUTORIA_VALUES)
    .withMessage(`estado debe ser uno de: ${ESTADOS_INTEGRANTE_TUTORIA_VALUES.join(', ')}`),
  body('fechaIncorporacion')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('fechaIncorporacion debe ser una fecha válida (YYYY-MM-DD)'),
  body('observaciones').optional({ nullable: true }).isString(),
];

export const createBitacoraEntradaValidator = [
  body('tipo')
    .optional()
    .isIn(TIPOS_BITACORA_TUTORIA_VALUES)
    .withMessage(`tipo debe ser uno de: ${TIPOS_BITACORA_TUTORIA_VALUES.join(', ')}`),
  body('fecha')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('fecha debe ser una fecha válida (YYYY-MM-DD)'),
  body('actividad').optional({ nullable: true }).isString(),
  body('observaciones').optional({ nullable: true }).isString(),
  body('porcentajeAvance')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 100 })
    .withMessage('porcentajeAvance debe estar entre 0 y 100'),
  body('avanceProyectoId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('avanceProyectoId debe ser un entero positivo'),
  body('estado')
    .optional()
    .isIn(ESTADOS_BITACORA_TUTORIA_VALUES)
    .withMessage(`estado debe ser uno de: ${ESTADOS_BITACORA_TUTORIA_VALUES.join(', ')}`),
  body('estadoRevisionAvance')
    .optional()
    .isIn(ESTADOS_REVISION_AVANCE_VALUES)
    .withMessage(`estadoRevisionAvance debe ser uno de: ${ESTADOS_REVISION_AVANCE_VALUES.join(', ')}`),
];

export const updateBitacoraEntradaValidator = [
  body('fecha')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('fecha debe ser una fecha válida (YYYY-MM-DD)'),
  body('actividad').optional({ nullable: true }).isString(),
  body('observaciones').optional({ nullable: true }).isString(),
  body('porcentajeAvance')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 100 })
    .withMessage('porcentajeAvance debe estar entre 0 y 100'),
  body('estado')
    .optional()
    .isIn(ESTADOS_BITACORA_TUTORIA_VALUES)
    .withMessage(`estado debe ser uno de: ${ESTADOS_BITACORA_TUTORIA_VALUES.join(', ')}`),
];

export const createAvanceValidator = [
  body('titulo')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage('titulo no debe superar los 255 caracteres'),
  body('descripcion').optional({ nullable: true }).isString(),
];

// ============================================
// Extensión 2026-07-31 (formulario de modalidad de graduación, reporte de
// avance por carrera, planilla de avance "10 en 10")
// ============================================

/** GET /estudiantes-elegibles?search=&carreraId=&gestionId= (Requisito 1) */
export const listEstudiantesElegiblesValidator = [
  ...listValidator,
  query('carreraId').optional().isInt({ min: 1 }).withMessage('carreraId debe ser un entero positivo'),
  query('gestionId').optional().isInt({ min: 1 }).withMessage('gestionId debe ser un entero positivo'),
];

/** GET /reportes/avance-carrera[/pdf]?gestionId=&carreraId= (Requisito 2) */
export const avanceTutoriaCarreraValidator = [
  query('gestionId').optional().isInt({ min: 1 }).withMessage('gestionId debe ser un entero positivo'),
  query('carreraId').optional().isInt({ min: 1 }).withMessage('carreraId debe ser un entero positivo'),
];

/**
 * GET /reportes/seguimiento-tutoria-docentes[/export]?docenteId=&carreraId=&anio=&mes=
 * (extensión 2026-08-10, reemplaza la planilla de avance "10 en 10" de 3er
 * año). Todos los filtros son opcionales y nunca bloqueantes: anio/mes
 * default al mes/año actual del servidor, resuelto en el use case.
 */
export const seguimientoTutoriaDocentesValidator = [
  query('docenteId').optional().isInt({ min: 1 }).withMessage('docenteId debe ser un entero positivo'),
  query('carreraId').optional().isInt({ min: 1 }).withMessage('carreraId debe ser un entero positivo'),
  query('anio').optional().isInt({ min: 2000, max: 2100 }).withMessage('anio debe ser un entero válido'),
  query('mes').optional().isInt({ min: 1, max: 12 }).withMessage('mes debe ser un entero entre 1 y 12'),
];

// ============================================
// Extensión 2026-08-01 — Acta de defensa de grado
// ============================================

/** POST /:id/acta-defensa — registra el/los acta(s) de defensa del proyecto. */
export const registrarActaDefensaValidator = [
  body('fechaDefensa')
    .notEmpty()
    .withMessage('fechaDefensa es requerida')
    .isISO8601()
    .withMessage('fechaDefensa debe ser una fecha válida (YYYY-MM-DD)'),
  body('horaInicio')
    .notEmpty()
    .withMessage('horaInicio es requerida')
    .matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
    .withMessage('horaInicio debe tener formato HH:mm'),
  body('horaConclusion')
    .optional({ nullable: true })
    .matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
    .withMessage('horaConclusion debe tener formato HH:mm'),
  body('tribunal')
    .isArray({ min: TRIBUNAL_ACTA_DEFENSA_MIEMBROS, max: TRIBUNAL_ACTA_DEFENSA_MIEMBROS })
    .withMessage(`tribunal debe tener exactamente ${TRIBUNAL_ACTA_DEFENSA_MIEMBROS} miembros`),
  body('tribunal.*.docenteId')
    .notEmpty()
    .withMessage('tribunal[].docenteId es requerido (siempre docentes del instituto, P5)')
    .isInt({ min: 1 })
    .withMessage('tribunal[].docenteId debe ser un entero positivo'),
  body('tribunal.*.cargo')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 80 })
    .withMessage('tribunal[].cargo no debe superar los 80 caracteres'),
  body('calificaciones')
    .isArray({ min: 1 })
    .withMessage('calificaciones debe ser un array con al menos un elemento'),
  body('calificaciones.*.estudianteId')
    .notEmpty()
    .withMessage('calificaciones[].estudianteId es requerido')
    .isInt({ min: 1 })
    .withMessage('calificaciones[].estudianteId debe ser un entero positivo'),
  body('calificaciones.*.calificacionFinal')
    .notEmpty()
    .withMessage('calificaciones[].calificacionFinal es requerida')
    .isFloat({ min: 0, max: 100 })
    .withMessage('calificaciones[].calificacionFinal debe estar entre 0 y 100'),
  body('numeroActa')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('numeroActa debe ser un entero positivo (ayuda: se asigna automáticamente si no se envía)'),
  body('observaciones').optional({ nullable: true }).isString(),
];

/**
 * PATCH /:id/acta-defensa/:actaId/anular — anula un acta EMITIDA (P8, extensión
 * 2026-08-02). El motivo se antepone a `observaciones` en el use case.
 */
export const anularActaDefensaValidator = [
  body('motivo')
    .notEmpty()
    .withMessage('motivo es requerido')
    .isString()
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('motivo debe tener entre 3 y 500 caracteres'),
];
