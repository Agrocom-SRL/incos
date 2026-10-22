import { describe, it, expect } from 'vitest';
import {
  montosCobradosCurso,
  motivoGrupoNoEditable,
  opcionesGrupoEdicion,
  resolverGrupoInicial,
  validarGrupoElegido,
} from '../inscripcionGrupos';

describe('reglas de elección de grupo', () => {
  it('preselecciona el único grupo y exige elegir con dos o más', () => {
    expect(resolverGrupoInicial([{ id: 3 }])).toBe(3);
    expect(resolverGrupoInicial([{ id: 3 }, { id: 4 }])).toBeNull();
    expect(validarGrupoElegido([{ id: 3 }, { id: 4 }], null)).toMatch(/Elija el grupo/);
    expect(validarGrupoElegido([{ id: 3 }], null)).toBeNull();
  });
});

describe('montosCobradosCurso', () => {
  const curso = { tieneCosto: true, costo: 440, cobraMatricula: true, costoMatricula: 150 };

  it('cobra curso y matrícula según los interruptores', () => {
    expect(montosCobradosCurso(curso)).toEqual({ MATRICULA: 150, CURSO: 440 });
  });

  it('con costo del curso externo el instituto solo cobra la matrícula', () => {
    expect(montosCobradosCurso({ ...curso, pagoCursoExterno: true })).toEqual({
      MATRICULA: 150,
      CURSO: 0,
    });
  });
});

describe('motivoGrupoNoEditable', () => {
  const grupos = [{ id: 1 }];

  it('editable con PENDIENTE/INSCRITO y al menos un grupo', () => {
    expect(motivoGrupoNoEditable({ estado: 'PENDIENTE' }, grupos)).toBeNull();
    expect(motivoGrupoNoEditable({ estado: 'INSCRITO' }, grupos)).toBeNull();
  });

  it('explica por qué no con RETIRADO/ANULADO o sin grupos', () => {
    expect(motivoGrupoNoEditable({ estado: 'RETIRADO' }, grupos)).toMatch(/retirada o anulada/);
    expect(motivoGrupoNoEditable({ estado: 'ANULADO' }, grupos)).toMatch(/retirada o anulada/);
    expect(motivoGrupoNoEditable({ estado: 'INSCRITO' }, [])).toMatch(/no tiene grupos/);
  });
});

describe('opcionesGrupoEdicion', () => {
  const grupos = [
    { id: 1, nombre: 'G1', horariosLabel: 'SAB 08:00-12:00', cupoDisponible: 3 },
    { id: 2, nombre: 'G2', horariosLabel: '', cupoDisponible: 0 },
    { id: 3, nombre: 'G3', horariosLabel: null, cupoDisponible: null },
  ];

  it('rotula cupo y deshabilita grupos llenos', () => {
    const opciones = opcionesGrupoEdicion(grupos, 1);
    expect(opciones[0]).toMatchObject({ value: 1, disabled: false, label: 'G1 · SAB 08:00-12:00 · 3 cupos' });
    expect(opciones[1]).toMatchObject({ disabled: true, label: 'G2 · cupo completo' });
    expect(opciones[2].label).toBe('G3 · sin tope de cupo');
  });

  it('el grupo actual lleno sigue seleccionable', () => {
    expect(opcionesGrupoEdicion(grupos, 2)[1].disabled).toBe(false);
  });
});
