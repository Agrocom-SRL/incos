import { describe, it, expect, jest } from '@jest/globals';
import { ListCursosCapacitacionUseCase } from '../../../src/application/use-cases/capacitacion/ListCursosCapacitacionUseCase.js';

describe('ListCursosCapacitacionUseCase', () => {
  const fila = (id, estado, ini = '2000-01-01', fin = '2999-01-01') => ({
    id, titulo: `C${id}`, estado, fecha_inicio: ini, fecha_fin: fin, activo: 1, costo: '10.5',
  });
  const crear = (rows = [], total = rows.length) => {
    const deps = {
      cursoCapacitacionFichaViewRepository: { findListado: jest.fn().mockResolvedValue({ rows, total }) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new ListCursosCapacitacionUseCase(deps) };
  };

  it('lista con filtro SQL para PROPUESTO y devuelve paginación', async () => {
    const { deps, useCase } = crear([fila(1, 'PROPUESTO')], 25);
    const res = await useCase.execute({ search: 'x' }, '2', '10', { estado: 'PROPUESTO', incluirInactivos: 'true' });
    expect(deps.cursoCapacitacionFichaViewRepository.findListado).toHaveBeenCalledWith(
      { search: 'x', estado: 'PROPUESTO', includeInactive: true },
      2,
      10
    );
    expect(res).toMatchObject({ total: 25, page: 2, limit: 10, totalPages: 3 });
    expect(res.cursosCapacitacion[0]).toMatchObject({ id: 1, costo: 10.5, activo: true });
  });

  it('usa valores por defecto con page/limit inválidos (NaN)', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute({}, 'abc', NaN, {});
    expect(deps.cursoCapacitacionFichaViewRepository.findListado).toHaveBeenCalledWith(
      { search: undefined, estado: undefined, includeInactive: false },
      1,
      50
    );
    expect(res).toMatchObject({ page: 1, limit: 50, totalPages: 0, cursosCapacitacion: [] });
  });

  it('filtra por estado EFECTIVO en JS (EN_CURSO) y pagina', async () => {
    const rows = [
      fila(1, 'ABIERTO'), // EN_CURSO efectivo
      fila(2, 'ABIERTO', '2999-01-01', '2999-12-31'), // ABIERTO efectivo
      fila(3, 'ABIERTO'), // EN_CURSO efectivo
      fila(4, 'ABIERTO', '2000-01-01', '2000-02-01'), // CERRADO efectivo
    ];
    const { deps, useCase } = crear(rows);
    const res = await useCase.execute({ search: 's' }, 2, 1, { estado: 'EN_CURSO' });
    expect(deps.cursoCapacitacionFichaViewRepository.findListado).toHaveBeenCalledWith(
      { search: 's', includeInactive: false },
      1,
      10000
    );
    expect(res.total).toBe(2);
    expect(res.totalPages).toBe(2);
    expect(res.cursosCapacitacion.map((c) => c.id)).toEqual([3]);
  });

  it('estado CERRADO derivado por fecha', async () => {
    const { useCase } = crear([fila(4, 'ABIERTO', '2000-01-01', '2000-02-01'), fila(5, 'PROPUESTO')]);
    const res = await useCase.execute({}, 1, 50, { estado: 'CERRADO' });
    expect(res.cursosCapacitacion.map((c) => c.id)).toEqual([4]);
  });

  it('estado inexistente en datos devuelve lista vacía', async () => {
    const { useCase } = crear([fila(5, 'PROPUESTO')]);
    const res = await useCase.execute({}, 1, 50, { estado: 'ABIERTO' });
    expect(res).toMatchObject({ total: 0, totalPages: 0, cursosCapacitacion: [] });
  });
});
