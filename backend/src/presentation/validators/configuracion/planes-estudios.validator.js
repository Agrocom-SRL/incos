import { body } from 'express-validator';

export const createPlanEstudiosValidator = [
  body('carrera_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('carrera_id debe ser entero > 0')
    .toInt(),
  body('nombre_plan')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('nombre_plan inválido'),
  body('horas_semana')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('horas_semana inválido')
    .toInt(),
  body('vigente')
    .optional()
    .isBoolean()
    .withMessage('vigente debe ser boolean'),
  body('activo')
    .optional()
    .isBoolean()
    .withMessage('activo debe ser boolean'),
];

export const updatePlanEstudiosValidator = [
  body('carrera_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('carrera_id debe ser entero > 0')
    .toInt(),
  body('nombre_plan')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('nombre_plan inválido'),
  body('horas_semana')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('horas_semana inválido')
    .toInt(),
  body('vigente')
    .optional()
    .isBoolean()
    .withMessage('vigente debe ser boolean'),
  body('activo')
    .optional()
    .isBoolean()
    .withMessage('activo debe ser boolean'),
];

export const createPeriodoValidator = [
  body('nombre')
    .notEmpty()
    .withMessage('nombre es requerido')
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('nombre inválido'),
  body('numero')
    .notEmpty()
    .withMessage('numero es requerido')
    .isInt({ min: 1, max: 50 })
    .withMessage('numero inválido')
    .toInt(),
  body('orden_visualizacion')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('orden_visualizacion inválido')
    .toInt(),
  body('activo')
    .optional()
    .isBoolean()
    .withMessage('activo debe ser boolean'),
];

export const updatePeriodoValidator = [
  body('nombre')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('nombre inválido'),
  body('numero')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('numero inválido')
    .toInt(),
  body('orden_visualizacion')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('orden_visualizacion inválido')
    .toInt(),
  body('activo')
    .optional()
    .isBoolean()
    .withMessage('activo debe ser boolean'),
];

export const createAsignaturaPlanValidator = [
  body('plan_estudio_id')
    .notEmpty()
    .withMessage('plan_estudio_id es requerido')
    .isInt({ min: 1 })
    .withMessage('plan_estudio_id inválido')
    .toInt(),
  body('periodo_id')
    .notEmpty()
    .withMessage('periodo_id es requerido')
    .isInt({ min: 1 })
    .withMessage('periodo_id inválido')
    .toInt(),
  body('materia_id')
    .notEmpty()
    .withMessage('materia_id es requerido')
    .isInt({ min: 1 })
    .withMessage('materia_id inválido')
    .toInt(),
  body('horas_semanales')
    .notEmpty()
    .withMessage('horas_semanales es requerido')
    .isInt({ min: 1, max: 200 })
    .withMessage('horas_semanales inválido')
    .toInt(),
  body('modalidad')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('modalidad inválida'),
  body('orden_visualizacion')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('orden_visualizacion inválido')
    .toInt(),
  body('activo')
    .optional()
    .isBoolean()
    .withMessage('activo debe ser boolean'),
];

export const updateAsignaturaPlanValidator = [
  body('horas_semanales')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('horas_semanales inválido')
    .toInt(),
  body('modalidad')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('modalidad inválida'),
  body('orden_visualizacion')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('orden_visualizacion inválido')
    .toInt(),
  body('activo')
    .optional()
    .isBoolean()
    .withMessage('activo debe ser boolean'),
];

export const createPrerrequisitoValidator = [
  body('plan_estudio_id')
    .notEmpty()
    .withMessage('plan_estudio_id es requerido')
    .isInt({ min: 1 })
    .withMessage('plan_estudio_id inválido')
    .toInt(),
  body('asignatura_id')
    .notEmpty()
    .withMessage('asignatura_id es requerido')
    .isInt({ min: 1 })
    .withMessage('asignatura_id inválido')
    .toInt(),
  body('prerrequisito_id')
    .notEmpty()
    .withMessage('prerrequisito_id es requerido')
    .isInt({ min: 1 })
    .withMessage('prerrequisito_id inválido')
    .toInt(),
];

