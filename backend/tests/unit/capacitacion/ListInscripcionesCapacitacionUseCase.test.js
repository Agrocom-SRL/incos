import { describe, it, expect, jest } from '@jest/globals';
import { ListInscripcionesCapacitacionUseCase } from '../../../src/application/use-cases/capacitacion/ListInscripcionesCapacitacionUseCase.js';

import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('ListInscripcionesCapacitacionUseCase', () => {
  const crear = (rows = [], total = rows.length) => {
    const deps = {
      inscripcionCapacitacionRepository: { findListadoRows: jest.fn().mockResolvedValue({ rows, total }) },
      capacitacionCompromisoRepository: { marcarVencidosComoIncumplidos: jest.fn().mockResolvedValue(0) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new ListInscripcionesCapacitacionUseCase(deps) };
  };

  it('marca vencidos, aplica filtros y pagina', async () => {
    const { deps, useCase } = crear([{ id: 1, estado: 'INSCRITO' }], 21);
    const res = await useCase.execute(
      { search: 'ana' },
      '3',
      '10',
      { capacitacionId: '4', participanteId: '8', estado: 'PENDIENTE', incluirInactivos: 'true' }
    );
    expect(deps.capacitacionCompromisoRepository.marcarVencidosComoIncumplidos).toHaveBeenCalledTimes(1);
    expect(deps.inscripcionCapacitacionRepository.findListadoRows).toHaveBeenCalledWith(
      { search: 'ana', capacitacionId: 4, participanteId: 8, estado: 'PENDIENTE', includeInactive: true },
      3,
      10
    );
    expect(res).toMatchObject({ total: 21, page: 3, limit: 10, totalPages: 3 });
    expect(res.inscripcionesCapacitacion).toHaveLength(1);
  });

  it('ignora estado inválido y usa valores por defecto', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute({}, 'x', NaN, { estado: 'FOO' });
    expect(deps.inscripcionCapacitacionRepository.findListadoRows).toHaveBeenCalledWith(
      {
        search: undefined,
capacitacionId: undefined,
participanteId: undefined,
        estado: undefined,
includeInactive: false,
      },
      1,
      50
    );
    expect(res).toMatchObject({ page: 1, limit: 50, totalPages: 0, inscripcionesCapacitacion: [] });
  });
});

describe('ListInscripcionesCapacitacionUseCase filtros inválidos', () => {
  it.each([[{ capacitacionId: 'abc' }], [{ participanteId: '5x' }], [{ capacitacionId: '0' }]])(
    'rechaza %p sin consultar con NaN',
    async (query) => {
      const inscripcionCapacitacionRepository = { findListadoRows: jest.fn() };
      const capacitacionCompromisoRepository = { marcarVencidosComoIncumplidos: jest.fn() };
      const useCase = new ListInscripcionesCapacitacionUseCase({
        inscripcionCapacitacionRepository,
        capacitacionCompromisoRepository,
        logger: { info: jest.fn() },
      });
      await expect(useCase.execute({}, 1, 10, query)).rejects.toBeInstanceOf(ValidationError);
      expect(inscripcionCapacitacionRepository.findListadoRows).not.toHaveBeenCalled();
    }
  );
});
