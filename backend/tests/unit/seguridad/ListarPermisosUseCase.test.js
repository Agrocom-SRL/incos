import { describe, it, expect, jest } from '@jest/globals';
import { ListarPermisosUseCase } from '../../../src/application/use-cases/seguridad/ListarPermisosUseCase.js';

describe('ListarPermisosUseCase', () => {
  const crear = (rows) => {
    const permissionRepository = { findAllActivosPlano: jest.fn().mockResolvedValue(rows) };
    return { permissionRepository, useCase: new ListarPermisosUseCase({ permissionRepository }) };
  };

  it('agrupa por dominio y separa acciones_validas; default LISTAR', async () => {
    const { permissionRepository, useCase } = crear([
      { id: 1, codigo: 'a', nombre: 'A', dominio: 'SEG', modulo: 'm', acciones_validas: 'LISTAR,CREAR' },
      { id: 2, codigo: 'b', nombre: 'B', dominio: 'SEG', modulo: 'm', acciones_validas: null },
      { id: 3, codigo: 'c', nombre: 'C', dominio: 'ACA', modulo: 'n', acciones_validas: 'EDITAR' },
    ]);
    const res = await useCase.execute({});
    expect(permissionRepository.findAllActivosPlano).toHaveBeenCalledWith({ dominio: null });
    expect(res.SEG.map((p) => p.acciones_validas)).toEqual([['LISTAR', 'CREAR'], ['LISTAR']]);
    expect(res.ACA).toHaveLength(1);
  });

  it('filtra por dominio con trim', async () => {
    const { permissionRepository, useCase } = crear([]);
    expect(await useCase.execute({ dominio: ' SEG ' })).toEqual({});
    expect(permissionRepository.findAllActivosPlano).toHaveBeenCalledWith({ dominio: 'SEG' });
  });

  it('dominio solo espacios se trata como sin filtro', async () => {
    const { permissionRepository, useCase } = crear([]);
    await useCase.execute({ dominio: '   ' });
    expect(permissionRepository.findAllActivosPlano).toHaveBeenCalledWith({ dominio: null });
  });
});
