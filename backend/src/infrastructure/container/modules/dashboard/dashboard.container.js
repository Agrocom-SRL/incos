/**
 * Registro de dependencias del resumen del dashboard.
 */
import {
  ACADEMICO_TOKENS,
  DASHBOARD_TOKENS,
  REPOSITORIOS_TOKENS,
  SERVICIOS_TOKENS,
} from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { GetDashboardResumenUseCase } from '../../../../application/use-cases/dashboard/GetDashboardResumenUseCase.js';
import { GetMiDashboardResumenUseCase } from '../../../../application/use-cases/dashboard/GetMiDashboardResumenUseCase.js';
import { GetMiDashboardResumenDocenteUseCase } from '../../../../application/use-cases/dashboard/GetMiDashboardResumenDocenteUseCase.js';
import {
  GetDashboardResumenController,
  GetMiDashboardResumenController,
  GetMiDashboardResumenDocenteController,
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

  // Portal del rol docente: reusa la composición docente+cursos de mis-cursos
  // (GetMisCursosAsistenciaUseCase, módulo académico) en lugar de duplicar queries.
  registerComponent(
    container,
    DASHBOARD_TOKENS.getMiDashboardResumenDocenteUseCase,
    (c) =>
      new GetMiDashboardResumenDocenteUseCase({
        dashboardRepository: c.resolve(REPOSITORIOS_TOKENS.dashboardRepository),
        getMisCursosAsistenciaUseCase: c.resolve(ACADEMICO_TOKENS.getMisCursosAsistenciaUseCase),
        calificacionContextoRepository: c.resolve(
          REPOSITORIOS_TOKENS.calificacionContextoRepository
        ),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        logger: c.resolve(SERVICIOS_TOKENS.logger),
      })
  );

  registerComponent(
    container,
    DASHBOARD_TOKENS.getMiDashboardResumenDocenteController,
    (c) =>
      new GetMiDashboardResumenDocenteController({
        getMiDashboardResumenDocenteUseCase: c.resolve(
          DASHBOARD_TOKENS.getMiDashboardResumenDocenteUseCase
        ),
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
        getMiDashboardResumenDocenteController: c.resolve(
          DASHBOARD_TOKENS.getMiDashboardResumenDocenteController
        ),
      };
      return buildDashboardRouter({ controllers });
    }
  );

  return container;
}
