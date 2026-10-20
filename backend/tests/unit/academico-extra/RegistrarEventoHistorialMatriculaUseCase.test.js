import { describe, it, expect, jest } from '@jest/globals';
import { RegistrarEventoHistorialMatriculaUseCase } from '../../../src/application/use-cases/academico/nivelaciones/RegistrarEventoHistorialMatriculaUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('RegistrarEventoHistorialMatriculaUseCase', () => {
  const crear = () => {
    const repo = {
      expireCurrentBySubjectEnrollmentId: jest.fn().mockResolvedValue(1),
      expireCurrentByAlternateAnchor: jest.fn().mockResolvedValue(1),
      create: jest.fn().mockResolvedValue({ id: 70 }),
    };
    const logger = { info: jest.fn() };
    return { repo, logger, useCase: new RegistrarEventoHistorialMatriculaUseCase({ subjectEnrollmentHistoryRepository: repo, logger }) };
  };

  it('ancla en matrícula cursada: expira el vigente y crea el evento', async () => {
    const { useCase, repo } = crear();
    const res = await useCase.execute(
      { usuarioId: 10, subjectEnrollmentId: '9', stateType: 'NIVELACION_1RA', transitionDate: '2026-05-01', observations: '  obs  ' },
      { transaction: 'TX' },
    );
    expect(res).toEqual({ evento: { id: 70 } });
    expect(repo.expireCurrentBySubjectEnrollmentId).toHaveBeenCalledWith(9, 10, { transaction: 'TX' });
    expect(repo.expireCurrentByAlternateAnchor).not.toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        subjectEnrollmentId: 9,
stateType: 'NIVELACION_1RA',
transitionDate: '2026-05-01',
        forcedGrade: false,
observations: 'obs',
current: true,
      }),
      10,
      { transaction: 'TX' },
    );
  });

  it('ancla alterna (materia no cursada): expira por inscripción + materia del plan', async () => {
    const { useCase, repo } = crear();
    await useCase.execute({ usuarioId: 10, enrollmentId: '5', planSubjectId: '30', stateType: 'CHOQUE_HORARIO' });
    expect(repo.expireCurrentByAlternateAnchor).toHaveBeenCalledWith(5, 30, 10, { transaction: undefined });
    expect(repo.expireCurrentBySubjectEnrollmentId).not.toHaveBeenCalled();
    expect(repo.create.mock.calls[0][0]).toMatchObject({ enrollmentId: 5, planSubjectId: 30 });
  });

  it('decisión administrativa con nota forzada se persiste', async () => {
    const { useCase, repo } = crear();
    await useCase.execute({ usuarioId: 10, subjectEnrollmentId: 9, stateType: 'ABANDONO', resultingGrade: 30, forcedGrade: true });
    expect(repo.create.mock.calls[0][0]).toMatchObject({ stateType: 'ABANDONO', resultingGrade: 30, forcedGrade: true });
  });

  it('observaciones en blanco se guardan como null', async () => {
    const { useCase, repo } = crear();
    await useCase.execute({ usuarioId: 10, subjectEnrollmentId: 9, stateType: 'NIVELACION_1RA', observations: '   ' });
    expect(repo.create.mock.calls[0][0].observations).toBeNull();
  });

  it.each([
    ['sin ninguna ancla', {}],
    ['matrícula y alterna a la vez', { subjectEnrollmentId: 9, enrollmentId: 5, planSubjectId: 30 }],
    ['alterna incompleta (solo inscripción)', { enrollmentId: 5 }],
    ['alterna incompleta (solo plan)', { planSubjectId: 30 }],
    ['matrícula con inscripción suelta', { subjectEnrollmentId: 9, enrollmentId: 5 }],
  ])('rechaza ancla inválida: %s', async (_n, ancla) => {
    const { useCase, repo } = crear();
    await expect(useCase.execute({ usuarioId: 10, stateType: 'NIVELACION_1RA', ...ancla })).rejects.toBeInstanceOf(ValidationError);
    expect(repo.expireCurrentBySubjectEnrollmentId).not.toHaveBeenCalled();
    expect(repo.expireCurrentByAlternateAnchor).not.toHaveBeenCalled();
    expect(repo.create).not.toHaveBeenCalled();
  });

  it.each([[undefined], ['INVENTADO'], [null]])('rechaza stateType inválido (%p)', async (stateType) => {
    const { useCase, repo } = crear();
    await expect(useCase.execute({ usuarioId: 10, subjectEnrollmentId: 9, stateType })).rejects.toBeInstanceOf(ValidationError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('rechaza nota resultante en un tipo que no es ABANDONO/RETIRADO', async () => {
    const { useCase, repo } = crear();
    await expect(
      useCase.execute({ usuarioId: 10, subjectEnrollmentId: 9, stateType: 'NIVELACION_1RA', resultingGrade: 50 }),
    ).rejects.toThrow(/solo debe usarse para ABANDONO o RETIRADO/);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it.each([[101], [-1], ['abc']])('rechaza nota resultante fuera de rango o no numérica (%p)', async (resultingGrade) => {
    const { useCase, repo } = crear();
    await expect(
      useCase.execute({ usuarioId: 10, subjectEnrollmentId: 9, stateType: 'ABANDONO', resultingGrade, forcedGrade: true }),
    ).rejects.toThrow(/entre 0 y 100/);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('rechaza forcedGrade sin nota resultante', async () => {
    const { useCase } = crear();
    await expect(
      useCase.execute({ usuarioId: 10, subjectEnrollmentId: 9, stateType: 'RETIRADO', forcedGrade: true }),
    ).rejects.toThrow(/resultingGrade/);
  });
});
