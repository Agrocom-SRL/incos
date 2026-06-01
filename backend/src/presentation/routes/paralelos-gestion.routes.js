import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso, verificarPermisoCualquiera } from '../middleware/permisos.middleware.js';
import { idValidator } from '../validators/common/index.js';
import {
  updateParaleloGestionValidator,
  cambiarTurnoParaleloGestionValidator,
  updateParaleloGestionEstadoValidator,
} from '../validators/oferta/oferta.validator.js';
import { cambiarTurnoConBloquesValidator } from '../validators/horarios/asignacion-horarios.validator.js';

export function buildParalelosGestionRouter({ controllers, middlewares }) {
  const router = express.Router();
  const { validateRequest } = middlewares;
  const permisoParalelo = 'institucional.oferta.paralelo-gestion';
  const permisoCursos = 'institucional.oferta.cursos';

  router.get(
    '/:id/cobertura-docente',
    authenticate,
    verificarPermisoCualquiera([
      ['institucional.horarios.asignacion-docente', 'LISTAR'],
      ['docentes.asignar', 'EDITAR'],
    ]),
    idValidator,
    validateRequest,
    (req, res, next) => controllers.getParaleloGestionCoberturaDocenteController.handle(req, res, next)
  );

  router.get(
    '/:id/grilla-horario',
    authenticate,
    verificarPermiso('institucional.horario.armado', 'LISTAR'),
    idValidator,
    validateRequest,
    (req, res, next) => controllers.getParaleloGestionGrillaHorarioController.handle(req, res, next)
  );

  router.get(
    '/:id/conflictos',
    authenticate,
    verificarPermiso('institucional.horario.conflictos', 'LISTAR'),
    idValidator,
    validateRequest,
    (req, res, next) => controllers.getParaleloGestionConflictosController.handle(req, res, next)
  );

  router.post(
    '/:id/publicar',
    authenticate,
    verificarPermiso('institucional.horario.publicacion', 'EDITAR'),
    idValidator,
    validateRequest,
    (req, res, next) => controllers.publicarParaleloGestionController.handle(req, res, next)
  );

  router.put(
    '/:id/cambiar-turno-con-bloques',
    authenticate,
    verificarPermiso('institucional.horario.armado', 'EDITAR'),
    idValidator,
    cambiarTurnoConBloquesValidator,
    validateRequest,
    (req, res, next) =>
      controllers.cambiarTurnoParaleloGestionConBloquesController.handle(req, res, next)
  );

  router.get(
    '/:id/validar-oferta',
    authenticate,
    verificarPermiso(permisoCursos, 'LISTAR'),
    idValidator,
    validateRequest,
    (req, res, next) => controllers.validarOfertaParaleloGestionController.handle(req, res, next)
  );

  router.get(
    '/:id/oferta-cursos',
    authenticate,
    verificarPermiso(permisoCursos, 'LISTAR'),
    idValidator,
    validateRequest,
    (req, res, next) => controllers.listOfertaCursosByParaleloGestionController.handle(req, res, next)
  );

  router.post(
    '/:id/generar-oferta',
    authenticate,
    verificarPermiso(permisoCursos, 'CREAR'),
    idValidator,
    validateRequest,
    (req, res, next) => controllers.generarOfertaCursosController.handle(req, res, next)
  );

  router.get(
    '/:id',
    authenticate,
    verificarPermiso(permisoParalelo, 'DETALLE'),
    idValidator,
    validateRequest,
    (req, res, next) => controllers.getParaleloGestionByIdController.handle(req, res, next)
  );

  router.put(
    '/:id/cambiar-turno',
    authenticate,
    verificarPermiso(permisoParalelo, 'EDITAR'),
    cambiarTurnoParaleloGestionValidator,
    validateRequest,
    (req, res, next) => controllers.cambiarTurnoParaleloGestionController.handle(req, res, next)
  );

  router.put(
    '/:id/estado',
    authenticate,
    verificarPermiso(permisoParalelo, 'EDITAR'),
    updateParaleloGestionEstadoValidator,
    validateRequest,
    (req, res, next) => controllers.updateParaleloGestionEstadoController.handle(req, res, next)
  );

  router.put(
    '/:id',
    authenticate,
    verificarPermiso(permisoParalelo, 'EDITAR'),
    updateParaleloGestionValidator,
    validateRequest,
    (req, res, next) => controllers.updateParaleloGestionController.handle(req, res, next)
  );

  return router;
}
