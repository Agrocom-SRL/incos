import { body, query } from 'express-validator';
import { listValidator } from '../common/list.validator.js';

/**
 * Validators de Participantes de capacitación (módulo CAP)
 *
 * Shape (patrón estudiantes): ci (VARCHAR 20) + expedicion (VARCHAR 5 opc,
 * unicidad CI+expedición en lógica de negocio), nombres (VARCHAR 150),
 * apellidos (VARCHAR 100 opc), celular (VARCHAR 20), email (VARCHAR 150 opc).
 */
export const listParticipantesValidator = [
  ...listValidator,
  query('ci')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 20 })
    .withMessage('ci no debe superar los 20 caracteres'),
  query('incluirInactivos')
    .optional()
    .isIn(['true', 'false', '0', '1'])
    .withMessage('incluirInactivos debe ser true o false'),
];

/**
 * Reglas de los campos de un participante (compartidas entre el POST propio y
 * el objeto anidado `participante` del POST de inscripciones).
 *
 * @param {string} prefix - '' para body plano, 'participante.' para anidado
 * @param {boolean} required - Si los campos obligatorios se exigen
 * @returns {Array} Cadena de validators de express-validator
 */
export function buildParticipanteFieldValidators(prefix = '', required = true) {
  const req = (chain, message) => (required ? chain.notEmpty().withMessage(message) : chain.optional());

  return [
    req(body(`${prefix}ci`), `${prefix}ci es requerido`)
      .isString()
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage(`${prefix}ci debe tener entre 4 y 20 caracteres`),
    body(`${prefix}expedicion`)
      .optional({ nullable: true })
      .isString()
      .trim()
      .isLength({ max: 5 })
      .withMessage(`${prefix}expedicion no debe superar los 5 caracteres`),
    req(body(`${prefix}nombres`), `${prefix}nombres es requerido`)
      .isString()
      .trim()
      .isLength({ min: 2, max: 150 })
      .withMessage(`${prefix}nombres debe tener entre 2 y 150 caracteres`),
    body(`${prefix}apellidoPaterno`)
      .optional({ nullable: true })
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage(`${prefix}apellidoPaterno no debe superar los 100 caracteres`),
    body(`${prefix}apellidoMaterno`)
      .optional({ nullable: true })
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage(`${prefix}apellidoMaterno no debe superar los 100 caracteres`),
    req(body(`${prefix}celular`), `${prefix}celular es requerido`)
      .isString()
      .trim()
      .isLength({ min: 7, max: 20 })
      .withMessage(`${prefix}celular debe tener entre 7 y 20 caracteres`),
    body(`${prefix}email`)
      .optional({ nullable: true })
      .isEmail()
      .withMessage(`${prefix}email debe ser un correo válido`)
      .isLength({ max: 150 })
      .withMessage(`${prefix}email no debe superar los 150 caracteres`),
  ];
}

export const createParticipanteValidator = [
  ...buildParticipanteFieldValidators('', true),
  body('activo').optional().isBoolean().withMessage('activo debe ser boolean'),
];

export const updateParticipanteValidator = [
  ...buildParticipanteFieldValidators('', false),
  body('activo').optional().isBoolean().withMessage('activo debe ser boolean'),
];
