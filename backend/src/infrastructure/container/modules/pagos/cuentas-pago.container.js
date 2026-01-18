/**
 * Registro de dependencias del recurso Cuentas de Pago
 */

import { PAGOS_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListPaymentAccountsUseCase } from '../../../../application/use-cases/pagos/ListPaymentAccountsUseCase.js';
import { ListCuentasPagoController } from '../../../../presentation/controllers/pagos/index.js';
import { buildCuentasPagoRouter } from '../../../../presentation/routes/cuentas-pago.routes.js';

export function registerCuentasPagoResource(container) {
    // USE CASES
    registerComponent(
        container,
        PAGOS_TOKENS.listPaymentAccountsUseCase,
        (c) =>
            new ListPaymentAccountsUseCase({
                paymentAccountRepository: c.resolve(REPOSITORIOS_TOKENS.paymentAccountRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    // CONTROLLERS
    registerComponent(
        container,
        PAGOS_TOKENS.listCuentasPagoController,
        (c) =>
            new ListCuentasPagoController({
                listPaymentAccountsUseCase: c.resolve(PAGOS_TOKENS.listPaymentAccountsUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    // ROUTER
    registerComponent(
        container,
        PAGOS_TOKENS.cuentasPagoRouter,
        (c) => {
            const controllers = {
                listCuentasPagoController: c.resolve(PAGOS_TOKENS.listCuentasPagoController),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildCuentasPagoRouter({ controllers, middlewares });
        },
    );

    return container;
}
