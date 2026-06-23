/**
 * Registro de dependencias del recurso Bancos Autorizados
 */

import { PAGOS_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListAuthorizedBanksUseCase } from '../../../../application/use-cases/pagos/ListAuthorizedBanksUseCase.js';
import { CreateAuthorizedBankUseCase } from '../../../../application/use-cases/pagos/CreateAuthorizedBankUseCase.js';
import { UpdateAuthorizedBankUseCase } from '../../../../application/use-cases/pagos/UpdateAuthorizedBankUseCase.js';
import {
    ListBancosAutorizadosController,
    CreateBancoAutorizadoController,
    UpdateBancoAutorizadoController,
} from '../../../../presentation/controllers/pagos/index.js';
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

    registerComponent(
        container,
        PAGOS_TOKENS.createAuthorizedBankUseCase,
        (c) =>
            new CreateAuthorizedBankUseCase({
                authorizedBankRepository: c.resolve(REPOSITORIOS_TOKENS.authorizedBankRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        PAGOS_TOKENS.updateAuthorizedBankUseCase,
        (c) =>
            new UpdateAuthorizedBankUseCase({
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

    registerComponent(
        container,
        PAGOS_TOKENS.createBancoAutorizadoController,
        (c) =>
            new CreateBancoAutorizadoController({
                createAuthorizedBankUseCase: c.resolve(PAGOS_TOKENS.createAuthorizedBankUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        PAGOS_TOKENS.updateBancoAutorizadoController,
        (c) =>
            new UpdateBancoAutorizadoController({
                updateAuthorizedBankUseCase: c.resolve(PAGOS_TOKENS.updateAuthorizedBankUseCase),
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
                createBancoAutorizadoController: c.resolve(PAGOS_TOKENS.createBancoAutorizadoController),
                updateBancoAutorizadoController: c.resolve(PAGOS_TOKENS.updateBancoAutorizadoController),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildBancosAutorizadosRouter({ controllers, middlewares });
        },
    );

    return container;
}
