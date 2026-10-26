import { describe, it, expect, vi, beforeEach } from 'vitest';

const casos = vi.hoisted(() => ({}));
vi.mock('@container', () => ({ useCasesFactory: new Proxy({}, { get: (_, k) => casos[k] }) }));

import {
  ESTADO_BIMESTRE_HEADER,
  resolverEstadoBimestreHeader,
  etiquetaEstadoBimestre,
  tooltipAbrirCuaderno,
} from '../bimestreConsolidadoUtils';
import {
  parseFechaCalendario,
  nivelUrgenciaPlazo,
  formatearFechaCalendario,
  calcularPlazoCuaderno,
  mapBimestresCalendario,
  periodoCalendarioPorNumero,
} from '../bimestrePlazoUtils';
import { tituloBimestre } from '../bimestreTitulos';
import { buildResumenDesdePolitica } from '../buildResumenDesdePolitica';
import { validarPuntosBimestre, calcularFilaEstudiante, calcularVistaPrevia } from '../calcularVistaPrevia';
import { createCalificacionesBreadcrumbItems } from '../calificacionesBreadcrumbs';
import * as paths from '../calificacionesPaths';
import { mapEstudiantesRegistroBase, cargarContextoCursoRegistro } from '../cargarContextoCursoRegistro';
import {
  loadEvaluacionesCache,
  saveEvaluacionesCache,
  loadNotasCache,
  saveNotaCache,
  clearNotasEvaluacionCache,
  aplicarNotasCacheAEstudiantes,
} from '../cuadernoLocalCache';
import { mergeNotasEnEstudiantes } from '../mergeNotasCuaderno';
import { resolverNotaMinimaAprobacion, NOTA_MINIMA_APROBACION_DEFAULT } from '../notaMinimaAprobacion';
import { parseNotaInput } from '../parseNotaInput';
import { ajustarParComplementario, ajustarPesosMultiples, sumaPesos } from '../politicaPorcentajeUtils';
import { calcularSumaPuntosComponente, contarNotasCargadas } from '../puntosEvaluaciones';
import { resolverTipoEvaluacionAsistenciaId, esEvaluacionAsistencia } from '../tipoEvaluacionAsistencia';
import { POLITICAS_ASISTENCIA } from '../politicasAsistencia';
import { CALIFICACIONES_PERMISOS } from '../calificacionesPermisos';

beforeEach(() => {
  sessionStorage.clear();
  Object.keys(casos).forEach((k) => delete casos[k]);
});

describe('estado del bimestre', () => {
  it('resuelve el estado del encabezado', () => {
    const { EN_CURSO, CERRADO, PENDIENTE } = ESTADO_BIMESTRE_HEADER;
    expect(resolverEstadoBimestreHeader(1, 3, 'cerrado', true)).toBe(EN_CURSO);
    expect(resolverEstadoBimestreHeader(1, 1, 'futuro')).toBe(PENDIENTE);
    expect(resolverEstadoBimestreHeader(3, 2, 'abierto')).toBe(PENDIENTE);
    expect(resolverEstadoBimestreHeader(2, 2, 'abierto')).toBe(EN_CURSO);
    expect(resolverEstadoBimestreHeader(1, 2, 'abierto')).toBe(CERRADO);
    expect(resolverEstadoBimestreHeader(2, 2, 'cerrado')).toBe(CERRADO);
    expect(resolverEstadoBimestreHeader(2, 2, 'otro')).toBe(CERRADO);
    expect(resolverEstadoBimestreHeader(1, 0, 'abierto')).toBe(EN_CURSO);
  });
  it('etiquetas y tooltips', () => {
    expect(etiquetaEstadoBimestre('en_curso')).toBe('En curso');
    expect(etiquetaEstadoBimestre('cerrado')).toBe('Cerrado');
    expect(etiquetaEstadoBimestre('pendiente')).toBe('Pendiente');
    expect(etiquetaEstadoBimestre('x')).toBe('');
    expect(tooltipAbrirCuaderno(2, 'cerrado', true)).toMatch(/registrar notas/);
    expect(tooltipAbrirCuaderno(2, 'pendiente')).toMatch(/aún no habilitado/);
    expect(tooltipAbrirCuaderno(2, 'cerrado')).toMatch(/consolidado/);
    expect(tooltipAbrirCuaderno(2, 'x')).toMatch(/registrar notas/);
    expect(tituloBimestre(2)).toBe('Segundo bimestre');
    expect(tituloBimestre(9)).toBe('Bimestre 9');
  });
});

