import { describe, it, expect } from 'vitest';
import {
  PLANILLA_ROW_ESTADOS as E,
  PERIODO_SUBTITULOS as S,
  buildMateriasPlanillaModel,
  buildSeleccionResumen,
  computeInitialSelection,
  computePeriodoQueLeToca,
  pruneSeleccionInvalida,
} from '../materiasPlanillaRules';

const asig = (id, sigla, extra = {}) => ({
  asignaturaPlanId: 100 + id,
  materiaId: id,
  sigla,
  nombre: `Materia ${sigla}`,
  horasSemanales: 4,
  ...extra,
});

/** Plan de 3 periodos; MAT2 exige MAT1, MAT3 exige MAT2. */
const contexto = (estudiante = {}, extra = {}) => ({
  estudiante,
  periodos: [
    { id: 30, numero: 3, nombre: 'Tercero', asignaturas: [asig(5, 'MAT3', { prerrequisito: { sigla: 'MAT2' } })] },
    { id: 10, numero: 1, asignaturas: [asig(1, 'MAT1'), asig(2, 'FIS1')] },
    {
      id: 20,
      numero: 2,
      nombre: 'Segundo',
      asignaturas: [asig(3, 'MAT2', { prerrequisito: { asignaturaPlanId: 101 } }), asig(4, 'FIS2', { prerrequisito: { materiaId: 2 } })],
    },
  ],
  ...extra,
});

const fila = (model, sigla) => model.periodos.flatMap((p) => p.rows).find((r) => r.sigla === sigla);

describe('computePeriodoQueLeToca', () => {
  it('devuelve null sin minPeriodoPendiente y respeta el salto máximo', () => {
    expect(computePeriodoQueLeToca()).toBeNull();
    const periodos = [
      { numero: 1, asignaturas: [{ estadoHistorial: 'APROBADO' }] },
      { numero: 2, asignaturas: [{ estadoHistorial: null }] },
      { numero: 3, asignaturas: [{}] },
      { numero: 4, asignaturas: [] },
    ];
    expect(computePeriodoQueLeToca({ periodos, minPeriodoPendiente: 1 })).toBe(2);
    expect(computePeriodoQueLeToca({ periodos, minPeriodoPendiente: 0 })).toBe(1);
    expect(computePeriodoQueLeToca({ periodos: [], minPeriodoPendiente: 2 })).toBe(2);
  });
});

