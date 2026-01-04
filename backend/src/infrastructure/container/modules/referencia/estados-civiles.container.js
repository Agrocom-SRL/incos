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

import { TOKENS } from '../../tokens.js';
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
    container.register(
        TOKENS.ref_listEstadosCivilesUseCase,
        (c) =>
            new ListEstadosCivilesUseCase({
                civilStatusRepository: c.resolve(TOKENS.civilStatusRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints

    // ============================================
    // CONTROLLERS
    // ============================================
    container.register(
        TOKENS.ref_listEstadosCivilesController,
        (c) =>
            new ListEstadosCivilesController({
                listEstadosCivilesUseCase: c.resolve(TOKENS.ref_listEstadosCivilesUseCase),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Controllers cuando se implementen sus endpoints

    // ============================================
    // ROUTER
    // ============================================
    container.register(
        TOKENS.ref_estadosCivilesRouter,
        (c) => {
            const controllers = {
                listEstadosCivilesController: c.resolve(TOKENS.ref_listEstadosCivilesController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(TOKENS.validateRequest),
            };

            return buildEstadosCivilesRouter({ controllers, middlewares });
        },
        { singleton: true }
    );

    return container;
}

