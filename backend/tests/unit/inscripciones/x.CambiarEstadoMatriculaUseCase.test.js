import { describe, it, expect, jest } from '@jest/globals';

const mockTransaction = jest.fn(async (fn) => fn('TX'));
jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { transaction: mockTransaction },
}));

const { CambiarEstadoMatriculaUseCase } = await import(
  '../../../src/application/use-cases/inscripciones/CambiarEstadoMatriculaUseCase.js'
);
const { NotFoundError } = await import('../../../src/domain/errors/AppError.js');

describe('CambiarEstadoMatriculaUseCase', () => {
  const crear = (enrollment = { id: 4 }) => {
    const deps = {
      enrollmentRepository: { findById: jest.fn().mockResolvedValue(enrollment) },
      subjectEnrollmentRepository: { marcarCursandoPorInscripcion: jest.fn().mockResolvedValue(3) },
      subjectEnrollmentBimesterRepository: {
        abrirBimestresFaltantesPorInscripcion: jest.fn().mockResolvedValue(undefined),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new CambiarEstadoMatriculaUseCase(deps) };
  };

  it('activa el cursado en una transacción y devuelve el conteo', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ inscripcionId: 4, userId: 8 });

    expect(deps.enrollmentRepository.findById).toHaveBeenCalledWith(4);
    expect(mockTransaction).toHaveBeenCalled();
    expect(deps.subjectEnrollmentRepository.marcarCursandoPorInscripcion).toHaveBeenCalledWith(4, 8, {
      transaction: 'TX',
    });
    expect(deps.subjectEnrollmentBimesterRepository.abrirBimestresFaltantesPorInscripcion).toHaveBeenCalledWith(
      4,
      8,
      { transaction: 'TX' }
    );
    expect(res).toEqual({ inscripcionId: 4, matriculasInscritoACursando: 3 });
  });

  it('userId por defecto es null', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ inscripcionId: 4 });
    expect(deps.subjectEnrollmentRepository.marcarCursandoPorInscripcion).toHaveBeenCalledWith(4, null, {
      transaction: 'TX',
    });
  });

  it('es idempotente: reejecutar con 0 matrículas devuelve 0', async () => {
    const { useCase, deps } = crear();
    deps.subjectEnrollmentRepository.marcarCursandoPorInscripcion.mockResolvedValue(0);
    const res = await useCase.execute({ inscripcionId: 4 });
    expect(res.matriculasInscritoACursando).toBe(0);
  });

  it('lanza NotFoundError si la inscripción no existe y no toca matrículas', async () => {
    const { useCase, deps } = crear(null);
    await expect(useCase.execute({ inscripcionId: 99 })).rejects.toThrow(NotFoundError);
    expect(deps.subjectEnrollmentRepository.marcarCursandoPorInscripcion).not.toHaveBeenCalled();
  });
});
