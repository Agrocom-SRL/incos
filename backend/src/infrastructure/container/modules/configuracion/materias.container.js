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

import { CONFIGURACION_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
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
    registerComponent(
        container,
        CONFIGURACION_TOKENS.listMateriasUseCase,
        (c) =>
            new ListMateriasUseCase({
                subjectRepository: c.resolve(REPOSITORIOS_TOKENS.subjectRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        CONFIGURACION_TOKENS.listMateriasController,
        (c) =>
            new ListMateriasController({
                listMateriasUseCase: c.resolve(CONFIGURACION_TOKENS.listMateriasUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    // TODO: Agregar otros Controllers cuando se implementen sus endpoints

    // ============================================
    // ROUTER
    // ============================================
    registerComponent(
        container,
        CONFIGURACION_TOKENS.materiasRouter,
        (c) => {
            const controllers = {
                listMateriasController: c.resolve(CONFIGURACION_TOKENS.listMateriasController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildMateriasRouter({ controllers, middlewares });
        }
    );

    return container;
}

