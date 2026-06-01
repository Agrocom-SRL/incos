import { body } from 'express-validator';

/**
 * PUT /paralelos/:id/schedule — body con schedules[] (cursoId = oferta_curso_id).
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
