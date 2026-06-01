import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { validarConflictoHorarioValidator } from '../validators/horarios/asignacion-horarios.validator.js';

export function buildConflictosRouter({ controllers, middlewares }) {
  const router = express.Router();
  const { validateRequest } = middlewares;

  router.post(
    '/validar',
    authenticate,
    verificarPermiso('institucional.horario.armado', 'EDITAR'),
    validarConflictoHorarioValidator,
    validateRequest,
    (req, res, next) => controllers.validarConflictoHorarioController.handle(req, res, next)
  );

  return router;
}
