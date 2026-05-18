/**
 * Registro de dependencias del recurso Documentación
 * 
 * Responsabilidades:
 * - Registrar Use Cases del recurso Documentación
 * - Registrar Controllers del recurso Documentación
 * - Construir y registrar el router del recurso Documentación
 * 
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Documentación registrado
 */

import { REFERENCIA_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListDocumentacionUseCase } from '../../../../application/use-cases/referencia/ListDocumentacionUseCase.js';
import { ListDocumentacionController } from '../../../../presentation/controllers/referencia/index.js';
import { buildDocumentacionRouter } from '../../../../presentation/routes/documentacion.routes.js';

/**
 * Registra el recurso Documentación en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerDocumentacionResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    registerComponent(
        container,
        REFERENCIA_TOKENS.listDocumentacionUseCase,
        (c) =>
            new ListDocumentacionUseCase({
                documentacionRepository: c.resolve(REPOSITORIOS_TOKENS.documentationRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        REFERENCIA_TOKENS.listDocumentacionController,
        (c) =>
            new ListDocumentacionController({
                listDocumentacionUseCase: c.resolve(REFERENCIA_TOKENS.listDocumentacionUseCase),
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
        REFERENCIA_TOKENS.documentacionRouter,
        (c) => {
            const controllers = {
                listDocumentacionController: c.resolve(REFERENCIA_TOKENS.listDocumentacionController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildDocumentacionRouter({ controllers, middlewares });
        },
    );

    return container;
}

