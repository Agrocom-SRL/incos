import { body } from 'express-validator';

/**
 * Body para POST /docentes/asignaciones
 */
export const createTeacherAssignmentValidator = [
  body('gestionPlanId')
    .notEmpty()
    .withMessage('gestionPlanId es requerido')
    .isInt({ min: 1 })
    .withMessage('gestionPlanId debe ser un entero positivo'),

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

  body('cargaHoraria')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 200 })
    .withMessage('cargaHoraria debe ser un entero entre 0 y 200'),

  body('fechaAsignacion')
    .optional({ nullable: true })
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('fechaAsignacion debe tener formato YYYY-MM-DD'),

  body('vigente').optional({ nullable: true }).isBoolean().withMessage('vigente debe ser booleano'),
];
