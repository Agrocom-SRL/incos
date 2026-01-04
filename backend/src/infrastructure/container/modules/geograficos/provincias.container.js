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

import { TOKENS } from '../../tokens.js';
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
    container.register(
        TOKENS.geo_listProvinciasUseCase,
        (c) =>
            new ListProvinciasUseCase({
                provinceRepository: c.resolve(TOKENS.provinceRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints

    // ============================================
    // CONTROLLERS
    // ============================================
    container.register(
        TOKENS.geo_listProvinciasController,
        (c) =>
            new ListProvinciasController({
                listProvinciasUseCase: c.resolve(TOKENS.geo_listProvinciasUseCase),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Controllers cuando se implementen sus endpoints

    // ============================================
    // ROUTER
    // ============================================
    container.register(
        TOKENS.geo_provinciasRouter,
        (c) => {
            const controllers = {
                listProvinciasController: c.resolve(TOKENS.geo_listProvinciasController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(TOKENS.validateRequest),
            };

            return buildProvinciasRouter({ controllers, middlewares });
        },
        { singleton: true }
    );

    return container;
}

