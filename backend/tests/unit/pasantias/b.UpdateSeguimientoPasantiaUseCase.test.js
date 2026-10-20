import { describe, it, expect, jest } from '@jest/globals';
import { UpdateSeguimientoPasantiaUseCase } from '../../../src/application/use-cases/pasantias/UpdateSeguimientoPasantiaUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

const crear = ({ pasantia = { id: 2 }, seguimiento = { id: 6, pasantiaId: 2 } } = {}) => {
  const pasantiaRepository = { findById: jest.fn().mockResolvedValue(pasantia) };
  const pasantiaSeguimientoRepository = {
    findById: jest.fn().mockResolvedValue(seguimiento),
    update: jest.fn().mockResolvedValue({ id: 6, nivelDesempeno: 'ALTO' }),
  };
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  return {
    pasantiaSeguimientoRepository,
    useCase: new UpdateSeguimientoPasantiaUseCase({
      pasantiaRepository, pasantiaSeguimientoRepository, logger,
    }),
  };
};

describe('UpdateSeguimientoPasantiaUseCase', () => {
  it('actualiza descartando pasantiaId del payload', async () => {
    const { useCase, pasantiaSeguimientoRepository } = crear();
    const data = { nivelDesempeno: 'ALTO', pasantiaId: 50 };
    const res = await useCase.execute(2, 6, data, 7);
    expect(res).toEqual({ seguimiento: { id: 6, nivelDesempeno: 'ALTO' } });
    expect(pasantiaSeguimientoRepository.update).toHaveBeenCalledWith(
      6, { nivelDesempeno: 'ALTO' }, 7
    );
    expect(data.pasantiaId).toBe(50); // no muta la entrada
  });

  it('acepta data nula', async () => {
    const { useCase, pasantiaSeguimientoRepository } = crear();
    await useCase.execute(2, 6, null);
    expect(pasantiaSeguimientoRepository.update).toHaveBeenCalledWith(6, {}, null);
  });

  it('compara pertenencia numéricamente (string vs number)', async () => {
    const { useCase } = crear({ seguimiento: { id: 6, pasantiaId: '2' } });
    await expect(useCase.execute(2, 6, {})).resolves.toBeDefined();
  });

  it('NotFoundError si el trámite no existe', async () => {
    const { useCase, pasantiaSeguimientoRepository } = crear({ pasantia: null });
    await expect(useCase.execute(2, 6, {})).rejects.toBeInstanceOf(NotFoundError);
    expect(pasantiaSeguimientoRepository.update).not.toHaveBeenCalled();
  });

  it('NotFoundError si el seguimiento no existe', async () => {
    const { useCase } = crear({ seguimiento: null });
    await expect(useCase.execute(2, 6, {})).rejects.toBeInstanceOf(NotFoundError);
  });

  it('NotFoundError (anti-IDOR) si pertenece a otro trámite', async () => {
    const { useCase, pasantiaSeguimientoRepository } = crear({
      seguimiento: { id: 6, pasantiaId: 3 },
    });
    await expect(useCase.execute(2, 6, {})).rejects.toBeInstanceOf(NotFoundError);
    expect(pasantiaSeguimientoRepository.update).not.toHaveBeenCalled();
  });
});
