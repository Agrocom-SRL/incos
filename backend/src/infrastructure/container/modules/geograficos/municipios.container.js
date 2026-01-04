/**
 * Registro de dependencias del recurso Municipios
 * 
 * Responsabilidades:
 * - Registrar Use Cases del recurso Municipios
 * - Registrar Controllers del recurso Municipios
 * - Construir y registrar el router del recurso Municipios
 * 
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Municipios registrado
 */

import { TOKENS } from '../../tokens.js';
import { ListMunicipiosUseCase } from '../../../../application/use-cases/geograficos/ListMunicipiosUseCase.js';
import { ListMunicipiosController } from '../../../../presentation/controllers/geograficos/index.js';
import { buildMunicipiosRouter } from '../../../../presentation/routes/municipios.routes.js';

/**
 * Registra el recurso Municipios en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerMunicipiosResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    container.register(
        TOKENS.geo_listMunicipiosUseCase,
        (c) =>
            new ListMunicipiosUseCase({
                municipalityRepository: c.resolve(TOKENS.municipalityRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints

    // ============================================
    // CONTROLLERS
    // ============================================
    container.register(
        TOKENS.geo_listMunicipiosController,
        (c) =>
            new ListMunicipiosController({
                listMunicipiosUseCase: c.resolve(TOKENS.geo_listMunicipiosUseCase),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Controllers cuando se implementen sus endpoints

    // ============================================
    // ROUTER
    // ============================================
    container.register(
        TOKENS.geo_municipiosRouter,
        (c) => {
            const controllers = {
                listMunicipiosController: c.resolve(TOKENS.geo_listMunicipiosController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(TOKENS.validateRequest),
            };

            return buildMunicipiosRouter({ controllers, middlewares });
        },
        { singleton: true }
    );

    return container;
}

