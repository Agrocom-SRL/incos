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

import { REFERENCIA_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
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
    registerComponent(
        container,
        REFERENCIA_TOKENS.listDiscapacidadUseCase,
        (c) =>
            new ListDiscapacidadUseCase({
                disabilityTypeRepository: c.resolve(REPOSITORIOS_TOKENS.disabilityTypeRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        REFERENCIA_TOKENS.listDiscapacidadController,
        (c) =>
            new ListDiscapacidadController({
                listDiscapacidadUseCase: c.resolve(REFERENCIA_TOKENS.listDiscapacidadUseCase),
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
        REFERENCIA_TOKENS.discapacidadRouter,
        (c) => {
            const controllers = {
                listDiscapacidadController: c.resolve(REFERENCIA_TOKENS.listDiscapacidadController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildDiscapacidadRouter({ controllers, middlewares });
        },
    );

    return container;
}

