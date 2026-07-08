/**
 * Registro de dependencias del recurso Estados Civiles
 *
 * Responsabilidades:
 * - Registrar Use Cases del recurso Estados Civiles
 * - Registrar Controllers del recurso Estados Civiles
 * - Construir y registrar el router del recurso Estados Civiles
 *
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Estados Civiles registrado
 */

import { REFERENCIA_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListEstadosCivilesUseCase } from '../../../../application/use-cases/referencia/ListEstadosCivilesUseCase.js';
import { CreateEstadoCivilUseCase } from '../../../../application/use-cases/referencia/CreateEstadoCivilUseCase.js';
import { UpdateEstadoCivilUseCase } from '../../../../application/use-cases/referencia/UpdateEstadoCivilUseCase.js';
import { GetEstadoCivilByIdUseCase } from '../../../../application/use-cases/referencia/GetEstadoCivilByIdUseCase.js';
import { DeleteEstadoCivilUseCase } from '../../../../application/use-cases/referencia/DeleteEstadoCivilUseCase.js';
import { SetEstadoEstadoCivilUseCase } from '../../../../application/use-cases/referencia/SetEstadoEstadoCivilUseCase.js';
import {
    ListEstadosCivilesController,
    CreateEstadoCivilController,
    UpdateEstadoCivilController,
    GetEstadoCivilByIdController,
    DeleteEstadoCivilController,
    SetEstadoEstadoCivilController,
} from '../../../../presentation/controllers/referencia/index.js';
import { buildEstadosCivilesRouter } from '../../../../presentation/routes/estados-civiles.routes.js';

/**
 * Registra el recurso Estados Civiles en el contenedor
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerEstadosCivilesResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    registerComponent(
        container,
        REFERENCIA_TOKENS.listEstadosCivilesUseCase,
        (c) =>
            new ListEstadosCivilesUseCase({
                civilStatusRepository: c.resolve(REPOSITORIOS_TOKENS.civilStatusRepository),
                complementariosUsosViewRepository: c.resolve(
                    REPOSITORIOS_TOKENS.complementariosUsosViewRepository,
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.createEstadoCivilUseCase,
        (c) =>
            new CreateEstadoCivilUseCase({
                civilStatusRepository: c.resolve(REPOSITORIOS_TOKENS.civilStatusRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.updateEstadoCivilUseCase,
        (c) =>
            new UpdateEstadoCivilUseCase({
                civilStatusRepository: c.resolve(REPOSITORIOS_TOKENS.civilStatusRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.getEstadoCivilByIdUseCase,
        (c) =>
            new GetEstadoCivilByIdUseCase({
                civilStatusRepository: c.resolve(REPOSITORIOS_TOKENS.civilStatusRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.deleteEstadoCivilUseCase,
        (c) =>
            new DeleteEstadoCivilUseCase({
                civilStatusRepository: c.resolve(REPOSITORIOS_TOKENS.civilStatusRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.setEstadoEstadoCivilUseCase,
        (c) =>
            new SetEstadoEstadoCivilUseCase({
                civilStatusRepository: c.resolve(REPOSITORIOS_TOKENS.civilStatusRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        REFERENCIA_TOKENS.listEstadosCivilesController,
        (c) =>
            new ListEstadosCivilesController({
                listEstadosCivilesUseCase: c.resolve(REFERENCIA_TOKENS.listEstadosCivilesUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.createEstadoCivilController,
        (c) =>
            new CreateEstadoCivilController({
                createEstadoCivilUseCase: c.resolve(REFERENCIA_TOKENS.createEstadoCivilUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.updateEstadoCivilController,
        (c) =>
            new UpdateEstadoCivilController({
                updateEstadoCivilUseCase: c.resolve(REFERENCIA_TOKENS.updateEstadoCivilUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.getEstadoCivilByIdController,
        (c) =>
            new GetEstadoCivilByIdController({
                getEstadoCivilByIdUseCase: c.resolve(REFERENCIA_TOKENS.getEstadoCivilByIdUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.deleteEstadoCivilController,
        (c) =>
            new DeleteEstadoCivilController({
                deleteEstadoCivilUseCase: c.resolve(REFERENCIA_TOKENS.deleteEstadoCivilUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.setEstadoEstadoCivilController,
        (c) =>
            new SetEstadoEstadoCivilController({
                setEstadoEstadoCivilUseCase: c.resolve(
                    REFERENCIA_TOKENS.setEstadoEstadoCivilUseCase
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
        REFERENCIA_TOKENS.estadosCivilesRouter,
        (c) => {
            const controllers = {
                listEstadosCivilesController: c.resolve(
                    REFERENCIA_TOKENS.listEstadosCivilesController
                ),
                createEstadoCivilController: c.resolve(
                    REFERENCIA_TOKENS.createEstadoCivilController
                ),
                updateEstadoCivilController: c.resolve(
                    REFERENCIA_TOKENS.updateEstadoCivilController
                ),
                getEstadoCivilByIdController: c.resolve(
                    REFERENCIA_TOKENS.getEstadoCivilByIdController
                ),
                deleteEstadoCivilController: c.resolve(
                    REFERENCIA_TOKENS.deleteEstadoCivilController
                ),
                setEstadoEstadoCivilController: c.resolve(
                    REFERENCIA_TOKENS.setEstadoEstadoCivilController
                ),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildEstadosCivilesRouter({ controllers, middlewares });
        },
    );

    return container;
}
