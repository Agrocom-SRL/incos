import { body } from 'express-validator';

export const assignTeacherToCourseValidator = [
  body('cursoId')
    .notEmpty()
    .withMessage('cursoId es requerido')
    .isInt({ min: 1 })
    .withMessage('cursoId debe ser un entero positivo'),
  body('docenteId')
    .notEmpty()
    .withMessage('docenteId es requerido')
    .isInt({ min: 1 })
    .withMessage('docenteId debe ser un entero positivo'),
  body('gestionPlanId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('gestionPlanId debe ser un entero positivo'),
  body('vigente').optional({ nullable: true }).isBoolean().withMessage('vigente debe ser booleano'),
];