describe('plazo del cuaderno', () => {
  const hoy = new Date(2026, 4, 10);
  it('parsea fechas', () => {
    expect(parseFechaCalendario(null)).toBeNull();
    expect(parseFechaCalendario('')).toBeNull();
    expect(parseFechaCalendario(new Date('x'))).toBeNull();
    const d = new Date(2026, 0, 2);
    expect(parseFechaCalendario(d)).toBe(d);
    expect(parseFechaCalendario('2026-03-04T10:00:00Z').getDate()).toBe(4);
    expect(parseFechaCalendario('March 5, 2026').getMonth()).toBe(2);
    expect(parseFechaCalendario('basura')).toBeNull();
    expect(formatearFechaCalendario('2026-03-04')).toMatch(/04.*03.*2026|2026/);
    expect(formatearFechaCalendario(null)).toBeNull();
  });
  it('nivel de urgencia', () => {
    expect(nivelUrgenciaPlazo(80)).toBe('danger');
    expect(nivelUrgenciaPlazo(50)).toBe('warning');
    expect(nivelUrgenciaPlazo(10)).toBe('primary');
    expect(nivelUrgenciaPlazo('x')).toBe('primary');
  });
  it('plazo no calculable', () => {
    expect(calcularPlazoCuaderno({ bimestreNum: 1 }).visible).toBe(false);
    expect(calcularPlazoCuaderno({ bimestreNum: 1, fechaInicio: '2026-01-01' }).mensaje).toBeNull();
  });
  it('mensajes por días restantes en un bimestre intermedio', () => {
    const base = { bimestreNum: 2, fechaInicio: '2026-04-10', hoy };
    const r = calcularPlazoCuaderno({ ...base, fechaFin: '2026-05-30' });
    expect(r).toMatchObject({ visible: true, diasRestantes: 20, nivel: 'warning', esUltimoBimestre: false });
    expect(r.mensaje).toBe('20 días disponibles hasta el cierre del bimestre.');
    expect(r.progresoPct).toBe(Math.round((30 / 50) * 100));
    expect(calcularPlazoCuaderno({ ...base, fechaFin: '2026-05-11' }).mensaje).toBe('1 día disponible hasta el cierre del bimestre.');
    expect(calcularPlazoCuaderno({ ...base, fechaFin: '2026-05-10' }).mensaje).toMatch(/Último día/);
    const vencido = calcularPlazoCuaderno({ ...base, fechaFin: '2026-05-01' });
    expect(vencido).toMatchObject({ visible: false, diasRestantes: 0, progresoPct: 100, nivel: 'danger' });
    expect(vencido.mensaje).toMatch(/bimestre finalizó/);
  });
  it('último bimestre usa el fin de gestión y solo se muestra al final', () => {
    const base = { bimestreNum: 4, fechaInicio: '2026-03-01', fechaFin: '2026-04-01', hoy };
    const lejos = calcularPlazoCuaderno({ ...base, gestionFechaFin: '2026-06-01' });
    expect(lejos).toMatchObject({ visible: false, esUltimoBimestre: true });
    expect(lejos.mensaje).toMatch(/gestión académica/);
    expect(calcularPlazoCuaderno({ ...base, gestionFechaFin: '2026-05-12' }).visible).toBe(true);
    expect(calcularPlazoCuaderno({ ...base, gestionFechaFin: '2026-05-10' }).mensaje).toMatch(/Último día.*gestión/);
    expect(calcularPlazoCuaderno({ ...base, gestionFechaFin: '2026-05-11' }).mensaje).toMatch(/1 día.*gestión/);
    expect(calcularPlazoCuaderno({ ...base, gestionFechaFin: '2026-01-01' }).mensaje).toMatch(/gestión académica finalizó/);
    expect(calcularPlazoCuaderno(base).fechaFinFmt).toBeTruthy();
  });
  it('mapea el calendario de bimestres', () => {
    expect(mapBimestresCalendario(null)).toEqual([]);
    const cal = mapBimestresCalendario([{ numero_orden: 2, fecha_inicio: 'a', estado_calendario: 'abierto', reabierto: 1 }, { nombre: 'B' }]);
    expect(cal[0]).toMatchObject({ numero: 2, fechaInicio: 'a', estadoCalendario: 'abierto', reabierto: true, editable: false });
    expect(cal[1]).toMatchObject({ numero: 2, nombre: 'B', estadoCalendario: 'futuro' });
    expect(periodoCalendarioPorNumero(cal, 2).fechaInicio).toBe('a');
    expect(periodoCalendarioPorNumero(null, 1)).toBeNull();
  });
});

