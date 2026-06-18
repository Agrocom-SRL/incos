/**
 * Registro de dependencias del recurso Configuración de Aportes
 */

import { PAGOS_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListContributionConfigurationsUseCase } from '../../../../application/use-cases/pagos/ListContributionConfigurationsUseCase.js';
import { CreateContributionConfigurationUseCase } from '../../../../application/use-cases/pagos/CreateContributionConfigurationUseCase.js';
import { UpdateContributionConfigurationUseCase } from '../../../../application/use-cases/pagos/UpdateContributionConfigurationUseCase.js';
import {
    ListConfiguracionAportesController,
    CreateConfiguracionAporteController,
    UpdateConfiguracionAporteController,
} from '../../../../presentation/controllers/pagos/index.js';
import { buildConfiguracionAportesRouter } from '../../../../presentation/routes/configuracion-aportes.routes.js';

export function registerConfiguracionAportesResource(container) {
    // USE CASES
    registerComponent(
        container,
        PAGOS_TOKENS.listContributionConfigurationsUseCase,
        (c) =>
            new ListContributionConfigurationsUseCase({
                contributionConfigurationRepository: c.resolve(REPOSITORIOS_TOKENS.contributionConfigurationRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        PAGOS_TOKENS.createContributionConfigurationUseCase,
        (c) =>
            new CreateContributionConfigurationUseCase({
                contributionConfigurationRepository: c.resolve(REPOSITORIOS_TOKENS.contributionConfigurationRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    registerComponent(
        container,
        PAGOS_TOKENS.updateContributionConfigurationUseCase,
        (c) =>
            new UpdateContributionConfigurationUseCase({
                contributionConfigurationRepository: c.resolve(REPOSITORIOS_TOKENS.contributionConfigurationRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            }),
    );

    // CONTROLLERS
    registerComponent(
        container,
        PAGOS_TOKENS.listConfiguracionAportesController,
        (c) =>
            new ListConfiguracionAportesController({
                listContributionConfigurationsUseCase: c.resolve(PAGOS_TOKENS.listContributionConfigurationsUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        PAGOS_TOKENS.createConfiguracionAporteController,
        (c) =>
            new CreateConfiguracionAporteController({
                createContributionConfigurationUseCase: c.resolve(PAGOS_TOKENS.createContributionConfigurationUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    registerComponent(
        container,
        PAGOS_TOKENS.updateConfiguracionAporteController,
        (c) =>
            new UpdateConfiguracionAporteController({
                updateContributionConfigurationUseCase: c.resolve(PAGOS_TOKENS.updateContributionConfigurationUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            }),
    );

    // ROUTER
    registerComponent(
        container,
        PAGOS_TOKENS.configuracionAportesRouter,
        (c) => {
            const controllers = {
                listConfiguracionAportesController: c.resolve(PAGOS_TOKENS.listConfiguracionAportesController),
                createConfiguracionAporteController: c.resolve(PAGOS_TOKENS.createConfiguracionAporteController),
                updateConfiguracionAporteController: c.resolve(PAGOS_TOKENS.updateConfiguracionAporteController),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildConfiguracionAportesRouter({ controllers, middlewares });
        },
    );

    return container;
}
