import { body, param } from 'express-validator';

/**
 * PUT /api/v1/inscripciones/:id/historial-previo
 */
export const updateEnrollmentPriorHistoryValidator = [
  param('id').isInt({ min: 1 }).withMessage('El ID de la inscripción debe ser un entero positivo'),

  body('prior_history')
    .exists({ checkNull: true })
    .withMessage('prior_history es requerido')
    .isArray({ min: 1 })
    .withMessage('prior_history debe ser un arreglo con al menos un elemento')
    .custom((value) => {
      if (!Array.isArray(value)) return false;
      return value.every((row) => {
        if (!row || typeof row !== 'object') return false;
        const materiaId = row.materia_id ?? row.materiaId;
        const periodId = row.period_id ?? row.periodId;
        const status = String(row.status ?? row.estado ?? 'APROBADO').toUpperCase();
        const grade = row.final_grade ?? row.finalGrade ?? row.nota_final;
        const statusOk = ['APROBADO', 'CONVALIDADO'].includes(status);
        if (!statusOk) return false;
        if (status === 'CONVALIDADO') {
          return (
            Number.isInteger(Number(materiaId)) &&
            Number(materiaId) >= 1 &&
            Number.isInteger(Number(periodId)) &&
            Number(periodId) >= 1
          );
        }
        const gradeNum = Number(grade);
        return (
          Number.isInteger(Number(materiaId)) &&
          Number(materiaId) >= 1 &&
          Number.isInteger(Number(periodId)) &&
          Number(periodId) >= 1 &&
          !Number.isNaN(gradeNum) &&
          gradeNum >= 0 &&
          gradeNum <= 100
        );
      });
    })
    .withMessage(
      'Cada elemento de prior_history requiere materia_id, period_id y status (APROBADO|CONVALIDADO). APROBADO exige final_grade (0-100).'
    ),
];
