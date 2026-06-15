import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso, verificarPermisoCualquiera } from '../middleware/permisos.middleware.js';
import { listParalelosValidator, putParaleloScheduleValidator } from '../validators/academico/index.js';
import { createParaleloValidator, updateParaleloValidator } from '../validators/configuracion/paralelos.validator.js';
import { idValidator } from '../validators/common/index.js';

/**
 * Router del módulo Paralelos (maestro CFG + lecturas horarios/matrícula).
 */
export function buildParalelosRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;

    const permisoCfg = 'configuracion.paralelo';
    const listarParalelos = [
        authenticate,
        verificarPermisoCualquiera([
            [permisoCfg, 'LISTAR'],
            ['institucional.gestion.horarios', 'LISTAR'],
            ['matricula.inscribir', 'LISTAR'],
        ]),
    ];
    const verHorarios = [authenticate, verificarPermiso('institucional.gestion.horarios', 'LISTAR')];
    const editarArmadoHorarios = [authenticate, verificarPermiso('institucional.horario.armado', 'EDITAR')];
    const verPublicacionHorarios = [authenticate, verificarPermiso('institucional.horario.publicacion', 'LISTAR')];
    const crearParalelo = [authenticate, verificarPermiso(permisoCfg, 'CREAR')];
    const detalleParalelo = [authenticate, verificarPermiso(permisoCfg, 'DETALLE')];
    const editarParalelo = [authenticate, verificarPermiso(permisoCfg, 'EDITAR')];
    const eliminarParalelo = [authenticate, verificarPermiso(permisoCfg, 'ELIMINAR')];

    router.get(
        '/',
        ...listarParalelos,
        listParalelosValidator,
        validateRequest,
        (req, res, next) => controllers.listParalelosController.handle(req, res, next)
    );

    router.post(
        '/',
        ...crearParalelo,
        createParaleloValidator,
        validateRequest,
        (req, res, next) => controllers.createParaleloController.handle(req, res, next)
    );

    router.get(
        '/dashboard/paralelos-estado',
        ...verHorarios,
        (req, res, next) => controllers.getDashboardParalelosEstadoController.handle(req, res, next)
    );

    router.get(
        '/dashboard/asignaturas-sin-curso',
        ...verHorarios,
        (req, res, next) => controllers.getDashboardAsignaturasSinCursoController.handle(req, res, next)
    );

    router.get(
        '/dashboard/capacidad-turno',
        ...verHorarios,
        (req, res, next) => controllers.getDashboardCapacidadTurnoController.handle(req, res, next)
    );

    router.get(
        '/dashboard/horarios-pendientes',
        ...verHorarios,
        (req, res, next) => controllers.getDashboardHorariosPendientesController.handle(req, res, next)
    );

    router.get(
        '/dashboard/horarios-publicacion',
        ...verPublicacionHorarios,
        (req, res, next) => controllers.getHorariosPublicacionPlanesController.handle(req, res, next)
    );

    router.get(
        '/:id/schedule',
        ...verHorarios,
        ...idValidator,
        validateRequest,
        (req, res, next) => controllers.getParaleloScheduleController.handle(req, res, next)
    );

    router.put(
        '/:id/schedule',
        ...editarArmadoHorarios,
        ...idValidator,
        ...putParaleloScheduleValidator,
        validateRequest,
        (req, res, next) => controllers.putParaleloScheduleController.handle(req, res, next)
    );

    router.get(
        '/:id/paralelos-gestion',
        authenticate,
        verificarPermisoCualquiera([
            [permisoCfg, 'DETALLE'],
            ['institucional.oferta.paralelo-gestion', 'LISTAR'],
        ]),
        ...idValidator,
        validateRequest,
        (req, res, next) =>
            controllers.listParalelosGestionByParaleloController.handle(req, res, next),
    );

    router.get(
        '/:id',
        ...detalleParalelo,
        ...idValidator,
        validateRequest,
        (req, res, next) => controllers.getParaleloByIdController.handle(req, res, next)
    );

    router.put(
        '/:id',
        ...editarParalelo,
        ...idValidator,
        updateParaleloValidator,
        validateRequest,
        (req, res, next) => controllers.updateParaleloController.handle(req, res, next)
    );

    router.delete(
        '/:id',
        ...eliminarParalelo,
        ...idValidator,
        validateRequest,
        (req, res, next) => controllers.deleteParaleloController.handle(req, res, next)
    );

    return router;
}
