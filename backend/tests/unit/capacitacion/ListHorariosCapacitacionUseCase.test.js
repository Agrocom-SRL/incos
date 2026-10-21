import { describe, it, expect, jest } from '@jest/globals';
import { ListHorariosCapacitacionUseCase } from '../../../src/application/use-cases/capacitacion/ListHorariosCapacitacionUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('ListHorariosCapacitacionUseCase', () => {
  const crear = (rows = []) => {
    const deps = {
      cursoCapacitacionRepository: { listHorariosCapacitacion: jest.fn().mockResolvedValue(rows) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new ListHorariosCapacitacionUseCase(deps) };
  };
  const sinFiltros = { aulaId: null, excludeCursoId: null, search: null, orden: null };

  it('sin filtros consulta el catálogo completo, ocupado es false y expone cursosEnUso', async () => {
    const { deps, useCase } = crear([
      { horarioId: 1, nombre: 'SAB M', dia: 'SABADO', horaInicio: '08:00:00', horaFin: '12:00:00', tipoHorario: 'CAPACITACION', ocupado: 0, cursosEnUso: '2' },
    ]);
    const res = await useCase.execute();
    expect(deps.cursoCapacitacionRepository.listHorariosCapacitacion).toHaveBeenCalledWith(sinFiltros);
    expect(res.horarios).toEqual([
      { horarioId: 1, nombre: 'SAB M', dia: 'SABADO', horaInicio: '08:00:00', horaFin: '12:00:00', tipoHorario: 'CAPACITACION', ocupado: false, cursosEnUso: 2 },
    ]);
  });

  it('con aulaId y excludeCursoId los normaliza y marca ocupado', async () => {
    const { deps, useCase } = crear([{ horarioId: 2, ocupado: '1' }]);
    const res = await useCase.execute({ aulaId: '5', excludeCursoId: '7' });
    expect(deps.cursoCapacitacionRepository.listHorariosCapacitacion).toHaveBeenCalledWith({
      ...sinFiltros, aulaId: 5, excludeCursoId: 7,
    });
    expect(res.horarios[0]).toMatchObject({ ocupado: true, cursosEnUso: 0 });
  });

  it('valores vacíos se tratan como ausentes', async () => {
    const { deps, useCase } = crear();
    await useCase.execute({ aulaId: '', excludeCursoId: null, search: '   ', sort: '' });
    expect(deps.cursoCapacitacionRepository.listHorariosCapacitacion).toHaveBeenCalledWith(sinFiltros);
  });

  it('búsqueda recortada y orden por día, hora o nombre con dirección', async () => {
    const { deps, useCase } = crear();
    await useCase.execute({ search: ' sab ', sort: 'hora:DESC' });
    expect(deps.cursoCapacitacionRepository.listHorariosCapacitacion).toHaveBeenCalledWith({
      ...sinFiltros, search: 'sab', orden: { campo: 'hora', direccion: 'DESC' },
    });
    await useCase.execute({ sort: 'dia' });
    expect(deps.cursoCapacitacionRepository.listHorariosCapacitacion.mock.calls[1][0].orden).toEqual({
      campo: 'dia', direccion: 'ASC',
    });
  });

  it.each([['precio'], ['dia:arriba'], ['hora:asc:x']])('rechaza sort inválido (%p)', async (sort) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute({ sort })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.cursoCapacitacionRepository.listHorariosCapacitacion).not.toHaveBeenCalled();
  });

  it('rechaza búsqueda demasiado larga', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({ search: 'x'.repeat(101) })).rejects.toBeInstanceOf(ValidationError);
  });

  it.each([['abc'], [0], [-1], [1.5]])('rechaza aulaId inválido (%p)', async (aulaId) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute({ aulaId })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.cursoCapacitacionRepository.listHorariosCapacitacion).not.toHaveBeenCalled();
  });

  it('rechaza excludeCursoId inválido', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({ aulaId: 1, excludeCursoId: 'x' })).rejects.toBeInstanceOf(ValidationError);
  });
});
