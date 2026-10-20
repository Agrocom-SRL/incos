import { describe, it, expect, jest } from '@jest/globals';
import { GetMiDashboardResumenUseCase } from '../../../src/application/use-cases/dashboard/GetMiDashboardResumenUseCase.js';
import { ForbiddenError } from '../../../src/domain/errors/AppError.js';

describe('GetMiDashboardResumenUseCase', () => {
  const crear = ({ vinculado = true, carrera = { id: 1, codigo: 'C', nombre: 'Carrera', color_hex: '#fff', imagen_ruta: 'x.png' }, saldo = 10.6 } = {}) => {
    const deps = {
      dashboardRepository: {
        findEstudianteResumen: jest.fn().mockResolvedValue({ id: 5 }),
        findCarreraDeEstudiante: jest.fn().mockResolvedValue(carrera),
        findDocentesDeEstudiante: jest.fn().mockResolvedValue([{ id: 1 }]),
        findActividadesDeEstudiante: jest.fn().mockResolvedValue([{ id: 2 }]),
        countSesionesUsuarioHoyYMes: jest.fn().mockResolvedValue({ hoy: 1, mes: 7 }),
        findSaldoPendienteEstudiante: jest.fn().mockResolvedValue(saldo),
      },
      studentRepository: {
        findAll: jest.fn().mockResolvedValue(vinculado ? [{ id: 5 }] : []),
        findById: jest.fn(),
      },
      userRepository: { findById: jest.fn().mockResolvedValue(null) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new GetMiDashboardResumenUseCase(deps) };
  };

  it('arma el resumen del estudiante de la sesión', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute({ usuarioId: 20, docentesLimit: 3, actividadesLimit: 4 });
    expect(deps.studentRepository.findAll).toHaveBeenCalledWith({ userId: 20 });
    expect(deps.dashboardRepository.findDocentesDeEstudiante).toHaveBeenCalledWith(5, 3);
    expect(deps.dashboardRepository.findActividadesDeEstudiante).toHaveBeenCalledWith(5, 4);
    expect(deps.dashboardRepository.countSesionesUsuarioHoyYMes).toHaveBeenCalledWith(20);
    expect(res).toEqual({
      estudiante: { id: 5 },
      carrera: { id: 1, codigo: 'C', nombre: 'Carrera', colorHex: '#fff', imagenRuta: 'x.png' },
      docentes: [{ id: 1 }],
      actividades: [{ id: 2 }],
      stats: { sesionesHoy: 1, sesionesMes: 7 },
      saldoPendiente: 11,
    });
  });

  it('usa límites 10 por defecto, carrera null y saldo no numérico -> 0', async () => {
    const { deps, useCase } = crear({ carrera: null, saldo: 'abc' });
    const res = await useCase.execute({ usuarioId: 20 });
    expect(deps.dashboardRepository.findDocentesDeEstudiante).toHaveBeenCalledWith(5, 10);
    expect(res.carrera).toBeNull();
    expect(res.saldoPendiente).toBe(0);
  });

  it('colorHex e imagenRuta ausentes pasan a null', async () => {
    const { useCase } = crear({ carrera: { id: 1, codigo: 'C', nombre: 'N' } });
    const res = await useCase.execute({ usuarioId: 20 });
    expect(res.carrera).toMatchObject({ colorHex: null, imagenRuta: null });
  });

  it('lanza ForbiddenError si el usuario no está vinculado a un estudiante', async () => {
    const { deps, useCase } = crear({ vinculado: false });
    await expect(useCase.execute({ usuarioId: 20 })).rejects.toBeInstanceOf(ForbiddenError);
    expect(deps.dashboardRepository.findEstudianteResumen).not.toHaveBeenCalled();
  });

  it('exige las dependencias en el constructor', () => {
    expect(() => new GetMiDashboardResumenUseCase({})).toThrow('dashboardRepository es requerido');
    expect(() => new GetMiDashboardResumenUseCase({ dashboardRepository: {} })).toThrow('studentRepository');
    expect(() => new GetMiDashboardResumenUseCase({ dashboardRepository: {}, studentRepository: {} })).toThrow('userRepository');
    expect(
      () => new GetMiDashboardResumenUseCase({ dashboardRepository: {}, studentRepository: {}, userRepository: {} })
    ).toThrow('logger');
  });
});
