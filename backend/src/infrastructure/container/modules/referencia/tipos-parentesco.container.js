/**
 * Registro de dependencias del recurso Tipos Parentesco
 * 
 * Responsabilidades:
 * - Registrar Use Cases del recurso Tipos Parentesco
 * - Registrar Controllers del recurso Tipos Parentesco
 * - Construir y registrar el router del recurso Tipos Parentesco
 * 
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Tipos Parentesco registrado
 */

import { TOKENS } from '../../tokens.js';
import { ListTiposParentescoUseCase } from '../../../../application/use-cases/referencia/ListTiposParentescoUseCase.js';
import { ListTiposParentescoController } from '../../../../presentation/controllers/referencia/index.js';
import { buildTiposParentescoRouter } from '../../../../presentation/routes/tipos-parentesco.routes.js';

/**
 * Registra el recurso Tipos Parentesco en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerTiposParentescoResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    container.register(
        TOKENS.ref_listTiposParentescoUseCase,
        (c) =>
            new ListTiposParentescoUseCase({
                relationshipTypeRepository: c.resolve(TOKENS.relationshipTypeRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints

    // ============================================
    // CONTROLLERS
    // ============================================
    container.register(
        TOKENS.ref_listTiposParentescoController,
        (c) =>
            new ListTiposParentescoController({
                listTiposParentescoUseCase: c.resolve(TOKENS.ref_listTiposParentescoUseCase),
                logger: c.resolve(TOKENS.logger),
                responseFormatter: c.resolve(TOKENS.responseFormatter),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Controllers cuando se implementen sus endpoints

    // ============================================
    // ROUTER
    // ============================================
    container.register(
        TOKENS.ref_tiposParentescoRouter,
        (c) => {
            const controllers = {
                listTiposParentescoController: c.resolve(TOKENS.ref_listTiposParentescoController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(TOKENS.validateRequest),
            };

            return buildTiposParentescoRouter({ controllers, middlewares });
        },
        { singleton: true }
    );

    return container;
}

