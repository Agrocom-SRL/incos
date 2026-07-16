/**
 * Registro de dependencias del recurso Inscripciones de Capacitación (módulo CAP)
 *
 * Responsabilidades:
 * - Registrar Use Cases del recurso Inscripciones
 * - Registrar Controllers del recurso Inscripciones
 * - Construir y registrar el router (incluye POST /:id/pagos, cuyo
 *   use case/controller registra pagos-capacitacion.container.js)
 *
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */

import { CAPACITACION_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListInscripcionesCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/ListInscripcionesCapacitacionUseCase.js';
import { GetInscripcionCapacitacionByIdUseCase } from '../../../../application/use-cases/capacitacion/GetInscripcionCapacitacionByIdUseCase.js';
import { CreateInscripcionCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/CreateInscripcionCapacitacionUseCase.js';
import { DeleteInscripcionCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/DeleteInscripcionCapacitacionUseCase.js';
import {
    ListInscripcionesCapacitacionController,
    GetInscripcionCapacitacionByIdController,
    CreateInscripcionCapacitacionController,
    DeleteInscripcionCapacitacionController,
} from '../../../../presentation/controllers/capacitacion/index.js';
import { buildInscripcionesCapacitacionRouter } from '../../../../presentation/routes/inscripciones-capacitacion.routes.js';

export function registerInscripcionesCapacitacionResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    registerComponent(
        container,
        CAPACITACION_TOKENS.listInscripcionesCapacitacionUseCase,
        (c) =>
            new ListInscripcionesCapacitacionUseCase({
                inscripcionCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.inscripcionCapacitacionRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.getInscripcionCapacitacionByIdUseCase,
        (c) =>
            new GetInscripcionCapacitacionByIdUseCase({
                inscripcionCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.inscripcionCapacitacionRepository
                ),
                pagoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.pagoCapacitacionRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.createInscripcionCapacitacionUseCase,
        (c) =>
            new CreateInscripcionCapacitacionUseCase({
                inscripcionCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.inscripcionCapacitacionRepository
                ),
                participanteRepository: c.resolve(CAPACITACION_TOKENS.participanteRepository),
                cursoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.cursoCapacitacionRepository
                ),
                registerPagoCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.registerPagoCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.deleteInscripcionCapacitacionUseCase,
        (c) =>
            new DeleteInscripcionCapacitacionUseCase({
                inscripcionCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.inscripcionCapacitacionRepository
                ),
                pagoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.pagoCapacitacionRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        CAPACITACION_TOKENS.listInscripcionesCapacitacionController,
        (c) =>
            new ListInscripcionesCapacitacionController({
                listInscripcionesCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.listInscripcionesCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.getInscripcionCapacitacionByIdController,
        (c) =>
            new GetInscripcionCapacitacionByIdController({
                getInscripcionCapacitacionByIdUseCase: c.resolve(
                    CAPACITACION_TOKENS.getInscripcionCapacitacionByIdUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.createInscripcionCapacitacionController,
        (c) =>
            new CreateInscripcionCapacitacionController({
                createInscripcionCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.createInscripcionCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.deleteInscripcionCapacitacionController,
        (c) =>
            new DeleteInscripcionCapacitacionController({
                deleteInscripcionCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.deleteInscripcionCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    // ============================================
    // ROUTER
    // ============================================
    registerComponent(
        container,
        CAPACITACION_TOKENS.inscripcionesCapacitacionRouter,
        (c) => {
            const controllers = {
                listInscripcionesCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.listInscripcionesCapacitacionController
                ),
                getInscripcionCapacitacionByIdController: c.resolve(
                    CAPACITACION_TOKENS.getInscripcionCapacitacionByIdController
                ),
                createInscripcionCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.createInscripcionCapacitacionController
                ),
                deleteInscripcionCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.deleteInscripcionCapacitacionController
                ),
                registerPagoCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.registerPagoCapacitacionController
                ),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildInscripcionesCapacitacionRouter({ controllers, middlewares });
        }
    );

    return container;
}
