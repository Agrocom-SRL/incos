import { body, validationResult } from 'express-validator';
import { UnprocessableEntityError } from '../../../domain/errors/AppError.js';

export const loginValidator = [
  body('username')
    .isString()
    .withMessage('username debe ser texto')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('username es requerido')
    .isLength({ max: 50 })
    .withMessage('username debe tener como máximo 50 caracteres'),
  body('password')
    .notEmpty()
    .withMessage('password es requerido')
    .isString()
    .withMessage('password debe ser texto')
    .isLength({ min: 8, max: 100 })
    .withMessage('password debe tener entre 8 y 100 caracteres'),
];

export function validateLoginRequest(req, res, next) {
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
