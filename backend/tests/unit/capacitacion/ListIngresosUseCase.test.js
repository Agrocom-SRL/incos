import { describe, it, expect, jest } from '@jest/globals';
import { ListIngresosUseCase } from '../../../src/application/use-cases/ingresos/ListIngresosUseCase.js';

describe('ListIngresosUseCase', () => {
  const crear = (rows = [], total = rows.length) => {
    const deps = {
      ingresoRepository: { findAll: jest.fn().mockResolvedValue({ rows, total }) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new ListIngresosUseCase(deps) };
  };

  it('lista, mapea filas y pagina', async () => {
    const { deps, useCase } = crear(
      [{ origen: 'APORTE', id_local: 4, monto: '12.5', persona_apellido_paterno: 'Paz', persona_nombres: 'Ana' }],
      21
    );
    const res = await useCase.execute({ search: 'ana' }, '2', '10', {
      origen: 'APORTE', sort: 'fecha_pago:asc',
    });
    expect(deps.ingresoRepository.findAll).toHaveBeenCalledWith({
      page: 2, limit: 10, search: 'ana', origen: 'APORTE', sortField: 'fecha_pago', sortOrder: 'ASC',
    });
    expect(res).toMatchObject({ total: 21, page: 2, limit: 10, totalPages: 3 });
    expect(res.ingresos[0]).toMatchObject({ id: 'APORTE-4', monto: 12.5, personaNombreCompleto: 'Paz Ana' });
  });

  it('orden descendente por defecto cuando falta o es inválida la dirección', async () => {
    const { deps, useCase } = crear();
    await useCase.execute({}, 1, 10, { sort: 'monto' });
    expect(deps.ingresoRepository.findAll.mock.calls[0][0]).toMatchObject({ sortField: 'monto', sortOrder: 'DESC' });
  });

  it('sin sort deja sortField/sortOrder indefinidos; sort no string se ignora', async () => {
    const { deps, useCase } = crear();
    await useCase.execute({}, 1, 10, { sort: 123 });
    const arg = deps.ingresoRepository.findAll.mock.calls[0][0];
    expect(arg.sortField).toBeUndefined();
    expect(arg.sortOrder).toBeUndefined();
  });

  it('ignora origen desconocido y acepta CAPACITACION', async () => {
    const { deps, useCase } = crear();
    await useCase.execute({}, 1, 10, { origen: 'OTRO' });
    expect(deps.ingresoRepository.findAll.mock.calls[0][0].origen).toBeUndefined();
    await useCase.execute({}, 1, 10, { origen: 'CAPACITACION' });
    expect(deps.ingresoRepository.findAll.mock.calls[1][0].origen).toBe('CAPACITACION');
  });

  it('page/limit inválidos (NaN, 0) caen a 1 y 50', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute({}, 'x', NaN);
    expect(deps.ingresoRepository.findAll.mock.calls[0][0]).toMatchObject({ page: 1, limit: 50 });
    expect(res).toMatchObject({ page: 1, limit: 50, totalPages: 0, ingresos: [] });
  });
});
