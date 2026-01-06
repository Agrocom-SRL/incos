/**
 * Registro de dependencias del recurso Carreras
 * 
 * Responsabilidades:
 * - Registrar Use Cases del recurso Carreras
 * - Registrar Controllers del recurso Carreras
 * - Construir y registrar el router del recurso Carreras
 * 
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Carreras registrado
 */

import { TOKENS } from '../../tokens.js';
import { ListCarrerasUseCase } from '../../../../application/use-cases/configuracion/ListCarrerasUseCase.js';
import { ListCarrerasController } from '../../../../presentation/controllers/configuracion/index.js';
import { buildCarrerasRouter } from '../../../../presentation/routes/carreras.routes.js';

/**
 * Registra el recurso Carreras en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerCarrerasResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    container.register(
        TOKENS.cfg_listCarrerasUseCase,
        (c) =>
            new ListCarrerasUseCase({
                careerRepository: c.resolve(TOKENS.careerRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints
    // container.register(
    //     TOKENS.cfg_createCarreraUseCase,
    //     (c) => new CreateCarreraUseCase({
    //         careerRepository: c.resolve(TOKENS.careerRepository),
    //         logger: c.resolve(TOKENS.logger),
    //     }),
    //     { singleton: true }
    // );

    // ============================================
    // CONTROLLERS
    // ============================================
    container.register(
        TOKENS.cfg_listCarrerasController,
        (c) =>
            new ListCarrerasController({
                listCarrerasUseCase: c.resolve(TOKENS.cfg_listCarrerasUseCase),
                logger: c.resolve(TOKENS.logger),
                responseFormatter: c.resolve(TOKENS.responseFormatter),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Controllers cuando se implementen sus endpoints
    // container.register(
    //     TOKENS.cfg_createCarreraController,
    //     (c) => new CreateCarreraController({
    //         createCarreraUseCase: c.resolve(TOKENS.cfg_createCarreraUseCase),
    //         logger: c.resolve(TOKENS.logger),
    //     }),
    //     { singleton: true }
    // );

    // ============================================
    // ROUTER
    // ============================================
    container.register(
        TOKENS.cfg_carrerasRouter,
        (c) => {
            const controllers = {
                listCarrerasController: c.resolve(TOKENS.cfg_listCarrerasController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(TOKENS.validateRequest),
            };

            return buildCarrerasRouter({ controllers, middlewares });
        },
        { singleton: true }
    );

    return container;
}

