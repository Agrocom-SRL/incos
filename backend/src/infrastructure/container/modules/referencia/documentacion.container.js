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

import { TOKENS } from '../../tokens.js';
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
    container.register(
        TOKENS.ref_listDocumentacionUseCase,
        (c) =>
            new ListDocumentacionUseCase({
                documentacionRepository: c.resolve(TOKENS.documentacionRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints

    // ============================================
    // CONTROLLERS
    // ============================================
    container.register(
        TOKENS.ref_listDocumentacionController,
        (c) =>
            new ListDocumentacionController({
                listDocumentacionUseCase: c.resolve(TOKENS.ref_listDocumentacionUseCase),
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
        TOKENS.ref_documentacionRouter,
        (c) => {
            const controllers = {
                listDocumentacionController: c.resolve(TOKENS.ref_listDocumentacionController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(TOKENS.validateRequest),
            };

            return buildDocumentacionRouter({ controllers, middlewares });
        },
        { singleton: true }
    );

    return container;
}

