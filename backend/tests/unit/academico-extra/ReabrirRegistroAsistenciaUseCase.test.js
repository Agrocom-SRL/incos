import { describe, it, expect, jest } from '@jest/globals';
import { ReabrirRegistroAsistenciaUseCase } from '../../../src/application/use-cases/academico/asistencia/ReabrirRegistroAsistenciaUseCase.js';
import { ForbiddenError, NotFoundError } from '../../../src/domain/errors/AppError.js';
import { crearDepsAcceso, crearLogger } from './asistenciaTestUtils.js';

describe('ReabrirRegistroAsistenciaUseCase', () => {
  const crear = ({ periodoId = 55, acceso } = {}) => {
    const deps = {
      ...crearDepsAcceso(acceso),
      cuadernoRepository: { obtenerPeriodoAcademicoId: jest.fn().mockResolvedValue(periodoId) },
      sesionClaseRepository: {
        reabrirSesionDia: jest.fn().mockResolvedValue({ sesionEstado: 'ABIERTA' }),
        reabrirSesionesBimestre: jest.fn().mockResolvedValue(4),
      },
      logger: crearLogger(),
    };
    return { deps, useCase: new ReabrirRegistroAsistenciaUseCase(deps) };
  };

  it('reabre un día puntual y devuelve el estado de la sesión', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ usuarioId: 10, asignacionId: '20', bimestre: '2', fecha: '2026-03-18' });
    expect(res).toEqual({ bimestre: 2, fecha: '2026-03-18', sesionEstado: 'ABIERTA' });
    expect(deps.cuadernoRepository.obtenerPeriodoAcademicoId).toHaveBeenCalledWith(3, 2);
    expect(deps.sesionClaseRepository.reabrirSesionDia).toHaveBeenCalledWith(
      20, '2026-03-18', 10,
    );
    expect(deps.sesionClaseRepository.reabrirSesionesBimestre).not.toHaveBeenCalled();
  });

  it('reabre en lote por bimestre cuando no hay fecha', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ usuarioId: 10, asignacionId: 20, bimestre: 1 });
    expect(res).toEqual({ bimestre: 1, registroEstado: 'ABIERTO', sesionesAfectadas: 4 });
    expect(deps.sesionClaseRepository.reabrirSesionesBimestre).toHaveBeenCalledWith(20, 55, 10);
    expect(deps.sesionClaseRepository.reabrirSesionDia).not.toHaveBeenCalled();
  });

  it.each([[0], [5], ['abc'], [undefined], [null]])(
    'rechaza bimestre inválido (%p) sin consultar repositorios',
    async (bimestre) => {
      const { useCase, deps } = crear();
      await expect(useCase.execute({ usuarioId: 10, asignacionId: 20, bimestre })).rejects.toBeInstanceOf(NotFoundError);
      expect(deps.calificacionCoordinacionRepository.obtenerCursoPorAsignacion).not.toHaveBeenCalled();
    },
  );

  it('rechaza asignacionId no numérico (NaN) como asignación inexistente', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 'x', bimestre: 1 })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza NotFoundError si el curso no existe', async () => {
    const { useCase } = crear({
      acceso: { calificacionCoordinacionRepository: { obtenerCursoPorAsignacion: jest.fn().mockResolvedValue(null) } },
    });
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 20, bimestre: 1 })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza ForbiddenError si no es docente del curso ni coordinación', async () => {
    const { useCase, deps } = crear({ acceso: { teacherRepository: { findAll: jest.fn().mockResolvedValue([{ id: 99 }]) } } });
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 20, bimestre: 1 })).rejects.toBeInstanceOf(ForbiddenError);
    expect(deps.sesionClaseRepository.reabrirSesionesBimestre).not.toHaveBeenCalled();
  });

  it('permite a coordinación (permiso) reabrir un curso ajeno', async () => {
    const { useCase, deps } = crear({
      acceso: {
        teacherRepository: { findAll: jest.fn().mockResolvedValue([{ id: 99 }]) },
        authRepository: { tienePermiso: jest.fn().mockResolvedValue(true) },
      },
    });
    await useCase.execute({ usuarioId: 10, asignacionId: 20, bimestre: 1 });
    expect(deps.authRepository.tienePermiso).toHaveBeenCalledWith(10, 'academico.asistencia.registro.coordinacion', 'LISTAR');
    expect(deps.sesionClaseRepository.reabrirSesionesBimestre).toHaveBeenCalled();
  });

  it('lanza NotFoundError si el bimestre no tiene periodo académico', async () => {
    const { useCase, deps } = crear({ periodoId: null });
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 20, bimestre: 1 })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.sesionClaseRepository.reabrirSesionesBimestre).not.toHaveBeenCalled();
  });

  it('falla con 404 si no hay gestión vigente', async () => {
    const { useCase } = crear({
      acceso: { calificacionContextoRepository: { obtenerContextoVigente: jest.fn().mockResolvedValue(null) } },
    });
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 20, bimestre: 1 })).rejects.toMatchObject({ statusCode: 404 });
  });
});