describe('vista previa de notas', () => {
  const evals = [
    { id: 1, componente: 'TEORICO', puntos: 30 },
    { id: 2, componente: 'PRACTICO', puntos: 40 },
    { id: 3, componente: 'PRACTICO', puntos: 30 },
  ];
  it('valida que los componentes sumen la cuota', () => {
    const ok = validarPuntosBimestre(evals);
    expect(ok).toMatchObject({ sumaTeorico: 30, sumaPractico: 70, puntosListos: true, alertas: [] });
    const mal = validarPuntosBimestre([{ componente: 'TEORICO', puntos: 40 }, { componente: 'PRACTICO', puntos: 20 }]);
    expect(mal.puntosListos).toBe(false);
    expect(mal.alertas[0]).toMatch(/supera 30/);
    expect(mal.alertas[1]).toMatch(/suma 20 de 70/);
    expect(validarPuntosBimestre([]).puntosListos).toBe(true);
    expect(validarPuntosBimestre().tieneTeorico).toBe(false);
    expect(validarPuntosBimestre([{ componente: 'TEORICO', puntos: 10 }], { teorico: 10, practico: 90 }).teoricoCompleto).toBe(true);
  });
  it('calcula por estudiante y resume', () => {
    const completo = calcularFilaEstudiante({ id: 1, nombre: 'Ana', notas: { 1: '25.4', 2: 30, 3: 25 } }, evals);
    expect(completo).toMatchObject({ notaTeorico: 25, notaPractico: 55, notaBimestre: 80, incompleto: false, faltantes: 0 });
    const incompleto = calcularFilaEstudiante({ id: 2, nombre: 'Beto', notas: { 1: 20, 2: '' } }, evals);
    expect(incompleto).toMatchObject({ notaTeorico: 20, notaPractico: null, notaBimestre: null, incompletoPractico: true, faltantes: 2 });
    expect(calcularFilaEstudiante({ id: 3 }, [])).toMatchObject({ notaTeorico: null, notaPractico: null, incompleto: false });
    const v = calcularVistaPrevia({ estudiantes: [{ id: 1, notas: { 1: 30, 2: 40, 3: 30 } }, { id: 2, notas: {} }], evaluaciones: evals, cuota: { teorico: 30, practico: 70 } });
    expect(v.resumen).toEqual({ total: 2, calculables: 1, conFaltantes: 1 });
    expect(calcularVistaPrevia({}).filas).toEqual([]);
  });
  it('suma puntos y cuenta notas cargadas', () => {
    expect(calcularSumaPuntosComponente(evals, 'PRACTICO', 5)).toBe(75);
    expect(calcularSumaPuntosComponente(evals, 'PRACTICO', 0, 2)).toBe(30);
    expect(calcularSumaPuntosComponente(null, 'X')).toBe(0);
    expect(contarNotasCargadas([{ notas: { 1: 5 } }, { notas: { 1: '' } }, {}], 1)).toBe(1);
    expect(contarNotasCargadas(null, 1)).toBe(0);
  });
  it('parsea notas ingresadas', () => {
    expect(parseNotaInput('')).toBeNull();
    expect(parseNotaInput(undefined)).toBeNull();
    expect(parseNotaInput('15')).toBe(15);
    expect(parseNotaInput('1.5')).toBeUndefined();
    expect(parseNotaInput('-1')).toBeUndefined();
    expect(parseNotaInput('x')).toBeUndefined();
  });
});

