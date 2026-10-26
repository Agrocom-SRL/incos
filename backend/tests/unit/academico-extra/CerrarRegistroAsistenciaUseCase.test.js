import { describe, it, expect, jest } from '@jest/globals';
import { CerrarRegistroAsistenciaUseCase } from '../../../src/application/use-cases/academico/asistencia/CerrarRegistroAsistenciaUseCase.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';
import { crearDepsAcceso, crearLogger } from './asistenciaTestUtils.js';

describe('CerrarRegistroAsistenciaUseCase', () => {
  const crear = ({ periodoId = 55, acceso } = {}) => {
    const deps = {
      ...crearDepsAcceso(acceso),
      cuadernoRepository: { obtenerPeriodoAcademicoId: jest.fn().mockResolvedValue(periodoId) },
      sesionClaseRepository: {
        cerrarSesionDia: jest.fn().mockResolvedValue({ sesionEstado: 'CERRADA' }),
        cerrarSesionesBimestre: jest.fn().mockResolvedValue(4),
      },
      logger: crearLogger(),
    };
    return { deps, useCase: new CerrarRegistroAsistenciaUseCase(deps) };
  };

  it('cierra un día puntual y devuelve el estado de la sesión', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ usuarioId: 10, asignacionId: '20', bimestre: '2', fecha: '2026-03-18' });
    expect(res).toEqual({ bimestre: 2, fecha: '2026-03-18', sesionEstado: 'CERRADA' });
    expect(deps.cuadernoRepository.obtenerPeriodoAcademicoId).toHaveBeenCalledWith(3, 2);
    expect(deps.sesionClaseRepository.cerrarSesionDia).toHaveBeenCalledWith(
      20, '2026-03-18', { periodoAcademicoId: 55 }, 10,
    );
    expect(deps.sesionClaseRepository.cerrarSesionesBimestre).not.toHaveBeenCalled();
  });

  it('cierra en lote por bimestre cuando no hay fecha', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ usuarioId: 10, asignacionId: 20, bimestre: 1 });
    expect(res).toEqual({ bimestre: 1, registroEstado: 'CERRADO', sesionesAfectadas: 4 });
    expect(deps.sesionClaseRepository.cerrarSesionesBimestre).toHaveBeenCalledWith(20, 55, 10);
    expect(deps.sesionClaseRepository.cerrarSesionDia).not.toHaveBeenCalled();
  });

  it.each([[0], [5], ['abc'], [undefined], [null]])(
    'rechaza bimestre inválido (%p) sin consultar repositorios',
    async (bimestre) => {
      const { useCase, deps } = crear();
      await expect(useCase.execute({ usuarioId: 10, asignacionId: 20, bimestre })).rejects.toBeInstanceOf(ValidationError);
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
    expect(deps.sesionClaseRepository.cerrarSesionesBimestre).not.toHaveBeenCalled();
  });

  it('permite a coordinación (permiso) cerrar un curso ajeno', async () => {
    const { useCase, deps } = crear({
      acceso: {
        teacherRepository: { findAll: jest.fn().mockResolvedValue([{ id: 99 }]) },
        authRepository: { tienePermiso: jest.fn().mockResolvedValue(true) },
      },
    });
    await useCase.execute({ usuarioId: 10, asignacionId: 20, bimestre: 1 });
    expect(deps.authRepository.tienePermiso).toHaveBeenCalledWith(10, 'academico.asistencia.registro.coordinacion', 'LISTAR');
    expect(deps.sesionClaseRepository.cerrarSesionesBimestre).toHaveBeenCalled();
  });

  it('lanza NotFoundError si el bimestre no tiene periodo académico', async () => {
    const { useCase, deps } = crear({ periodoId: null });
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 20, bimestre: 1 })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.sesionClaseRepository.cerrarSesionesBimestre).not.toHaveBeenCalled();
  });

  it('falla con 404 si no hay gestión vigente', async () => {
    const { useCase } = crear({
      acceso: { calificacionContextoRepository: { obtenerContextoVigente: jest.fn().mockResolvedValue(null) } },
    });
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 20, bimestre: 1 })).rejects.toMatchObject({ statusCode: 404 });
  });
  it.each([['abc'], ['2026-02-31'], ['31/01/2026']])(
    'rechaza fecha inválida (%p) con ValidationError sin tocar repositorios',
    async (fecha) => {
      const { useCase, deps } = crear();
      await expect(
        useCase.execute({ usuarioId: 10, asignacionId: 20, bimestre: 1, fecha }),
      ).rejects.toBeInstanceOf(ValidationError);
      expect(deps.sesionClaseRepository.cerrarSesionDia).not.toHaveBeenCalled();
      expect(deps.calificacionCoordinacionRepository.obtenerCursoPorAsignacion).not.toHaveBeenCalled();
    },
  );
});
