import { describe, it, expect, jest } from '@jest/globals';
import { ListSeguimientosPasantiaUseCase } from '../../../src/application/use-cases/pasantias/ListSeguimientosPasantiaUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

const crear = ({ pasantia = { id: 2 }, seguimientos = [] } = {}) => {
  const pasantiaRepository = { findById: jest.fn().mockResolvedValue(pasantia) };
  const pasantiaSeguimientoRepository = {
    findByPasantiaId: jest.fn().mockResolvedValue(seguimientos),
  };
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  return {
    pasantiaSeguimientoRepository,
    useCase: new ListSeguimientosPasantiaUseCase({
      pasantiaRepository, pasantiaSeguimientoRepository, logger,
    }),
  };
};

describe('ListSeguimientosPasantiaUseCase', () => {
  it('lista sin rutaArchivo y con total', async () => {
    const { useCase, pasantiaSeguimientoRepository } = crear({
      seguimientos: [{ id: 1, rutaArchivo: '/a', fecha: 'f' }, { id: 2 }],
    });
    const res = await useCase.execute(2);
    expect(pasantiaSeguimientoRepository.findByPasantiaId).toHaveBeenCalledWith(2);
    expect(res).toEqual({ seguimientos: [{ id: 1, fecha: 'f' }, { id: 2 }], total: 2 });
  });

  it('lista vacía', async () => {
    const { useCase } = crear();
    expect(await useCase.execute(2)).toEqual({ seguimientos: [], total: 0 });
  });

  it('NotFoundError si el trámite no existe', async () => {
    const { useCase, pasantiaSeguimientoRepository } = crear({ pasantia: null });
    await expect(useCase.execute(2)).rejects.toBeInstanceOf(NotFoundError);
    expect(pasantiaSeguimientoRepository.findByPasantiaId).not.toHaveBeenCalled();
  });
});
