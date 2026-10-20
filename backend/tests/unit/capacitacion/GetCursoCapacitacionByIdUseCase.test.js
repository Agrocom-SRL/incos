import { describe, it, expect, jest } from '@jest/globals';
import { GetCursoCapacitacionByIdUseCase } from '../../../src/application/use-cases/capacitacion/GetCursoCapacitacionByIdUseCase.js';

describe('GetCursoCapacitacionByIdUseCase', () => {
  const crear = ({ row = { id: 1, titulo: 'T', estado: 'PROPUESTO', activo: 1 }, horarios = [] } = {}) => {
    const deps = {
      cursoCapacitacionFichaViewRepository: {
        findListadoById: jest.fn().mockResolvedValue(row),
        findHorariosByCapacitacionId: jest.fn().mockResolvedValue(horarios),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new GetCursoCapacitacionByIdUseCase(deps) };
  };

  it('devuelve la ficha con horarios y horarioIds', async () => {
    const { deps, useCase } = crear({
      horarios: [
        { capacitacion_horario_id: 1, horario_id: 10, dia: 'LUNES' },
        { capacitacion_horario_id: 2, horario_id: 11, dia: 'MARTES' },
      ],
    });
    const res = await useCase.execute(1);
    expect(deps.cursoCapacitacionFichaViewRepository.findListadoById).toHaveBeenCalledWith(1);
    expect(deps.cursoCapacitacionFichaViewRepository.findHorariosByCapacitacionId).toHaveBeenCalledWith(1);
    expect(res.id).toBe(1);
    expect(res.horarioIds).toEqual([10, 11]);
    expect(res.horarios).toHaveLength(2);
  });

  it('devuelve null si el curso no existe', async () => {
    const { deps, useCase } = crear({ row: null });
    await expect(useCase.execute(5)).resolves.toBeNull();
    expect(deps.cursoCapacitacionFichaViewRepository.findHorariosByCapacitacionId).not.toHaveBeenCalled();
  });

  it('curso sin horarios -> listas vacías', async () => {
    const { useCase } = crear();
    const res = await useCase.execute(1);
    expect(res.horarios).toEqual([]);
    expect(res.horarioIds).toEqual([]);
  });
});
