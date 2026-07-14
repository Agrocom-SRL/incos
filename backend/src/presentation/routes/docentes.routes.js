import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso, verificarPermisoCualquiera } from '../middleware/permisos.middleware.js';
import { docenteSelfOnlyGuard } from '../middleware/docenteSelfOnly.middleware.js';
import { listValidator, idValidator } from '../validators/common/index.js';
import {
  createTeacherValidator,
  updateTeacherValidator,
  listTeacherAssignmentsValidator,
  createTeacherAssignmentValidator,
  assignTeacherToCourseValidator,
  updateTeacherAssignmentValidator,
  listPlanesDocenteValidator,
  listPeriodosDocenteValidator,
  listParalelosDocenteValidator,
  listCursosParaleloDocenteValidator,
  listCursosDisponiblesDocenteValidator,
  cursoIdParamValidator,
  getDocenteCargaGestionValidator,
  putDocenteColorValidator,
} from '../validators/docentes/index.js';

/**
 * Router del módulo Docentes.
 *
 * @param {Object} params
 * @param {Object} params.controllers
 * @param {Object} params.middlewares
 * @param {Function} params.middlewares.validateRequest
 */
export function buildDocentesRouter({ controllers, middlewares }) {
  const router = express.Router();
  const { validateRequest } = middlewares;

  const docentesListar = [authenticate, verificarPermiso('docentes.ver', 'LISTAR')];
  const docenteDetalle = [authenticate, verificarPermiso('docentes.ver', 'DETALLE')];
  const docenteCrear = [authenticate, verificarPermiso('docentes.crear', 'CREAR')];
  const docenteEditar = [authenticate, verificarPermiso('docentes.editar', 'EDITAR')];
  const docenteEliminar = [authenticate, verificarPermiso('docentes.editar', 'ELIMINAR')];
  const docenteAsignar = [
    authenticate,
    verificarPermisoCualquiera([
      ['institucional.horarios.asignacion-docente', 'EDITAR'],
      ['docentes.asignar', 'EDITAR'],
    ]),
  ];
  const docenteAsignarEliminar = [
    authenticate,
    verificarPermisoCualquiera([
      ['institucional.horarios.asignacion-docente', 'ELIMINAR'],
      ['docentes.asignar', 'ELIMINAR'],
    ]),
  ];
  // Alta de una nueva asignación (docente + materia + paralelo). El seed y la UI
  // (ActionButton/PermisoGuard "Asignar materias y paralelos") usan CREAR; antes
  // este gate solo aceptaba EDITAR, lo que dejaba CREAR huérfano en las 3 capas.
  const docenteAsignarCrear = [
    authenticate,
    verificarPermisoCualquiera([
      ['institucional.horarios.asignacion-docente', 'CREAR'],
      ['institucional.horarios.asignacion-docente', 'EDITAR'],
      ['docentes.asignar', 'CREAR'],
      ['docentes.asignar', 'EDITAR'],
    ]),
  ];
  const docenteColorListar = [
    authenticate,
    verificarPermisoCualquiera([
      ['institucional.horarios.color-docente', 'LISTAR'],
      ['institucional.horarios.asignacion-docente', 'LISTAR'],
      ['docentes.asignar', 'EDITAR'],
    ]),
  ];
  const docenteColorEditar = [
    authenticate,
    verificarPermisoCualquiera([
      ['institucional.horarios.color-docente', 'EDITAR'],
      ['docentes.asignar', 'EDITAR'],
    ]),
  ];
  const docenteCargaListar = [
    authenticate,
    verificarPermisoCualquiera([
      ['institucional.horarios.carga-docente', 'LISTAR'],
      ['institucional.horarios.asignacion-docente', 'LISTAR'],
      ['docentes.asignar', 'EDITAR'],
    ]),
  ];

  // "Mis datos" se consume desde el portal del rol docente (autoservicio, sin
  // permiso propio, como /auth/me). El acceso lo blinda resolveDocenteIdForUsuario:
  // 403 si el usuario no está vinculado a un docente.
  const misDatosDocente = [authenticate];

  router.get(
    '/',
    ...docentesListar,
    listValidator,
    validateRequest,
    (req, res, next) => controllers.listTeachersController.handle(req, res, next)
  );

  /**
   * GET /api/v1/docentes/mis-datos
   * Identidad mínima del docente de la sesión (se resuelve desde req.usuario.id
   * en servidor). Payload: { id, nombreCompleto }. El frontend lo usa para
   * redirigir al docente a SU propia ficha /docentes/:id.
   *
   * IMPORTANTE: debe ir ANTES de /:id para evitar conflictos.
   */
  router.get(
    '/mis-datos',
    ...misDatosDocente,
    (req, res, next) => controllers.getMisDatosDocenteController.handle(req, res, next)
  );

  /**
   * GET /api/v1/docentes/mis-estudiantes
   * Roster de estudiantes de los cursos VIGENTES del docente de la sesión en la
   * gestión vigente (portal del rol docente). Gate solo `authenticate`: la
   * identidad se resuelve en servidor (resolveDocenteIdForUsuario, anti-IDOR;
   * 403 si el usuario no está vinculado a un docente).
   *
   * IMPORTANTE: debe ir ANTES de /:id para evitar conflictos.
   */
  router.get(
    '/mis-estudiantes',
    ...misDatosDocente,
    (req, res, next) => controllers.getMisEstudiantesDocenteController.handle(req, res, next)
  );

  router.post(
    '/',
    ...docenteCrear,
    createTeacherValidator,
    validateRequest,
    (req, res, next) => controllers.createTeacherController.handle(req, res, next)
  );

  router.get(
    '/planes-habilitados',
    ...docenteAsignar,
    ...listPlanesDocenteValidator,
    validateRequest,
    (req, res, next) => controllers.listPlanesHabilitadosDocenteController.handle(req, res, next)
  );

  router.get(
    '/periodos-disponibles',
    ...docenteAsignar,
    ...listPeriodosDocenteValidator,
    validateRequest,
    (req, res, next) => controllers.listPeriodosDocenteAsignacionController.handle(req, res, next)
  );

  router.get(
    '/paralelos-disponibles',
    ...docenteAsignar,
    ...listParalelosDocenteValidator,
    validateRequest,
    (req, res, next) => controllers.listParalelosDocenteAsignacionController.handle(req, res, next)
  );

  router.get(
    '/cursos-por-paralelo',
    ...docenteAsignar,
    ...listCursosParaleloDocenteValidator,
    validateRequest,
    (req, res, next) => controllers.listCursosPorParaleloDocenteController.handle(req, res, next)
  );

  router.get(
    '/cursos-disponibles',
    ...docenteAsignar,
    ...listCursosDisponiblesDocenteValidator,
    validateRequest,
    (req, res, next) => controllers.listCursosDisponiblesDocenteController.handle(req, res, next)
  );

  router.get(
    '/conflicto-bloques',
    ...docentesListar,
    (req, res, next) => controllers.getDocentesConflictoBloquesController.handle(req, res, next)
  );

  router.get(
    '/cursos/:cursoId/horarios',
    ...docenteAsignar,
    ...cursoIdParamValidator,
    validateRequest,
    (req, res, next) => controllers.getCursoHorariosDocenteController.handle(req, res, next)
  );

  router.get(
    '/asignaciones',
    ...docenteAsignar,
    ...listTeacherAssignmentsValidator,
    validateRequest,
    (req, res, next) => controllers.listTeacherAssignmentsController.handle(req, res, next)
  );

  router.post(
    '/asignaciones',
    ...docenteAsignarCrear,
    ...createTeacherAssignmentValidator,
    validateRequest,
    (req, res, next) => controllers.createTeacherAssignmentController.handle(req, res, next)
  );

  router.post(
    '/asignaciones/curso',
    ...docenteAsignarCrear,
    ...assignTeacherToCourseValidator,
    validateRequest,
    (req, res, next) => controllers.assignTeacherToCourseController.handle(req, res, next)
  );

  router.patch(
    '/asignaciones/:id',
    ...docenteAsignar,
    ...idValidator,
    ...updateTeacherAssignmentValidator,
    validateRequest,
    (req, res, next) => controllers.updateTeacherAssignmentController.handle(req, res, next)
  );

  router.delete(
    '/asignaciones/:id',
    ...docenteAsignarEliminar,
    ...idValidator,
    validateRequest,
    (req, res, next) => controllers.deleteTeacherAssignmentController.handle(req, res, next)
  );

  router.get(
    '/colores-en-uso',
    ...docenteColorListar,
    validateRequest,
    (req, res, next) => controllers.getDocenteColoresEnUsoController.handle(req, res, next)
  );

  router.get(
    '/colores-sugeridos',
    ...docenteColorListar,
    validateRequest,
    (req, res, next) => controllers.getDocenteColoresSugeridosController.handle(req, res, next)
  );

  // Lectura por :id consumida por la ficha; anti-IDOR: un usuario con vínculo
  // docente solo puede consultar SU propio id (docenteSelfOnlyGuard).
  router.get(
    '/:id/carga-gestion',
    ...docenteCargaListar,
    ...getDocenteCargaGestionValidator,
    validateRequest,
    docenteSelfOnlyGuard,
    (req, res, next) => controllers.getDocenteCargaGestionController.handle(req, res, next)
  );

  router.put(
    '/:id/color',
    ...docenteColorEditar,
    ...idValidator,
    putDocenteColorValidator,
    validateRequest,
    (req, res, next) => controllers.updateDocenteColorController.handle(req, res, next)
  );

  router.put(
    '/:id',
    ...docenteEditar,
    ...idValidator,
    updateTeacherValidator,
    validateRequest,
    (req, res, next) => controllers.updateTeacherController.handle(req, res, next)
  );

  router.delete(
    '/:id',
    ...docenteEliminar,
    ...idValidator,
    validateRequest,
    (req, res, next) => controllers.deleteTeacherController.handle(req, res, next)
  );

  // Ficha del docente. El rol DOCENTE tiene DETALLE para ver SU propia ficha
  // (portal del rol docente); docenteSelfOnlyGuard fuerza :id = docente propio
  // (anti-IDOR). Staff sin vínculo docente pasa sin restricción.
  router.get(
    '/:id',
    ...docenteDetalle,
    ...idValidator,
    validateRequest,
    docenteSelfOnlyGuard,
    (req, res, next) => controllers.getTeacherByIdController.handle(req, res, next)
  );

  return router;
}
