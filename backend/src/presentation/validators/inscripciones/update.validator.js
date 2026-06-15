/**
 * Validador para actualización de inscripciones (PUT /api/v1/inscripciones/:id)
 *
 * Todos los campos del body son opcionales (actualización parcial).
 * Misma lógica que create para materias/paralelos: si se envían, debe cumplir una de:
 * - parallel_id: reemplaza materias por las del paralelo (tipo NUEVO).
 * - teacher_assignment_ids: reemplaza materias por las asignaciones indicadas (ANTIGUO).
 * - parallel_ids_by_period + materia_ids_by_period: selección por periodo (ANTIGUO), al menos una materia.
 *
 * Campos validados (sincronizados con create.validator y frontend):
 * - parallel_id: opcional, entero > 0
 * - teacher_assignment_ids: opcional, array de enteros > 0
 * - parallel_ids_by_period: opcional, objeto { periodId: parallelId }
 * - materia_ids_by_period: opcional, objeto { periodId: [materiaIds] }
 * - observations: opcional, máx 1000 caracteres
 * - enrollment_date: opcional, formato YYYY-MM-DD
 */
import expressValidator from 'express-validator';
const { body } = expressValidator;

export const updateEnrollmentValidator = [
  // ============================================
  // CAMPOS CONDICIONALES (materias/paralelo; misma lógica que create)
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
      if (!Array.isArray(value)) return true;
      if (value.length === 0) return true; // En update permitimos array vacío (no actualizar materias)
      return value.every((id) => Number.isInteger(Number(id)) && Number(id) >= 1);
    })
    .withMessage('Cada elemento de teacher_assignment_ids debe ser un entero mayor a 0')
    .customSanitizer((value) => (Array.isArray(value) ? value.map((id) => Number(id)) : value)),

  body('parallel_ids_by_period')
    .optional({ nullable: true })
    .isObject()
    .withMessage('parallel_ids_by_period debe ser un objeto { periodId: parallelId }'),

  body('materia_ids_by_period')
    .optional({ nullable: true })
    .isObject()
    .withMessage('materia_ids_by_period debe ser un objeto { periodId: [materiaIds] }'),

  // Validación condicional: si envía algo de materias/paralelo, debe ser una combinación válida (como en create)
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

      const sentAny =
        (parallelId != null && parallelId !== '') ||
        Array.isArray(teacherAssignmentIds) ||
        (parallelIdsByPeriod != null && typeof parallelIdsByPeriod === 'object') ||
        (materiaIdsByPeriod != null && typeof materiaIdsByPeriod === 'object');

      if (!sentAny) return true;
      if (hasParallel || hasMaterias || hasSelectionByPeriod) return true;

      throw new Error(
        'Debe enviar parallel_id, teacher_assignment_ids, o parallel_ids_by_period con materia_ids_by_period (al menos una materia)'
      );
    }),

  body('prior_history')
    .optional({ nullable: true })
    .isArray()
    .withMessage('prior_history debe ser un arreglo')
    .custom((value) => {
      if (value == null) return true;
      if (!Array.isArray(value)) return false;
      if (value.length === 0) return true;
      return value.every((row) => {
        if (!row || typeof row !== 'object') return false;
        const materiaId = row.materia_id ?? row.materiaId;
        const periodId = row.period_id ?? row.periodId;
        const status = String(row.status ?? row.estado ?? 'APROBADO').toUpperCase();
        const grade = row.final_grade ?? row.finalGrade ?? row.nota_final;
        if (!['APROBADO', 'CONVALIDADO'].includes(status)) return false;
        if (
          !Number.isInteger(Number(materiaId)) ||
          Number(materiaId) < 1 ||
          !Number.isInteger(Number(periodId)) ||
          Number(periodId) < 1
        ) {
          return false;
        }
        if (status === 'CONVALIDADO') return true;
        const gradeNum = Number(grade);
        return !Number.isNaN(gradeNum) && gradeNum >= 0 && gradeNum <= 100;
      });
    })
    .withMessage(
      'Cada elemento de prior_history debe incluir materia_id, period_id, final_grade (0-100) y status opcional (APROBADO|CONVALIDADO)'
    ),

  // ============================================
  // CAMPOS OPCIONALES
  // ============================================
  body('observations')
    .optional({ nullable: true, checkFalsy: true })
    .customSanitizer((value) => {
      if (value === '' || value === null || value === undefined) return null;
      if (typeof value === 'string') return value.trim() || null;
      return value;
    })
    .custom((value) => {
      if (value === null || value === undefined) return true;
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
