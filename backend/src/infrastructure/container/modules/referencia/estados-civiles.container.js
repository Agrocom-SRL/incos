/**
 * Registro de dependencias del recurso Estados Civiles
 * 
 * Responsabilidades:
 * - Registrar Use Cases del recurso Estados Civiles
 * - Registrar Controllers del recurso Estados Civiles
 * - Construir y registrar el router del recurso Estados Civiles
 * 
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Estados Civiles registrado
 */

import { REFERENCIA_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListEstadosCivilesUseCase } from '../../../../application/use-cases/referencia/ListEstadosCivilesUseCase.js';
import { ListEstadosCivilesController } from '../../../../presentation/controllers/referencia/index.js';
import { buildEstadosCivilesRouter } from '../../../../presentation/routes/estados-civiles.routes.js';

/**
 * Registra el recurso Estados Civiles en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerEstadosCivilesResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    registerComponent(
        container,
        REFERENCIA_TOKENS.listEstadosCivilesUseCase,
        (c) =>
            new ListEstadosCivilesUseCase({
                civilStatusRepository: c.resolve(REPOSITORIOS_TOKENS.civilStatusRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        REFERENCIA_TOKENS.listEstadosCivilesController,
        (c) =>
            new ListEstadosCivilesController({
                listEstadosCivilesUseCase: c.resolve(REFERENCIA_TOKENS.listEstadosCivilesUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    // TODO: Agregar otros Controllers cuando se implementen sus endpoints

    // ============================================
    // ROUTER
    // ============================================
    registerComponent(
        container,
        REFERENCIA_TOKENS.estadosCivilesRouter,
        (c) => {
            const controllers = {
                listEstadosCivilesController: c.resolve(REFERENCIA_TOKENS.listEstadosCivilesController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildEstadosCivilesRouter({ controllers, middlewares });
        },
    );

    return container;
}

