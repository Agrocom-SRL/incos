import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

const mockTransaction = jest.fn(async (fn) => fn('TX'));
jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { transaction: mockTransaction },
}));

const { ProgramarNivelacionUseCase } = await import(
  '../../../src/application/use-cases/academico/nivelaciones/ProgramarNivelacionUseCase.js'
);

describe('ProgramarNivelacionUseCase', () => {
  const crear = () => {
    const registrarEventoHistorialMatriculaUseCase = { execute: jest.fn().mockResolvedValue({ evento: { id: 70 } }) };
    const levelingRepository = { create: jest.fn().mockResolvedValue({ id: 3 }) };
    const logger = { info: jest.fn() };
    return {
      registrarEventoHistorialMatriculaUseCase,
levelingRepository,
logger,
      useCase: new ProgramarNivelacionUseCase({ registrarEventoHistorialMatriculaUseCase, levelingRepository, logger }),
    };
  };

  beforeEach(() => mockTransaction.mockClear());

  it('registra el evento y crea la nivelación PROGRAMADA en la misma transacción', async () => {
    const { useCase, registrarEventoHistorialMatriculaUseCase: evento, levelingRepository: repo } = crear();
    const res = await useCase.execute({
      usuarioId: 10,
subjectEnrollmentId: 9,
stateType: 'NIVELACION_1RA',
transitionDate: '2026-05-01',
      observations: 'obs',
managementId: 3,
evaluatorTeacherId: 7,
examDate: '2026-05-10',
    });
    expect(res).toEqual({ evento: { id: 70 }, nivelacion: { id: 3 } });
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(evento.execute).toHaveBeenCalledWith(
      { usuarioId: 10, subjectEnrollmentId: 9, enrollmentId: undefined, planSubjectId: undefined, stateType: 'NIVELACION_1RA', transitionDate: '2026-05-01', observations: 'obs' },
      { transaction: 'TX' },
    );
    expect(repo.create).toHaveBeenCalledWith(
      { subjectEnrollmentHistoryId: 70, managementId: 3, evaluatorTeacherId: 7, examDate: '2026-05-10', status: 'PROGRAMADA' },
      10,
      { transaction: 'TX' },
    );
  });

  it('los datos opcionales se envían como null', async () => {
    const { useCase, levelingRepository: repo } = crear();
    await useCase.execute({ usuarioId: 10, enrollmentId: 5, planSubjectId: 30, stateType: 'ARTICULO_18' });
    expect(repo.create.mock.calls[0][0]).toEqual({
      subjectEnrollmentHistoryId: 70, managementId: null, evaluatorTeacherId: null, examDate: null, status: 'PROGRAMADA',
    });
  });

  it.each([[undefined], ['ABANDONO'], ['RETIRADO'], ['nivelacion_1ra'], ['']])(
    'rechaza stateType que no es intento académico (%p) sin abrir transacción',
    async (stateType) => {
      const { useCase, registrarEventoHistorialMatriculaUseCase: evento, levelingRepository: repo } = crear();
      await expect(useCase.execute({ usuarioId: 10, subjectEnrollmentId: 9, stateType })).rejects.toBeInstanceOf(ValidationError);
      expect(mockTransaction).not.toHaveBeenCalled();
      expect(evento.execute).not.toHaveBeenCalled();
      expect(repo.create).not.toHaveBeenCalled();
    },
  );

  it('si el evento falla no crea la nivelación y propaga el error', async () => {
    const { useCase, registrarEventoHistorialMatriculaUseCase: evento, levelingRepository: repo } = crear();
    evento.execute.mockRejectedValue(new ValidationError('ancla'));
    await expect(useCase.execute({ usuarioId: 10, stateType: 'NIVELACION_1RA' })).rejects.toBeInstanceOf(ValidationError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('exige dependencias', () => {
    expect(() => new ProgramarNivelacionUseCase({ levelingRepository: {}, logger: {} })).toThrow(/requerido/);
    expect(() => new ProgramarNivelacionUseCase({ registrarEventoHistorialMatriculaUseCase: {}, logger: {} })).toThrow(/requerido/);
    expect(() => new ProgramarNivelacionUseCase({ registrarEventoHistorialMatriculaUseCase: {}, levelingRepository: {} })).toThrow(/requerido/);
  });
});
