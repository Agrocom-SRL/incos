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
    registerComponent(
        container,
        REFERENCIA_TOKENS.listIdiomasUseCase,
        (c) =>
            new ListIdiomasUseCase({
                languageRepository: c.resolve(REPOSITORIOS_TOKENS.languageRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints
    // registerComponent(
    //     REFERENCIA_TOKENS.createIdiomaUseCase,
    //     (c) => new CreateIdiomaUseCase({
    //         languageRepository: c.resolve(REPOSITORIOS_TOKENS.languageRepository),
    //         logger: c.resolve(SERVICIOS_TOKENS.logger),
    //     })
    // );

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

    // TODO: Agregar otros Controllers cuando se implementen sus endpoints
    // registerComponent(
    //     REFERENCIA_TOKENS.createIdiomaController,
    //     (c) => new CreateIdiomaController({
    //         createIdiomaUseCase: c.resolve(REFERENCIA_TOKENS.createIdiomaUseCase),
    //         logger: c.resolve(SERVICIOS_TOKENS.logger),
    //     })
    // );

    // ============================================
    // ROUTER
    // ============================================
    registerComponent(
        container,
        REFERENCIA_TOKENS.idiomasRouter,
        (c) => {
            const controllers = {
                listIdiomasController: c.resolve(REFERENCIA_TOKENS.listIdiomasController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildIdiomasRouter({ controllers, middlewares });
        },
    );

    return container;
}

