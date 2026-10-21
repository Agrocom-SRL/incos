import { describe, it, expect, jest } from '@jest/globals';
import { GetCursoCapacitacionByIdUseCase } from '../../../src/application/use-cases/capacitacion/GetCursoCapacitacionByIdUseCase.js';

describe('GetCursoCapacitacionByIdUseCase', () => {
  const crear = ({ row = { id: 1, titulo: 'T', estado: 'PROPUESTO', activo: 1 }, horarios = [], requisitos = [], grupos = [] } = {}) => {
    const deps = {
      cursoCapacitacionFichaViewRepository: {
        findListadoById: jest.fn().mockResolvedValue(row),
        findHorariosByCapacitacionId: jest.fn().mockResolvedValue(horarios),
      },
      grupoCapacitacionRepository: {
        findConInscritosByCapacitacionId: jest.fn().mockResolvedValue(grupos),
      },
      capacitacionRequisitoRepository: {
        findByCapacitacionId: jest.fn().mockResolvedValue(requisitos),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new GetCursoCapacitacionByIdUseCase(deps) };
  };

  it('devuelve la ficha con grupos, sus horarios e inscritosCount', async () => {
    const { deps, useCase } = crear({
      grupos: [
        { id: 1, nombre: 'Grupo 1 – Mañana', cupoMaximo: 20, orden: 1, inscritosCount: 7, aulaId: 4, aulaCodigo: 'A-4', aulaNombre: 'Aula 4' },
        { id: 2, nombre: 'Grupo 2 – Tarde', cupoMaximo: null, orden: 2, inscritosCount: 0 },
      ],
      horarios: [
        { capacitacion_horario_id: 1, grupo_id: 1, grupo_nombre: 'Grupo 1 – Mañana', horario_id: 10, dia: 'SABADO', hora_inicio: '08:00:00', hora_fin: '12:00:00', bloque_etiqueta: 'SAB 08:00-12:00' },
        { capacitacion_horario_id: 2, grupo_id: 2, grupo_nombre: 'Grupo 2 – Tarde', horario_id: 11, dia: 'SABADO', hora_inicio: '15:00:00', hora_fin: '19:00:00', bloque_etiqueta: 'SAB 15:00-19:00' },
      ],
      requisitos: [{ id: 3, descripcion: 'Cédula', obligatorio: true, orden: 1 }],
    });
    const res = await useCase.execute(1);
    expect(deps.cursoCapacitacionFichaViewRepository.findListadoById).toHaveBeenCalledWith(1);
    expect(deps.cursoCapacitacionFichaViewRepository.findHorariosByCapacitacionId).toHaveBeenCalledWith(1);
    expect(res.id).toBe(1);
    expect(deps.grupoCapacitacionRepository.findConInscritosByCapacitacionId).toHaveBeenCalledWith(1);
    expect(res.horarioIds).toBeUndefined();
    expect(res.grupos).toHaveLength(2);
    expect(res.grupos[0]).toMatchObject({
      id: 1, nombre: 'Grupo 1 – Mañana', cupoMaximo: 20, inscritosCount: 7, aulaId: 4, aulaCodigo: 'A-4', aulaNombre: 'Aula 4',
    });
    expect(res.grupos[1]).toMatchObject({ aulaId: null, aulaCodigo: null, aulaNombre: null });
    expect(res.aulaId).toBeUndefined();
    expect(res.grupos[0].horarios).toEqual([
      expect.objectContaining({
        capacitacionHorarioId: 1, horarioId: 10, dia: 'SABADO', horaInicio: '08:00:00', horaFin: '12:00:00', etiqueta: 'SAB 08:00-12:00',
      }),
    ]);
    expect(res.grupos[1].horarios.map((h) => h.horarioId)).toEqual([11]);
    expect(res.horariosComunes).toEqual([]);
    expect(deps.capacitacionRequisitoRepository.findByCapacitacionId).toHaveBeenCalledWith(1);
    expect(res.requisitos).toEqual([{ id: 3, descripcion: 'Cédula', obligatorio: true, orden: 1 }]);
  });

  it('expone los campos del folleto y fechaFin nula', async () => {
    const { useCase } = crear({
      row: {
        id: 1, titulo: 'Guaraní', estado: 'ABIERTO', fecha_inicio: '2000-01-01', fecha_fin: null,
        tiene_costo: 1, cobra_matricula: 0, grupos_count: 2, costo: '440.00', costo_matricula: '150.00', entidad_certificadora: 'IPELC', modalidad: 'SEMIPRESENCIAL',
        nivel: 'Básico', dirigido_a: 'Todos', duracion: '2 meses', aulas_resumen: 'Aula 1, Aula 2', activo: 1,
      },
    });
    const res = await useCase.execute(1);
    expect(res).toMatchObject({
      tieneCosto: true, cobraMatricula: false, gruposCount: 2, costo: 440, costoMatricula: 150, entidadCertificadora: 'IPELC', modalidad: 'SEMIPRESENCIAL',
      nivel: 'Básico', dirigidoA: 'Todos', duracion: '2 meses', fechaFin: null, aulasResumen: 'Aula 1, Aula 2',
      estado: 'EN_CURSO',
    });
  });

  it('devuelve null si el curso no existe', async () => {
    const { deps, useCase } = crear({ row: null });
    await expect(useCase.execute(5)).resolves.toBeNull();
    expect(deps.cursoCapacitacionFichaViewRepository.findHorariosByCapacitacionId).not.toHaveBeenCalled();
  });

  it('curso sin grupos ni horarios -> listas vacías', async () => {
    const { useCase } = crear();
    const res = await useCase.execute(1);
    expect(res.grupos).toEqual([]);
    expect(res.horariosComunes).toEqual([]);
    expect(res.requisitos).toEqual([]);
  });
});
