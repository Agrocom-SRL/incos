/**
 * Registro de dependencias del recurso Inscripciones (CRUD básico)
 * 
 * Responsabilidades:
 * - Registrar Use Cases del recurso Inscripciones (List, Create, GetById, Update, Delete)
 * - Registrar Controllers del recurso Inscripciones
 * - Construir y registrar el router del recurso Inscripciones
 * 
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Inscripciones registrado
 */

import { INSCRIPCIONES_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { buildInscripcionesRouter } from '../../../../presentation/routes/inscripciones.routes.js';

/**
 * Registra el recurso Inscripciones en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */

export function registerInscripcionesResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    // TODO: Agregar Use Cases cuando se implementen
    // registerComponent(
    //     container,
    //     INSCRIPCIONES_TOKENS.listEnrollmentsUseCase,
    //     (c) =>
    //         new ListEnrollmentsUseCase({
    //             enrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.enrollmentRepository),
    //             logger: c.resolve(SERVICIOS_TOKENS.logger),
    //         })
    // );

    // ============================================
    // CONTROLLERS
    // ============================================
    // TODO: Agregar Controllers cuando se implementen
    // registerComponent(
    //     container,
    //     INSCRIPCIONES_TOKENS.listEnrollmentsController,
    //     (c) =>
    //         new ListEnrollmentsController({
    //             listEnrollmentsUseCase: c.resolve(INSCRIPCIONES_TOKENS.listEnrollmentsUseCase),
    //             logger: c.resolve(SERVICIOS_TOKENS.logger),
    //             responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
    //         })
    // );

    // ============================================
    // ROUTER
    // ============================================
    registerComponent(
        container,
        INSCRIPCIONES_TOKENS.inscripcionesRouter,
        (c) => {
            const controllers = {
                // TODO: Agregar controllers cuando se implementen
                // listEnrollmentsController: c.resolve(INSCRIPCIONES_TOKENS.listEnrollmentsController),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildInscripcionesRouter({ controllers, middlewares });
        }
    );

    return container;
}
