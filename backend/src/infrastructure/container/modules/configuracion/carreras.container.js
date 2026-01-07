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

import { CONFIGURACION_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
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
    registerComponent(
        container,
        CONFIGURACION_TOKENS.listCarrerasUseCase,
        (c) =>
            new ListCarrerasUseCase({
                careerRepository: c.resolve(REPOSITORIOS_TOKENS.careerRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints
    // registerComponent(
    //     container,
    //     CONFIGURACION_TOKENS.createCarreraUseCase,
    //     (c) => new CreateCarreraUseCase({
    //         careerRepository: c.resolve(REPOSITORIOS_TOKENS.careerRepository),
    //         logger: c.resolve(SERVICIOS_TOKENS.logger),
    //     })
    // );

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        CONFIGURACION_TOKENS.listCarrerasController,
        (c) =>
            new ListCarrerasController({
                listCarrerasUseCase: c.resolve(CONFIGURACION_TOKENS.listCarrerasUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    // TODO: Agregar otros Controllers cuando se implementen sus endpoints
    // registerComponent(
    //     container,
    //     CONFIGURACION_TOKENS.createCarreraController,
    //     (c) => new CreateCarreraController({
    //         createCarreraUseCase: c.resolve(CONFIGURACION_TOKENS.createCarreraUseCase),
    //         logger: c.resolve(SERVICIOS_TOKENS.logger),
    //     })
    // );

    // ============================================
    // ROUTER
    // ============================================
    registerComponent(
        container,
        CONFIGURACION_TOKENS.carrerasRouter,
        (c) => {
            const controllers = {
                listCarrerasController: c.resolve(CONFIGURACION_TOKENS.listCarrerasController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildCarrerasRouter({ controllers, middlewares });
        }
    );

    return container;
}

