import { describe, it, expect } from 'vitest';
import { estadoCalendarioPorFecha, estadoInstitucional, mapBimestreApertura, buildBimestresApertura } from '../bimestresApertura';
import { formatFechaCorta, formatRangoFechas, buildBimestresTimeline } from '../bimestresTimeline';
import { tipoMeta, estadoDot, mapActividadView, buildCronograma } from '../cronogramaGestion';
import { gestionActivacionStatus } from '../gestionActivacionStatus';
import { toISODate, mapPeriodoLectura, colorPeriodo, periodoDeDia, mesesDelAnio, celdasDelMes, anioDelCalendario } from '../periodosCalendario';
import { resolverFaseGestion } from '../resolverFaseGestion';
import {
  getActividadTipoLabel,
  getActividadTipoPillClass,
  getActividadEstadoLabel,
  getActividadEstadoPillClass,
  getActividadTipoDotClass,
  getActividadTipoTextClass,
  TIPO_ACTIVIDAD_OPTIONS,
} from '../../config/actividadPill';
import { actualPaths } from '../../config/paths';
import { gestionPlanDisplayLabel, isGestionPlanVigente, buildGestionPlanesResumen } from '../../../pasadas/utils/gestionPlanesResumen';

const HOY = new Date(2026, 5, 15);

describe('bimestresApertura', () => {
  it('compara la fecha de hoy con el rango', () => {
    expect(estadoCalendarioPorFecha('2026-07-01', '2026-08-01', HOY)).toBe('futuro');
    expect(estadoCalendarioPorFecha('2026-01-01', '2026-02-01', HOY)).toBe('cerrado');
    expect(estadoCalendarioPorFecha('2026-06-01T00:00:00Z', '2026-06-30', HOY)).toBe('abierto');
    expect(estadoCalendarioPorFecha(null, null, HOY)).toBe('futuro');
  });
  it('traduce estado UI a institucional', () => {
    expect(estadoInstitucional('cerrado')).toBe('CERRADO');
    expect(estadoInstitucional('vigente')).toBe('EN_CURSO');
    expect(estadoInstitucional('futuro')).toBe('PENDIENTE');
  });
  it('habilita abrir/cerrar según estado y fechas', () => {
    const base = { numero: 1, fechaInicio: '2026-06-01', fechaFin: '2026-06-30' };
    const sinIniciar = mapBimestreApertura({ ...base, estado: 'futuro' }, { iniciada: false, hoy: HOY });
    expect(sinIniciar).toMatchObject({ abrirHabilitado: false, cerrarHabilitado: false, codigo: 'B1', nombre: 'Bimestre 1' });
    expect(sinIniciar.abrirTooltip).toMatch(/inicie la gestión/);
    const abrible = mapBimestreApertura({ ...base, estado: 'futuro' }, { iniciada: true, hoy: HOY });
    expect(abrible.abrirHabilitado).toBe(true);
    expect(abrible.cerrarTooltip).toMatch(/aún no está en curso/);
    const futuro = mapBimestreApertura({ ...base, fechaInicio: '2026-09-01', fechaFin: '2026-10-01', estado: 'futuro' }, { iniciada: true, hoy: HOY });
    expect(futuro.abrirTooltip).toMatch(/fecha de inicio/);
    const enCurso = mapBimestreApertura({ ...base, estado: 'vigente' }, { iniciada: true, hoy: HOY });
    expect(enCurso.abrirTooltip).toMatch(/ya está abierto/);
    expect(enCurso.cerrarTooltip).toMatch(/fecha de fin/);
    const cerrable = mapBimestreApertura({ ...base, fechaFin: '2026-06-10', estado: 'vigente' }, { iniciada: true, hoy: HOY });
    expect(cerrable.cerrarHabilitado).toBe(true);
    const cerrado = mapBimestreApertura({ ...base, estado: 'cerrado', codigo: 'X', nombre: 'N' }, { iniciada: true, hoy: HOY });
    expect(cerrado).toMatchObject({ abrirTooltip: 'El bimestre ya está cerrado.', cerrarTooltip: 'El bimestre ya está cerrado.', codigo: 'X', nombre: 'N' });
  });
  it('ordena por número', () => {
    expect(buildBimestresApertura([{ numero: 2 }, { numero: 1 }]).map((b) => b.numero)).toEqual([1, 2]);
    expect(buildBimestresApertura(null)).toEqual([]);
  });
});

