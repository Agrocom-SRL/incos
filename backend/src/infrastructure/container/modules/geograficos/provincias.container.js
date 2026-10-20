/**
 * Registro de dependencias del recurso Provincias
 *
 * Responsabilidades:
 * - Registrar Use Cases del recurso Provincias
 * - Registrar Controllers del recurso Provincias
 * - Construir y registrar el router del recurso Provincias
 *
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Provincias registrado
 */

import { GEOGRAFICOS_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListProvinciasUseCase } from '../../../../application/use-cases/geograficos/ListProvinciasUseCase.js';
import { ListProvinciasController } from '../../../../presentation/controllers/geograficos/index.js';
import { buildProvinciasRouter } from '../../../../presentation/routes/provincias.routes.js';

/**
 * Registra el recurso Provincias en el contenedor
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerProvinciasResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    registerComponent(
        container,
        GEOGRAFICOS_TOKENS.listProvinciasUseCase,
        (c) =>
            new ListProvinciasUseCase({
                provinceRepository: c.resolve(REPOSITORIOS_TOKENS.provinceRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        GEOGRAFICOS_TOKENS.listProvinciasController,
        (c) =>
            new ListProvinciasController({
                listProvinciasUseCase: c.resolve(GEOGRAFICOS_TOKENS.listProvinciasUseCase),
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
        GEOGRAFICOS_TOKENS.provinciasRouter,
        (c) => {
            const controllers = {
                listProvinciasController: c.resolve(GEOGRAFICOS_TOKENS.listProvinciasController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildProvinciasRouter({ controllers, middlewares });
        },
    );

    return container;
}
