/**
 * Registro de dependencias del recurso Aulas (catálogo maestro de espacios físicos)
 *
 * Responsabilidades:
 * - Registrar Use Cases del recurso Aulas
 * - Registrar Controllers del recurso Aulas
 * - Construir y registrar el router del recurso Aulas
 *
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 *
 * NOTA: El repositorio (ClassroomRepository / classroomRepository) YA está
 * registrado en repositories.container.js (consumido también por
 * `aulas-horarios.container.js` para el picker de oferta) — aquí solo se
 * consume, no se crea.
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Aulas registrado
 */

import { CONFIGURACION_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListAulasUseCase } from '../../../../application/use-cases/configuracion/ListAulasUseCase.js';
import { CreateAulaUseCase } from '../../../../application/use-cases/configuracion/CreateAulaUseCase.js';
import { UpdateAulaUseCase } from '../../../../application/use-cases/configuracion/UpdateAulaUseCase.js';
import { GetAulaByIdUseCase } from '../../../../application/use-cases/configuracion/GetAulaByIdUseCase.js';
import { DeleteAulaUseCase } from '../../../../application/use-cases/configuracion/DeleteAulaUseCase.js';
import { SetEstadoAulaUseCase } from '../../../../application/use-cases/configuracion/SetEstadoAulaUseCase.js';
import {
    ListAulasController,
    CreateAulaController,
    UpdateAulaController,
    GetAulaByIdController,
    DeleteAulaController,
    SetEstadoAulaController,
} from '../../../../presentation/controllers/configuracion/index.js';
import { buildAulasRouter } from '../../../../presentation/routes/aulas.routes.js';

/**
 * Registra el recurso Aulas en el contenedor
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerAulasResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    registerComponent(
        container,
        CONFIGURACION_TOKENS.listAulasUseCase,
        (c) =>
            new ListAulasUseCase({
                classroomRepository: c.resolve(REPOSITORIOS_TOKENS.classroomRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.getAulaByIdUseCase,
        (c) =>
            new GetAulaByIdUseCase({
                classroomRepository: c.resolve(REPOSITORIOS_TOKENS.classroomRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.createAulaUseCase,
        (c) =>
            new CreateAulaUseCase({
                classroomRepository: c.resolve(REPOSITORIOS_TOKENS.classroomRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.updateAulaUseCase,
        (c) =>
            new UpdateAulaUseCase({
                classroomRepository: c.resolve(REPOSITORIOS_TOKENS.classroomRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.deleteAulaUseCase,
        (c) =>
            new DeleteAulaUseCase({
                classroomRepository: c.resolve(REPOSITORIOS_TOKENS.classroomRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.setEstadoAulaUseCase,
        (c) =>
            new SetEstadoAulaUseCase({
                classroomRepository: c.resolve(REPOSITORIOS_TOKENS.classroomRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        CONFIGURACION_TOKENS.listAulasController,
        (c) =>
            new ListAulasController({
                listAulasUseCase: c.resolve(CONFIGURACION_TOKENS.listAulasUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.getAulaByIdController,
        (c) =>
            new GetAulaByIdController({
                getAulaByIdUseCase: c.resolve(CONFIGURACION_TOKENS.getAulaByIdUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.createAulaController,
        (c) =>
            new CreateAulaController({
                createAulaUseCase: c.resolve(CONFIGURACION_TOKENS.createAulaUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.updateAulaController,
        (c) =>
            new UpdateAulaController({
                updateAulaUseCase: c.resolve(CONFIGURACION_TOKENS.updateAulaUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.deleteAulaController,
        (c) =>
            new DeleteAulaController({
                deleteAulaUseCase: c.resolve(CONFIGURACION_TOKENS.deleteAulaUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.setEstadoAulaController,
        (c) =>
            new SetEstadoAulaController({
                setEstadoAulaUseCase: c.resolve(CONFIGURACION_TOKENS.setEstadoAulaUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    // ============================================
    // ROUTER
    // ============================================
    registerComponent(
        container,
        CONFIGURACION_TOKENS.aulasRouter,
        (c) => {
            const controllers = {
                listAulasController: c.resolve(CONFIGURACION_TOKENS.listAulasController),
                getAulaByIdController: c.resolve(CONFIGURACION_TOKENS.getAulaByIdController),
                createAulaController: c.resolve(CONFIGURACION_TOKENS.createAulaController),
                updateAulaController: c.resolve(CONFIGURACION_TOKENS.updateAulaController),
                deleteAulaController: c.resolve(CONFIGURACION_TOKENS.deleteAulaController),
                setEstadoAulaController: c.resolve(CONFIGURACION_TOKENS.setEstadoAulaController),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildAulasRouter({ controllers, middlewares });
        }
    );

    return container;
}