describe('bimestresTimeline y cronograma', () => {
  it('formatea fechas y rangos', () => {
    expect(formatFechaCorta('2026-03-05T00:00')).toBe('05/03/2026');
    expect(formatFechaCorta(null)).toBe('—');
    expect(formatFechaCorta('abc')).toBe('abc');
    expect(formatRangoFechas('2026-03-05', null)).toBe('05/03/2026 – —');
  });
  it('construye la línea de tiempo', () => {
    const [a, b] = buildBimestresTimeline([{ numero: 1, estado: 'vigente', fechaInicio: '2026-01-01', fechaFin: '2026-02-01', metricas: { x: 1 } }, { numero: 2, estado: 'raro' }]);
    expect(a).toMatchObject({ stepStatus: 'process', rango: '01/01/2026 – 01/02/2026', metricas: { x: 1 } });
    expect(a.tag.label).toBe('Vigente');
    expect(b).toMatchObject({ estado: 'raro', stepStatus: 'wait', metricas: null });
    expect(buildBimestresTimeline()).toEqual([]);
  });
  it('mapea actividades y cronograma', () => {
    expect(tipoMeta('FERIADO').label).toBe('Feriado');
    expect(tipoMeta('zzz').label).toBe('Actividad');
    expect(estadoDot('vigente')).toBe('blue');
    expect(estadoDot('x')).toBe('gray');
    expect(mapActividadView({ tipo: 'FERIA', fechaInicio: '2026-01-02' })).toMatchObject({ rango: '02/01/2026', esRango: false });
    expect(mapActividadView({ fechaInicio: '2026-01-02', fechaFin: '2026-01-03' })).toMatchObject({ rango: '02/01/2026 – 03/01/2026', esRango: true });
    const c = buildCronograma({ periodos: [{ fechaInicio: '2026-01-01', fechaFin: '2026-02-01', actividades: [{ tipo: 'OTRO' }] }, {}], proximasActividades: [{}] });
    expect(c.periodos[0]).toMatchObject({ totalActividades: 1 });
    expect(c.periodos[1].actividades).toEqual([]);
    expect(c.proximas).toHaveLength(1);
    expect(buildCronograma(null)).toEqual({ periodos: [], proximas: [] });
  });
  it('estado de activación de la gestión', () => {
    expect(gestionActivacionStatus({ gestionIniciada: true, bimestres: [{ matriculasTransicionadas: 5 }] })).toEqual({ iniciada: true, estadoLabel: 'Cursado iniciado', estadoColor: 'success', matriculasCursando: 5 });
    expect(gestionActivacionStatus(null)).toMatchObject({ iniciada: false, estadoColor: 'default', matriculasCursando: null });
  });
});

describe('periodosCalendario', () => {
  it('mapea periodos y colores', () => {
    expect(toISODate('2026-01-02T10:00')).toBe('2026-01-02');
    expect(toISODate(null)).toBeNull();
    expect(mapPeriodoLectura({ id: 1, fechaInicio: '2026-01-02T00:00' })).toMatchObject({ id: 1, numeroOrden: null, colorHex: null, fechaInicio: '2026-01-02' });
    expect(colorPeriodo({ colorHex: 'ff0000' })).toBe('#ff0000');
    expect(colorPeriodo({ division: 'BIMESTRE' })).toBe('#2196f3');
    expect(colorPeriodo(null)).toBe('#10b981');
  });
  it('elige el periodo más corto que contiene el día', () => {
    const ps = [
      { id: 1, fechaInicio: '2026-01-01', fechaFin: '2026-12-31' },
      { id: 2, fechaInicio: '2026-03-01', fechaFin: '2026-03-31' },
      { id: 3 },
    ];
    expect(periodoDeDia('2026-03-10', ps).id).toBe(2);
    expect(periodoDeDia('2026-05-10', ps).id).toBe(1);
    expect(periodoDeDia('2027-01-01', ps)).toBeNull();
  });
  it('genera meses y celdas del calendario', () => {
    expect(mesesDelAnio(2026)).toHaveLength(12);
    const celdas = celdasDelMes(2026, 1); // febrero 2026 empieza en domingo
    expect(celdas.length % 7).toBe(0);
    expect(celdas.slice(0, 6).every((c) => c === null)).toBe(true);
    expect(celdas[6]).toEqual({ iso: '2026-02-01', dia: 1 });
    expect(celdas.filter(Boolean)).toHaveLength(28);
  });
  it('resuelve el año del calendario', () => {
    expect(anioDelCalendario({ anio: '2025' })).toBe(2025);
    expect(anioDelCalendario({ fechaInicio: '2024-05-01' })).toBe(2024);
    expect(anioDelCalendario(null)).toBe(new Date().getFullYear());
  });
});

