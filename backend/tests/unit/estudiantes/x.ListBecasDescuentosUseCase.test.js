import { jest } from '@jest/globals';
import { ListBecasDescuentosUseCase } from '../../../src/application/use-cases/estudiantes/ListBecasDescuentosUseCase.js';

describe('ListBecasDescuentosUseCase', () => {
  const crear = (scholarships = [{ id: 1, name: 'A', percentage: 10, active: true }, { id: 2, name: 'B', percentage: 20, active: true }], total = 2) => {
    const deps = {
      scholarshipRepository: { findAll: jest.fn().mockResolvedValue({ scholarships, total }) },
      finanzasUsosViewRepository: {
        getUsosByCatalogo: jest.fn().mockResolvedValue(
          new Map([[1, { cantidadPagos: 2, cantidadCuentas: 1, cantidadAsignaciones: 3 }]])
        ),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ListBecasDescuentosUseCase(deps) };
  };

  it('lista bajo dataFieldName becasDescuentos con conteos de uso (0 por defecto)', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({}, 1, 10);

    expect(deps.scholarshipRepository.findAll).toHaveBeenCalledWith({}, 1, 10);
    expect(deps.finanzasUsosViewRepository.getUsosByCatalogo).toHaveBeenCalledWith('BECA_DESCUENTO');
    expect(res.becasDescuentos[0]).toEqual(
      expect.objectContaining({ id: 1, nombre: 'A', cantidadPagos: 2, cantidadCuentas: 1, cantidadAsignaciones: 3, totalReferencias: 6 })
    );
    expect(res.becasDescuentos[1]).toEqual(expect.objectContaining({ id: 2, totalReferencias: 0 }));
    expect(res).toEqual(expect.objectContaining({ total: 2, page: 1, limit: 10, totalPages: 1 }));
  });

  it('incluirInactivos=true se traduce a includeInactive', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ search: 'a' }, 1, 10, { incluirInactivos: 'true' });
    expect(deps.scholarshipRepository.findAll).toHaveBeenCalledWith({ search: 'a', includeInactive: true }, 1, 10);
  });

  it('incluirInactivos=false da includeInactive false', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({}, 1, 10, { incluirInactivos: 'false' });
    expect(deps.scholarshipRepository.findAll).toHaveBeenCalledWith({ includeInactive: false }, 1, 10);
  });

  it('page/limit no numéricos (NaN) caen a 1 y 50', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({}, 'abc', 'xyz');
    expect(deps.scholarshipRepository.findAll).toHaveBeenCalledWith({}, 1, 50);
    expect(res.page).toBe(1);
    expect(res.limit).toBe(50);
  });

  it('lista vacía devuelve arreglo vacío y totalPages 0', async () => {
    const { useCase } = crear([], 0);
    const res = await useCase.execute();
    expect(res.becasDescuentos).toEqual([]);
    expect(res.totalPages).toBe(0);
  });

  it('propaga y registra el error del repositorio', async () => {
    const { useCase, deps } = crear();
    deps.scholarshipRepository.findAll.mockRejectedValue(new Error('db'));
    await expect(useCase.execute()).rejects.toThrow('db');
    expect(deps.logger.error).toHaveBeenCalled();
  });
});
