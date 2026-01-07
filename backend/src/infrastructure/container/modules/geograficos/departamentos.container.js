/**
 * Registro de dependencias del recurso Departamentos
 * 
 * Responsabilidades:
 * - Registrar Use Cases del recurso Departamentos
 * - Registrar Controllers del recurso Departamentos
 * - Construir y registrar el router del recurso Departamentos
 * 
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Departamentos registrado
 */

import { GEOGRAFICOS_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListDepartamentosUseCase } from '../../../../application/use-cases/geograficos/ListDepartamentosUseCase.js';
import { ListDepartamentosController } from '../../../../presentation/controllers/geograficos/index.js';
import { buildDepartamentosRouter } from '../../../../presentation/routes/departamentos.routes.js';

/**
 * Registra el recurso Departamentos en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerDepartamentosResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    registerComponent(
        container,
        GEOGRAFICOS_TOKENS.listDepartamentosUseCase,
        (c) =>
            new ListDepartamentosUseCase({
                departmentRepository: c.resolve(REPOSITORIOS_TOKENS.departmentRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        GEOGRAFICOS_TOKENS.listDepartamentosController,
        (c) =>
            new ListDepartamentosController({
                listDepartamentosUseCase: c.resolve(GEOGRAFICOS_TOKENS.listDepartamentosUseCase),
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
        GEOGRAFICOS_TOKENS.departamentosRouter,
        (c) => {
            const controllers = {
                listDepartamentosController: c.resolve(GEOGRAFICOS_TOKENS.listDepartamentosController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildDepartamentosRouter({ controllers, middlewares });
        },
    );

    return container;
}

