import { body } from 'express-validator';

/** null o ausente desasigna; número positivo asigna (también acepta string numérico desde JSON). */
export const patchAulaHorarioValidator = [
  body('aulaId').custom((value) => {
    if (value === undefined || value === null) return true;
    const n = Number(value);
    return Number.isFinite(n) && n > 0;
  }).withMessage('aulaId debe ser un entero positivo, null u omitirse para quitar la aula'),
];

