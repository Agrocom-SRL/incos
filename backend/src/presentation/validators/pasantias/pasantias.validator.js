import { body, param, query } from 'express-validator';
import { listValidator } from '../common/list.validator.js';
import {
  ESTADOS_PASANTIA_VALUES,
  HORAS_PASANTIA_MAX,
  HORAS_PASANTIA_MIN,
  NIVELES_DESEMPENO_PASANTIA_VALUES,
  RESULTADOS_INFORME_PASANTIA_VALUES,
  TIPOS_CONTRATO_PASANTIA_VALUES,
  TIPOS_INFORME_PASANTIA_VALUES,
  TIPOS_PASANTIA_VALUES,
  TIPOS_SOCIETARIO_EMPRESA_VALUES,
} from '../../../domain/constants/pasantias.constants.js';

/**
 * Validators del módulo Pasantías (TUT · práctica laboral)
 *
 * Shape raíz: pasantias (24-pasantias.sql); satélites pasantias_informes y
 * pasantias_seguimientos; catálogo pasantias_empresas.
 */

/** Param :empresaId (catálogo de empresas). */
export const empresaIdValidator = [
  param('empresaId')
    .notEmpty()
    .withMessage('El ID de la empresa es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID de la empresa debe ser un número entero mayor a 0')
    .toInt(),
];

/** Param :informeId (rutas anidadas de informes). */
export const informeIdValidator = [
  param('informeId')
    .notEmpty()
    .withMessage('El ID del informe es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del informe debe ser un número entero mayor a 0')
    .toInt(),
];

/** Param :seguimientoId (rutas anidadas de seguimientos). */
export const seguimientoIdValidator = [
  param('seguimientoId')
    .notEmpty()
    .withMessage('El ID del seguimiento es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del seguimiento debe ser un número entero mayor a 0')
    .toInt(),
];

export const listPasantiasValidator = [
  ...listValidator,
  query('carreraId').optional().isInt({ min: 1 }).withMessage('carreraId debe ser un entero positivo'),
  query('gestionId').optional().isInt({ min: 1 }).withMessage('gestionId debe ser un entero positivo'),
  query('estado')
    .optional()
    .isIn(ESTADOS_PASANTIA_VALUES)
    .withMessage(`estado debe ser uno de: ${ESTADOS_PASANTIA_VALUES.join(', ')}`),
  query('tipo')
    .optional()
    .isIn(TIPOS_PASANTIA_VALUES)
    .withMessage(`tipo debe ser uno de: ${TIPOS_PASANTIA_VALUES.join(', ')}`),
  query('docenteSupervisorId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('docenteSupervisorId debe ser un entero positivo'),
  query('estudianteId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('estudianteId debe ser un entero positivo'),
];

export const listPasantiasEmpresasValidator = [
  ...listValidator,
  query('incluirInactivos')
    .optional()
    .isBoolean()
    .withMessage('incluirInactivos debe ser boolean'),
  query('tipoSocietario')
    .optional()
    .isIn(TIPOS_SOCIETARIO_EMPRESA_VALUES)
    .withMessage(`tipoSocietario debe ser uno de: ${TIPOS_SOCIETARIO_EMPRESA_VALUES.join(', ')}`),
];

export const createPasantiaValidator = [
  body('estudianteId')
    .notEmpty()
    .withMessage('estudianteId es requerido')
    .isInt({ min: 1 })
    .withMessage('estudianteId debe ser un entero positivo'),
  body('tipo')
    .notEmpty()
    .withMessage('tipo es requerido')
    .isIn(TIPOS_PASANTIA_VALUES)
    .withMessage(`tipo debe ser uno de: ${TIPOS_PASANTIA_VALUES.join(', ')}`),
  body('empresaId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('empresaId debe ser un entero positivo'),
  body('carreraId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('carreraId debe ser un entero positivo'),
  body('gestionId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('gestionId debe ser un entero positivo'),
  body('docenteSupervisorId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('docenteSupervisorId debe ser un entero positivo'),
  body('areaDepartamento')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 150 })
    .withMessage('areaDepartamento no debe superar los 150 caracteres'),
  body('cargoPuesto')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 150 })
    .withMessage('cargoPuesto no debe superar los 150 caracteres'),
  body('funciones').optional({ nullable: true }).isString(),
  body('fechaInicio')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('fechaInicio debe ser una fecha válida (YYYY-MM-DD)'),
  body('fechaFinalizacion')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('fechaFinalizacion debe ser una fecha válida (YYYY-MM-DD)'),
  body('horasRequeridas')
    .optional({ nullable: true })
    .isInt({ min: HORAS_PASANTIA_MIN, max: HORAS_PASANTIA_MAX })
    .withMessage(`horasRequeridas debe estar entre ${HORAS_PASANTIA_MIN} y ${HORAS_PASANTIA_MAX}`),
  body('horasCumplidas')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('horasCumplidas debe ser un entero mayor o igual a 0'),
  body('tipoContrato')
    .optional({ nullable: true })
    .isIn(TIPOS_CONTRATO_PASANTIA_VALUES)
    .withMessage(`tipoContrato debe ser uno de: ${TIPOS_CONTRATO_PASANTIA_VALUES.join(', ')}`),
  body('tipoContratoDetalle')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 150 })
    .withMessage('tipoContratoDetalle no debe superar los 150 caracteres'),
  body('responsableEmpresa')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 150 })
    .withMessage('responsableEmpresa no debe superar los 150 caracteres'),
  body('cargoResponsable')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 150 })
    .withMessage('cargoResponsable no debe superar los 150 caracteres'),
  body('telefonoResponsable')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 30 })
    .withMessage('telefonoResponsable no debe superar los 30 caracteres'),
  body('observaciones').optional({ nullable: true }).isString(),
];

