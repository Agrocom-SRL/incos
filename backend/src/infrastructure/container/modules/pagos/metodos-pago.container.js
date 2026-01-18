/**
 * Registro de dependencias del recurso Métodos de Pago
 */

import { PAGOS_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListPaymentMethodsUseCase } from '../../../../application/use-cases/pagos/ListPaymentMethodsUseCase.js';
import { ListMetodosPagoController } from '../../../../presentation/controllers/pagos/index.js';
import { buildMetodosPagoRouter } from '../../../../presentation/routes/metodos-pago.routes.js';

export function registerMetodosPagoResource(container) {
    // USE CASES
    registerComponent(
        container,
        PAGOS_TOKENS.listPaymentMethodsUseCase,
        (c) =>
            new ListPaymentMethodsUseCase({
                paymentMethodRepository: c.resolve(REPOSITORIOS_TOKENS.paymentMethodRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    // CONTROLLERS
    registerComponent(
        container,
        PAGOS_TOKENS.listMetodosPagoController,
        (c) =>
            new ListMetodosPagoController({
                listPaymentMethodsUseCase: c.resolve(PAGOS_TOKENS.listPaymentMethodsUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    // ROUTER
    registerComponent(
        container,
        PAGOS_TOKENS.metodosPagoRouter,
        (c) => {
            const controllers = {
                listMetodosPagoController: c.resolve(PAGOS_TOKENS.listMetodosPagoController),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildMetodosPagoRouter({ controllers, middlewares });
        },
    );

    return container;
}
