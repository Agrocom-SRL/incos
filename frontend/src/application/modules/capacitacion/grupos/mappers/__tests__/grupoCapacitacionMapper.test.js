import { describe, it, expect } from 'vitest';
import { mapGrupoCapacitacion, mapGruposCapacitacionList } from '../grupoCapacitacionMapper';

const raw = {
  grupoId: 7,
  nombre: ' 1er grupo ',
  cursoId: 3,
  cursoTitulo: 'Curso de Guaraní',
  cursoEstado: 'ABIERTO',
  modalidad: 'SEMIPRESENCIAL',
  cupoMaximo: 20,
  inscritosCount: '5',
  aulaId: 2,
  aulaCodigo: 'A-01',
  aulaNombre: 'Aula 1',
  horarios: [
    { horarioId: 1, etiqueta: 'SAB 08:00-12:00' },
    { horarioId: 2, etiqueta: 'SAB 15:00-19:00' },
  ],
  horariosEtiqueta: 'SAB 08:00-12:00 · SAB 15:00-19:00',
};

describe('grupoCapacitacionMapper', () => {
  it('mapea la fila del listado con aula, cupo disponible y horarios', () => {
    expect(mapGrupoCapacitacion(raw)).toMatchObject({
      id: 7,
      nombre: '1er grupo',
      cursoId: 3,
      cursoTitulo: 'Curso de Guaraní',
      cursoEstado: 'ABIERTO',
      modalidadLabel: 'Semipresencial',
      cupoMaximo: 20,
      inscritosCount: 5,
      cupoDisponible: 15,
      aulaLabel: 'A-01 · Aula 1',
      horariosLineas: ['SAB 08:00-12:00', 'SAB 15:00-19:00'],
    });
  });

  it('sin aula ni cupo máximo: aulaLabel null y cupo sin tope', () => {
    const g = mapGrupoCapacitacion({ grupoId: 1, nombre: 'G', horarios: [] });
    expect(g.aulaLabel).toBeNull();
    expect(g.cupoMaximo).toBeNull();
    expect(g.cupoDisponible).toBeNull();
    expect(g.horariosLineas).toEqual([]);
  });

  it('arma la etiqueta de horarios si el backend no envía horariosEtiqueta', () => {
    const g = mapGrupoCapacitacion({ grupoId: 1, horarios: [{ horarioId: 1, etiqueta: 'LUN 08:00-09:00' }] });
    expect(g.horariosEtiqueta).toBe('LUN 08:00-09:00');
  });

  it('descarta filas sin id y tolera listas inválidas', () => {
    expect(mapGrupoCapacitacion({ nombre: 'sin id' })).toBeNull();
    expect(mapGruposCapacitacionList([raw, null, {}])).toHaveLength(1);
    expect(mapGruposCapacitacionList(undefined)).toEqual([]);
  });
});
