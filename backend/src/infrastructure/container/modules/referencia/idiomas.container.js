/**
 * Registro de dependencias del recurso Idiomas
 *
 * Responsabilidades:
 * - Registrar Use Cases del recurso Idiomas
 * - Registrar Controllers del recurso Idiomas
 * - Construir y registrar el router del recurso Idiomas
 *
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Idiomas registrado
 */

import { REFERENCIA_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListIdiomasUseCase } from '../../../../application/use-cases/referencia/ListIdiomasUseCase.js';
import { CreateIdiomaUseCase } from '../../../../application/use-cases/referencia/CreateIdiomaUseCase.js';
import { UpdateIdiomaUseCase } from '../../../../application/use-cases/referencia/UpdateIdiomaUseCase.js';
import { GetIdiomaByIdUseCase } from '../../../../application/use-cases/referencia/GetIdiomaByIdUseCase.js';
import { DeleteIdiomaUseCase } from '../../../../application/use-cases/referencia/DeleteIdiomaUseCase.js';
import { SetEstadoIdiomaUseCase } from '../../../../application/use-cases/referencia/SetEstadoIdiomaUseCase.js';
import {
    ListIdiomasController,
    CreateIdiomaController,
    UpdateIdiomaController,
    GetIdiomaByIdController,
    DeleteIdiomaController,
    SetEstadoIdiomaController,
} from '../../../../presentation/controllers/referencia/index.js';
import { buildIdiomasRouter } from '../../../../presentation/routes/idiomas.routes.js';

/**
 * Registra el recurso Idiomas en el contenedor
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerIdiomasResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    registerComponent(
        container,
        REFERENCIA_TOKENS.listIdiomasUseCase,
        (c) =>
            new ListIdiomasUseCase({
                languageRepository: c.resolve(REPOSITORIOS_TOKENS.languageRepository),
                complementariosUsosViewRepository: c.resolve(
                    REPOSITORIOS_TOKENS.complementariosUsosViewRepository,
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.createIdiomaUseCase,
        (c) =>
            new CreateIdiomaUseCase({
                languageRepository: c.resolve(REPOSITORIOS_TOKENS.languageRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.updateIdiomaUseCase,
        (c) =>
            new UpdateIdiomaUseCase({
                languageRepository: c.resolve(REPOSITORIOS_TOKENS.languageRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.getIdiomaByIdUseCase,
        (c) =>
            new GetIdiomaByIdUseCase({
                languageRepository: c.resolve(REPOSITORIOS_TOKENS.languageRepository),
                complementariosUsosViewRepository: c.resolve(
                    REPOSITORIOS_TOKENS.complementariosUsosViewRepository,
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.deleteIdiomaUseCase,
        (c) =>
            new DeleteIdiomaUseCase({
                languageRepository: c.resolve(REPOSITORIOS_TOKENS.languageRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.setEstadoIdiomaUseCase,
        (c) =>
            new SetEstadoIdiomaUseCase({
                languageRepository: c.resolve(REPOSITORIOS_TOKENS.languageRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        REFERENCIA_TOKENS.listIdiomasController,
        (c) =>
            new ListIdiomasController({
                listIdiomasUseCase: c.resolve(REFERENCIA_TOKENS.listIdiomasUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.createIdiomaController,
        (c) =>
            new CreateIdiomaController({
                createIdiomaUseCase: c.resolve(REFERENCIA_TOKENS.createIdiomaUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.updateIdiomaController,
        (c) =>
            new UpdateIdiomaController({
                updateIdiomaUseCase: c.resolve(REFERENCIA_TOKENS.updateIdiomaUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.getIdiomaByIdController,
        (c) =>
            new GetIdiomaByIdController({
                getIdiomaByIdUseCase: c.resolve(REFERENCIA_TOKENS.getIdiomaByIdUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.deleteIdiomaController,
        (c) =>
            new DeleteIdiomaController({
                deleteIdiomaUseCase: c.resolve(REFERENCIA_TOKENS.deleteIdiomaUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.setEstadoIdiomaController,
        (c) =>
            new SetEstadoIdiomaController({
                setEstadoIdiomaUseCase: c.resolve(REFERENCIA_TOKENS.setEstadoIdiomaUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    // ============================================
    // ROUTER
    // ============================================
    registerComponent(
        container,
        REFERENCIA_TOKENS.idiomasRouter,
        (c) => {
            const controllers = {
                listIdiomasController: c.resolve(REFERENCIA_TOKENS.listIdiomasController),
                createIdiomaController: c.resolve(REFERENCIA_TOKENS.createIdiomaController),
                updateIdiomaController: c.resolve(REFERENCIA_TOKENS.updateIdiomaController),
                getIdiomaByIdController: c.resolve(REFERENCIA_TOKENS.getIdiomaByIdController),
                deleteIdiomaController: c.resolve(REFERENCIA_TOKENS.deleteIdiomaController),
                setEstadoIdiomaController: c.resolve(REFERENCIA_TOKENS.setEstadoIdiomaController),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildIdiomasRouter({ controllers, middlewares });
        },
    );

    return container;
}
