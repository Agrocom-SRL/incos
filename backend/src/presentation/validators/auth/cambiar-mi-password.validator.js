import { body, validationResult } from 'express-validator';
import { UnprocessableEntityError } from '../../../domain/errors/AppError.js';

export const cambiarMiPasswordValidator = [
  body('password_actual')
    .notEmpty()
    .withMessage('password_actual es requerido')
    .isString()
    .withMessage('password_actual debe ser texto'),
  body('password_nuevo')
    .notEmpty()
    .withMessage('password_nuevo es requerido')
    .isLength({ min: 8, max: 100 })
    .withMessage('password_nuevo debe tener entre 8 y 100 caracteres'),
];

export function validateCambiarMiPasswordRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((err) => ({
      field: err.path || err.param || err.location,
      message: err.msg,
      value: err.value,
    }));
    return next(
      new UnprocessableEntityError('Los datos proporcionados son inválidos', details)
    );
  }
  next();
}
