import { ObtenerDashboardResumenUseCase } from '@useCases/dashboard';
import DashboardRepository from '@infrastructure/repositories/DashboardRepository';

/**
 * @param {Object} factory
 */
export function registerDashboardModule(factory) {
  const dashboardRepository = DashboardRepository;

  factory.obtenerDashboardResumen = () => {
    return new ObtenerDashboardResumenUseCase({ dashboardRepository });
  };

  return factory;
}
