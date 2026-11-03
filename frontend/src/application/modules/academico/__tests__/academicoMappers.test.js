import { describe, it, expect } from 'vitest';
import * as libros from '../libros/mappers/librosMapper';
import * as pills from '../acompanamiento/utils/acompanamientoPills';
import * as alertas from '../acompanamiento/alertas/mappers/alertaRiesgoMapper';
import { mapPanelAcompanamiento } from '../acompanamiento/panel/mappers/panelAcompanamientoMapper';
import * as sesiones from '../acompanamiento/sesiones/mappers/sesionRefuerzoMapper';
import * as acPaths from '../acompanamiento/config/paths';
import ACOMPANAMIENTO_PERMISOS from '../acompanamiento/utils/acompanamientoPermisos';
import * as doc from '../centralizador/utils/centralizadorDoc';
import * as centPaths from '../centralizador/utils/centralizadorPaths';
import * as centPara from '../centralizador/utils/paraleloCentralizador';
import { createCentralizadorBreadcrumbItems } from '../centralizador/utils/centralizadorBreadcrumbs';
import { paraleloListMapper, mapParalelosList } from '../paralelos/mappers/paraleloListMapper';
import mapHistorialAcademico, { mapEstudianteBusqueda } from '../historial/mappers/historialMapper';
import { HISTORIAL_SELECTOR_PATH, historialAcademicoPath } from '../historial/utils/historialPaths';

describe('libros: mapper', () => {
  it('formatea el curso', () => {
    expect(libros.formatOrdinalPeriodo(2)).toBe('SEGUNDO');
    expect(libros.formatOrdinalPeriodo(9, 'Séptimo Año')).toBe('SÉPTIMO');
    expect(libros.formatOrdinalPeriodo(null, null)).toBe('');
    expect(libros.formatLetraParalelo(' Paralelo a ')).toBe('A');
    expect(libros.formatLetraParalelo(null)).toBe('');
    expect(libros.formatCursoLibro({ periodoNumero: 1, paraleloNombre: 'A' })).toBe('PRIMERO - PARALELO A');
  });
  it('mapea libros, folios, paralelos y cierre', () => {
    expect(libros.mapLibro(null)).toBeNull();
    expect(libros.mapLibro({ numeroLibro: 3, folios: [{ numeroFolio: 1, estudiantes: [{ celdas: null }, null] }] })).toMatchObject({ libroLabel: 'LIBRO N° 3' });
    expect(libros.mapLibro({}).libroLabel).toBe('Libro de registro');
    expect(libros.mapLibrosList(null)).toEqual([]);
    const f = libros.mapFolio({ numeroFolio: 2, periodoNumero: 1, paraleloNombre: 'B', asignaturas: [1], estudiantes: [{ celdas: { a: 1 } }] });
    expect(f).toMatchObject({ folioLabel: 'FOLIO N° 2', cursoLabel: 'PRIMERO - PARALELO B', asignaturas: [1] });
    expect(f.estudiantes[0].celdas).toEqual({ a: 1 });
    expect(libros.mapFolio(null)).toBeNull();
    expect(libros.mapFolio({}).folioLabel).toBe('Folio');
    expect(libros.mapFoliosList([{}])).toHaveLength(1);
    expect(libros.mapParaleloLibro(null)).toBeNull();
    expect(libros.mapParaleloLibro({ periodoNumero: 2, paraleloNombre: 'A' }).cursoLabel).toBe('SEGUNDO - PARALELO A');
    expect(libros.mapParalelosLibro('x')).toEqual([]);
    expect(libros.mapFolioEstudiante(null)).toBeNull();
    expect(libros.formatRangoApellidosFolio()).toBe('');
    expect(libros.formatRangoApellidosFolio({ apellidoDesde: 'Abe', apellidoHasta: 'Zeta' })).toBe('Abe – Zeta');
    expect(libros.formatRangoApellidosFolio({ apellidoDesde: 'Abe' })).toBe('Abe');
    expect(libros.mapCierrePendientes(null)).toBeNull();
    const c = libros.mapCierrePendientes({
      pendientes: { total: '3', paralelos: [{ periodoNumero: 1, paraleloNombre: 'A', totalEstudiantes: '5', folios: [{ numeroFolio: 1, totalEstudiantes: 2, apellidoDesde: 'A', apellidoHasta: 'B' }, {}] }, {}] },
      desactualizadas: { total: 4 },
    });
    expect(c).toMatchObject({ total: 3, totalParalelos: 2, desactualizadas: 4 });
    expect(c.paralelos[0].folios[0]).toMatchObject({ label: 'Folio 1', rangoLabel: 'A – B' });
    expect(c.paralelos[0].folios[1].label).toBe('Folio');
    expect(libros.default.mapLibro).toBe(libros.mapLibro);
  });
});

