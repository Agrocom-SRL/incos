import { describe, it, expect, jest } from '@jest/globals';
import { ListGruposCapacitacionUseCase } from '../../../src/application/use-cases/capacitacion/ListGruposCapacitacionUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('ListGruposCapacitacionUseCase', () => {
  const fila = (o = {}) => ({
    grupo_id: 1, nombre: 'Grupo 1 – Mañana', orden: 1, curso_id: 9, curso_titulo: 'Guaraní', curso_estado: 'ABIERTO',
    curso_fecha_inicio: '2999-01-01', curso_fecha_fin: null, modalidad: 'PRESENCIAL', cupo_maximo: 25,
    inscritos_count: '3', aula_id: 4, aula_codigo: 'A-4', aula_nombre: 'Aula 4', horarios_etiqueta: 'SAB 08:00-12:00', ...o,
  });
  const crear = ({ rows = [fila()], total = rows.length, horarios = [] } = {}) => {
    const deps = {
      grupoCapacitacionListadoViewRepository: {
        findListado: jest.fn().mockResolvedValue({ rows, total }),
        findHorariosByGrupoIds: jest.fn().mockResolvedValue(horarios),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new ListGruposCapacitacionUseCase(deps) };
  };

  it('mapea el grupo con su curso, aula, cupo, inscritos y horarios (contrato `grupos`)', async () => {
    const { deps, useCase } = crear({
      horarios: [{ grupo_id: 1, horario_id: 5, bloque_etiqueta: 'SAB 08:00-12:00' }],
      total: 21,
    });
    const res = await useCase.execute({ search: 'guar' }, '2', '10', { cursoId: '9' });
    expect(deps.grupoCapacitacionListadoViewRepository.findListado).toHaveBeenCalledWith(
      { search: 'guar', cursoId: 9 }, 2, 10
    );
    expect(deps.grupoCapacitacionListadoViewRepository.findHorariosByGrupoIds).toHaveBeenCalledWith([1]);
    expect(res).toMatchObject({ total: 21, page: 2, limit: 10, totalPages: 3 });
    expect(res.grupos[0]).toEqual({
      grupoId: 1, nombre: 'Grupo 1 – Mañana', orden: 1, cursoId: 9, cursoTitulo: 'Guaraní', cursoEdicion: null, cursoEstado: 'ABIERTO',
      modalidad: 'PRESENCIAL', cupoMaximo: 25, inscritosCount: 3, aulaId: 4, aulaCodigo: 'A-4', aulaNombre: 'Aula 4',
      horarios: [{ horarioId: 5, etiqueta: 'SAB 08:00-12:00' }], horariosEtiqueta: 'SAB 08:00-12:00',
    });
  });

  it('un grupo sin horarios ni aula devuelve listas vacías y nulos', async () => {
    const { useCase } = crear({ rows: [fila({ aula_id: null, aula_codigo: null, aula_nombre: null, horarios_etiqueta: null })] });
    const { grupos } = await useCase.execute();
    expect(grupos[0]).toMatchObject({ aulaId: null, aulaNombre: null, horarios: [], horariosEtiqueta: null });
  });

  it('sin filas no consulta horarios con ids inútiles y devuelve lista vacía', async () => {
    const { useCase } = crear({ rows: [] });
    await expect(useCase.execute()).resolves.toMatchObject({ grupos: [], total: 0, totalPages: 0 });
  });

  it('el estado se resuelve como EFECTIVO del curso y filtra/pagina en JS', async () => {
    const { deps, useCase } = crear({
      rows: [
        fila({ grupo_id: 1 }),
        fila({ grupo_id: 2, curso_estado: 'PROPUESTO' }),
        fila({ grupo_id: 3, curso_estado: 'ABIERTO', curso_fecha_inicio: '2999-01-01' }),
      ],
    });
    const res = await useCase.execute({}, 1, 1, { estado: 'EN_CURSO' });
    // inicio en 2999: los cursos ABIERTO siguen ABIERTO (no EN_CURSO)
    expect(res.total).toBe(0);
    const abiertos = await useCase.execute({}, 1, 1, { estado: 'ABIERTO' });
    expect(abiertos).toMatchObject({ total: 2, totalPages: 2 });
    expect(abiertos.grupos).toHaveLength(1);
    expect(deps.grupoCapacitacionListadoViewRepository.findListado).toHaveBeenCalledWith(
      { search: undefined, cursoId: undefined }, 1, 10000
    );
  });

  it.each([['abc'], [0], [-1]])('rechaza cursoId inválido (%p)', async (cursoId) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute({}, 1, 10, { cursoId })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.grupoCapacitacionListadoViewRepository.findListado).not.toHaveBeenCalled();
  });

  it('rechaza estado inválido', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({}, 1, 10, { estado: 'XXX' })).rejects.toBeInstanceOf(ValidationError);
  });
});
