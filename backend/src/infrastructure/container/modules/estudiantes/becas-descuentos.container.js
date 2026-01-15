/**
 * Registro de dependencias del recurso Becas y Descuentos
 * 
 * Responsabilidades:
 * - Registrar Use Cases del recurso Becas y Descuentos
 * - Registrar Controllers del recurso Becas y Descuentos
 * - Construir y registrar el router del recurso Becas y Descuentos
 * 
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Becas y Descuentos registrado
 */

import { ESTUDIANTES_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListBecasDescuentosUseCase } from '../../../../application/use-cases/estudiantes/ListBecasDescuentosUseCase.js';
import { ListBecasDescuentosController } from '../../../../presentation/controllers/estudiantes/becas/index.js';
import { buildBecasDescuentosRouter } from '../../../../presentation/routes/becas-descuentos.routes.js';

/**
 * Registra el recurso Becas y Descuentos en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */

export function registerBecasDescuentosResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    registerComponent(
        container,
        ESTUDIANTES_TOKENS.listBecasDescuentosUseCase,
        (c) =>
            new ListBecasDescuentosUseCase({
                scholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.scholarshipRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints
    // registerComponent(
    //     container,
    //     ESTUDIANTES_TOKENS.createBecaDescuentoUseCase,
    //     (c) => new CreateBecaDescuentoUseCase({
    //         scholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.scholarshipRepository),
    //         logger: c.resolve(SERVICIOS_TOKENS.logger),
    //     })
    // );

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        ESTUDIANTES_TOKENS.listBecasDescuentosController,
        (c) =>
            new ListBecasDescuentosController({
                listBecasDescuentosUseCase: c.resolve(ESTUDIANTES_TOKENS.listBecasDescuentosUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    // TODO: Agregar otros Controllers cuando se implementen sus endpoints
    // registerComponent(
    //     container,
    //     ESTUDIANTES_TOKENS.createBecaDescuentoController,
    //     (c) => new CreateBecaDescuentoController({
    //         createBecaDescuentoUseCase: c.resolve(ESTUDIANTES_TOKENS.createBecaDescuentoUseCase),
    //         logger: c.resolve(SERVICIOS_TOKENS.logger),
    //     })
    // );

    // ============================================
    // ROUTER
    // ============================================
    registerComponent(
        container,
        ESTUDIANTES_TOKENS.becasDescuentosRouter,
        (c) => {
            const controllers = {
                listBecasDescuentosController: c.resolve(ESTUDIANTES_TOKENS.listBecasDescuentosController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildBecasDescuentosRouter({ controllers, middlewares });
        }
    );

    return container;
}
