import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { idValidator } from '../validators/common/index.js';
import {
    listParticipantesValidator,
    createParticipanteValidator,
    updateParticipanteValidator,
} from '../validators/capacitacion/index.js';

/**
 * Construye el router de Participantes de capacitación (módulo CAP).
 *
 * Personas externas a la matrícula formal (sin usuario/rol). Permiso
 * `capacitacion.participante` (LISTAR/DETALLE/CREAR/EDITAR — sin ELIMINAR en
 * este primer corte, ver seed 65).
 *
 * @param {Object} params - Dependencias inyectadas
 * @param {Object} params.controllers - Controllers del módulo
 * @param {Object} params.middlewares - Middlewares (validateRequest, etc.)
 * @returns {Router} Router configurado de Express
 */
export function buildParticipantesRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;
    const listar = [authenticate, verificarPermiso('capacitacion.participante', 'LISTAR')];
    const detalle = [authenticate, verificarPermiso('capacitacion.participante', 'DETALLE')];
    const crear = [authenticate, verificarPermiso('capacitacion.participante', 'CREAR')];
    const editar = [authenticate, verificarPermiso('capacitacion.participante', 'EDITAR')];

    /**
     * GET /api/v1/participantes
     * Listado con búsqueda por CI/nombres/apellidos/celular (search) o CI
     * exacto (ci=). Query: page/limit/search + ci + incluirInactivos.
     */
    router.get(
        '/',
        ...listar,
        listParticipantesValidator,
        validateRequest,
        (req, res, next) => controllers.listParticipantesController.handle(req, res, next)
    );

    // POST / - Crear participante (unicidad CI+expedición en lógica de negocio)
    router.post(
        '/',
        ...crear,
        createParticipanteValidator,
        validateRequest,
        (req, res, next) => controllers.createParticipanteController.handle(req, res, next)
    );

    // GET /:id - Ficha del participante (datos + inscripciones)
    router.get(
        '/:id',
        ...detalle,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.getParticipanteByIdController.handle(req, res, next)
    );

    // PUT /:id - Actualizar participante
    router.put(
        '/:id',
        ...editar,
        idValidator,
        updateParticipanteValidator,
        validateRequest,
        (req, res, next) => controllers.updateParticipanteController.handle(req, res, next)
    );

    return router;
}