export const updatePasantiaValidator = [
  body('estudianteId').optional().isInt({ min: 1 }).withMessage('estudianteId debe ser un entero positivo'),
  body('tipo')
    .optional()
    .isIn(TIPOS_PASANTIA_VALUES)
    .withMessage(`tipo debe ser uno de: ${TIPOS_PASANTIA_VALUES.join(', ')}`),
  body('empresaId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('empresaId debe ser un entero positivo'),
  body('carreraId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('carreraId debe ser un entero positivo'),
  body('gestionId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('gestionId debe ser un entero positivo'),
  body('docenteSupervisorId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('docenteSupervisorId debe ser un entero positivo'),
  body('areaDepartamento')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 150 })
    .withMessage('areaDepartamento no debe superar los 150 caracteres'),
  body('cargoPuesto')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 150 })
    .withMessage('cargoPuesto no debe superar los 150 caracteres'),
  body('funciones').optional({ nullable: true }).isString(),
  body('fechaInicio')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('fechaInicio debe ser una fecha válida (YYYY-MM-DD)'),
  body('fechaFinalizacion')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('fechaFinalizacion debe ser una fecha válida (YYYY-MM-DD)'),
  body('horasRequeridas')
    .optional({ nullable: true })
    .isInt({ min: HORAS_PASANTIA_MIN, max: HORAS_PASANTIA_MAX })
    .withMessage(`horasRequeridas debe estar entre ${HORAS_PASANTIA_MIN} y ${HORAS_PASANTIA_MAX}`),
  body('horasCumplidas')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('horasCumplidas debe ser un entero mayor o igual a 0'),
  body('tipoContrato')
    .optional({ nullable: true })
    .isIn(TIPOS_CONTRATO_PASANTIA_VALUES)
    .withMessage(`tipoContrato debe ser uno de: ${TIPOS_CONTRATO_PASANTIA_VALUES.join(', ')}`),
  body('tipoContratoDetalle')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 150 })
    .withMessage('tipoContratoDetalle no debe superar los 150 caracteres'),
  body('responsableEmpresa')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 150 })
    .withMessage('responsableEmpresa no debe superar los 150 caracteres'),
  body('cargoResponsable')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 150 })
    .withMessage('cargoResponsable no debe superar los 150 caracteres'),
  body('telefonoResponsable')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 30 })
    .withMessage('telefonoResponsable no debe superar los 30 caracteres'),
  body('observaciones').optional({ nullable: true }).isString(),
];

