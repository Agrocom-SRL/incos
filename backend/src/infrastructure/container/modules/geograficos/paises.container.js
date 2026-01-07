/**
 * Registro de dependencias del recurso Países
 * 
 * Responsabilidades:
 * - Registrar Use Cases del recurso Países
 * - Registrar Controllers del recurso Países
 * - Construir y registrar el router del recurso Países
 * 
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Países registrado
 */

import { GEOGRAFICOS_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListPaisesUseCase } from '../../../../application/use-cases/geograficos/ListPaisesUseCase.js';
import { ListPaisesController } from '../../../../presentation/controllers/geograficos/index.js';
import { buildPaisesRouter } from '../../../../presentation/routes/paises.routes.js';

/**
 * Registra el recurso Países en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerPaisesResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    registerComponent(
        container,
        GEOGRAFICOS_TOKENS.listPaisesUseCase,
        (c) =>
            new ListPaisesUseCase({
                countryRepository: c.resolve(REPOSITORIOS_TOKENS.countryRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints
    // registerComponent(
    //     GEOGRAFICOS_TOKENS.createPaisUseCase,
    //     (c) => new CreatePaisUseCase({
    //         countryRepository: c.resolve(REPOSITORIOS_TOKENS.countryRepository),
    //         logger: c.resolve(SERVICIOS_TOKENS.logger),
    //     })
    // );

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        GEOGRAFICOS_TOKENS.listPaisesController,
        (c) =>
            new ListPaisesController({
                listPaisesUseCase: c.resolve(GEOGRAFICOS_TOKENS.listPaisesUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    // TODO: Agregar otros Controllers cuando se implementen sus endpoints
    // registerComponent(
    //     GEOGRAFICOS_TOKENS.createPaisController,
    //     (c) => new CreatePaisController({
    //         createPaisUseCase: c.resolve(GEOGRAFICOS_TOKENS.createPaisUseCase),
    //         logger: c.resolve(SERVICIOS_TOKENS.logger),
    //     })
    // );

    // ============================================
    // ROUTER
    // ============================================
    registerComponent(
        container,
        GEOGRAFICOS_TOKENS.paisesRouter,
        (c) => {
            const controllers = {
                listPaisesController: c.resolve(GEOGRAFICOS_TOKENS.listPaisesController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildPaisesRouter({ controllers, middlewares });
        },
    );

    return container;
}