describe('resolverFaseGestion', () => {
  const bims = [{ numero: 1, fechaInicio: '2026-07-01', fechaFin: '2026-08-01' }, { numero: 4, fechaFin: '2026-06-01' }, { numero: 2, fechaFin: '2026-06-01' }, { numero: 3, fechaFin: '2026-12-01' }];
  it('fase previa al inicio', () => {
    expect(resolverFaseGestion({ hoy: HOY, gestionIniciada: false, bimestres: bims })).toMatchObject({ fase: 'PRE_INICIO', ventanaAbierta: false, disponibleDesde: '2026-07-01' });
    expect(resolverFaseGestion({ hoy: HOY, gestionIniciada: false })).toMatchObject({ ventanaAbierta: true, disponibleDesde: null });
    expect(resolverFaseGestion().fase).toBe('PRE_INICIO');
  });
  it('clausura, cierre y en curso', () => {
    expect(resolverFaseGestion({ hoy: HOY, gestionIniciada: true, bimestres: bims, bimestreVigente: 4 }).fase).toBe('CLAUSURA');
    expect(resolverFaseGestion({ hoy: HOY, gestionIniciada: true, bimestres: bims, bimestreVigente: 2 })).toMatchObject({ fase: 'CIERRE_BIMESTRE', bimestreObjetivo: 2 });
    expect(resolverFaseGestion({ hoy: HOY, gestionIniciada: true, bimestres: bims, bimestreVigente: 3 })).toMatchObject({ fase: 'EN_CURSO', mensaje: 'Bimestre 3 en curso.' });
    expect(resolverFaseGestion({ hoy: HOY, gestionIniciada: true })).toMatchObject({ fase: 'EN_CURSO', bimestreObjetivo: null, mensaje: 'Gestión en curso.' });
  });
});

describe('config de cronograma y paths', () => {
  it('etiquetas y clases', () => {
    expect(getActividadTipoLabel('FERIA')).toBe('Feria');
    expect(getActividadTipoLabel('zz')).toBe('Actividad');
    expect(getActividadTipoPillClass('FERIADO')).toBe('cronograma-pill cronograma-pill--feriado');
    expect(getActividadEstadoLabel('pasada')).toBe('Pasada');
    expect(getActividadEstadoLabel('zz')).toBe('Futura');
    expect(getActividadEstadoPillClass('vigente')).toMatch(/vigente/);
    expect(getActividadTipoDotClass('OTRO')).toBe('cronograma-dot cronograma-dot--otro');
    expect(getActividadTipoTextClass('EVALUACION')).toBe('cronograma-tipo--evaluacion');
    expect(TIPO_ACTIVIDAD_OPTIONS).toHaveLength(10);
  });
  it('rutas de la gestión actual', () => {
    expect(actualPaths.root()).toBe('/institucional/actual');
    expect(actualPaths.bimestres()).toMatch(/bimestres$/);
    expect(actualPaths.cronogramaNueva()).toMatch(/nueva$/);
    expect(actualPaths.cronogramaDetalle(3)).toMatch(/cronograma\/3$/);
    expect(actualPaths.cronogramaEditar(3)).toMatch(/3\/editar$/);
    expect(actualPaths.cronograma()).toMatch(/cronograma$/);
  });
});

describe('gestionPlanesResumen', () => {
  it('etiqueta y vigencia del plan', () => {
    expect(gestionPlanDisplayLabel(null)).toBeNull();
    expect(gestionPlanDisplayLabel({ carreraNombre: 'Sistemas', carreraCodigo: 'SIS' })).toBe('SIS — Sistemas');
    expect(gestionPlanDisplayLabel({ nombre: 'N' })).toBe('N');
    expect(gestionPlanDisplayLabel({ planEstudioId: 4 })).toBe('Plan #4');
    expect(gestionPlanDisplayLabel({})).toBeNull();
    expect(isGestionPlanVigente({ estado: 'vigente' })).toBe(true);
    expect(isGestionPlanVigente({ estado: 'CERRADO' })).toBe(false);
    expect(isGestionPlanVigente({ activo: false })).toBe(false);
    expect(isGestionPlanVigente(null)).toBe(true);
  });
  it('resume top 3 y restantes', () => {
    const planes = [1, 2, 3, 4, 5].map((i) => ({ nombre: `P${i}`, estado: i === 5 ? 'CERRADO' : 'VIGENTE' }));
    expect(buildGestionPlanesResumen(planes)).toEqual({ count: 5, nombresTop: ['P1', 'P2', 'P3'], restantes: 1 });
    expect(buildGestionPlanesResumen([{ nombre: 'X', estado: 'CERRADO' }]).nombresTop).toEqual(['X']);
    expect(buildGestionPlanesResumen(null)).toEqual({ count: 0, nombresTop: [], restantes: 0 });
  });
});
