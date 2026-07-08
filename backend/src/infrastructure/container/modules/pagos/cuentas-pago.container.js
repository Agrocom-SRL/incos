/**
 * Registro de dependencias del recurso Cuentas de Pago
 */

import { PAGOS_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListPaymentAccountsUseCase } from '../../../../application/use-cases/pagos/ListPaymentAccountsUseCase.js';
import { CreatePaymentAccountUseCase } from '../../../../application/use-cases/pagos/CreatePaymentAccountUseCase.js';
import { UpdatePaymentAccountUseCase } from '../../../../application/use-cases/pagos/UpdatePaymentAccountUseCase.js';
import { DeletePaymentAccountUseCase } from '../../../../application/use-cases/pagos/DeletePaymentAccountUseCase.js';
import { SetEstadoCuentaPagoUseCase } from '../../../../application/use-cases/pagos/SetEstadoCuentaPagoUseCase.js';
import {
    ListCuentasPagoController,
    CreateCuentaPagoController,
    UpdateCuentaPagoController,
    DeleteCuentaPagoController,
    SetEstadoCuentaPagoController,
} from '../../../../presentation/controllers/pagos/index.js';
import { buildCuentasPagoRouter } from '../../../../presentation/routes/cuentas-pago.routes.js';

export function registerCuentasPagoResource(container) {
    // USE CASES
    registerComponent(
        container,
        PAGOS_TOKENS.listPaymentAccountsUseCase,
        (c) =>
            new ListPaymentAccountsUseCase({
                paymentAccountRepository: c.resolve(REPOSITORIOS_TOKENS.paymentAccountRepository),
                finanzasUsosViewRepository: c.resolve(
                    REPOSITORIOS_TOKENS.finanzasUsosViewRepository,
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        PAGOS_TOKENS.createPaymentAccountUseCase,
        (c) =>
            new CreatePaymentAccountUseCase({
                paymentAccountRepository: c.resolve(REPOSITORIOS_TOKENS.paymentAccountRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        PAGOS_TOKENS.updatePaymentAccountUseCase,
        (c) =>
            new UpdatePaymentAccountUseCase({
                paymentAccountRepository: c.resolve(REPOSITORIOS_TOKENS.paymentAccountRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        PAGOS_TOKENS.deletePaymentAccountUseCase,
        (c) =>
            new DeletePaymentAccountUseCase({
                paymentAccountRepository: c.resolve(REPOSITORIOS_TOKENS.paymentAccountRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        PAGOS_TOKENS.setEstadoCuentaPagoUseCase,
        (c) =>
            new SetEstadoCuentaPagoUseCase({
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

    registerComponent(
        container,
        PAGOS_TOKENS.createCuentaPagoController,
        (c) =>
            new CreateCuentaPagoController({
                createPaymentAccountUseCase: c.resolve(PAGOS_TOKENS.createPaymentAccountUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        PAGOS_TOKENS.updateCuentaPagoController,
        (c) =>
            new UpdateCuentaPagoController({
                updatePaymentAccountUseCase: c.resolve(PAGOS_TOKENS.updatePaymentAccountUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        PAGOS_TOKENS.deleteCuentaPagoController,
        (c) =>
            new DeleteCuentaPagoController({
                deletePaymentAccountUseCase: c.resolve(PAGOS_TOKENS.deletePaymentAccountUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        PAGOS_TOKENS.setEstadoCuentaPagoController,
        (c) =>
            new SetEstadoCuentaPagoController({
                setEstadoCuentaPagoUseCase: c.resolve(PAGOS_TOKENS.setEstadoCuentaPagoUseCase),
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
                createCuentaPagoController: c.resolve(PAGOS_TOKENS.createCuentaPagoController),
                updateCuentaPagoController: c.resolve(PAGOS_TOKENS.updateCuentaPagoController),
                deleteCuentaPagoController: c.resolve(PAGOS_TOKENS.deleteCuentaPagoController),
                setEstadoCuentaPagoController: c.resolve(
                    PAGOS_TOKENS.setEstadoCuentaPagoController,
                ),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildCuentasPagoRouter({ controllers, middlewares });
        },
    );

    return container;
}