export const transicionPasantiaValidator = [
  body('estado')
    .notEmpty()
    .withMessage('estado (destino de la transición) es requerido')
    .isIn(ESTADOS_PASANTIA_VALUES)
    .withMessage(`estado debe ser uno de: ${ESTADOS_PASANTIA_VALUES.join(', ')}`),
  body('observaciones').optional({ nullable: true }).isString(),
];

export const createPasantiaEmpresaValidator = [
  body('nombre')
    .notEmpty()
    .withMessage('nombre es requerido')
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('nombre debe tener entre 2 y 255 caracteres'),
  body('nombreComercial')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('nombreComercial no debe superar los 200 caracteres'),
  body('tipoSocietario')
    .optional({ nullable: true })
    .isIn(TIPOS_SOCIETARIO_EMPRESA_VALUES)
    .withMessage(`tipoSocietario debe ser uno de: ${TIPOS_SOCIETARIO_EMPRESA_VALUES.join(', ')}`),
  body('nit')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 30 })
    .withMessage('nit no debe superar los 30 caracteres'),
  body('enFuncionamiento')
    .optional({ nullable: true })
    .isBoolean()
    .withMessage('enFuncionamiento debe ser boolean'),
  body('direccion')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage('direccion no debe superar los 255 caracteres'),
  body('telefono')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 30 })
    .withMessage('telefono no debe superar los 30 caracteres'),
  body('sectorActividad')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 150 })
    .withMessage('sectorActividad no debe superar los 150 caracteres'),
  body('observaciones').optional({ nullable: true }).isString(),
];

export const updatePasantiaEmpresaValidator = [
  body('nombre')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('nombre debe tener entre 2 y 255 caracteres'),
  body('nombreComercial')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('nombreComercial no debe superar los 200 caracteres'),
  body('tipoSocietario')
    .optional({ nullable: true })
    .isIn(TIPOS_SOCIETARIO_EMPRESA_VALUES)
    .withMessage(`tipoSocietario debe ser uno de: ${TIPOS_SOCIETARIO_EMPRESA_VALUES.join(', ')}`),
  body('nit')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 30 })
    .withMessage('nit no debe superar los 30 caracteres'),
  body('enFuncionamiento')
    .optional({ nullable: true })
    .isBoolean()
    .withMessage('enFuncionamiento debe ser boolean'),
  body('direccion')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage('direccion no debe superar los 255 caracteres'),
  body('telefono')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 30 })
    .withMessage('telefono no debe superar los 30 caracteres'),
  body('sectorActividad')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 150 })
    .withMessage('sectorActividad no debe superar los 150 caracteres'),
  body('observaciones').optional({ nullable: true }).isString(),
];

/**
 * Body PATCH /empresas/:empresaId/estado — { "activo": boolean }.
 * Réplica del patrón set-estado de los catálogos maestros (se mantiene por
 * módulo para respetar la convención de carpetas de validators).
 */
export const setEstadoPasantiaEmpresaValidator = [
  body('activo')
    .exists({ checkNull: true })
    .withMessage('activo es requerido')
    .isBoolean()
    .withMessage('activo debe ser boolean'),
];