describe('buildMateriasPlanillaModel', () => {
  it('sin contexto o sin periodos devuelve null', () => {
    expect(buildMateriasPlanillaModel()).toBeNull();
    expect(buildMateriasPlanillaModel({ contexto: { periodos: [] } })).toBeNull();
  });

  it('esNuevoSistema desconocido: planilla libre, ordenada, sin subtítulos', () => {
    const m = buildMateriasPlanillaModel({ contexto: contexto(), seleccion: { 10: [1], 20: [3] } });
    expect(m.periodos.map((p) => p.numero)).toEqual([1, 2, 3]);
    expect(m.periodos[0].subtitulo).toBeNull();
    expect(m.perfil.esNuevoSistema).toBeNull();
    expect(fila(m, 'MAT1').estado).toBe(E.SELECCIONADA);
    expect(fila(m, 'MAT1').tag).toBe('arrastre');
    expect(fila(m, 'MAT2').tag).toBeNull();
    expect(m.flags).toMatchObject({ multiPeriodo: true, minSelectedNumero: 1, maxSelectedNumero: 2, totalSeleccionadas: 2 });
    expect(m.periodos[0].nombre).toBe('Periodo 1');
    expect(m.periodos[0]).toMatchObject({ seleccionablesCount: 2, seleccionadasCount: 1, algunaSeleccionada: true, todasSeleccionadas: false });
  });

  it('NUEVO: primer periodo fijo y el resto bloqueado', () => {
    const m = buildMateriasPlanillaModel({ contexto: contexto({ tipoAdmision: 'nuevo', esNuevoSistema: true }) });
    expect(m.periodos[0]).toMatchObject({ fijo: true, disabled: false, subtitulo: S.ACTUAL });
    expect(fila(m, 'MAT1')).toMatchObject({ estado: E.FIJA, marcada: true, seleccionable: false });
    expect(m.periodos[1]).toMatchObject({ disabled: true, subtitulo: S.BLOQUEADO_SECUENCIA });
    expect(fila(m, 'MAT2').estado).toBe(E.BLOQUEADA_PERIODO);
    expect(m.flags.totalSeleccionadas).toBe(2);
  });

  it('TRASPASO: periodos hasta anio cursado convalidados; prerrequisito cubierto por el wizard', () => {
    const m = buildMateriasPlanillaModel({
      contexto: contexto({ tipoAdmision: 'TRASPASO', esNuevoSistema: true, traspasoAnioCursado: 'PRIMERO' }),
      seleccion: { 20: [3] },
    });
    expect(m.periodos[0]).toMatchObject({ disabled: true, subtitulo: S.CONVALIDADO_TRASPASO });
    expect(fila(m, 'MAT2').estado).toBe(E.SELECCIONADA);
    const seg = buildMateriasPlanillaModel({ contexto: contexto(), tipoAdmision: 'TRASPASO', esNuevoSistema: true, traspasoAnioCursado: 'SEGUNDO' });
    expect(seg.periodos[1].subtitulo).toBe(S.CONVALIDADO_TRASPASO);
    expect(seg.periodos[2].subtitulo).toBe(S.DISPONIBLE);
    const otro = buildMateriasPlanillaModel({ contexto: contexto(), tipoAdmision: 'TRASPASO', esNuevoSistema: true, traspasoAnioCursado: 'TERCERO' });
    expect(otro.periodos[0].disabled).toBe(false);
  });

  it('TRANSITABILIDAD: periodo 1 convalidado; marcado previo bloquea la dependiente', () => {
    const m = buildMateriasPlanillaModel({
      contexto: contexto({ tipoAdmision: 'TRANSITABILIDAD', esNuevoSistema: 1 }),
      seleccion: { 20: [3], abc: [9], 30: [], 99: 'x' },
    });
    expect(m.periodos[0]).toMatchObject({ disabled: true, subtitulo: S.CONVALIDADO_TRANSITABILIDAD });
    expect(fila(m, 'MAT2').estado).toBe(E.SELECCIONADA);
    // MAT3 exige MAT2, que está marcada en esta gestión: no puede cursarse a la vez.
    expect(fila(m, 'MAT3')).toMatchObject({ estado: E.BLOQUEADA_PRERREQUISITO, tooltip: 'Requiere MAT2 aprobada' });
  });

  it('ANTIGUO nuevo sistema: libre y prerrequisito cubierto por hipótesis; otro tipo no cubre', () => {
    const a = buildMateriasPlanillaModel({ contexto: contexto({ tipoAdmision: 'ANTIGUO', esNuevoSistema: true }) });
    expect(a.periodos.every((p) => !p.disabled)).toBe(true);
    expect(fila(a, 'MAT2').estado).toBe(E.NORMAL);
    const o = buildMateriasPlanillaModel({ contexto: contexto({ tipoAdmision: 'OTRO', esNuevoSistema: true }) });
    expect(fila(o, 'MAT2').estado).toBe(E.BLOQUEADA_PRERREQUISITO);
  });

  it('readOnly deja las filas no seleccionables', () => {
    const m = buildMateriasPlanillaModel({ contexto: contexto({ tipoAdmision: 'ANTIGUO', esNuevoSistema: true }), readOnly: true });
    expect(m.periodos[0].rows.every((r) => !r.seleccionable)).toBe(true);
    expect(m.flags.readOnly).toBe(true);
  });

  it('con historial en el sistema: aprobadas, nivelación, salto máximo y prerrequisito por sigla', () => {
    const ctx = {
      estudiante: { tipoAdmision: 'ANTIGUO', esNuevoSistema: false },
      resumenHistorial: { minPeriodoPendiente: 2 },
      periodos: [
        { id: 10, numero: 1, asignaturas: [asig(1, 'MAT1', { estadoHistorial: 'aprobado', notaFinal: 70 }), asig(2, 'FIS1', { estadoHistorial: 'CONVALIDADO' }), asig(6, 'QUI1', { estadoHistorial: 'REPROBADO' })] },
        { id: 20, numero: 2, asignaturas: [asig(3, 'MAT2', { prerrequisito: { sigla: ' mat1 ' } }), asig(4, 'FIS2', { prerrequisito: { sigla: 'XXX' } }), asig(7, 'ING2', { prerrequisito: { sigla: 'QUI1' } })] },
        { id: 30, numero: 3, asignaturas: [asig(5, 'MAT3')] },
        { id: 40, numero: 4, asignaturas: [asig(8, 'MAT4')] },
      ],
    };
    const m = buildMateriasPlanillaModel({ contexto: ctx, seleccion: { 20: [3] } });
    expect(m.flags).toMatchObject({ queLeTocaNumero: 2, saltoMaximoNumero: 3 });
    expect(fila(m, 'MAT1')).toMatchObject({ estado: E.APROBADA, tooltip: 'Aprobada en su historial académico (nota 70)', marcada: true });
    expect(fila(m, 'FIS1').tooltip).toBe('Convalidada en su historial académico');
    expect(fila(m, 'QUI1')).toMatchObject({ esNivelar: true, seleccionable: true });
    expect(m.flags.premarcadasNivelar.map((x) => x.sigla)).toEqual(['QUI1']);
    expect(m.flags.desmarcadasNivelar).toHaveLength(1);
    expect(m.periodos[1].subtitulo).toBe(S.ACTUAL);
    expect(m.periodos[2].subtitulo).toBe(S.DISPONIBLE);
    expect(m.periodos[3]).toMatchObject({ disabled: true, subtitulo: S.BLOQUEADO_SECUENCIA });
    expect(fila(m, 'MAT2').estado).toBe(E.SELECCIONADA);
    // Prerrequisito fuera del plan cargado: no se puede verificar, queda libre.
    expect(fila(m, 'FIS2').estado).toBe(E.NORMAL);
    // QUI1 reprobada no cubre ING2.
    expect(fila(m, 'ING2').estado).toBe(E.BLOQUEADA_PRERREQUISITO);
    expect(fila(m, 'MAT4').estado).toBe(E.BLOQUEADA_PERIODO);

    const sel = buildMateriasPlanillaModel({ contexto: ctx, seleccion: { 10: [6] } });
    expect(fila(sel, 'QUI1').tag).toBe('nivelar');
    expect(sel.flags.desmarcadasNivelar).toHaveLength(0);
  });
});

