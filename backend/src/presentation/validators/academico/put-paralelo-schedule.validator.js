import { body } from 'express-validator';

/**
 * Valida payload para persistir el plan semanal de un paralelo.
 *
 * Acepta cualquiera de estos nombres como array principal:
 * - schedules
 * - schedule
 * - courseSchedules
 *
 * Cada item debe contener:
 * - cursoId (int > 0)
 * - bloques (array) opcional
 */
export const putParaleloScheduleValidator = [
  body().custom((value) => {
    const v = value || {};
    const arr = v.schedules ?? v.schedule ?? v.courseSchedules;
    if (!Array.isArray(arr)) {
      throw new Error('El body debe incluir `schedules` (o `schedule` / `courseSchedules`) como array');
    }
    return true;
  }),
  body(['schedules', 'schedule', 'courseSchedules']).optional().isArray(),
  body(['schedules.*.cursoId', 'schedule.*.cursoId', 'courseSchedules.*.cursoId'])
    .optional()
    .isInt({ min: 1 })
    .withMessage('cursoId debe ser entero > 0')
    .toInt(),
  body(['schedules.*.bloques', 'schedule.*.bloques', 'courseSchedules.*.bloques']).optional().isArray(),
];

