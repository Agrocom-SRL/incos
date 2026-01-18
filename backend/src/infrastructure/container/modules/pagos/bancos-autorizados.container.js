/**
 * Registro de dependencias del recurso Bancos Autorizados
 */

import { PAGOS_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListAuthorizedBanksUseCase } from '../../../../application/use-cases/pagos/ListAuthorizedBanksUseCase.js';
import { ListBancosAutorizadosController } from '../../../../presentation/controllers/pagos/index.js';
import { buildBancosAutorizadosRouter } from '../../../../presentation/routes/bancos-autorizados.routes.js';

export function registerBancosAutorizadosResource(container) {
    // USE CASES
    registerComponent(
        container,
        PAGOS_TOKENS.listAuthorizedBanksUseCase,
        (c) =>
            new ListAuthorizedBanksUseCase({
                authorizedBankRepository: c.resolve(REPOSITORIOS_TOKENS.authorizedBankRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    // CONTROLLERS
    registerComponent(
        container,
        PAGOS_TOKENS.listBancosAutorizadosController,
        (c) =>
            new ListBancosAutorizadosController({
                listAuthorizedBanksUseCase: c.resolve(PAGOS_TOKENS.listAuthorizedBanksUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    // ROUTER
    registerComponent(
        container,
        PAGOS_TOKENS.bancosAutorizadosRouter,
        (c) => {
            const controllers = {
                listBancosAutorizadosController: c.resolve(PAGOS_TOKENS.listBancosAutorizadosController),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildBancosAutorizadosRouter({ controllers, middlewares });
        },
    );

    return container;
}
