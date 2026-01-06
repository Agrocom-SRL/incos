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

import { TOKENS } from '../../tokens.js';
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
    container.register(
        TOKENS.geo_listPaisesUseCase,
        (c) =>
            new ListPaisesUseCase({
                countryRepository: c.resolve(TOKENS.countryRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints
    // container.register(
    //     TOKENS.geo_createPaisUseCase,
    //     (c) => new CreatePaisUseCase({
    //         countryRepository: c.resolve(TOKENS.countryRepository),
    //         logger: c.resolve(TOKENS.logger),
    //     }),
    //     { singleton: true }
    // );

    // ============================================
    // CONTROLLERS
    // ============================================
    container.register(
        TOKENS.geo_listPaisesController,
        (c) =>
            new ListPaisesController({
                listPaisesUseCase: c.resolve(TOKENS.geo_listPaisesUseCase),
                logger: c.resolve(TOKENS.logger),
                responseFormatter: c.resolve(TOKENS.responseFormatter),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Controllers cuando se implementen sus endpoints
    // container.register(
    //     TOKENS.geo_createPaisController,
    //     (c) => new CreatePaisController({
    //         createPaisUseCase: c.resolve(TOKENS.geo_createPaisUseCase),
    //         logger: c.resolve(TOKENS.logger),
    //     }),
    //     { singleton: true }
    // );

    // ============================================
    // ROUTER
    // ============================================
    container.register(
        TOKENS.geo_paisesRouter,
        (c) => {
            const controllers = {
                listPaisesController: c.resolve(TOKENS.geo_listPaisesController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(TOKENS.validateRequest),
            };

            return buildPaisesRouter({ controllers, middlewares });
        },
        { singleton: true }
    );

    return container;
}

