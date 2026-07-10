/**
 * Registro de dependencias del recurso Discapacidad
 *
 * Responsabilidades:
 * - Registrar Use Cases del recurso Discapacidad
 * - Registrar Controllers del recurso Discapacidad
 * - Construir y registrar el router del recurso Discapacidad
 *
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Discapacidad registrado
 */

import { REFERENCIA_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListDiscapacidadUseCase } from '../../../../application/use-cases/referencia/ListDiscapacidadUseCase.js';
import { CreateDiscapacidadUseCase } from '../../../../application/use-cases/referencia/CreateDiscapacidadUseCase.js';
import { UpdateDiscapacidadUseCase } from '../../../../application/use-cases/referencia/UpdateDiscapacidadUseCase.js';
import { GetDiscapacidadByIdUseCase } from '../../../../application/use-cases/referencia/GetDiscapacidadByIdUseCase.js';
import { DeleteDiscapacidadUseCase } from '../../../../application/use-cases/referencia/DeleteDiscapacidadUseCase.js';
import { SetEstadoDiscapacidadUseCase } from '../../../../application/use-cases/referencia/SetEstadoDiscapacidadUseCase.js';
import {
    ListDiscapacidadController,
    CreateDiscapacidadController,
    UpdateDiscapacidadController,
    GetDiscapacidadByIdController,
    DeleteDiscapacidadController,
    SetEstadoDiscapacidadController,
} from '../../../../presentation/controllers/referencia/index.js';
import { buildDiscapacidadRouter } from '../../../../presentation/routes/discapacidad.routes.js';

/**
 * Registra el recurso Discapacidad en el contenedor
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerDiscapacidadResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    registerComponent(
        container,
        REFERENCIA_TOKENS.listDiscapacidadUseCase,
        (c) =>
            new ListDiscapacidadUseCase({
                disabilityTypeRepository: c.resolve(REPOSITORIOS_TOKENS.disabilityTypeRepository),
                complementariosUsosViewRepository: c.resolve(
                    REPOSITORIOS_TOKENS.complementariosUsosViewRepository,
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.createDiscapacidadUseCase,
        (c) =>
            new CreateDiscapacidadUseCase({
                disabilityTypeRepository: c.resolve(REPOSITORIOS_TOKENS.disabilityTypeRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.updateDiscapacidadUseCase,
        (c) =>
            new UpdateDiscapacidadUseCase({
                disabilityTypeRepository: c.resolve(REPOSITORIOS_TOKENS.disabilityTypeRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.getDiscapacidadByIdUseCase,
        (c) =>
            new GetDiscapacidadByIdUseCase({
                disabilityTypeRepository: c.resolve(REPOSITORIOS_TOKENS.disabilityTypeRepository),
                complementariosUsosViewRepository: c.resolve(
                    REPOSITORIOS_TOKENS.complementariosUsosViewRepository,
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.deleteDiscapacidadUseCase,
        (c) =>
            new DeleteDiscapacidadUseCase({
                disabilityTypeRepository: c.resolve(REPOSITORIOS_TOKENS.disabilityTypeRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.setEstadoDiscapacidadUseCase,
        (c) =>
            new SetEstadoDiscapacidadUseCase({
                disabilityTypeRepository: c.resolve(REPOSITORIOS_TOKENS.disabilityTypeRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        REFERENCIA_TOKENS.listDiscapacidadController,
        (c) =>
            new ListDiscapacidadController({
                listDiscapacidadUseCase: c.resolve(REFERENCIA_TOKENS.listDiscapacidadUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.createDiscapacidadController,
        (c) =>
            new CreateDiscapacidadController({
                createDiscapacidadUseCase: c.resolve(REFERENCIA_TOKENS.createDiscapacidadUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.updateDiscapacidadController,
        (c) =>
            new UpdateDiscapacidadController({
                updateDiscapacidadUseCase: c.resolve(REFERENCIA_TOKENS.updateDiscapacidadUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.getDiscapacidadByIdController,
        (c) =>
            new GetDiscapacidadByIdController({
                getDiscapacidadByIdUseCase: c.resolve(REFERENCIA_TOKENS.getDiscapacidadByIdUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.deleteDiscapacidadController,
        (c) =>
            new DeleteDiscapacidadController({
                deleteDiscapacidadUseCase: c.resolve(REFERENCIA_TOKENS.deleteDiscapacidadUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.setEstadoDiscapacidadController,
        (c) =>
            new SetEstadoDiscapacidadController({
                setEstadoDiscapacidadUseCase: c.resolve(
                    REFERENCIA_TOKENS.setEstadoDiscapacidadUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    // ============================================
    // ROUTER
    // ============================================
    registerComponent(
        container,
        REFERENCIA_TOKENS.discapacidadRouter,
        (c) => {
            const controllers = {
                listDiscapacidadController: c.resolve(REFERENCIA_TOKENS.listDiscapacidadController),
                createDiscapacidadController: c.resolve(
                    REFERENCIA_TOKENS.createDiscapacidadController
                ),
                updateDiscapacidadController: c.resolve(
                    REFERENCIA_TOKENS.updateDiscapacidadController
                ),
                getDiscapacidadByIdController: c.resolve(
                    REFERENCIA_TOKENS.getDiscapacidadByIdController
                ),
                deleteDiscapacidadController: c.resolve(
                    REFERENCIA_TOKENS.deleteDiscapacidadController
                ),
                setEstadoDiscapacidadController: c.resolve(
                    REFERENCIA_TOKENS.setEstadoDiscapacidadController
                ),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildDiscapacidadRouter({ controllers, middlewares });
        },
    );

    return container;
}
