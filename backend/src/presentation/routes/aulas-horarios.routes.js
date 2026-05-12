/**
 * Aulas × planificación semanal (vista `vista_aulas_horarios_semana`).
 *
 * PATCH /horarios/:cursoHorarioId/aula — body `{ "aulaId": number | null }` actualiza `cursos_horarios.aula_id`
 * (permiso `institucional.horario.armado` + EDITAR).
 */
import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import {
  listAulasHorariosValidator,
  patchAulaHorarioValidator,
  cursoHorarioIdParamValidator,
} from '../validators/aulas-horarios/index.js';

export function buildAulasHorariosRouter({ controllers, middlewares }) {
  const router = express.Router();
  const { validateRequest } = middlewares;

  const verHorarios = [authenticate, verificarPermiso('institucional.gestion.horarios', 'LISTAR')];
  const editarAula = [authenticate, verificarPermiso('institucional.horario.armado', 'EDITAR')];

  router.get(
    '/horarios',
    ...verHorarios,
    ...listAulasHorariosValidator,
    validateRequest,
    (req, res, next) => controllers.listAulasHorariosController.handle(req, res, next)
  );

  router.patch(
    '/horarios/:cursoHorarioId/aula',
    ...editarAula,
    ...cursoHorarioIdParamValidator,
    ...patchAulaHorarioValidator,
    validateRequest,
    (req, res, next) => controllers.patchAulaHorarioController.handle(req, res, next)
  );

  return router;
}

