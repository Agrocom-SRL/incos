import { describe, it, expect, jest } from '@jest/globals';
import { RegistrarResultadoNivelacionUseCase } from '../../../src/application/use-cases/academico/nivelaciones/RegistrarResultadoNivelacionUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('RegistrarResultadoNivelacionUseCase', () => {
  const crear = ({ actual = { id: 3, status: 'PROGRAMADA' } } = {}) => {
    const levelingRepository = {
      findById: jest.fn().mockResolvedValue(actual),
      update: jest.fn().mockResolvedValue({ id: 3, status: 'APROBADA' }),
    };
    const logger = { info: jest.fn() };
    return { levelingRepository, logger, useCase: new RegistrarResultadoNivelacionUseCase({ levelingRepository, logger }) };
  };
  const run = (useCase, o = {}) => useCase.execute({ usuarioId: 10, levelingId: '3', status: 'APROBADA', levelingGrade: 75, ...o });

  it('registra una aprobación derivando passed de la nota (>= 61)', async () => {
    const { useCase, levelingRepository: repo } = crear();
    const res = await run(useCase);
    expect(res).toEqual({ nivelacion: { id: 3, status: 'APROBADA' } });
    expect(repo.findById).toHaveBeenCalledWith(3);
    expect(repo.update).toHaveBeenCalledWith(3, expect.objectContaining({ status: 'APROBADA', levelingGrade: 75, passed: true }), 10);
  });

  it('61 aprueba y 60 no, en el umbral', async () => {
    const a = crear();
    await run(a.useCase, { levelingGrade: 61 });
    expect(a.levelingRepository.update.mock.calls[0][1].passed).toBe(true);
    const b = crear();
    await run(b.useCase, { status: 'REPROBADA', levelingGrade: 60 });
    expect(b.levelingRepository.update.mock.calls[0][1].passed).toBe(false);
  });

  it('respeta passed explícito sobre el derivado', async () => {
    const { useCase, levelingRepository: repo } = crear();
    await run(useCase, { levelingGrade: 90, passed: false });
    expect(repo.update.mock.calls[0][1].passed).toBe(false);
  });

  it('solo incluye observations si el llamador la envió; en blanco la limpia', async () => {
    const a = crear();
    await run(a.useCase);
    expect(a.levelingRepository.update.mock.calls[0][1]).not.toHaveProperty('observations');
    const b = crear();
    await run(b.useCase, { observations: '  ok ' });
    expect(b.levelingRepository.update.mock.calls[0][1].observations).toBe('ok');
    const c = crear();
    await run(c.useCase, { observations: '   ' });
    expect(c.levelingRepository.update.mock.calls[0][1].observations).toBeNull();
  });

  it('permite pasar a EN_CURSO y CANCELADA sin nota', async () => {
    for (const status of ['EN_CURSO', 'CANCELADA']) {
      const { useCase, levelingRepository: repo } = crear();
      await run(useCase, { status, levelingGrade: undefined });
      expect(repo.update.mock.calls[0][1]).toMatchObject({ status, levelingGrade: null, passed: null });
    }
  });

  it('permite EN_CURSO -> APROBADA', async () => {
    const { useCase, levelingRepository: repo } = crear({ actual: { id: 3, status: 'EN_CURSO' } });
    await run(useCase);
    expect(repo.update).toHaveBeenCalled();
  });

  it.each(['APROBADA', 'REPROBADA'])('un estado final requiere nota (%s)', async (status) => {
    const { useCase, levelingRepository: repo } = crear();
    await expect(run(useCase, { status, levelingGrade: undefined })).rejects.toThrow(/requiere levelingGrade/);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it.each([
    ['APROBADA', 'REPROBADA'],
    ['REPROBADA', 'APROBADA'],
    ['CANCELADA', 'EN_CURSO'],
    ['EN_CURSO', 'PROGRAMADA'],
  ])('rechaza transición %s -> %s', async (desde, hacia) => {
    const { useCase, levelingRepository: repo } = crear({ actual: { id: 3, status: desde } });
    await expect(run(useCase, { status: hacia })).rejects.toThrow(/Transición inválida/);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it.each([[undefined], ['INVENTADO']])('rechaza status destino inválido (%p)', async (status) => {
    const { useCase, levelingRepository: repo } = crear();
    await expect(run(useCase, { status })).rejects.toBeInstanceOf(ValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it.each([[101], [-1], ['abc']])('rechaza nota fuera de 0-100 o no numérica (%p)', async (levelingGrade) => {
    const { useCase, levelingRepository: repo } = crear();
    await expect(run(useCase, { levelingGrade })).rejects.toThrow(/entre 0 y 100/);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it.each([[undefined], [null], ['abc'], [0], [-3], ['']])('rechaza levelingId inválido (%p)', async (levelingId) => {
    const { useCase, levelingRepository: repo } = crear();
    await expect(run(useCase, { levelingId })).rejects.toBeInstanceOf(ValidationError);
    expect(repo.findById).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si la nivelación no existe', async () => {
    const { useCase, levelingRepository: repo } = crear({ actual: null });
    await expect(run(useCase)).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('exige repositorio y logger', () => {
    expect(() => new RegistrarResultadoNivelacionUseCase({ logger: {} })).toThrow(/requerido/);
    expect(() => new RegistrarResultadoNivelacionUseCase({ levelingRepository: {} })).toThrow(/requerido/);
  });
});
