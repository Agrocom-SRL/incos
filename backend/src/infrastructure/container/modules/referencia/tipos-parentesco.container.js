/**
 * Registro de dependencias del recurso Tipos Parentesco
 *
 * Responsabilidades:
 * - Registrar Use Cases del recurso Tipos Parentesco
 * - Registrar Controllers del recurso Tipos Parentesco
 * - Construir y registrar el router del recurso Tipos Parentesco
 *
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Tipos Parentesco registrado
 */

import { REFERENCIA_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListTiposParentescoUseCase } from '../../../../application/use-cases/referencia/ListTiposParentescoUseCase.js';
import { CreateTipoParentescoUseCase } from '../../../../application/use-cases/referencia/CreateTipoParentescoUseCase.js';
import { UpdateTipoParentescoUseCase } from '../../../../application/use-cases/referencia/UpdateTipoParentescoUseCase.js';
import { GetTipoParentescoByIdUseCase } from '../../../../application/use-cases/referencia/GetTipoParentescoByIdUseCase.js';
import { DeleteTipoParentescoUseCase } from '../../../../application/use-cases/referencia/DeleteTipoParentescoUseCase.js';
import { SetEstadoTipoParentescoUseCase } from '../../../../application/use-cases/referencia/SetEstadoTipoParentescoUseCase.js';
import {
    ListTiposParentescoController,
    CreateTipoParentescoController,
    UpdateTipoParentescoController,
    GetTipoParentescoByIdController,
    DeleteTipoParentescoController,
    SetEstadoTipoParentescoController,
} from '../../../../presentation/controllers/referencia/index.js';
import { buildTiposParentescoRouter } from '../../../../presentation/routes/tipos-parentesco.routes.js';

/**
 * Registra el recurso Tipos Parentesco en el contenedor
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerTiposParentescoResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    registerComponent(
        container,
        REFERENCIA_TOKENS.listTiposParentescoUseCase,
        (c) =>
            new ListTiposParentescoUseCase({
                relationshipTypeRepository: c.resolve(
                    REPOSITORIOS_TOKENS.relationshipTypeRepository
                ),
                complementariosUsosViewRepository: c.resolve(
                    REPOSITORIOS_TOKENS.complementariosUsosViewRepository,
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.createTipoParentescoUseCase,
        (c) =>
            new CreateTipoParentescoUseCase({
                relationshipTypeRepository: c.resolve(
                    REPOSITORIOS_TOKENS.relationshipTypeRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.updateTipoParentescoUseCase,
        (c) =>
            new UpdateTipoParentescoUseCase({
                relationshipTypeRepository: c.resolve(
                    REPOSITORIOS_TOKENS.relationshipTypeRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.getTipoParentescoByIdUseCase,
        (c) =>
            new GetTipoParentescoByIdUseCase({
                relationshipTypeRepository: c.resolve(
                    REPOSITORIOS_TOKENS.relationshipTypeRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.deleteTipoParentescoUseCase,
        (c) =>
            new DeleteTipoParentescoUseCase({
                relationshipTypeRepository: c.resolve(
                    REPOSITORIOS_TOKENS.relationshipTypeRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.setEstadoTipoParentescoUseCase,
        (c) =>
            new SetEstadoTipoParentescoUseCase({
                relationshipTypeRepository: c.resolve(
                    REPOSITORIOS_TOKENS.relationshipTypeRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        REFERENCIA_TOKENS.listTiposParentescoController,
        (c) =>
            new ListTiposParentescoController({
                listTiposParentescoUseCase: c.resolve(REFERENCIA_TOKENS.listTiposParentescoUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.createTipoParentescoController,
        (c) =>
            new CreateTipoParentescoController({
                createTipoParentescoUseCase: c.resolve(
                    REFERENCIA_TOKENS.createTipoParentescoUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.updateTipoParentescoController,
        (c) =>
            new UpdateTipoParentescoController({
                updateTipoParentescoUseCase: c.resolve(
                    REFERENCIA_TOKENS.updateTipoParentescoUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.getTipoParentescoByIdController,
        (c) =>
            new GetTipoParentescoByIdController({
                getTipoParentescoByIdUseCase: c.resolve(
                    REFERENCIA_TOKENS.getTipoParentescoByIdUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.deleteTipoParentescoController,
        (c) =>
            new DeleteTipoParentescoController({
                deleteTipoParentescoUseCase: c.resolve(
                    REFERENCIA_TOKENS.deleteTipoParentescoUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.setEstadoTipoParentescoController,
        (c) =>
            new SetEstadoTipoParentescoController({
                setEstadoTipoParentescoUseCase: c.resolve(
                    REFERENCIA_TOKENS.setEstadoTipoParentescoUseCase
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
        REFERENCIA_TOKENS.tiposParentescoRouter,
        (c) => {
            const controllers = {
                listTiposParentescoController: c.resolve(
                    REFERENCIA_TOKENS.listTiposParentescoController
                ),
                createTipoParentescoController: c.resolve(
                    REFERENCIA_TOKENS.createTipoParentescoController
                ),
                updateTipoParentescoController: c.resolve(
                    REFERENCIA_TOKENS.updateTipoParentescoController
                ),
                getTipoParentescoByIdController: c.resolve(
                    REFERENCIA_TOKENS.getTipoParentescoByIdController
                ),
                deleteTipoParentescoController: c.resolve(
                    REFERENCIA_TOKENS.deleteTipoParentescoController
                ),
                setEstadoTipoParentescoController: c.resolve(
                    REFERENCIA_TOKENS.setEstadoTipoParentescoController
                ),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildTiposParentescoRouter({ controllers, middlewares });
        },
    );

    return container;
}