describe('política de calificaciones', () => {
  it('resumen desde política', () => {
    expect(buildResumenDesdePolitica(null)).toBeNull();
    const r = buildResumenDesdePolitica({ cuotaTeorico: 30, cuotaPractico: 70, configurada: 1, gestionNombre: 'G' });
    expect(r).toMatchObject({ cuotaTeorico: 30, sumaCuota: 100, sumaBimestres: 100, notaMinimaAprobacion: 61, configurada: true, pesosBimestres: [25, 25, 25, 25] });
    expect(buildResumenDesdePolitica({ sumaCuota: 90, pesosBimestres: [10, 20], notaMinimaAprobacion: 70 })).toMatchObject({ sumaCuota: 90, sumaBimestres: 30, notaMinimaAprobacion: 70 });
    expect(resolverNotaMinimaAprobacion({ notaMinimaAprobacion: '70' })).toBe(70);
    expect(resolverNotaMinimaAprobacion(null)).toBe(NOTA_MINIMA_APROBACION_DEFAULT);
  });
  it('ajusta porcentajes', () => {
    expect(ajustarParComplementario(0, 30)).toEqual([30, 70]);
    expect(ajustarParComplementario(0, 150)).toEqual([100, 0]);
    expect(ajustarParComplementario(0, 'x')).toEqual([0, 100]);
    expect(ajustarPesosMultiples([], 0, 10)).toEqual([]);
    expect(ajustarPesosMultiples([50], 0, 10)).toEqual([100]);
    expect(ajustarPesosMultiples([25, 25, 25, 25], 0, 40)).toEqual([40, 20, 20, 20]);
    expect(ajustarPesosMultiples([100, 0, 0], 0, 70)).toEqual([70, 15, 15]);
    expect(ajustarPesosMultiples([0, 100, 0], 1, 100)).toEqual([0, 100, 0]);
    expect(sumaPesos([10, '20', null])).toBe(30);
    expect(sumaPesos(null)).toBe(0);
    const trio = ajustarPesosMultiples([33.3, 33.3, 33.4], 0, 50);
    expect(Math.round(sumaPesos(trio))).toBe(100);
    expect(POLITICAS_ASISTENCIA.map((p) => p.value)).toEqual(['NO_AFECTA', 'COMPUTA_NOTA', 'CAUSA_REPROBACION']);
    expect(CALIFICACIONES_PERMISOS.cuaderno).toBe('academico.calificacion.cuaderno');
  });
  it('tipo de evaluación de asistencia', () => {
    expect(resolverTipoEvaluacionAsistenciaId([{ id: 3, codigo: 'ASISTENCIA' }, { id: 4, codigo: 'X' }])).toBe(3);
    expect(resolverTipoEvaluacionAsistenciaId(null)).toBeNull();
    expect(esEvaluacionAsistencia({ tipoEvaluacionId: 3 }, 3)).toBe(true);
    expect(esEvaluacionAsistencia({ tipoEvaluacionId: 3 }, null)).toBe(false);
  });
});

