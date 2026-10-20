import { describe, it, expect, jest } from '@jest/globals';
import { ListInformesPasantiaUseCase } from '../../../src/application/use-cases/pasantias/ListInformesPasantiaUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

const crear = ({ pasantia = { id: 2 }, informes = [] } = {}) => {
  const pasantiaRepository = { findById: jest.fn().mockResolvedValue(pasantia) };
  const pasantiaInformeRepository = { findByPasantiaId: jest.fn().mockResolvedValue(informes) };
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  return {
    pasantiaInformeRepository,
    useCase: new ListInformesPasantiaUseCase({ pasantiaRepository, pasantiaInformeRepository, logger }),
  };
};

describe('ListInformesPasantiaUseCase', () => {
  it('lista informes sin rutaArchivo y con total', async () => {
    const { useCase, pasantiaInformeRepository } = crear({
      informes: [{ id: 1, rutaArchivo: '/x', tipo: 'A' }, { id: 2, rutaArchivo: '/y' }],
    });
    const res = await useCase.execute(2);
    expect(pasantiaInformeRepository.findByPasantiaId).toHaveBeenCalledWith(2);
    expect(res).toEqual({ informes: [{ id: 1, tipo: 'A' }, { id: 2 }], total: 2 });
  });

  it('lista vacía', async () => {
    const { useCase } = crear();
    expect(await useCase.execute(2)).toEqual({ informes: [], total: 0 });
  });

  it('NotFoundError si el trámite no existe', async () => {
    const { useCase, pasantiaInformeRepository } = crear({ pasantia: null });
    await expect(useCase.execute(2)).rejects.toBeInstanceOf(NotFoundError);
    expect(pasantiaInformeRepository.findByPasantiaId).not.toHaveBeenCalled();
  });
});