describe('computeInitialSelection', () => {
  it('NUEVO selecciona el bloque del primer periodo; sin contexto, vacío', () => {
    expect(computeInitialSelection()).toEqual({});
    expect(computeInitialSelection({ contexto: contexto({ tipoAdmision: 'NUEVO', esNuevoSistema: true }) })).toEqual({ 10: [1, 2] });
  });
  it('con historial pre-marca las pendientes a nivelar', () => {
    const ctx = {
      estudiante: { esNuevoSistema: false },
      resumenHistorial: { minPeriodoPendiente: 2 },
      periodos: [
        { id: 10, numero: 1, asignaturas: [asig(1, 'A', { estadoHistorial: 'APROBADO' }), asig(2, 'B', { estadoHistorial: 'REPROBADO' })] },
        { id: 20, numero: 2, asignaturas: [asig(3, 'C')] },
      ],
    };
    expect(computeInitialSelection({ contexto: ctx })).toEqual({ 10: [2] });
    expect(computeInitialSelection({ contexto: contexto({ esNuevoSistema: true, tipoAdmision: 'ANTIGUO' }) })).toEqual({});
  });
});

describe('pruneSeleccionInvalida', () => {
  const ctx = contexto({ tipoAdmision: 'ANTIGUO', esNuevoSistema: true });
  it('mantiene la misma referencia si todo es válido', () => {
    const sel = { 10: [1] };
    expect(pruneSeleccionInvalida({ contexto: ctx, seleccion: sel })).toBe(sel);
  });
  it('quita materias inexistentes y periodos vacíos, y devuelve lo original sin contexto', () => {
    expect(pruneSeleccionInvalida({ contexto: ctx, seleccion: { 10: [1, 77], 20: [], 99: [1] } })).toEqual({ 10: [1] });
    const sel = { 10: [1] };
    expect(pruneSeleccionInvalida({ seleccion: sel })).toBe(sel);
  });
  it('NUEVO conserva las filas fijas', () => {
    const nuevo = contexto({ tipoAdmision: 'NUEVO', esNuevoSistema: true });
    const sel = { 10: [1, 2] };
    expect(pruneSeleccionInvalida({ contexto: nuevo, seleccion: sel })).toBe(sel);
    expect(pruneSeleccionInvalida({ contexto: nuevo, seleccion: { 10: [1, 2], 20: [3] } })).toEqual({ 10: [1, 2] });
  });
});

describe('buildSeleccionResumen', () => {
  it('sin modelo devuelve el resumen vacío', () => {
    expect(buildSeleccionResumen(null)).toEqual({ porPeriodo: [], totales: { materias: 0, horas: 0, periodos: 0 }, multiPeriodo: false, desmarcadasNivelar: [] });
  });
  it('agrupa por periodo con horas, arrastre y totales', () => {
    const m = buildMateriasPlanillaModel({ contexto: contexto({ tipoAdmision: 'ANTIGUO', esNuevoSistema: true }), seleccion: { 10: [1, 2], 20: [3] } });
    const r = buildSeleccionResumen(m);
    expect(r.totales).toEqual({ materias: 3, horas: 12, periodos: 2 });
    expect(r.multiPeriodo).toBe(true);
    expect(r.porPeriodo[0]).toMatchObject({ numero: 1, totalMaterias: 2, totalHoras: 8, tieneArrastre: true, tieneNivelar: false });
    expect(r.porPeriodo[0].materias[0]).toMatchObject({ sigla: 'MAT1', tag: 'arrastre' });
  });
});
