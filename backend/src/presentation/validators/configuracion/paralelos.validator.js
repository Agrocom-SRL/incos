import { body } from 'express-validator';

const TURNOS = ['MAÑANA', 'TARDE', 'NOCHE'];

export const createParaleloValidator = [
  body('carrera_id')
    .notEmpty()
    .withMessage('carrera_id es requerido')
    .isInt({ min: 1 })
    .withMessage('carrera_id debe ser un entero positivo'),
  body('periodo_id')
    .notEmpty()
    .withMessage('periodo_id es requerido')
    .isInt({ min: 1 })
    .withMessage('periodo_id debe ser un entero positivo'),
  body('nombre')
    .notEmpty()
    .withMessage('nombre es requerido')
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('nombre debe tener entre 1 y 50 caracteres'),
  body('turno')
    .notEmpty()
    .withMessage('turno es requerido')
    .isIn(TURNOS)
    .withMessage('turno debe ser MAÑANA, TARDE o NOCHE'),
  body('descripcion').optional().isString().trim(),
  body('activo').optional().isBoolean().withMessage('activo debe ser boolean'),
];

export const updateParaleloValidator = [
  body('carrera_id').optional().isInt({ min: 1 }),
  body('periodo_id').optional().isInt({ min: 1 }),
  body('nombre').optional().isString().trim().isLength({ min: 1, max: 50 }),
  body('turno').optional().isIn(TURNOS),
  body('descripcion').optional().isString().trim(),
  body('activo').optional().isBoolean(),
];
