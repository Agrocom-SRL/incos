/**
 * Validador para creación de inscripciones (POST /api/v1/inscripciones)
 *
 * Modos:
 * - Con parallel_id: inscribe en todas las materias del paralelo (estudiantes nuevos).
 * - Con teacher_assignment_ids: inscribe solo en las materias indicadas (estudiantes antiguos).
 *
 * Valida la estructura de datos que viene del frontend:
 * - student_id: ID del estudiante (requerido)
 * - parallel_id: ID del paralelo (requerido si no se envía teacher_assignment_ids)
 * - teacher_assignment_ids: array de IDs de asignaciones docentes (opcional; si se envía, parallel_id es opcional)
 * - enrollment_type, enrollment_date, observations: opcionales
 */
import expressValidator from 'express-validator';
const { body } = expressValidator;

export const createEnrollmentValidator = [
  body('student_id')
    .notEmpty()
    .withMessage('El ID del estudiante es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del estudiante debe ser un número entero mayor a 0')
    .toInt(),

  body('parallel_id')
    .optional({ nullable: true, values: 'null' })
    .isInt({ min: 1 })
    .withMessage('El ID del paralelo debe ser un número entero mayor a 0')
    .toInt(),

  body('teacher_assignment_ids')
    .optional({ nullable: true })
    .isArray()
    .withMessage('teacher_assignment_ids debe ser un arreglo')
    .custom((value) => {
      if (value == null) return true;
      if (!Array.isArray(value)) return false;
      return value.every((id) => Number.isInteger(Number(id)) && Number(id) >= 1);
    })
    .withMessage('Cada elemento de teacher_assignment_ids debe ser un entero mayor a 0'),

  body('parallel_id')
    .custom((parallelId, { req }) => {
      const teacherAssignmentIds = req.body?.teacher_assignment_ids ?? req.body?.teacherAssignmentIds;
      const hasParallel = parallelId != null && parallelId !== '' && Number(parallelId) >= 1;
      const hasMaterias =
        Array.isArray(teacherAssignmentIds) && teacherAssignmentIds.length > 0;
      if (hasParallel || hasMaterias) return true;
      throw new Error(
        'Debe enviar parallel_id o teacher_assignment_ids (al menos una materia)'
      );
    }),

  // ============================================
  // CAMPOS OPCIONALES
  // ============================================
  body('enrollment_type')
    .optional()
    .isIn(['NUEVO', 'REINGRESO', 'CONTINUIDAD', 'TRASPASO_ENTRADA', 'TRANSITABILIDAD_ENTRADA'])
    .withMessage('El tipo de inscripción debe ser uno de: NUEVO, REINGRESO, CONTINUIDAD, TRASPASO_ENTRADA, TRANSITABILIDAD_ENTRADA'),

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
