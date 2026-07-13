/**
 * Registro de dependencias del recurso Gestiones
 *
 * Responsabilidades:
 * - Registrar Use Cases del recurso Gestiones
 * - Registrar Controllers del recurso Gestiones
 * - Construir y registrar el router del recurso Gestiones
 *
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Gestiones registrado
 */

import { ACADEMICO_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListGestionesUseCase } from '../../../../application/use-cases/academico/ListGestionesUseCase.js';
import { CreateGestionUseCase } from '../../../../application/use-cases/academico/CreateGestionUseCase.js';
import { UpdateGestionUseCase } from '../../../../application/use-cases/academico/UpdateGestionUseCase.js';
import { ListGestionesController } from '../../../../presentation/controllers/academico/gestiones/list.controller.js';
import { CreateGestionController } from '../../../../presentation/controllers/academico/gestiones/create.controller.js';
import { UpdateGestionController } from '../../../../presentation/controllers/academico/gestiones/update.controller.js';
import { buildGestionesRouter } from '../../../../presentation/routes/gestiones.routes.js';
import { getHorariosGestionesControllers } from './horarios.container.js';

/**
 * Registra el recurso Gestiones en el contenedor
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */

export function registerGestionesResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    registerComponent(
        container,
        ACADEMICO_TOKENS.listGestionesUseCase,
        (c) =>
            new ListGestionesUseCase({
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ACADEMICO_TOKENS.createGestionUseCase,
        (c) =>
            new CreateGestionUseCase({
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ACADEMICO_TOKENS.updateGestionUseCase,
        (c) =>
            new UpdateGestionUseCase({
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        ACADEMICO_TOKENS.listGestionesController,
        (c) =>
            new ListGestionesController({
                listGestionesUseCase: c.resolve(ACADEMICO_TOKENS.listGestionesUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ACADEMICO_TOKENS.createGestionController,
        (c) =>
            new CreateGestionController({
                useCase: c.resolve(ACADEMICO_TOKENS.createGestionUseCase),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ACADEMICO_TOKENS.updateGestionController,
        (c) =>
            new UpdateGestionController({
                useCase: c.resolve(ACADEMICO_TOKENS.updateGestionUseCase),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    // TODO: Agregar otros Controllers cuando se implementen sus endpoints

    // ============================================
    // ROUTER
    // ============================================
    registerComponent(
        container,
        ACADEMICO_TOKENS.gestionesRouter,
        (c) => {
            const controllers = {
                listGestionesController: c.resolve(ACADEMICO_TOKENS.listGestionesController),
                createGestionController: c.resolve(ACADEMICO_TOKENS.createGestionController),
                updateGestionController: c.resolve(ACADEMICO_TOKENS.updateGestionController),
                marcarGestionVigenteController: c.resolve(
                    ACADEMICO_TOKENS.marcarGestionVigenteController
                ),
                renovarOfertaGestionController: c.resolve(
                    ACADEMICO_TOKENS.renovarOfertaGestionController
                ),
                listPlanesHabilitadosByGestionController: c.resolve(
                    ACADEMICO_TOKENS.listPlanesHabilitadosByGestionController
                ),
                getGestionCargaDocentesController: c.resolve(
                    ACADEMICO_TOKENS.getGestionCargaDocentesController
                ),
                ...getHorariosGestionesControllers(c),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildGestionesRouter({ controllers, middlewares });
        }
    );

    return container;
}
