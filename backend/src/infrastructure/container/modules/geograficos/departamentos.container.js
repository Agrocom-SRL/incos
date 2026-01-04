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

import { TOKENS } from '../../tokens.js';
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
    container.register(
        TOKENS.geo_listDepartamentosUseCase,
        (c) =>
            new ListDepartamentosUseCase({
                departmentRepository: c.resolve(TOKENS.departmentRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints

    // ============================================
    // CONTROLLERS
    // ============================================
    container.register(
        TOKENS.geo_listDepartamentosController,
        (c) =>
            new ListDepartamentosController({
                listDepartamentosUseCase: c.resolve(TOKENS.geo_listDepartamentosUseCase),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Controllers cuando se implementen sus endpoints

    // ============================================
    // ROUTER
    // ============================================
    container.register(
        TOKENS.geo_departamentosRouter,
        (c) => {
            const controllers = {
                listDepartamentosController: c.resolve(TOKENS.geo_listDepartamentosController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(TOKENS.validateRequest),
            };

            return buildDepartamentosRouter({ controllers, middlewares });
        },
        { singleton: true }
    );

    return container;
}

