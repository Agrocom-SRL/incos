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

import { REFERENCIA_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
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
    registerComponent(
        container,
        REFERENCIA_TOKENS.listTiposParentescoUseCase,
        (c) =>
            new ListTiposParentescoUseCase({
                relationshipTypeRepository: c.resolve(REPOSITORIOS_TOKENS.relationshipTypeRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        REFERENCIA_TOKENS.listTiposParentescoController,
        (c) =>
            new ListTiposParentescoController({
                listTiposParentescoUseCase: c.resolve(REFERENCIA_TOKENS.listTiposParentescoUseCase),
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
        REFERENCIA_TOKENS.tiposParentescoRouter,
        (c) => {
            const controllers = {
                listTiposParentescoController: c.resolve(REFERENCIA_TOKENS.listTiposParentescoController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildTiposParentescoRouter({ controllers, middlewares });
        },
    );

    return container;
}

