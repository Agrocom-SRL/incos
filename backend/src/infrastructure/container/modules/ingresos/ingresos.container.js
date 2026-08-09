/**
 * Registro de dependencias del recurso Ingresos (Finanzas · registro de ingresos)
 *
 * Responsabilidades:
 * - Registrar el Use Case ListIngresosUseCase
 * - Registrar el Controller ListIngresosController
 * - Construir y registrar el router /ingresos
 *
 * Principio SRP: este container maneja solo el recurso Ingresos. El
 * repositorio (INGRESOS_TOKENS.ingresoRepository) se registra en ./index.js.
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */

import { INGRESOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListIngresosUseCase } from '../../../../application/use-cases/ingresos/ListIngresosUseCase.js';
import { ListIngresosController } from '../../../../presentation/controllers/ingresos/index.js';
import { buildIngresosRouter } from '../../../../presentation/routes/ingresos.routes.js';

export function registerIngresosResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    registerComponent(
        container,
        INGRESOS_TOKENS.listIngresosUseCase,
        (c) =>
            new ListIngresosUseCase({
                ingresoRepository: c.resolve(INGRESOS_TOKENS.ingresoRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        INGRESOS_TOKENS.listIngresosController,
        (c) =>
            new ListIngresosController({
                listIngresosUseCase: c.resolve(INGRESOS_TOKENS.listIngresosUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    // ============================================
    // ROUTER
    // ============================================
    registerComponent(container, INGRESOS_TOKENS.ingresosRouter, (c) => {
        const controllers = {
            listIngresosController: c.resolve(INGRESOS_TOKENS.listIngresosController),
        };

        const middlewares = {
            validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
        };

        return buildIngresosRouter({ controllers, middlewares });
    });

    return container;
}
