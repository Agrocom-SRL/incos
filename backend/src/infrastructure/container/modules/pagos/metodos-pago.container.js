/**
 * Registro de dependencias del recurso Métodos de Pago
 */

import { PAGOS_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListPaymentMethodsUseCase } from '../../../../application/use-cases/pagos/ListPaymentMethodsUseCase.js';
import { UpdatePaymentMethodUseCase } from '../../../../application/use-cases/pagos/UpdatePaymentMethodUseCase.js';
import {
    ListMetodosPagoController,
    UpdateMetodoPagoController,
} from '../../../../presentation/controllers/pagos/index.js';
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

    registerComponent(
        container,
        PAGOS_TOKENS.updatePaymentMethodUseCase,
        (c) =>
            new UpdatePaymentMethodUseCase({
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

    registerComponent(
        container,
        PAGOS_TOKENS.updateMetodoPagoController,
        (c) =>
            new UpdateMetodoPagoController({
                updatePaymentMethodUseCase: c.resolve(PAGOS_TOKENS.updatePaymentMethodUseCase),
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
                updateMetodoPagoController: c.resolve(PAGOS_TOKENS.updateMetodoPagoController),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildMetodosPagoRouter({ controllers, middlewares });
        },
    );

    return container;
}