describe('acompañamiento', () => {
  it('pills', () => {
    expect(pills.formatEstadoSesion('REALIZADA')).toBe('Realizada');
    expect(pills.getEstadoSesionPillClass('CANCELADA')).toMatch(/inactiva/);
    expect(pills.getEstadoSesionPillClass('x')).toMatch(/default/);
    expect(pills.formatProgresoEstudiante('MEJORADO')).toBe('Mejorado');
    expect(pills.getProgresoEstudiantePillClass('SIN_MEJORA')).toMatch(/danger/);
    expect(pills.PROGRESO_ESTUDIANTE_OPTIONS).toHaveLength(4);
    expect(pills.formatOrigenEstudiante('VOLUNTARIO')).toBe('Voluntario');
    expect(pills.formatOrigenEstudiante(undefined)).toBe('—');
    expect(pills.formatSituacionRiesgo({ enRiesgo: true, enRiesgoAsistencia: true, umbralRiesgo: 61 })).toBe('En riesgo (nota y asistencia < 61)');
    expect(pills.formatSituacionRiesgo({ enRiesgo: true, umbralRiesgo: 61 })).toBe('En riesgo (< 61)');
    expect(pills.formatSituacionRiesgo({ enRiesgoAsistencia: true })).toBe('En riesgo (asistencia)');
    expect(pills.formatSituacionRiesgo()).toBe('Regular');
    expect(pills.getSituacionRiesgoPillClass({ enRiesgo: true })).toBe(pills.RIESGO_PILL_CLASS);
    expect(pills.getSituacionRiesgoPillClass()).toBe(pills.SIN_RIESGO_PILL_CLASS);
    expect(ACOMPANAMIENTO_PERMISOS.alerta).toMatch(/alerta/);
    expect(acPaths.sesionDetallePath(3)).toBe('/academico/acompanamiento/sesiones/3');
    expect(acPaths.sesionEditarPath(3)).toMatch(/3\/editar$/);
  });
  it('alertas de riesgo', () => {
    expect(alertas.mapAlertaRiesgo(null)).toBeNull();
    const a = alertas.mapAlertaRiesgo({ estudianteNombres: 'Juan', estudianteApellidoPaterno: 'Pérez', bim1: '60', enRiesgo: 1, pctAsistenciaUltimoBimestre: '70', materiaNombre: ' Mate ' });
    expect(a).toMatchObject({ estudianteNombre: 'Pérez Juan', bim1: 60, bim2: null, enRiesgo: true, umbralRiesgo: 61, umbralAsistencia: 75, materiaNombre: 'Mate', pctAsistenciaUltimoBimestre: 70 });
    expect(alertas.mapAlertaRiesgo({ estudianteNombre: 'Ana' }).estudianteNombre).toBe('Ana');
    expect(alertas.mapAlertaRiesgo({}).estudianteNombre).toBe('Sin nombre');
    expect(alertas.mapAlertasRiesgoList(null)).toEqual([]);
    expect(alertas.mapAlertaEstudiante(null)).toBeNull();
    const e = alertas.mapAlertaEstudiante({ estudianteId: 1, nombreCompleto: 'Ana', materias: [{ enRiesgo: true }, { enRiesgoAsistencia: 1 }, {}] });
    expect(e).toMatchObject({ materiasEnRiesgo: 1, materiasEnRiesgoAsistencia: 1, materiasEnRiesgoTotal: 2 });
    const solo = alertas.mapAlertaEstudiante({ estudianteId: 2, ci: '1', carreraNombre: 'Sis' });
    expect(solo.materias).toEqual([]);
  });
  it('panel', () => {
    expect(mapPanelAcompanamiento(null)).toBeNull();
    const p = mapPanelAcompanamiento({
      gestionNombre: 'G', riesgoPorCarrera: [{ carreraNombre: 'Sis', totalEstudiantes: 10, estudiantesEnRiesgo: 4 }, null, { totalEstudiantes: 10 }],
      reprobacionPorMateria: [{ materiaNombre: 'M', matriculados: 5 }, {}],
      sesionesResumen: [{ programadas: 4, realizadas: 3, participantes: 10, asistencias: 8, mes: ' enero ' }],
      casosCriticos: [{ estudianteNombre: 'Ana' }],
    });
    expect(p.totales).toMatchObject({ totalEstudiantes: 20, estudiantesEnRiesgo: 4, pctEstudiantesRiesgo: 20, sesionesProgramadas: 4, sesionesRealizadas: 3, pctAsistencia: 80 });
    expect(p.porCarrera[1].carreraNombre).toBe('Sin carrera');
    expect(p.porMateria[1].materiaNombre).toBe('Sin materia');
    expect(p.sesionesResumen[0].mes).toBe('enero');
    expect(p.casosCriticos).toHaveLength(1);
    const explicit = mapPanelAcompanamiento({ porCarrera: [], porMateria: [], sesiones: [], topRiesgo: [], totales: { totalEstudiantes: 7, pctAsistencia: 55 } });
    expect(explicit.totales).toMatchObject({ totalEstudiantes: 7, pctAsistencia: 55, pctEstudiantesRiesgo: 0 });
  });
  it('sesiones de refuerzo', () => {
    expect(sesiones.mapSesionRefuerzo(null)).toBeNull();
    const s = sesiones.mapSesionRefuerzo({ id: 1, fecha: '2026-03-04', horaInicio: '10:00:00', horaFin: '11:30:00', aulaCodigo: 'A1', aulaNombre: 'Uno', materiaNombre: 'Mate', paraleloNombre: 'A', participantesTotal: '5' });
    expect(s).toMatchObject({ fechaLabel: '04/03/2026', horarioLabel: '10:00 – 11:30', aulaLabel: 'A1 · Uno', cursoLabel: 'Mate · A', participantesTotal: 5, modalidad: 'PRESENCIAL', estado: 'PROGRAMADA' });
    expect(sesiones.mapSesionRefuerzo({ id: 2, horaInicio: '09:00' }).horarioLabel).toBe('09:00');
    expect(sesiones.mapSesionesRefuerzoList(null)).toEqual([]);
    expect(sesiones.mapEstudianteSesion(null)).toBeNull();
    expect(sesiones.mapEstudianteSesion({ nombres: 'Juan', apellidoPaterno: 'Pérez', asistio: 1 })).toMatchObject({ estudianteNombre: 'Pérez Juan', asistio: true, origen: 'RIESGO', progreso: 'SIN_EVALUAR' });
    expect(sesiones.mapEstudianteSesion({ estudianteNombre: 'Ana', asistio: 0 }).asistio).toBe(false);
    expect(sesiones.mapEstudianteSesion({}).asistio).toBeNull();
    expect(sesiones.mapSesionRefuerzoDetail(null)).toBeNull();
    expect(sesiones.mapSesionRefuerzoDetail({ id: 1, estudiantes: [{ estudianteNombre: 'A' }, null] }).estudiantes).toHaveLength(1);
    expect(sesiones.mapSesionRefuerzoDetail({ id: 1 }).estudiantes).toEqual([]);
    const payload = sesiones.mapFormValuesToSesionPayload({ asignacionDocenteId: '3', fecha: '2026-03-04', horaInicio: '2026-03-04T10:00:00', modalidad: 'VIRTUAL', aulaId: 5, enlaceVirtual: ' http://x ', tema: ' T ', estudiantes: ['1', 2] });
    expect(payload).toMatchObject({ asignacionDocenteId: 3, fecha: '2026-03-04', horaInicio: '10:00', aulaId: null, enlaceVirtual: 'http://x', tema: 'T' });
    expect(payload.estudiantes).toEqual([{ matriculaMateriaId: 1, origen: 'RIESGO' }, { matriculaMateriaId: 2, origen: 'RIESGO' }]);
    const presencial = sesiones.mapFormValuesToSesionPayload({ aulaId: '7', enlaceVirtual: 'x' }, { incluirEstudiantes: false });
    expect(presencial).toMatchObject({ aulaId: 7, enlaceVirtual: null });
    expect(presencial).not.toHaveProperty('estudiantes');
    expect(sesiones.mapFormValuesToSesionPayload().estudiantes).toEqual([]);
    const f = sesiones.mapSesionToFormValues({ fecha: '2026-03-04', horaInicio: '10:00', estudiantes: [{ matriculaMateriaId: 1 }, {}] });
    expect(f.fecha.format('YYYY-MM-DD')).toBe('2026-03-04');
    expect(f.horaInicio.format('HH:mm')).toBe('10:00');
    expect(f.estudiantes).toEqual([1]);
    expect(sesiones.mapSesionToFormValues(null)).toMatchObject({ modalidad: 'PRESENCIAL', estudiantes: [], horaInicio: undefined });
  });
});

