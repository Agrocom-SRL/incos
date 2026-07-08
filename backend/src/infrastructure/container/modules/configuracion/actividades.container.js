/**
 * Registro de dependencias del recurso Actividades (catálogo maestro)
 *
 * Responsabilidades:
 * - Registrar Use Cases del recurso Actividades
 * - Registrar Controllers del recurso Actividades
 * - Construir y registrar el router del recurso Actividades
 *
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 *
 * NOTA: El repositorio (ActivityRepository / activityRepository) YA está
 * registrado en repositories.container.js — aquí solo se consume, no se crea.
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Actividades registrado
 */

import { CONFIGURACION_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListActividadesUseCase } from '../../../../application/use-cases/configuracion/ListActividadesUseCase.js';
import { CreateActividadUseCase } from '../../../../application/use-cases/configuracion/CreateActividadUseCase.js';
import { UpdateActividadUseCase } from '../../../../application/use-cases/configuracion/UpdateActividadUseCase.js';
import { GetActividadByIdUseCase } from '../../../../application/use-cases/configuracion/GetActividadByIdUseCase.js';
import { DeleteActividadUseCase } from '../../../../application/use-cases/configuracion/DeleteActividadUseCase.js';
import { SetEstadoActividadUseCase } from '../../../../application/use-cases/configuracion/SetEstadoActividadUseCase.js';
import {
    ListActividadesController,
    CreateActividadController,
    UpdateActividadController,
    GetActividadByIdController,
    DeleteActividadController,
    SetEstadoActividadController,
} from '../../../../presentation/controllers/configuracion/index.js';
import { buildActividadesRouter } from '../../../../presentation/routes/actividades.routes.js';

/**
 * Registra el recurso Actividades en el contenedor
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerActividadesResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    registerComponent(
        container,
        CONFIGURACION_TOKENS.listActividadesUseCase,
        (c) =>
            new ListActividadesUseCase({
                activityRepository: c.resolve(REPOSITORIOS_TOKENS.activityRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.getActividadByIdUseCase,
        (c) =>
            new GetActividadByIdUseCase({
                activityRepository: c.resolve(REPOSITORIOS_TOKENS.activityRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.createActividadUseCase,
        (c) =>
            new CreateActividadUseCase({
                activityRepository: c.resolve(REPOSITORIOS_TOKENS.activityRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.updateActividadUseCase,
        (c) =>
            new UpdateActividadUseCase({
                activityRepository: c.resolve(REPOSITORIOS_TOKENS.activityRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.deleteActividadUseCase,
        (c) =>
            new DeleteActividadUseCase({
                activityRepository: c.resolve(REPOSITORIOS_TOKENS.activityRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.setEstadoActividadUseCase,
        (c) =>
            new SetEstadoActividadUseCase({
                activityRepository: c.resolve(REPOSITORIOS_TOKENS.activityRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        CONFIGURACION_TOKENS.listActividadesController,
        (c) =>
            new ListActividadesController({
                listActividadesUseCase: c.resolve(CONFIGURACION_TOKENS.listActividadesUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.getActividadByIdController,
        (c) =>
            new GetActividadByIdController({
                getActividadByIdUseCase: c.resolve(CONFIGURACION_TOKENS.getActividadByIdUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.createActividadController,
        (c) =>
            new CreateActividadController({
                createActividadUseCase: c.resolve(CONFIGURACION_TOKENS.createActividadUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.updateActividadController,
        (c) =>
            new UpdateActividadController({
                updateActividadUseCase: c.resolve(CONFIGURACION_TOKENS.updateActividadUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.deleteActividadController,
        (c) =>
            new DeleteActividadController({
                deleteActividadUseCase: c.resolve(CONFIGURACION_TOKENS.deleteActividadUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.setEstadoActividadController,
        (c) =>
            new SetEstadoActividadController({
                setEstadoActividadUseCase: c.resolve(
                    CONFIGURACION_TOKENS.setEstadoActividadUseCase
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
        CONFIGURACION_TOKENS.actividadesRouter,
        (c) => {
            const controllers = {
                listActividadesController: c.resolve(CONFIGURACION_TOKENS.listActividadesController),
                getActividadByIdController: c.resolve(CONFIGURACION_TOKENS.getActividadByIdController),
                createActividadController: c.resolve(CONFIGURACION_TOKENS.createActividadController),
                updateActividadController: c.resolve(CONFIGURACION_TOKENS.updateActividadController),
                deleteActividadController: c.resolve(CONFIGURACION_TOKENS.deleteActividadController),
                setEstadoActividadController: c.resolve(
                    CONFIGURACION_TOKENS.setEstadoActividadController
                ),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildActividadesRouter({ controllers, middlewares });
        }
    );

    return container;
}
