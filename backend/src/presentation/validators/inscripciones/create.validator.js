import { body } from 'express-validator';

/**
 * Validador para creación de inscripciones (POST /api/v1/inscripciones)
 * 
 * Valida la estructura de datos que viene del frontend:
 * - studentId: ID del estudiante (requerido)
 * - parallelId: ID del paralelo (requerido)
 * - enrollmentType: Tipo de inscripción (opcional, default: CONTINUIDAD)
 * - enrollmentDate: Fecha de inscripción (opcional)
 * - observations: Observaciones (opcional)
 * 
 * NOTA: Este validator valida la estructura del frontend.
 * El Use Case recuperará todos los datos necesarios (datos académicos, gestión, plan, asignaciones docentes)
 * basándose en estos IDs y creará los registros en las tablas correspondientes.
 * 
 * Ubicación: presentation/validators/inscripciones (validators específicos del módulo)
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo valida estructura y tipos de datos del request
 * - La lógica de negocio (validaciones complejas) está en el use case
 * 
 * @example
 * import { createEnrollmentValidator } from '../validators/inscripciones/index.js';
 * router.post('/', createEnrollmentValidator, validateRequest, controller);
 */
export const createEnrollmentValidator = [
  // ============================================
  // CAMPOS REQUERIDOS
  // ============================================
  body('student_id')
    .notEmpty()
    .withMessage('El ID del estudiante es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del estudiante debe ser un número entero mayor a 0')
    .toInt(),

  body('parallel_id')
    .notEmpty()
    .withMessage('El ID del paralelo es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del paralelo debe ser un número entero mayor a 0')
    .toInt(),

  // ============================================
  // CAMPOS OPCIONALES
  // ============================================
  body('enrollment_type')
    .optional()
    .isIn(['NUEVO', 'REINGRESO', 'CONTINUIDAD', 'TRANSFERENCIA_ENTRADA', 'TRASPASO_ENTRADA'])
    .withMessage('El tipo de inscripción debe ser uno de: NUEVO, REINGRESO, CONTINUIDAD, TRANSFERENCIA_ENTRADA, TRASPASO_ENTRADA'),

  body('observations')
    .optional({ nullable: true, checkFalsy: true })
    .customSanitizer((value) => {
      // Convertir cadenas vacías a null para consistencia
      if (value === '' || value === null || value === undefined) {
        return null;
      }
      // Si es una cadena, hacer trim
      if (typeof value === 'string') {
        return value.trim();
      }
      return value;
    })
    .custom((value) => {
      // Si es null o undefined, está permitido (campo opcional)
      if (value === null || value === undefined) {
        return true;
      }
      // Si no es null, debe ser una cadena
      if (typeof value !== 'string') {
        throw new Error('Las observaciones deben ser una cadena de texto');
      }
      // Validar longitud máxima (después del trim)
      if (value.length > 1000) {
        throw new Error('Las observaciones no pueden exceder 1000 caracteres');
      }
      return true;
    }),
];
