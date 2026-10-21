import { describe, it, expect } from 'vitest';
import {
  crearGrupoVacio,
  hayGrupoSinNombre,
  quitarHorarioDeGrupo,
  reconciliarHorariosGrupo,
} from '../gruposCapacitacion';
import { montosCobradosCurso, resolverGrupoInicial, validarGrupoElegido } from '../inscripcionGrupos';
import { buildConceptoOptions } from '../capacitacionCatalogos';

describe('gruposCapacitacion', () => {
  it('crea grupos vacíos con key única', () => {
    const a = crearGrupoVacio();
    expect(a).toMatchObject({ id: null, nombre: '', cupoMaximo: null, aulaId: null, horarios: [] });
    expect(a.key).not.toBe(crearGrupoVacio().key);
  });

  it('el grupo nuevo hereda el cupo por defecto del curso', () => {
    expect(crearGrupoVacio(30).cupoMaximo).toBe(30);
    expect(crearGrupoVacio(undefined).cupoMaximo).toBeNull();
  });

  it('reconcilia: conserva, agrega y descarta según la selección', () => {
    expect(
      reconciliarHorariosGrupo([{ horarioId: 1 }, { horarioId: 2 }], [2, '3']),
    ).toEqual([{ horarioId: 2 }, { horarioId: 3 }]);
    expect(reconciliarHorariosGrupo([{ horarioId: 1 }], [])).toEqual([]);
  });

  it('quita un horario del grupo indicado sin tocar los demás', () => {
    const grupos = [
      { nombre: 'A', horarios: [{ horarioId: 1 }, { horarioId: 2 }] },
      { nombre: 'B', horarios: [{ horarioId: 1 }] },
    ];
    const r = quitarHorarioDeGrupo(grupos, 0, 1);
    expect(r[0].horarios).toEqual([{ horarioId: 2 }]);
    expect(r[1].horarios).toEqual([{ horarioId: 1 }]);
  });

  it('detecta grupos sin nombre', () => {
    expect(hayGrupoSinNombre([{ nombre: 'A' }, { nombre: '  ' }])).toBe(true);
    expect(hayGrupoSinNombre([{ nombre: 'A' }])).toBe(false);
    expect(hayGrupoSinNombre(undefined)).toBe(false);
  });
});

describe('inscripcionGrupos', () => {
  it('preselecciona solo si hay un único grupo', () => {
    expect(resolverGrupoInicial([{ id: 5 }])).toBe(5);
    expect(resolverGrupoInicial([{ id: 5 }, { id: 6 }])).toBeNull();
    expect(resolverGrupoInicial([])).toBeNull();
  });

  it('exige grupo solo con 2 o más', () => {
    expect(validarGrupoElegido([{ id: 1 }, { id: 2 }], null)).toMatch(/Elija el grupo/);
    expect(validarGrupoElegido([{ id: 1 }, { id: 2 }], 2)).toBeNull();
    expect(validarGrupoElegido([{ id: 1 }], null)).toBeNull();
    expect(validarGrupoElegido([], null)).toBeNull();
  });

  it('montos cobrados: un concepto apagado vale 0 y no se ofrece', () => {
    const montos = montosCobradosCurso({ tieneCosto: true, costo: 440, cobraMatricula: false, costoMatricula: 150 });
    expect(montos).toEqual({ MATRICULA: 0, CURSO: 440 });
    expect(buildConceptoOptions(montos).map((o) => o.value)).toEqual(['CURSO']);
    expect(buildConceptoOptions(montosCobradosCurso({ tieneCosto: false, cobraMatricula: false }))).toEqual([]);
  });
});
