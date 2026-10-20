import { describe, it, expect, jest } from '@jest/globals';
import { CreateSeguimientoPasantiaUseCase } from '../../../src/application/use-cases/pasantias/CreateSeguimientoPasantiaUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

const crear = (pasantia = { id: 2 }) => {
  const pasantiaRepository = { findById: jest.fn().mockResolvedValue(pasantia) };
  const pasantiaSeguimientoRepository = {
    create: jest.fn().mockResolvedValue({ id: 8, fecha: '2026-02-02' }),
  };
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  return {
    pasantiaSeguimientoRepository,
    logger,
    useCase: new CreateSeguimientoPasantiaUseCase({
      pasantiaRepository, pasantiaSeguimientoRepository, logger,
    }),
  };
};

describe('CreateSeguimientoPasantiaUseCase', () => {
  it('crea el seguimiento forzando pasantiaId de la ruta', async () => {
    const { useCase, pasantiaSeguimientoRepository, logger } = crear();
    const res = await useCase.execute(2, { fecha: '2026-02-02', pasantiaId: 999 }, 7);
    expect(res).toEqual({ seguimiento: { id: 8, fecha: '2026-02-02' } });
    expect(pasantiaSeguimientoRepository.create).toHaveBeenCalledWith(
      { fecha: '2026-02-02', pasantiaId: 2 }, 7
    );
    expect(logger.info).toHaveBeenCalled();
  });

  it('userId por defecto null', async () => {
    const { useCase, pasantiaSeguimientoRepository } = crear();
    await useCase.execute(2, {});
    expect(pasantiaSeguimientoRepository.create).toHaveBeenCalledWith({ pasantiaId: 2 }, null);
  });

  it('NotFoundError si el trámite no existe', async () => {
    const { useCase, pasantiaSeguimientoRepository } = crear(null);
    await expect(useCase.execute(2, {})).rejects.toBeInstanceOf(NotFoundError);
    expect(pasantiaSeguimientoRepository.create).not.toHaveBeenCalled();
  });
});
