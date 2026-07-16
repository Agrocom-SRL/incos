/**
 * Registro de dependencias del recurso Participantes (módulo CAP)
 *
 * Responsabilidades:
 * - Registrar Use Cases del recurso Participantes
 * - Registrar Controllers del recurso Participantes
 * - Construir y registrar el router del recurso Participantes
 *
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */

import { CAPACITACION_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListParticipantesUseCase } from '../../../../application/use-cases/capacitacion/ListParticipantesUseCase.js';
import { GetParticipanteByIdUseCase } from '../../../../application/use-cases/capacitacion/GetParticipanteByIdUseCase.js';
import { CreateParticipanteUseCase } from '../../../../application/use-cases/capacitacion/CreateParticipanteUseCase.js';
import { UpdateParticipanteUseCase } from '../../../../application/use-cases/capacitacion/UpdateParticipanteUseCase.js';
import {
    ListParticipantesController,
    GetParticipanteByIdController,
    CreateParticipanteController,
    UpdateParticipanteController,
} from '../../../../presentation/controllers/capacitacion/index.js';
import { buildParticipantesRouter } from '../../../../presentation/routes/participantes.routes.js';

export function registerParticipantesResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    registerComponent(
        container,
        CAPACITACION_TOKENS.listParticipantesUseCase,
        (c) =>
            new ListParticipantesUseCase({
                participanteRepository: c.resolve(CAPACITACION_TOKENS.participanteRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.getParticipanteByIdUseCase,
        (c) =>
            new GetParticipanteByIdUseCase({
                participanteRepository: c.resolve(CAPACITACION_TOKENS.participanteRepository),
                inscripcionCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.inscripcionCapacitacionRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.createParticipanteUseCase,
        (c) =>
            new CreateParticipanteUseCase({
                participanteRepository: c.resolve(CAPACITACION_TOKENS.participanteRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.updateParticipanteUseCase,
        (c) =>
            new UpdateParticipanteUseCase({
                participanteRepository: c.resolve(CAPACITACION_TOKENS.participanteRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        CAPACITACION_TOKENS.listParticipantesController,
        (c) =>
            new ListParticipantesController({
                listParticipantesUseCase: c.resolve(CAPACITACION_TOKENS.listParticipantesUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.getParticipanteByIdController,
        (c) =>
            new GetParticipanteByIdController({
                getParticipanteByIdUseCase: c.resolve(
                    CAPACITACION_TOKENS.getParticipanteByIdUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.createParticipanteController,
        (c) =>
            new CreateParticipanteController({
                createParticipanteUseCase: c.resolve(CAPACITACION_TOKENS.createParticipanteUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.updateParticipanteController,
        (c) =>
            new UpdateParticipanteController({
                updateParticipanteUseCase: c.resolve(CAPACITACION_TOKENS.updateParticipanteUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    // ============================================
    // ROUTER
    // ============================================
    registerComponent(
        container,
        CAPACITACION_TOKENS.participantesRouter,
        (c) => {
            const controllers = {
                listParticipantesController: c.resolve(
                    CAPACITACION_TOKENS.listParticipantesController
                ),
                getParticipanteByIdController: c.resolve(
                    CAPACITACION_TOKENS.getParticipanteByIdController
                ),
                createParticipanteController: c.resolve(
                    CAPACITACION_TOKENS.createParticipanteController
                ),
                updateParticipanteController: c.resolve(
                    CAPACITACION_TOKENS.updateParticipanteController
                ),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildParticipantesRouter({ controllers, middlewares });
        }
    );

    return container;
}