describe('centralizador, paralelos e historial', () => {
  it('documento y rutas del centralizador', () => {
    expect(doc.nombreBimestre(2)).toBe('Segundo Bimestre');
    expect(doc.nombreBimestre(9)).toBe('');
    expect(doc.colorBimestre(1)).toBe('#2196F3');
    expect(doc.colorBimestre(9)).toBeNull();
    expect(doc.VERDICTOS_OBSERVACION_BIMESTRE_OPTIONS).toHaveLength(4);
    expect(doc.default.regimen).toBe('Anual');
    expect(centPaths.centralizadorMatrizPath(3, 2)).toBe('/academico/centralizador/3/bimestre/2');
    expect(centPaths.centralizadorParaleloPath(3)).toBe('/academico/centralizador/3');
    expect(Array.isArray(createCentralizadorBreadcrumbItems('ACA-CEN-MATRIZ', 'ACA', 'x', { paraleloGestionId: 3 }))).toBe(true);
    const p = centPara.normalizarParaleloCentralizador({ paralelo_gestion_id: '3', paralelo_nombre: 'A', carrera_nombre: 'Sis', periodo_nombre: 'Primero', cursos_creados: '5' });
    expect(p).toMatchObject({ paraleloGestionId: 3, cursosCreados: 5, cantidadDocentes: null });
    expect(centPara.normalizarParalelosCentralizador([{ paralelo_gestion_id: 1 }, {}, null].filter(Boolean))).toHaveLength(1);
    expect(centPara.normalizarParalelosCentralizador('x')).toEqual([]);
    expect(centPara.etiquetaParalelo(p)).toBe('Sis · Primero · Paralelo A');
    expect(centPara.etiquetaParalelo({})).toBeNull();
    expect(centPara.etiquetaParalelo(null)).toBeNull();
    expect(centPara.etiquetaParaleloCorta(p)).toBe('Paralelo A');
    expect(centPara.etiquetaParaleloCorta({})).toBeNull();
  });
  it('paralelos', () => {
    expect(paraleloListMapper(null)).toBeNull();
    expect(paraleloListMapper({ id: 1, carrera_id: 2, periodo_numero: 3, estadisticas: { totalInscritos: 4 } })).toMatchObject({ carreraId: 2, periodoNumero: 3, estadisticas: { totalInscritos: 4 } });
    expect(paraleloListMapper({ id: 2, numero: 5 })).toMatchObject({ periodoNumero: 5, estadisticas: { totalInscritos: 0, totalHombres: 0, totalMujeres: 0 } });
    expect(mapParalelosList(null)).toEqual([]);
    expect(mapParalelosList([{ id: 1 }, null])).toHaveLength(1);
  });
  it('historial', () => {
    expect(mapEstudianteBusqueda(null)).toBeNull();
    expect(mapEstudianteBusqueda({ id: 1, nombres: 'Juan', apellidoPaterno: 'Pérez', paraleloActual: 'A' })).toMatchObject({ nombreCompleto: 'Pérez Juan', paraleloActual: 'A', promedioHistorial: null });
    expect(mapHistorialAcademico(null)).toBeNull();
    expect(mapHistorialAcademico({})).toEqual({ estudiante: null, filas: [], resumen: null });
    expect(mapHistorialAcademico({ estudiante: { id: 1 }, filas: [1], resumen: {} }).filas).toEqual([1]);
    expect(HISTORIAL_SELECTOR_PATH).toBe('/academico/historial/academico');
    expect(historialAcademicoPath(9)).toBe('/academico/historial/academico/9');
  });
});
