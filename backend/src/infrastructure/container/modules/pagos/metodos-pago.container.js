/**
 * Registro de dependencias del recurso Métodos de Pago
 */

import { PAGOS_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListPaymentMethodsUseCase } from '../../../../application/use-cases/pagos/ListPaymentMethodsUseCase.js';
import { UpdatePaymentMethodUseCase } from '../../../../application/use-cases/pagos/UpdatePaymentMethodUseCase.js';
import { SetEstadoMetodoPagoUseCase } from '../../../../application/use-cases/pagos/SetEstadoMetodoPagoUseCase.js';
import {
    ListMetodosPagoController,
    UpdateMetodoPagoController,
    SetEstadoMetodoPagoController,
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
                finanzasUsosViewRepository: c.resolve(
                    REPOSITORIOS_TOKENS.finanzasUsosViewRepository,
                ),
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

    registerComponent(
        container,
        PAGOS_TOKENS.setEstadoMetodoPagoUseCase,
        (c) =>
            new SetEstadoMetodoPagoUseCase({
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

    registerComponent(
        container,
        PAGOS_TOKENS.setEstadoMetodoPagoController,
        (c) =>
            new SetEstadoMetodoPagoController({
                setEstadoMetodoPagoUseCase: c.resolve(PAGOS_TOKENS.setEstadoMetodoPagoUseCase),
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
                setEstadoMetodoPagoController: c.resolve(
                    PAGOS_TOKENS.setEstadoMetodoPagoController,
                ),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildMetodosPagoRouter({ controllers, middlewares });
        },
    );

    return container;
}
