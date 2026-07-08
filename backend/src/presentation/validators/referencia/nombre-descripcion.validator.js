import { body } from 'express-validator';

/**
 * Validators genéricos para catálogos de referencia con shape idéntico:
 * nombre (requerido en create, opcional en update) + descripcion (opcional) + activo (opcional).
 *
 * Reutilizado por Discapacidad y Tipos de Parentesco (Apoderados) en vez de
 * duplicar 2 archivos casi idénticos por entidad.
 *
 * @param {Object} params
 * @param {number} [params.nombreMax=100] - Longitud máxima de "nombre" según la columna real del modelo
 * @param {number} [params.descripcionMax=500] - Longitud máxima de "descripcion"
 * @returns {{ createValidator: Array, updateValidator: Array }}
 */
export function buildNombreDescripcionValidators({ nombreMax = 100, descripcionMax = 500 } = {}) {
  const createValidator = [
    body('nombre')
      .notEmpty()
      .withMessage('nombre es requerido')
      .isString()
      .trim()
      .isLength({ min: 2, max: nombreMax })
      .withMessage(`nombre debe tener entre 2 y ${nombreMax} caracteres`),
    body('descripcion')
      .optional({ nullable: true })
      .isString()
      .trim()
      .isLength({ max: descripcionMax })
      .withMessage(`descripcion no debe superar ${descripcionMax} caracteres`),
    body('activo').optional().isBoolean().withMessage('activo debe ser boolean'),
  ];

  const updateValidator = [
    body('nombre')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 2, max: nombreMax })
      .withMessage(`nombre debe tener entre 2 y ${nombreMax} caracteres`),
    body('descripcion')
      .optional({ nullable: true })
      .isString()
      .trim()
      .isLength({ max: descripcionMax })
      .withMessage(`descripcion no debe superar ${descripcionMax} caracteres`),
    body('activo').optional().isBoolean().withMessage('activo debe ser boolean'),
  ];

  return { createValidator, updateValidator };
}

// tipos_discapacidad.nombre STRING(100)
export const {
  createValidator: createDiscapacidadValidator,
  updateValidator: updateDiscapacidadValidator,
} = buildNombreDescripcionValidators({ nombreMax: 100 });

// tipos_parentesco.nombre STRING(50)
export const {
  createValidator: createTipoParentescoValidator,
  updateValidator: updateTipoParentescoValidator,
} = buildNombreDescripcionValidators({ nombreMax: 50 });
