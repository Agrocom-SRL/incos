import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

const mockTransaction = jest.fn(async (fn) => fn('TX'));
jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { transaction: mockTransaction },
}));

const { RegistrarDecisionAdministrativaUseCase } = await import(
  '../../../src/application/use-cases/academico/nivelaciones/RegistrarDecisionAdministrativaUseCase.js'
);

describe('RegistrarDecisionAdministrativaUseCase', () => {
  const crear = ({ matricula = { id: 9 } } = {}) => {
    const registrarEventoHistorialMatriculaUseCase = { execute: jest.fn().mockResolvedValue({ evento: { id: 70 } }) };
    const subjectEnrollmentRepository = {
      findById: jest.fn().mockResolvedValue(matricula),
      update: jest.fn().mockResolvedValue({}),
    };
    const logger = { info: jest.fn() };
    return {
      registrarEventoHistorialMatriculaUseCase,
subjectEnrollmentRepository,
      useCase: new RegistrarDecisionAdministrativaUseCase({ registrarEventoHistorialMatriculaUseCase, subjectEnrollmentRepository, logger }),
    };
  };

  beforeEach(() => mockTransaction.mockClear());

  it.each(['ABANDONO', 'RETIRADO'])('registra %s con nota forzada y sincroniza el estado de la matrícula', async (stateType) => {
    const { useCase, registrarEventoHistorialMatriculaUseCase: evento, subjectEnrollmentRepository: repo } = crear();
    const res = await useCase.execute({
      usuarioId: 10, subjectEnrollmentId: '9', stateType, resultingGrade: 30, transitionDate: '2026-05-01', observations: 'obs',
    });
    expect(res).toEqual({ evento: { id: 70 } });
    expect(repo.findById).toHaveBeenCalledWith(9);
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(evento.execute).toHaveBeenCalledWith(
      { usuarioId: 10, subjectEnrollmentId: 9, stateType, transitionDate: '2026-05-01', resultingGrade: 30, forcedGrade: true, observations: 'obs' },
      { transaction: 'TX' },
    );
    expect(repo.update).toHaveBeenCalledWith(9, { status: stateType }, 10, { transaction: 'TX' });
  });

  it.each([[undefined], ['NIVELACION_1RA'], ['abandono'], ['']])('rechaza stateType que no es decisión administrativa (%p)', async (stateType) => {
    const { useCase, subjectEnrollmentRepository: repo } = crear();
    await expect(
      useCase.execute({ usuarioId: 10, subjectEnrollmentId: 9, stateType, resultingGrade: 30 }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(repo.findById).not.toHaveBeenCalled();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it.each([[undefined], [null], ['abc'], [0], [-2], ['']])('rechaza subjectEnrollmentId inválido (%p)', async (subjectEnrollmentId) => {
    const { useCase, subjectEnrollmentRepository: repo } = crear();
    await expect(
      useCase.execute({ usuarioId: 10, subjectEnrollmentId, stateType: 'ABANDONO', resultingGrade: 30 }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(repo.findById).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si la matrícula no existe', async () => {
    const { useCase, registrarEventoHistorialMatriculaUseCase: evento, subjectEnrollmentRepository: repo } = crear({ matricula: null });
    await expect(
      useCase.execute({ usuarioId: 10, subjectEnrollmentId: 9, stateType: 'ABANDONO', resultingGrade: 30 }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(evento.execute).not.toHaveBeenCalled();
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('si el evento falla no actualiza la matrícula', async () => {
    const { useCase, registrarEventoHistorialMatriculaUseCase: evento, subjectEnrollmentRepository: repo } = crear();
    evento.execute.mockRejectedValue(new ValidationError('nota'));
    await expect(
      useCase.execute({ usuarioId: 10, subjectEnrollmentId: 9, stateType: 'ABANDONO', resultingGrade: 500 }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('exige dependencias', () => {
    expect(() => new RegistrarDecisionAdministrativaUseCase({ subjectEnrollmentRepository: {}, logger: {} })).toThrow(/requerido/);
    expect(() => new RegistrarDecisionAdministrativaUseCase({ registrarEventoHistorialMatriculaUseCase: {}, logger: {} })).toThrow(/requerido/);
    expect(() => new RegistrarDecisionAdministrativaUseCase({ registrarEventoHistorialMatriculaUseCase: {}, subjectEnrollmentRepository: {} })).toThrow(/requerido/);
  });
});
