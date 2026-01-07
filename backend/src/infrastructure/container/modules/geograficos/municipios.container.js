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

import { GEOGRAFICOS_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
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
    registerComponent(
        container,
        GEOGRAFICOS_TOKENS.listMunicipiosUseCase,
        (c) =>
            new ListMunicipiosUseCase({
                municipalityRepository: c.resolve(REPOSITORIOS_TOKENS.municipalityRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        GEOGRAFICOS_TOKENS.listMunicipiosController,
        (c) =>
            new ListMunicipiosController({
                listMunicipiosUseCase: c.resolve(GEOGRAFICOS_TOKENS.listMunicipiosUseCase),
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
        GEOGRAFICOS_TOKENS.municipiosRouter,
        (c) => {
            const controllers = {
                listMunicipiosController: c.resolve(GEOGRAFICOS_TOKENS.listMunicipiosController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildMunicipiosRouter({ controllers, middlewares });
        },
    );

    return container;
}

