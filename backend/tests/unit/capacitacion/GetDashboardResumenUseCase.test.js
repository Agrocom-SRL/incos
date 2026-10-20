import { describe, it, expect, jest } from '@jest/globals';
import { GetDashboardResumenUseCase } from '../../../src/application/use-cases/dashboard/GetDashboardResumenUseCase.js';

describe('GetDashboardResumenUseCase', () => {
  const crear = () => {
    const deps = {
      dashboardRepository: {
        findActividadesRecientes: jest.fn().mockResolvedValue([{ id: 1 }]),
        countEstudiantesRegistradosHoyYMes: jest.fn().mockResolvedValue({ hoy: 2, mes: 9 }),
        findDocentesRecientes: jest.fn().mockResolvedValue([{ id: 2 }]),
        findEstudiantesRecientes: jest.fn().mockResolvedValue([{ id: 3 }]),
        findCarrerasDestacadas: jest.fn().mockResolvedValue([{ id: 4 }]),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new GetDashboardResumenUseCase(deps) };
  };

  it('compone el resumen con límites por defecto', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute();
    expect(deps.dashboardRepository.findActividadesRecientes).toHaveBeenCalledWith(12);
    expect(deps.dashboardRepository.findDocentesRecientes).toHaveBeenCalledWith(10);
    expect(deps.dashboardRepository.findEstudiantesRecientes).toHaveBeenCalledWith(10);
    expect(deps.dashboardRepository.findCarrerasDestacadas).toHaveBeenCalledWith(10);
    expect(res).toEqual({
      actividades: [{ id: 1 }],
      stats: { estudiantesRegistradosHoy: 2, estudiantesRegistradosMes: 9 },
      ultimosDocentes: [{ id: 2 }],
      ultimosEstudiantes: [{ id: 3 }],
      carreras: [{ id: 4 }],
    });
  });

  it('respeta los límites enviados, incluido 0', async () => {
    const { deps, useCase } = crear();
    await useCase.execute({
      actividadesLimit: 0,
      ultimosDocentesLimit: 3,
      ultimosEstudiantesLimit: 4,
      carrerasLimit: 5,
    });
    expect(deps.dashboardRepository.findActividadesRecientes).toHaveBeenCalledWith(0);
    expect(deps.dashboardRepository.findDocentesRecientes).toHaveBeenCalledWith(3);
    expect(deps.dashboardRepository.findEstudiantesRecientes).toHaveBeenCalledWith(4);
    expect(deps.dashboardRepository.findCarrerasDestacadas).toHaveBeenCalledWith(5);
  });

  it('propaga errores del repositorio', async () => {
    const { deps, useCase } = crear();
    deps.dashboardRepository.findDocentesRecientes.mockRejectedValue(new Error('db'));
    await expect(useCase.execute()).rejects.toThrow('db');
  });
});
