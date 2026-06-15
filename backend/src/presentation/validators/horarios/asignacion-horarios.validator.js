import { body, param } from 'express-validator';

export const asignacionHorarioIdValidator = [
  param('id').isInt({ min: 1 }).withMessage('id debe ser un entero positivo'),
];

export const createAsignacionHorarioValidator = [
  body('asignacion_docente_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('asignacion_docente_id inválido'),
  body('asignacionDocenteId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('asignacionDocenteId inválido'),
  body().custom((_, { req }) => {
    const id = req.body?.asignacion_docente_id ?? req.body?.asignacionDocenteId;
    if (!id) throw new Error('asignacion_docente_id es requerido');
    return true;
  }),
  body('horario_id').optional().isInt({ min: 1 }),
  body('horarioId').optional().isInt({ min: 1 }),
  body().custom((_, { req }) => {
    const id = req.body?.horario_id ?? req.body?.horarioId;
    if (!id) throw new Error('horario_id es requerido');
    return true;
  }),
  body('aula_id').optional({ nullable: true }).isInt({ min: 1 }),
  body('aulaId').optional({ nullable: true }).isInt({ min: 1 }),
  body('orden_secuencia').optional().isInt({ min: 1 }),
  body('ordenSecuencia').optional().isInt({ min: 1 }),
];

export const updateAsignacionHorarioValidator = [
  ...asignacionHorarioIdValidator,
  body('asignacion_docente_id').optional().isInt({ min: 1 }),
  body('horario_id').optional().isInt({ min: 1 }),
  body('aula_id').optional({ nullable: true }).isInt({ min: 1 }),
  body('orden_secuencia').optional().isInt({ min: 1 }),
];

export const bulkAsignacionHorariosValidator = [
  body('items').optional().isArray({ min: 1 }),
  body().custom((value, { req }) => {
    const items = req.body?.items ?? (Array.isArray(req.body) ? req.body : null);
    if (!items?.length) throw new Error('Se requiere items[] con operaciones');
    return true;
  }),
];

export const validarConflictoHorarioValidator = [
  body('asignacion_docente_id').optional().isInt({ min: 1 }),
  body('horario_id').optional().isInt({ min: 1 }),
  body().custom((_, { req }) => {
    if (!req.body?.asignacion_docente_id && !req.body?.asignacionDocenteId) {
      throw new Error('asignacion_docente_id es requerido');
    }
    if (!req.body?.horario_id && !req.body?.horarioId) {
      throw new Error('horario_id es requerido');
    }
    return true;
  }),
  body('aula_id').optional({ nullable: true }).isInt({ min: 1 }),
  body('aulaId').optional({ nullable: true }).isInt({ min: 1 }),
  // Bloque nuevo: omitir o null; al mover/actualizar: id del bloque a excluir del chequeo
  body('asignacion_horario_id').optional({ nullable: true }).isInt({ min: 1 }),
  body('asignacionHorarioId').optional({ nullable: true }).isInt({ min: 1 }),
  body('exclude_id').optional({ nullable: true }).isInt({ min: 1 }),
];

export const cambiarTurnoConBloquesValidator = [
  body('turno').isString().trim().notEmpty().withMessage('turno es requerido'),
];
