/**
 * Registro de dependencias del recurso Materias
 * 
 * Responsabilidades:
 * - Registrar Use Cases del recurso Materias
 * - Registrar Controllers del recurso Materias
 * - Construir y registrar el router del recurso Materias
 * 
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Materias registrado
 */

import { TOKENS } from '../../tokens.js';
import { ListMateriasUseCase } from '../../../../application/use-cases/configuracion/ListMateriasUseCase.js';
import { ListMateriasController } from '../../../../presentation/controllers/configuracion/index.js';
import { buildMateriasRouter } from '../../../../presentation/routes/materias.routes.js';

/**
 * Registra el recurso Materias en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerMateriasResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    container.register(
        TOKENS.cfg_listMateriasUseCase,
        (c) =>
            new ListMateriasUseCase({
                subjectRepository: c.resolve(TOKENS.subjectRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints

    // ============================================
    // CONTROLLERS
    // ============================================
    container.register(
        TOKENS.cfg_listMateriasController,
        (c) =>
            new ListMateriasController({
                listMateriasUseCase: c.resolve(TOKENS.cfg_listMateriasUseCase),
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
        TOKENS.cfg_materiasRouter,
        (c) => {
            const controllers = {
                listMateriasController: c.resolve(TOKENS.cfg_listMateriasController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(TOKENS.validateRequest),
            };

            return buildMateriasRouter({ controllers, middlewares });
        },
        { singleton: true }
    );

    return container;
}