describe('paths, breadcrumbs y caché', () => {
  it('rutas', () => {
    expect(paths.notasCursoPath(5)).toBe('/academico/calificaciones/mis-cursos/5/notas');
    expect(paths.cuadernoBimestrePath(5, 2)).toBe('/academico/calificaciones/mis-cursos/5/cuaderno/2');
    expect(paths.bimestreConsolidadoPath(5, 2)).toMatch(/bimestre\/2\/consolidado$/);
    expect(paths.cursoNivelacionPath(5)).toMatch(/5\/nivelacion$/);
  });
  it('breadcrumbs con la materia', () => {
    const items = createCalificacionesBreadcrumbItems('ACA-CAL-CUADERNO', 'ACA', 'Bimestre 1', { asignacionId: 7, materia: 'Matemática' });
    expect(Array.isArray(items)).toBe(true);
    expect(items.some((i) => i.title === 'Matemática')).toBe(true);
    const sin = createCalificacionesBreadcrumbItems('ACA-CAL-MIS-CURSOS', 'ACA', null, { asignacionId: 7, materia: 'Mate' });
    expect(sin.some((i) => i.title === 'Mate')).toBe(false);
    expect(createCalificacionesBreadcrumbItems('ACA-CAL-CUADERNO', 'ACA', null, { materia: 'M' }).some((i) => i.title === 'M')).toBe(false);
    const final = createCalificacionesBreadcrumbItems('ACA-CAL-BIM-CONSOLIDADO', 'ACA', null, { asignacionId: 7, materia: 'Mate' });
    expect(final.some((i) => i.title === 'Mate')).toBe(true);
  });
  it('caché de sessionStorage', () => {
    expect(loadEvaluacionesCache(1, 1)).toEqual([]);
    saveEvaluacionesCache(1, 1, [{ id: 1 }]);
    expect(loadEvaluacionesCache(1, 1)).toEqual([{ id: 1 }]);
    sessionStorage.setItem('incos:cuaderno-eval:1:2', '{mal');
    expect(loadEvaluacionesCache(1, 2)).toEqual([]);
    saveNotaCache(1, 1, 10, 5, 80);
    saveNotaCache(1, 1, 11, 5, 70);
    saveNotaCache(1, 1, 11, 6, 60);
    expect(loadNotasCache(1, 1)).toEqual({ '10::5': 80, '11::5': 70, '11::6': 60 });
    saveNotaCache(1, 1, 11, 6, '');
    expect(Object.keys(loadNotasCache(1, 1))).toHaveLength(2);
    const aplicado = aplicarNotasCacheAEstudiantes([{ id: 10 }, { id: 99, notas: { 1: 1 } }], 1, 1);
    expect(aplicado[0].notas).toEqual({ 5: 80 });
    expect(aplicado[1].notas).toEqual({ 1: 1 });
    clearNotasEvaluacionCache(1, 1, 5);
    expect(loadNotasCache(1, 1)).toEqual({});
    sessionStorage.setItem('incos:cuaderno-notas:2:1', 'no-json');
    expect(loadNotasCache(2, 1)).toEqual({});
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('lleno');
    });
    expect(() => saveEvaluacionesCache(3, 1, [])).not.toThrow();
    expect(() => saveNotaCache(3, 1, 1, 1, 5)).not.toThrow();
    expect(() => clearNotasEvaluacionCache(3, 1, 1)).not.toThrow();
    spy.mockRestore();
  });
  it('mezcla notas en estudiantes', () => {
    const r = mergeNotasEnEstudiantes([{ id: 1, notas: { 9: 1 } }, { id: 2 }], [{ estudianteId: 1, evaluacionId: 5, nota: 70 }, { estudianteId: 2, evaluacionId: 5, nota: null }, { estudianteId: 3, evaluacionId: 5, nota: 1 }]);
    expect(r[0].notas).toEqual({ 9: 1, 5: 70 });
    expect(r[1].notas).toEqual({});
    expect(r).toHaveLength(2);
  });
});

describe('cargarContextoCursoRegistro', () => {
  it('mapea estudiantes base', () => {
    expect(mapEstudiantesRegistroBase([{ id: 1 }, { id: 2, nro: 9, codigo: 'C', nombre: 'N' }])).toEqual([
      { id: 1, nro: 1, codigo: '', nombre: '', notas: {} },
      { id: 2, nro: 9, codigo: 'C', nombre: 'N', notas: {} },
    ]);
  });
  it('carga el contexto del curso', async () => {
    casos.obtenerRegistroNotasCurso = () => ({
      ejecutar: vi.fn().mockResolvedValue({ success: true, data: { docente: { id: 1, bimestreVigente: '3' }, curso: { id: 2 }, estudiantes: [{ id: 5 }], bimestresCalendario: [{ numero: 1 }], gestion: { x: 1 } } }),
    });
    const ctx = await cargarContextoCursoRegistro(7);
    expect(ctx).toMatchObject({ bimestreVigente: 3, gestionFechas: { x: 1 } });
    expect(ctx.estudiantesBase).toHaveLength(1);
    expect(ctx.bimestresCalendario).toHaveLength(1);
  });
  it('errores: no encontrado, curso sin docente', async () => {
    casos.obtenerRegistroNotasCurso = () => ({ ejecutar: vi.fn().mockResolvedValue({ success: false, error: 'Curso no encontrado' }) });
    await expect(cargarContextoCursoRegistro(1)).rejects.toMatchObject({ code: 'CURSO_NOT_FOUND' });
    casos.obtenerRegistroNotasCurso = () => ({ ejecutar: vi.fn().mockResolvedValue({ success: false }) });
    await expect(cargarContextoCursoRegistro(1)).rejects.toThrow('No se pudo cargar el registro del curso');
    casos.obtenerRegistroNotasCurso = () => ({ ejecutar: vi.fn().mockResolvedValue({ success: true, data: { docente: { id: 1 } } }) });
    await expect(cargarContextoCursoRegistro(1)).rejects.toMatchObject({ code: 'CURSO_NOT_FOUND' });
    casos.obtenerRegistroNotasCurso = () => ({ ejecutar: vi.fn().mockResolvedValue({ success: true }) });
    await expect(cargarContextoCursoRegistro(1)).rejects.toThrow('CURSO_NOT_FOUND');
  });
});