export const createInformePasantiaValidator = [
  body('tipo')
    .notEmpty()
    .withMessage('tipo es requerido')
    .isIn(TIPOS_INFORME_PASANTIA_VALUES)
    .withMessage(`tipo debe ser uno de: ${TIPOS_INFORME_PASANTIA_VALUES.join(', ')}`),
  body('docenteId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('docenteId debe ser un entero positivo'),
  body('numeroMemo')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('numeroMemo no debe superar los 50 caracteres'),
  body('fechaVerificacion')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('fechaVerificacion debe ser una fecha válida (YYYY-MM-DD)'),
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
  body('areaRelacionada')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 150 })
    .withMessage('areaRelacionada no debe superar los 150 caracteres'),
  body('evaluacionCualitativa').optional({ nullable: true }).isString(),
  body('resultado')
    .optional({ nullable: true })
    .isIn(RESULTADOS_INFORME_PASANTIA_VALUES)
    .withMessage(`resultado debe ser uno de: ${RESULTADOS_INFORME_PASANTIA_VALUES.join(', ')}`),
  body('contenido').optional({ nullable: true }).isString(),
];

export const updateInformePasantiaValidator = [
  body('tipo')
    .optional()
    .isIn(TIPOS_INFORME_PASANTIA_VALUES)
    .withMessage(`tipo debe ser uno de: ${TIPOS_INFORME_PASANTIA_VALUES.join(', ')}`),
  body('docenteId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('docenteId debe ser un entero positivo'),
  body('numeroMemo')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('numeroMemo no debe superar los 50 caracteres'),
  body('fechaVerificacion')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('fechaVerificacion debe ser una fecha válida (YYYY-MM-DD)'),
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
  body('areaRelacionada')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 150 })
    .withMessage('areaRelacionada no debe superar los 150 caracteres'),
  body('evaluacionCualitativa').optional({ nullable: true }).isString(),
  body('resultado')
    .optional({ nullable: true })
    .isIn(RESULTADOS_INFORME_PASANTIA_VALUES)
    .withMessage(`resultado debe ser uno de: ${RESULTADOS_INFORME_PASANTIA_VALUES.join(', ')}`),
  body('contenido').optional({ nullable: true }).isString(),
];

export const createSeguimientoPasantiaValidator = [
  body('fecha')
    .notEmpty()
    .withMessage('fecha es requerida')
    .isISO8601()
    .withMessage('fecha debe ser una fecha válida (YYYY-MM-DD)'),
  body('descripcionTrabajo').optional({ nullable: true }).isString(),
  body('principalesActividades').optional({ nullable: true }).isString(),
  body('nivelDesempeno')
    .optional({ nullable: true })
    .isIn(NIVELES_DESEMPENO_PASANTIA_VALUES)
    .withMessage(`nivelDesempeno debe ser uno de: ${NIVELES_DESEMPENO_PASANTIA_VALUES.join(', ')}`),
  body('fortalezas').optional({ nullable: true }).isString(),
  body('areasMejorar').optional({ nullable: true }).isString(),
  body('sugerencias').optional({ nullable: true }).isString(),
  body('firmadoDocente').optional({ nullable: true }).isBoolean().withMessage('firmadoDocente debe ser boolean'),
  body('firmadoEmpresa').optional({ nullable: true }).isBoolean().withMessage('firmadoEmpresa debe ser boolean'),
];

export const updateSeguimientoPasantiaValidator = [
  body('fecha')
    .optional()
    .isISO8601()
    .withMessage('fecha debe ser una fecha válida (YYYY-MM-DD)'),
  body('descripcionTrabajo').optional({ nullable: true }).isString(),
  body('principalesActividades').optional({ nullable: true }).isString(),
  body('nivelDesempeno')
    .optional({ nullable: true })
    .isIn(NIVELES_DESEMPENO_PASANTIA_VALUES)
    .withMessage(`nivelDesempeno debe ser uno de: ${NIVELES_DESEMPENO_PASANTIA_VALUES.join(', ')}`),
  body('fortalezas').optional({ nullable: true }).isString(),
  body('areasMejorar').optional({ nullable: true }).isString(),
  body('sugerencias').optional({ nullable: true }).isString(),
  body('firmadoDocente').optional({ nullable: true }).isBoolean().withMessage('firmadoDocente debe ser boolean'),
  body('firmadoEmpresa').optional({ nullable: true }).isBoolean().withMessage('firmadoEmpresa debe ser boolean'),
];
