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

import { TOKENS } from '../../tokens.js';
import { ListIdiomasUseCase } from '../../../../application/use-cases/referencia/ListIdiomasUseCase.js';
import { ListIdiomasController } from '../../../../presentation/controllers/referencia/index.js';
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
    container.register(
        TOKENS.ref_listIdiomasUseCase,
        (c) =>
            new ListIdiomasUseCase({
                languageRepository: c.resolve(TOKENS.languageRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints
    // container.register(
    //     TOKENS.ref_createIdiomaUseCase,
    //     (c) => new CreateIdiomaUseCase({
    //         languageRepository: c.resolve(TOKENS.languageRepository),
    //         logger: c.resolve(TOKENS.logger),
    //     }),
    //     { singleton: true }
    // );

    // ============================================
    // CONTROLLERS
    // ============================================
    container.register(
        TOKENS.ref_listIdiomasController,
        (c) =>
            new ListIdiomasController({
                listIdiomasUseCase: c.resolve(TOKENS.ref_listIdiomasUseCase),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Controllers cuando se implementen sus endpoints
    // container.register(
    //     TOKENS.ref_createIdiomaController,
    //     (c) => new CreateIdiomaController({
    //         createIdiomaUseCase: c.resolve(TOKENS.ref_createIdiomaUseCase),
    //         logger: c.resolve(TOKENS.logger),
    //     }),
    //     { singleton: true }
    // );

    // ============================================
    // ROUTER
    // ============================================
    container.register(
        TOKENS.ref_idiomasRouter,
        (c) => {
            const controllers = {
                listIdiomasController: c.resolve(TOKENS.ref_listIdiomasController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(TOKENS.validateRequest),
            };

            return buildIdiomasRouter({ controllers, middlewares });
        },
        { singleton: true }
    );

    return container;
}

