/**
 * Registro de dependencias del recurso Discapacidad
 * 
 * Responsabilidades:
 * - Registrar Use Cases del recurso Discapacidad
 * - Registrar Controllers del recurso Discapacidad
 * - Construir y registrar el router del recurso Discapacidad
 * 
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Discapacidad registrado
 */

import { TOKENS } from '../../tokens.js';
import { ListDiscapacidadUseCase } from '../../../../application/use-cases/referencia/ListDiscapacidadUseCase.js';
import { ListDiscapacidadController } from '../../../../presentation/controllers/referencia/index.js';
import { buildDiscapacidadRouter } from '../../../../presentation/routes/discapacidad.routes.js';

/**
 * Registra el recurso Discapacidad en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerDiscapacidadResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    container.register(
        TOKENS.ref_listDiscapacidadUseCase,
        (c) =>
            new ListDiscapacidadUseCase({
                disabilityTypeRepository: c.resolve(TOKENS.disabilityTypeRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints

    // ============================================
    // CONTROLLERS
    // ============================================
    container.register(
        TOKENS.ref_listDiscapacidadController,
        (c) =>
            new ListDiscapacidadController({
                listDiscapacidadUseCase: c.resolve(TOKENS.ref_listDiscapacidadUseCase),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Controllers cuando se implementen sus endpoints

    // ============================================
    // ROUTER
    // ============================================
    container.register(
        TOKENS.ref_discapacidadRouter,
        (c) => {
            const controllers = {
                listDiscapacidadController: c.resolve(TOKENS.ref_listDiscapacidadController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(TOKENS.validateRequest),
            };

            return buildDiscapacidadRouter({ controllers, middlewares });
        },
        { singleton: true }
    );

    return container;
}

