import { describe, it, expect, jest } from '@jest/globals';
import { ListHorariosDisponiblesCapacitacionUseCase } from '../../../src/application/use-cases/capacitacion/ListHorariosDisponiblesCapacitacionUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('ListHorariosDisponiblesCapacitacionUseCase', () => {
  const crear = (rows = []) => {
    const deps = {
      cursoCapacitacionRepository: { listHorariosDisponibles: jest.fn().mockResolvedValue(rows) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new ListHorariosDisponiblesCapacitacionUseCase(deps) };
  };

  it('mapea filas y normaliza ocupado a booleano', async () => {
    const { deps, useCase } = crear([
      { horarioId: 1, nombre: 'B1', dia: 'LUNES', horaInicio: '18:00', horaFin: '19:00', turno: 'NOCHE', numeroBloque: 1, ocupado: 1 },
      { horarioId: 2, ocupado: '0' },
    ]);
    const res = await useCase.execute({ aulaId: '5', excludeCursoId: '7' });
    expect(deps.cursoCapacitacionRepository.listHorariosDisponibles).toHaveBeenCalledWith({
      aulaId: 5,
      excludeCursoId: 7,
    });
    expect(res.horarios[0]).toMatchObject({ horarioId: 1, ocupado: true, turno: 'NOCHE' });
    expect(res.horarios[1]).toEqual({
      horarioId: 2,
nombre: null,
dia: null,
horaInicio: null,
horaFin: null,
      turno: null,
numeroBloque: null,
ocupado: false,
    });
  });

  it('excludeCursoId vacío, null o ausente se envía como null', async () => {
    for (const exclude of [undefined, null, '']) {
      const { deps, useCase } = crear();
      await useCase.execute({ aulaId: 1, excludeCursoId: exclude });
      expect(deps.cursoCapacitacionRepository.listHorariosDisponibles).toHaveBeenCalledWith({
        aulaId: 1,
        excludeCursoId: null,
      });
    }
  });

  it.each([[undefined], [null], [''], ['abc'], [NaN], [0], [-1], [1.5]])(
    'rechaza aulaId inválido (%p)',
    async (aulaId) => {
      const { deps, useCase } = crear();
      await expect(useCase.execute({ aulaId })).rejects.toBeInstanceOf(ValidationError);
      expect(deps.cursoCapacitacionRepository.listHorariosDisponibles).not.toHaveBeenCalled();
    }
  );

  it('rechaza sin argumentos', async () => {
    const { useCase } = crear();
    await expect(useCase.execute()).rejects.toBeInstanceOf(ValidationError);
  });

  it.each([['abc'], [NaN], [0], [-3], [2.5]])('rechaza excludeCursoId inválido (%p)', async (ex) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute({ aulaId: 1, excludeCursoId: ex })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.cursoCapacitacionRepository.listHorariosDisponibles).not.toHaveBeenCalled();
  });
});
