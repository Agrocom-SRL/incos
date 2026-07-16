/**
 * Validador para creación de inscripciones (POST /api/v1/inscripciones)
 *
 * Modos de inscripción:
 * - Con parallel_id: inscribe en todas las materias del paralelo (estudiantes nuevos).
 * - Con teacher_assignment_ids: inscribe solo en las asignaciones docentes indicadas
 *   (permite múltiples paralelos/periodos en una sola inscripción).
 *
 * Nota: La inscripción NO incluye horarios ni aulas; esos datos se asignan en el proceso de
 * matriculación posterior, antes del inicio de clases.
 *
 * Campos validados (sincronizados con el frontend):
 * - student_id: ID del estudiante (requerido)
 * - parallel_id: ID del paralelo (opcional si se envía teacher_assignment_ids o selección por periodo)
 * - teacher_assignment_ids: array de IDs de asignaciones docentes (opcional)
 * - parallel_ids_by_period: objeto { periodId: parallelId } para inscripción por materias (ANTIGUO)
 * - materia_ids_by_period: objeto { periodId: [materiaIds] } para inscripción por materias (ANTIGUO)
 * - enrollment_type: Tipo de inscripción (opcional)
 * - observations: Observaciones (opcional, máximo 1000 caracteres)
 *
 * NOTA: enrollment_date NO se valida aquí porque el backend lo genera automáticamente
 * en CreateEnrollmentUseCase usando la fecha actual.
 */
import expressValidator from 'express-validator';
const { body } = expressValidator;

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

  // ============================================
  // CAMPOS CONDICIONALES (al menos uno requerido)
  // ============================================
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
      if (value.length === 0) return false; // Si se envía, debe tener al menos un elemento
      return value.every((id) => Number.isInteger(Number(id)) && Number(id) >= 1);
    })
    .withMessage('teacher_assignment_ids debe ser un arreglo con al menos un ID válido (entero mayor a 0)'),

  body('parallel_ids_by_period')
    .optional({ nullable: true })
    .isObject()
    .withMessage('parallel_ids_by_period debe ser un objeto { periodId: parallelId }'),

  body('materia_ids_by_period')
    .optional({ nullable: true })
    .isObject()
    .withMessage('materia_ids_by_period debe ser un objeto { periodId: [materiaIds] }'),

  // Validación condicional: debe enviar parallel_id O teacher_assignment_ids O (parallel_ids_by_period + materia_ids_by_period)
  body()
    .custom((_, { req }) => {
      const parallelId = req.body?.parallel_id;
      const teacherAssignmentIds = req.body?.teacher_assignment_ids ?? req.body?.teacherAssignmentIds;
      const parallelIdsByPeriod = req.body?.parallel_ids_by_period ?? req.body?.parallelIdsByPeriod;
      const materiaIdsByPeriod = req.body?.materia_ids_by_period ?? req.body?.materiaIdsByPeriod;

      const hasParallel = parallelId != null && parallelId !== '' && Number(parallelId) >= 1;
      const hasMaterias = Array.isArray(teacherAssignmentIds) && teacherAssignmentIds.length > 0;
      const hasSelectionByPeriod =
        parallelIdsByPeriod &&
        typeof parallelIdsByPeriod === 'object' &&
        materiaIdsByPeriod &&
        typeof materiaIdsByPeriod === 'object' &&
        Object.keys(materiaIdsByPeriod).length > 0 &&
        Object.values(materiaIdsByPeriod).some((arr) => Array.isArray(arr) && arr.length > 0);

      if (hasParallel || hasMaterias || hasSelectionByPeriod) return true;

      throw new Error(
        'Debe enviar parallel_id, teacher_assignment_ids, o parallel_ids_by_period con materia_ids_by_period (al menos una materia)'
      );
    }),

  // ============================================
  // CAMPOS OPCIONALES
  // ============================================
  body('enrollment_type')
    .optional()
    .isIn(['NUEVO', 'ANTIGUO', 'TRASPASO', 'TRANSITABILIDAD'])
    .withMessage('El tipo de inscripción debe ser uno de: NUEVO, ANTIGUO, TRASPASO, TRANSITABILIDAD'),

  // NOTA: enrollment_date NO se valida aquí porque el backend lo genera automáticamente
  // en CreateEnrollmentUseCase._createEnrollment() usando la fecha actual

  body('prior_history')
    .optional({ nullable: true })
    .isArray()
    .withMessage('prior_history debe ser un arreglo')
    .custom((value) => {
      if (value == null) return true;
      if (!Array.isArray(value) || value.length === 0) return true;
      return value.every((row) => {
        if (!row || typeof row !== 'object') return false;
        const materiaId = row.materia_id ?? row.materiaId;
        const periodId = row.period_id ?? row.periodId;
        const grade = row.final_grade ?? row.finalGrade ?? row.nota_final;
        const status = String(row.status ?? row.estado ?? 'APROBADO').toUpperCase();
        const statusOk = ['APROBADO', 'CONVALIDADO'].includes(status);
        if (!statusOk) return false;

        const idsOk =
          Number.isInteger(Number(materiaId)) &&
          Number(materiaId) >= 1 &&
          Number.isInteger(Number(periodId)) &&
          Number(periodId) >= 1;

        // CONVALIDADO no requiere nota (final_grade puede ser null).
        if (status === 'CONVALIDADO') return idsOk;

        // APROBADO exige final_grade en rango 0-100.
        const gradeNum = Number(grade);
        return idsOk && !Number.isNaN(gradeNum) && gradeNum >= 0 && gradeNum <= 100;
      });
    })
    .withMessage(
      'Revise el historial de materias previas: cada materia debe indicar su periodo y estado (Aprobado o Convalidado). Las materias aprobadas requieren una nota entre 0 y 100.'
    ),

  body('observations')
    .optional({ nullable: true, checkFalsy: true })
    .customSanitizer((value) => {
      // Convertir cadenas vacías a null para consistencia
      if (value === '' || value === null || value === undefined) {
        return null;
      }
      // Si es una cadena, hacer trim
      if (typeof value === 'string') {
        return value.trim() || null; // Si después del trim queda vacío, convertir a null
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
