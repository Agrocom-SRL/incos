import { body } from 'express-validator';

/**
 * Validators de escritura del catálogo Tipos de Evaluación (administración CFG).
 *
 * Shape: codigo (VARCHAR 40), nombre (VARCHAR 100), descripcion (TEXT opcional),
 * esRecuperatorio (BOOLEAN). El listado reutiliza `listTiposEvaluacionValidator`
 * (presentation/validators/academico/list-tipos-evaluacion.validator.js), ya
 * usado por el endpoint de lectura del cuaderno de calificaciones.
 *
 * NOTA: el "componente" (teórico/práctico) NO vive en este catálogo, vive en
 * la tabla `evaluaciones` — no agregar ese campo aquí.
 */
export const createTipoEvaluacionValidator = [
  body('codigo')
    .notEmpty()
    .withMessage('codigo es requerido')
    .isString()
    .trim()
    .isLength({ min: 1, max: 40 })
    .withMessage('codigo debe tener entre 1 y 40 caracteres'),
  body('nombre')
    .notEmpty()
    .withMessage('nombre es requerido')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('nombre debe tener entre 2 y 100 caracteres'),
  body('descripcion')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('descripcion no debe superar los 2000 caracteres'),
  body('esRecuperatorio').optional().isBoolean().withMessage('esRecuperatorio debe ser boolean'),
  body('activo').optional().isBoolean().withMessage('activo debe ser boolean'),
];

export const updateTipoEvaluacionValidator = [
  body('codigo')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 40 })
    .withMessage('codigo debe tener entre 1 y 40 caracteres'),
  body('nombre')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('nombre debe tener entre 2 y 100 caracteres'),
  body('descripcion')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('descripcion no debe superar los 2000 caracteres'),
  body('esRecuperatorio').optional().isBoolean().withMessage('esRecuperatorio debe ser boolean'),
  body('activo').optional().isBoolean().withMessage('activo debe ser boolean'),
];
