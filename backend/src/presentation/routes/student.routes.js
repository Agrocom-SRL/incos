import express from 'express';
import { validationResult } from 'express-validator';
import { registerStudentValidator } from '../validators/student.validator.js';
import container from '../../shared/container/index.js';

const router = express.Router();

/**
 * Middleware de validación de resultados
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Los datos proporcionados son inválidos',
        details: errors.array().map((err) => ({
          field: err.param || err.path,
          message: err.msg,
        })),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  }
  next();
};

// Obtener el controller desde el contenedor de DI
const studentController = container.resolve('estudiantes.studentController');

/**
 * POST /api/v1/estudiantes
 * Registrar nuevo estudiante
 * Permisos: estudiantes.crear
 */
router.post(
  '/',
  // authMiddleware, // TODO: Implementar middleware de autenticación
  registerStudentValidator,
  validateRequest,
  (req, res, next) => studentController.register(req, res, next)
);

export default router;
