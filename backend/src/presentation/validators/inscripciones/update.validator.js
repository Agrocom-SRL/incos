/**
 * Validador para actualización de inscripciones (PUT /api/v1/inscripciones/:id)
 *
 * Todos los campos del body son opcionales (actualización parcial).
 * - observations: opcional, máx 1000 caracteres
 * - enrollment_date: opcional, fecha YYYY-MM-DD
 * - parallel_id: opcional, número (para tipo NUEVO, reemplaza materias por las del paralelo)
 * - teacher_assignment_ids: opcional, array de números (para ANTIGUO, reemplaza materias)
 */
import expressValidator from 'express-validator';
const { body } = expressValidator;

export const updateEnrollmentValidator = [
  body('parallel_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 }).withMessage('parallel_id debe ser un entero positivo')
    .toInt(),

  body('teacher_assignment_ids')
    .optional({ nullable: true, checkFalsy: true })
    .isArray().withMessage('teacher_assignment_ids debe ser un array')
    .custom((value) => {
      if (!value || value.length === 0) return true;
      const valid = value.every((id) => Number.isInteger(Number(id)) && Number(id) >= 1);
      if (!valid) throw new Error('Cada elemento de teacher_assignment_ids debe ser un entero positivo');
      return true;
    })
    .customSanitizer((value) => (Array.isArray(value) ? value.map((id) => Number(id)) : value)),

  body('observations')
    .optional({ nullable: true, checkFalsy: true })
    .customSanitizer((value) => {
      if (value === '' || value === null || value === undefined) return null;
      if (typeof value === 'string') return value.trim() || null;
      return value;
    })
    .custom((value) => {
      if (value == null) return true;
      if (typeof value !== 'string') throw new Error('Las observaciones deben ser una cadena de texto');
      if (value.length > 1000) throw new Error('Las observaciones no pueden exceder 1000 caracteres');
      return true;
    }),

  body('enrollment_date')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value == null || value === '') return true;
      const str = String(value).trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) throw new Error('La fecha de inscripción debe tener formato YYYY-MM-DD');
      const d = new Date(str);
      if (Number.isNaN(d.getTime())) throw new Error('La fecha de inscripción no es válida');
      return true;
    }),
];
