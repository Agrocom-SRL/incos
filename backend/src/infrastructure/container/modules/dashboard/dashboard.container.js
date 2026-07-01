/**
 * Registro de dependencias del resumen del dashboard.
 */
import { DASHBOARD_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { GetDashboardResumenUseCase } from '../../../../application/use-cases/dashboard/GetDashboardResumenUseCase.js';
import { GetMiDashboardResumenUseCase } from '../../../../application/use-cases/dashboard/GetMiDashboardResumenUseCase.js';
import {
  GetDashboardResumenController,
  GetMiDashboardResumenController,
} from '../../../../presentation/controllers/dashboard/index.js';
import { buildDashboardRouter } from '../../../../presentation/routes/dashboard.routes.js';

export function registerDashboardModule(container) {
  registerComponent(
    container,
    DASHBOARD_TOKENS.getDashboardResumenUseCase,
    (c) =>
      new GetDashboardResumenUseCase({
        dashboardRepository: c.resolve(REPOSITORIOS_TOKENS.dashboardRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DASHBOARD_TOKENS.getDashboardResumenController,
    (c) =>
      new GetDashboardResumenController({
        getDashboardResumenUseCase: c.resolve(DASHBOARD_TOKENS.getDashboardResumenUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    DASHBOARD_TOKENS.getMiDashboardResumenUseCase,
    (c) =>
      new GetMiDashboardResumenUseCase({
        dashboardRepository: c.resolve(REPOSITORIOS_TOKENS.dashboardRepository),
        studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DASHBOARD_TOKENS.getMiDashboardResumenController,
    (c) =>
      new GetMiDashboardResumenController({
        getMiDashboardResumenUseCase: c.resolve(DASHBOARD_TOKENS.getMiDashboardResumenUseCase),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    DASHBOARD_TOKENS.dashboardRouter,
    (c) => {
      const controllers = {
        getDashboardResumenController: c.resolve(DASHBOARD_TOKENS.getDashboardResumenController),
        getMiDashboardResumenController: c.resolve(
          DASHBOARD_TOKENS.getMiDashboardResumenController
        ),
      };
      return buildDashboardRouter({ controllers });
    }
  );

  return container;
}
