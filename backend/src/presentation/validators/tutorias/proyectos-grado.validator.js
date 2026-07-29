import { body, param, query } from 'express-validator';
import { listValidator } from '../common/list.validator.js';
import {
  ESTADOS_PROYECTO_GRADO_VALUES,
  ROLES_INTEGRANTE_TUTORIA_VALUES,
  ESTADOS_INTEGRANTE_TUTORIA_VALUES,
  TIPOS_BITACORA_TUTORIA_VALUES,
  ESTADOS_BITACORA_TUTORIA_VALUES,
  ESTADOS_REVISION_AVANCE_VALUES,
} from '../../../domain/constants/tutorias.constants.js';

/**
 * Validators del sub-módulo Titulación (proyectos de grado, módulo TUT)
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
