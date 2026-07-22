import { body, query } from 'express-validator';
import { listValidator } from '../common/list.validator.js';
import { ESTADOS_INSCRIPCION_CAPACITACION_VALUES } from '../../../domain/constants/capacitacion.constants.js';
import { buildParticipanteFieldValidators } from './participantes.validator.js';

/**
 * Validators de Inscripciones de capacitación (módulo CAP)
 *
 * POST /inscripciones-capacitacion admite participante EXISTENTE
 * (participanteId) o NUEVO (objeto participante con datos mínimos) — la
 * exclusión mutua se valida en el use case. Pago inicial opcional
 * (pagoInicial: { monto, metodoPagoId, cuentaPagoId?, fechaPago?, observaciones? }).
 */
export const listInscripcionesCapacitacionValidator = [
  ...listValidator,
  query('capacitacionId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('capacitacionId debe ser un entero positivo'),
  query('participanteId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('participanteId debe ser un entero positivo'),
  query('estado')
    .optional()
    .isIn(ESTADOS_INSCRIPCION_CAPACITACION_VALUES)
    .withMessage(`estado debe ser uno de: ${ESTADOS_INSCRIPCION_CAPACITACION_VALUES.join(', ')}`),
  query('incluirInactivos')
    .optional()
    .isIn(['true', 'false', '0', '1'])
    .withMessage('incluirInactivos debe ser true o false'),
];

/**
 * Reglas de los campos de un pago (compartidas entre el POST /:id/pagos y el
 * objeto anidado `pagoInicial` del POST de inscripciones).
 *
 * @param {string} prefix - '' para body plano, 'pagoInicial.' para anidado
 * @param {boolean} required - Si monto/metodoPagoId se exigen
 * @returns {Array} Cadena de validators de express-validator
 */
function buildPagoFieldValidators(prefix = '', required = true) {
  const montoChain = required
    ? body(`${prefix}monto`).notEmpty().withMessage(`${prefix}monto es requerido`)
    : body(`${prefix}monto`).optional();
  const metodoChain = required
    ? body(`${prefix}metodoPagoId`).notEmpty().withMessage(`${prefix}metodoPagoId es requerido`)
    : body(`${prefix}metodoPagoId`).optional();

  return [
    montoChain.isFloat({ gt: 0 }).withMessage(`${prefix}monto debe ser un número mayor a 0`),
    metodoChain.isInt({ min: 1 }).withMessage(`${prefix}metodoPagoId debe ser un entero positivo`),
    body(`${prefix}cuentaPagoId`)
      .optional({ nullable: true })
      .isInt({ min: 1 })
      .withMessage(`${prefix}cuentaPagoId debe ser un entero positivo`),
    body(`${prefix}fechaPago`)
      .optional()
      .isISO8601()
      .withMessage(`${prefix}fechaPago debe ser una fecha válida (YYYY-MM-DD)`),
    body(`${prefix}observaciones`)
      .optional({ nullable: true })
      .isString()
      .trim()
      .isLength({ max: 2000 })
      .withMessage(`${prefix}observaciones no debe superar los 2000 caracteres`),
  ];
}

export const createInscripcionCapacitacionValidator = [
  body('capacitacionId')
    .notEmpty()
    .withMessage('capacitacionId es requerido')
    .isInt({ min: 1 })
    .withMessage('capacitacionId debe ser un entero positivo'),
  body('participanteId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('participanteId debe ser un entero positivo'),
  body('participante')
    .optional({ nullable: true })
    .isObject()
    .withMessage('participante debe ser un objeto con los datos del nuevo participante'),
  // Campos del participante nuevo (solo si viene el objeto; requeridos anidados
  // se validan en el use case porque son condicionales al objeto)
  ...buildParticipanteFieldValidators('participante.', false),
  body('fechaInscripcion')
    .optional()
    .isISO8601()
    .withMessage('fechaInscripcion debe ser una fecha válida (YYYY-MM-DD)'),
  body('pagoInicial')
    .optional({ nullable: true })
    .isObject()
    .withMessage('pagoInicial debe ser un objeto { monto, metodoPagoId, ... }'),
  ...buildPagoFieldValidators('pagoInicial.', false),
  // El validator no conoce el costo del curso (no sabe si es obligatorio ni si
  // el pago queda parcial): esa validación de negocio vive en el use case.
  // Aquí solo se valida la FORMA de la fecha si viene presente.
  body('pagoInicial.fechaCompromiso')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('pagoInicial.fechaCompromiso debe ser una fecha válida (YYYY-MM-DD)'),
];

export const registerPagoCapacitacionValidator = [...buildPagoFieldValidators('', true)];

/**
 * POST /:id/anular — decisión administrativa manual (permiso
 * capacitacion.inscripcion ACCIÓN ANULAR). `observacion` es opcional: el
 * schema de `capacitacion_inscritos` no tiene columna propia para guardarla,
 * queda solo en el log de auditoría del use case.
 */
export const anularInscripcionCapacitacionValidator = [
  body('observacion')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('observacion no debe superar los 500 caracteres'),
];
