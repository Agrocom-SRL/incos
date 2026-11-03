import { jest } from '@jest/globals';
import { ReabrirBimestreCursoUseCase } from '../../../src/application/use-cases/academico/ReabrirBimestreCursoUseCase.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('ReabrirBimestreCursoUseCase', () => {
  const crear = ({ curso = { docente_id: 7 }, esAdmin = true, reabiertos = 5 } = {}) => {
    const deps = {
      calificacionCoordinacionRepository: {
        obtenerCursoPorAsignacion: jest.fn().mockResolvedValue(curso),
      },
      calificacionContextoRepository: {
        obtenerContextoVigente: jest
          .fn()
          .mockResolvedValue({ gestion_id: 3, bimestre_vigente: 2 }),
      },
      subjectEnrollmentBimesterRepository: {
        asegurarBimestresMatriculaCurso: jest.fn().mockResolvedValue(undefined),
        reabrirBimestreCurso: jest.fn().mockResolvedValue(undefined),
        contarBimestreReabiertoCurso: jest.fn().mockResolvedValue(reabiertos),
      },
      teacherRepository: { findAll: jest.fn().mockResolvedValue([{ id: 7 }]) },
      userRepository: { findById: jest.fn() },
      authRepository: { tienePermiso: jest.fn().mockResolvedValue(esAdmin) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ReabrirBimestreCursoUseCase(deps) };
  };

  it('reabre el bimestre cuando el usuario es administrativo', async () => {
    const { useCase, deps } = crear();
    const result = await useCase.execute({ usuarioId: 1, asignacionId: '10', bimestreNum: '1' });

    const repo = deps.subjectEnrollmentBimesterRepository;
    expect(deps.authRepository.tienePermiso).toHaveBeenCalledWith(
      1,
      'academico.calificacion.gestion_bimestres',
      'EDITAR',
    );
    expect(repo.asegurarBimestresMatriculaCurso).toHaveBeenCalledWith(10, 2, 1);
    expect(repo.reabrirBimestreCurso).toHaveBeenCalledWith(10, 1, 1);
    expect(result).toEqual({ bimestre: 1, reabierto: true, matriculasReabiertas: 5 });
  });

  it('acepta el permiso ajuste_admin si no tiene gestion_bimestres', async () => {
    const { useCase, deps } = crear();
    deps.authRepository.tienePermiso.mockImplementation(async (_u, codigo) =>
      codigo === 'academico.calificacion.bimestre.ajuste_admin',
    );
    const result = await useCase.execute({ usuarioId: 1, asignacionId: 10, bimestreNum: 3 });
    expect(result.reabierto).toBe(true);
  });

  it('el docente del curso (sin rol administrativo) NO puede reabrir', async () => {
    const { useCase, deps } = crear({ curso: { docente_id: 7 }, esAdmin: false });
    await expect(
      useCase.execute({ usuarioId: 1, asignacionId: 10, bimestreNum: 1 }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(deps.subjectEnrollmentBimesterRepository.reabrirBimestreCurso).not.toHaveBeenCalled();
  });

  it('lanza NotFound si el curso no existe', async () => {
    const { useCase, deps } = crear({ curso: null });
    await expect(
      useCase.execute({ usuarioId: 1, asignacionId: 10, bimestreNum: 1 }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.subjectEnrollmentBimesterRepository.reabrirBimestreCurso).not.toHaveBeenCalled();
  });

  it('lanza NotFound si la asignación no es un id válido', async () => {
    const { useCase, deps } = crear();
    await expect(
      useCase.execute({ usuarioId: 1, asignacionId: 'abc', bimestreNum: 1 }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.calificacionCoordinacionRepository.obtenerCursoPorAsignacion).not.toHaveBeenCalled();
  });

  it.each([[0], [5], ['x'], [undefined]])('rechaza el bimestre inválido %s', async (bimestreNum) => {
    const { useCase, deps } = crear();
    await expect(
      useCase.execute({ usuarioId: 1, asignacionId: 10, bimestreNum }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(deps.calificacionCoordinacionRepository.obtenerCursoPorAsignacion).not.toHaveBeenCalled();
  });

  it('falla con ValidationError si no quedó ninguna matrícula reabierta', async () => {
    const { useCase, deps } = crear({ reabiertos: 0 });
    await expect(
      useCase.execute({ usuarioId: 1, asignacionId: 10, bimestreNum: 1 }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(deps.logger.info).not.toHaveBeenCalled();
  });

  it('lanza 404 si no hay gestión vigente', async () => {
    const { useCase, deps } = crear();
    deps.calificacionContextoRepository.obtenerContextoVigente.mockResolvedValue(null);
    await expect(
      useCase.execute({ usuarioId: 1, asignacionId: 10, bimestreNum: 1 }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
