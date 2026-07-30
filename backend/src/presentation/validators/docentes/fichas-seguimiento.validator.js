import { body, query } from 'express-validator';
import { listValidator } from '../common/list.validator.js';
import { CLASES_OBSERVADAS_FICHA_VALUES } from '../../../domain/constants/docentes.constants.js';

/**
 * Validators del recurso Supervisión docente (módulo DOC ·
 * fichas_seguimiento_clase, schema 27).
 *
 * Shape del formulario real «FICHA DE SEGUIMIENTO EN LA CLASE PRESENCIAL»:
 * fecha requerida, 4 booleanos SI/NO opcionales, 2 cantidades enteras ≥ 0 y
 * 9 secciones de observación libres. `supervisorId` NO se valida ni se acepta
 * en el body: se fija en servidor desde la sesión.
 */

const FICHA_BOOLEAN_FIELDS = [
  'tieneCronogramaBimestral',
  'tienePlanBimestral',
  'tieneRegistroAsistencia',
  'tieneRegistroPedagogico',
];

const FICHA_OBS_FIELDS = [
  'obsDocumentacion',
  'obsAvanceAsignatura',
  'obsPresentacionTema',
  'obsRecursos',
  'obsExposicion',
  'obsParticipacion',
  'obsActividadesPracticas',
  'obsActividadesEvaluacion',
  'otrasObservaciones',
];

const fichaCamposComunes = [
  body('claseObservada')
    .optional({ nullable: true })
    .isIn(CLASES_OBSERVADAS_FICHA_VALUES)
    .withMessage(`claseObservada debe ser una de: ${CLASES_OBSERVADAS_FICHA_VALUES.join(', ')}`),
  ...FICHA_BOOLEAN_FIELDS.map((field) =>
    body(field)
      .optional({ nullable: true })
      .isBoolean()
      .withMessage(`${field} debe ser boolean (SI/NO)`)
      .toBoolean()
  ),
  body('estudiantesEnPlanilla')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('estudiantesEnPlanilla debe ser un entero mayor o igual a 0')
    .toInt(),
  body('estudiantesAsistentes')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('estudiantesAsistentes debe ser un entero mayor o igual a 0')
    .toInt(),
  ...FICHA_OBS_FIELDS.map((field) =>
    body(field)
      .optional({ nullable: true })
      .isString()
      .withMessage(`${field} debe ser texto`)
      .isLength({ max: 5000 })
      .withMessage(`${field} no puede superar los 5000 caracteres`)
  ),
];

/** GET / — listado con filtros (docente, gestión, rango de fechas). */
export const listFichasSeguimientoValidator = [
  ...listValidator,
  query('docenteId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('docenteId debe ser un entero positivo'),
  query('gestionId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('gestionId debe ser un entero positivo'),
  query('fechaDesde')
    .optional()
    .isISO8601()
    .withMessage('fechaDesde debe tener formato YYYY-MM-DD'),
  query('fechaHasta')
    .optional()
    .isISO8601()
    .withMessage('fechaHasta debe tener formato YYYY-MM-DD'),
];

/** POST / — asignación observada y fecha requeridas. */
export const createFichaSeguimientoValidator = [
  body('asignacionDocenteId')
    .notEmpty()
    .withMessage('El curso observado (asignacionDocenteId) es requerido')
    .isInt({ min: 1 })
    .withMessage('asignacionDocenteId debe ser un entero positivo')
    .toInt(),
  body('fechaSeguimiento')
    .notEmpty()
    .withMessage('La fecha de seguimiento es requerida')
    .isISO8601()
    .withMessage('fechaSeguimiento debe tener formato YYYY-MM-DD'),
  ...fichaCamposComunes,
];

/** PUT /:id — payload parcial (todos opcionales). */
export const updateFichaSeguimientoValidator = [
  body('asignacionDocenteId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('asignacionDocenteId debe ser un entero positivo')
    .toInt(),
  body('fechaSeguimiento')
    .optional()
    .isISO8601()
    .withMessage('fechaSeguimiento debe tener formato YYYY-MM-DD'),
  ...fichaCamposComunes,
];
