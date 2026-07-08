/**
 * Registro de dependencias del recurso Documentación
 *
 * Responsabilidades:
 * - Registrar Use Cases del recurso Documentación
 * - Registrar Controllers del recurso Documentación
 * - Construir y registrar el router del recurso Documentación
 *
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Documentación registrado
 */

import { REFERENCIA_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListDocumentacionUseCase } from '../../../../application/use-cases/referencia/ListDocumentacionUseCase.js';
import { CreateDocumentacionUseCase } from '../../../../application/use-cases/referencia/CreateDocumentacionUseCase.js';
import { UpdateDocumentacionUseCase } from '../../../../application/use-cases/referencia/UpdateDocumentacionUseCase.js';
import { GetDocumentacionByIdUseCase } from '../../../../application/use-cases/referencia/GetDocumentacionByIdUseCase.js';
import { DeleteDocumentacionUseCase } from '../../../../application/use-cases/referencia/DeleteDocumentacionUseCase.js';
import { SetEstadoDocumentacionUseCase } from '../../../../application/use-cases/referencia/SetEstadoDocumentacionUseCase.js';
import {
    ListDocumentacionController,
    CreateDocumentacionController,
    UpdateDocumentacionController,
    GetDocumentacionByIdController,
    DeleteDocumentacionController,
    SetEstadoDocumentacionController,
} from '../../../../presentation/controllers/referencia/index.js';
import { buildDocumentacionRouter } from '../../../../presentation/routes/documentacion.routes.js';

/**
 * Registra el recurso Documentación en el contenedor
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerDocumentacionResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    registerComponent(
        container,
        REFERENCIA_TOKENS.listDocumentacionUseCase,
        (c) =>
            new ListDocumentacionUseCase({
                documentacionRepository: c.resolve(REPOSITORIOS_TOKENS.documentationRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.createDocumentacionUseCase,
        (c) =>
            new CreateDocumentacionUseCase({
                documentacionRepository: c.resolve(REPOSITORIOS_TOKENS.documentationRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.updateDocumentacionUseCase,
        (c) =>
            new UpdateDocumentacionUseCase({
                documentacionRepository: c.resolve(REPOSITORIOS_TOKENS.documentationRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.getDocumentacionByIdUseCase,
        (c) =>
            new GetDocumentacionByIdUseCase({
                documentacionRepository: c.resolve(REPOSITORIOS_TOKENS.documentationRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.deleteDocumentacionUseCase,
        (c) =>
            new DeleteDocumentacionUseCase({
                documentacionRepository: c.resolve(REPOSITORIOS_TOKENS.documentationRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.setEstadoDocumentacionUseCase,
        (c) =>
            new SetEstadoDocumentacionUseCase({
                documentacionRepository: c.resolve(REPOSITORIOS_TOKENS.documentationRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        REFERENCIA_TOKENS.listDocumentacionController,
        (c) =>
            new ListDocumentacionController({
                listDocumentacionUseCase: c.resolve(REFERENCIA_TOKENS.listDocumentacionUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.createDocumentacionController,
        (c) =>
            new CreateDocumentacionController({
                createDocumentacionUseCase: c.resolve(REFERENCIA_TOKENS.createDocumentacionUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.updateDocumentacionController,
        (c) =>
            new UpdateDocumentacionController({
                updateDocumentacionUseCase: c.resolve(REFERENCIA_TOKENS.updateDocumentacionUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.getDocumentacionByIdController,
        (c) =>
            new GetDocumentacionByIdController({
                getDocumentacionByIdUseCase: c.resolve(REFERENCIA_TOKENS.getDocumentacionByIdUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.deleteDocumentacionController,
        (c) =>
            new DeleteDocumentacionController({
                deleteDocumentacionUseCase: c.resolve(REFERENCIA_TOKENS.deleteDocumentacionUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        REFERENCIA_TOKENS.setEstadoDocumentacionController,
        (c) =>
            new SetEstadoDocumentacionController({
                setEstadoDocumentacionUseCase: c.resolve(
                    REFERENCIA_TOKENS.setEstadoDocumentacionUseCase,
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
        REFERENCIA_TOKENS.documentacionRouter,
        (c) => {
            const controllers = {
                listDocumentacionController: c.resolve(REFERENCIA_TOKENS.listDocumentacionController),
                createDocumentacionController: c.resolve(REFERENCIA_TOKENS.createDocumentacionController),
                updateDocumentacionController: c.resolve(REFERENCIA_TOKENS.updateDocumentacionController),
                getDocumentacionByIdController: c.resolve(REFERENCIA_TOKENS.getDocumentacionByIdController),
                deleteDocumentacionController: c.resolve(REFERENCIA_TOKENS.deleteDocumentacionController),
                setEstadoDocumentacionController: c.resolve(
                    REFERENCIA_TOKENS.setEstadoDocumentacionController,
                ),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildDocumentacionRouter({ controllers, middlewares });
        },
    );

    return container;
}
