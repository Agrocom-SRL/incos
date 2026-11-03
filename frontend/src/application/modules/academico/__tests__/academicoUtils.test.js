import { describe, it, expect } from 'vitest';
import { createAsistenciaBreadcrumbItems } from '../asistencia/utils/asistenciaBreadcrumbs';
import { PCT_ASISTENCIA_RIESGO, BIMESTRES_CONSOLIDADO, formatPctAsistencia } from '../asistencia/utils/asistenciaConsolidado';
import * as fechas from '../asistencia/utils/asistenciaFechas';
import * as marcas from '../asistencia/utils/asistenciaMarcas';
import * as aPaths from '../asistencia/utils/asistenciaPaths';
import * as semanas from '../asistencia/utils/asistenciaSemanas';
import { ESTADOS_REGISTRO } from '../asistencia/utils/asistenciaEstados';
import { ASISTENCIA_PERMISOS } from '../asistencia/utils/asistenciaPermisos';
import { getMotivoPillClass, getEstadoTextClass } from '../asistencia/utils/licenciaPills';
import * as licEstados from '../asistencia/utils/licenciasEstados';
import * as licMotivos from '../asistencia/utils/licenciasMotivos';
import { createNivelacionBreadcrumbItems } from '../nivelaciones/utils/nivelacionBreadcrumbs';
import * as nivEstados from '../nivelaciones/utils/nivelacionEstados';
import * as nivCtx from '../nivelaciones/utils/nivelacionEventoContexto';
import * as nivPaths from '../nivelaciones/utils/nivelacionPaths';
import NIVELACION_PERMISOS from '../nivelaciones/utils/nivelacionPermisos';
import * as paraNiv from '../nivelaciones/utils/paraleloNivelacion';
import LIBRO_DOC, { ESTUDIANTES_POR_FOLIO } from '../libros/utils/libroDoc';
import createLibrosBreadcrumbItems from '../libros/utils/librosBreadcrumbs';
import * as libEstados from '../libros/utils/librosEstados';
import * as libPaths from '../libros/utils/librosPaths';
import LIBROS_PERMISOS from '../libros/utils/librosPermisos';

describe('asistencia: fechas y semanas', () => {
  it('etiquetas de fecha', () => {
    expect(fechas.etiquetaDiaCorto('2026-05-04')).toBe('Lun');
    expect(fechas.etiquetaDiaCorto('2026-05-10')).toBe('Dom');
    expect(fechas.numeroDia('2026-05-04')).toBe(4);
    expect(fechas.etiquetaDiaMes('2026-05-04')).toBe('4 may');
    expect(fechas.etiquetaDiaMesAnio('2026-05-04')).toBe('4 may 2026');
    expect(fechas.etiquetaDiaMesAnio(null)).toBe('—');
    expect(fechas.etiquetaDiaMesAnio('basura')).toBe('basura');
    expect(fechas.etiquetaRangoFechas(null, 'x')).toBe('—');
    expect(fechas.etiquetaRangoFechas('2026-05-04', '2026-05-04')).toBe('4 may 2026');
    expect(fechas.etiquetaRangoFechas('2026-05-04', '2026-05-09')).toBe('4 may 2026 – 9 may 2026');
    expect(fechas.etiquetaFechaCompleta('2026-05-04')).toBe('Lun 4 may');
    expect(fechas.tituloSemana(null, null)).toBe('Semana');
    expect(fechas.tituloSemana('2026-05-04', '2026-05-09')).toBe('4-9 de Mayo');
    expect(fechas.tituloSemana('2026-04-27', '2026-05-02')).toBe('27 de Abril – 2 de Mayo');
  });
  it('semanas dentro de un rango', () => {
    const rango = { desde: '2026-05-01', hasta: '2026-06-15' };
    expect(semanas.aIso(new Date(Date.UTC(2026, 0, 2)))).toBe('2026-01-02');
    expect(semanas.sumarDias('2026-02-27', 2)).toBe('2026-03-01');
    expect(semanas.semanaDeFecha('2026-05-13', rango)).toEqual({ desde: '2026-05-11', hasta: '2026-05-16' });
    expect(semanas.semanaDeFecha('2026-05-03', rango)).toEqual({ desde: '2026-05-01', hasta: '2026-05-02' });
    expect(semanas.semanaDeFecha('2026-06-14', rango)).toEqual({ desde: '2026-06-08', hasta: '2026-06-13' });
    expect(semanas.semanaLibreDeFecha('2026-05-10')).toEqual({ desde: '2026-05-04', hasta: '2026-05-09' });
    const s = semanas.semanaDeFecha('2026-05-13', rango);
    expect(semanas.semanaAnterior(s, rango)).toEqual({ desde: '2026-05-04', hasta: '2026-05-09' });
    expect(semanas.semanaAnterior(semanas.semanaDeFecha('2026-05-01', rango), rango)).toBeNull();
    expect(semanas.semanaSiguiente(s, rango)).toEqual({ desde: '2026-05-18', hasta: '2026-05-23' });
    expect(semanas.semanaSiguiente(semanas.semanaDeFecha('2026-06-14', rango), rango)).toEqual({ desde: '2026-06-15', hasta: '2026-06-15' });
    const corto = { desde: '2026-05-01', hasta: '2026-06-14' };
    expect(semanas.semanaSiguiente(semanas.semanaDeFecha('2026-06-14', corto), corto)).toBeNull();
  });
  it('consolidado, estados y permisos', () => {
    expect(formatPctAsistencia(85.55)).toMatch(/^85[.,][56]%$/);
    expect(formatPctAsistencia(null)).toBe('—');
    expect(formatPctAsistencia('x')).toBe('—');
    expect(PCT_ASISTENCIA_RIESGO).toBe(61);
    expect(BIMESTRES_CONSOLIDADO).toHaveLength(4);
    expect(ESTADOS_REGISTRO.ABIERTO).toBe('ABIERTO');
    expect(ASISTENCIA_PERMISOS.registroVer).toMatch(/registro\.ver/);
  });
});

describe('asistencia: marcas y rutas', () => {
  it('marcas y transición de estados', () => {
    expect(marcas.estadoEfectivo(undefined)).toBe('PRESENTE');
    expect(marcas.marcaDeEstado('AUSENTE')).toBe('F');
    expect(marcas.marcaDeEstado('TARDANZA')).toBe('R');
    expect(marcas.marcaDeEstado('PRESENTE')).toBe('P');
    expect(marcas.marcaDeEstado(undefined)).toBe('P');
    expect(marcas.marcaDeEstado('AUSENTE', marcas.NEUTRO.LICENCIA)).toBe('L');
    expect(marcas.siguienteEstado('PRESENTE', false)).toBe('AUSENTE');
    expect(marcas.siguienteEstado('AUSENTE', false)).toBe('PRESENTE');
    expect(marcas.siguienteEstado('PRESENTE', true)).toBe('AUSENTE');
    expect(marcas.siguienteEstado('AUSENTE', true)).toBe('TARDANZA');
    expect(marcas.siguienteEstado('TARDANZA', true)).toBe('PRESENTE');
    expect(marcas.permiteAtraso('PRESENTE')).toBe(false);
    expect(marcas.permiteAtraso('TARDANZA')).toBe(true);
    expect(marcas.permiteAtraso('PRESENTE', true)).toBe(true);
    expect(marcas.celdaEditable({ esDiaClase: true })).toBe(true);
    expect(marcas.celdaEditable({ esDiaClase: true, neutro: 'FERIADO' })).toBe(false);
    expect(marcas.celdaEditable({ esDiaClase: true, esFuturo: true })).toBe(false);
    expect(marcas.celdaEditable({ esDiaClase: false })).toBe(false);
  });
  it('rutas, breadcrumbs y pills', () => {
    expect(aPaths.calendarioCursoPath(3)).toBe('/academico/asistencia/mis-cursos/3/calendario');
    expect(aPaths.planillaCursoPath(3)).toMatch(/planilla$/);
    expect(aPaths.planillaCursoPath(3, { desde: '2026-05-01', hasta: '2026-05-09' })).toMatch(/planilla\?desde=2026-05-01&hasta=2026-05-09$/);
    expect(aPaths.LICENCIAS_PATH).toMatch(/licencias/);
    const items = createAsistenciaBreadcrumbItems('ACA-ASI-MIS-CURSOS', 'ACA', 'Actual', { asignacionId: 3 });
    expect(Array.isArray(items)).toBe(true);
    expect(getMotivoPillClass('VIAJE')).toBe('licencia-pill licencia-pill--viaje');
    expect(getMotivoPillClass('x')).toBe('licencia-pill licencia-pill--otro');
    expect(getEstadoTextClass('APROBADA')).toBe('licencia-estado--aprobada');
    expect(getEstadoTextClass('x')).toBe('licencia-estado--pendiente');
  });
  it('licencias', () => {
    expect(licEstados.formatEstadoLicencia('APROBADA')).toBe('Aprobada');
    expect(licEstados.formatEstadoLicencia(null)).toBe('—');
    expect(licEstados.tagColorEstadoLicencia('RECHAZADA')).toBe('error');
    expect(licEstados.tagColorEstadoLicencia('x')).toBe('default');
    expect(licEstados.ESTADO_LICENCIA_OPTIONS).toHaveLength(4);
    expect(licMotivos.formatMotivoLicencia('VIAJE')).toBe('Viaje');
    expect(licMotivos.formatMotivoLicencia(undefined)).toBe('—');
    expect(licMotivos.MOTIVO_LICENCIA_OPTIONS).toHaveLength(8);
  });
});

describe('nivelaciones', () => {
  it('estados de historial y nivelación', () => {
    expect(nivEstados.formatEstadoHistorial('ARTICULO_18')).toBe('Nivela Art. 18');
    expect(nivEstados.formatEstadoHistorial('x')).toBe('x');
    expect(nivEstados.formatEstadoHistorial(undefined)).toBe('—');
    expect(nivEstados.getEstadoHistorialPillClass('ABANDONO')).toMatch(/danger/);
    expect(nivEstados.getEstadoHistorialPillClass('x')).toMatch(/default/);
    expect(nivEstados.getGrupoEstadoHistorial('VENCIDA')).toBe('BLOQUEO_SIN_NOTA');
    expect(nivEstados.getGrupoEstadoHistorial('x')).toBeNull();
    expect(nivEstados.getGrupoLabel('EXAMEN_ACADEMICO')).toBe('Examen académico');
    expect(nivEstados.getGrupoLabel('otro')).toBe('otro');
    expect(nivEstados.TIPOS_EVENTO_INSCRIBIR_OPTIONS).toHaveLength(3);
    expect(nivEstados.TIPOS_CON_EXAMEN).toContain('NIVELACION_1RA');
    expect(nivEstados.TIPOS_DECISION_ADMINISTRATIVA).toEqual(['ABANDONO', 'RETIRADO']);
    expect(nivEstados.DECISION_ADMINISTRATIVA_OPTIONS[0].label).toBe('Abandono');
    expect(nivEstados.formatEstadoNivelacion('APROBADA')).toBe('Aprobada');
    expect(nivEstados.formatEstadoNivelacion(null)).toBe('—');
    expect(nivEstados.getEstadoNivelacionPillClass('REPROBADA')).toMatch(/danger/);
    expect(nivEstados.getEstadoNivelacionPillClass('x')).toMatch(/default/);
    expect(nivEstados.RESULTADO_NIVELACION_OPTIONS).toHaveLength(4);
    expect(nivEstados.ESTADOS_NIVELACION_FINALES).toEqual(['APROBADA', 'REPROBADA']);
    expect(nivEstados.NOTA_MINIMA_NIVELACION).toBe(61);
  });
  it('contexto de eventos por URL', () => {
    expect(nivCtx.buildAprobarContextoParams({ nivelacionId: 4 }).toString()).toBe('nivelacionId=4');
    expect(nivCtx.buildAprobarContextoParams().toString()).toBe('');
    expect(nivCtx.parseAprobarContexto(new URLSearchParams('nivelacionId=4'))).toBe(4);
    expect(nivCtx.parseAprobarContexto(new URLSearchParams(''))).toBeNull();
    const detalle = nivCtx.buildDetalleEventoContextoParams({
      historialMatriculaId: 5, estudianteNombre: 'Ana', asignaturaSigla: 'MAT', forcedGrade: 1, esAnclaDirecta: false, resultingGrade: 70,
      nivelacion: { id: 9, status: 'APROBADA', levelingGrade: 80, passed: true, examDate: '2026-01-01' },
    });
    const parsed = nivCtx.parseDetalleEventoContexto(detalle);
    expect(parsed).toMatchObject({ historialMatriculaId: 5, estudianteNombre: 'Ana', resultingGrade: 70, forcedGrade: true, esAnclaDirecta: false });
    expect(parsed.nivelacion).toEqual({ id: 9, status: 'APROBADA', levelingGrade: 80, passed: true, examDate: '2026-01-01' });
    expect(nivCtx.parseDetalleEventoContexto(new URLSearchParams(''))).toBeNull();
    expect(nivCtx.parseDetalleEventoContexto(nivCtx.buildDetalleEventoContextoParams({ historialMatriculaId: 1 })).nivelacion).toBeNull();
    expect(nivCtx.buildDetalleEventoContextoParams().toString()).toBe('');
    const crear = nivCtx.buildCrearEventoContextoParams({ subjectEnrollmentId: 3, estudianteCodigo: 'E1' });
    expect(nivCtx.parseCrearEventoContexto(crear)).toEqual({ ancla: { subjectEnrollmentId: 3 }, contexto: { estudianteNombre: null, estudianteCodigo: 'E1', asignaturaSigla: null, asignaturaNombre: null } });
    const alt = nivCtx.buildCrearEventoContextoParams({ enrollmentId: 1, planSubjectId: 2 });
    expect(nivCtx.parseCrearEventoContexto(alt).ancla).toEqual({ enrollmentId: 1, planSubjectId: 2 });
    expect(nivCtx.parseCrearEventoContexto(new URLSearchParams('enrollmentId=1'))).toBeNull();
    expect(nivCtx.buildCrearEventoContextoParams().toString()).toBe('');
  });
  it('rutas, paralelos y breadcrumbs', () => {
    expect(nivPaths.nivelacionParaleloPath(7)).toBe('/academico/nivelaciones/listar/7');
    expect(NIVELACION_PERMISOS.ver).toBe('academico.nivelacion.ver');
    expect(Array.isArray(createNivelacionBreadcrumbItems('ACA-NIV-LISTAR', 'ACA', 'x', { id: 1 }))).toBe(true);
    const n = paraNiv.normalizarParaleloNivelacion({ paralelo_gestion_id: '3', paralelo_nombre: 'A', cantidad_estudiantes: '12' });
    expect(n).toMatchObject({ paraleloGestionId: 3, cantidadEstudiantes: 12, carreraId: null });
    expect(paraNiv.normalizarParalelosNivelacion([{ paralelo_gestion_id: 1 }, {}])).toHaveLength(1);
    expect(paraNiv.normalizarParalelosNivelacion(null)).toEqual([]);
    expect(paraNiv.etiquetaParaleloNivelacionCorta({ paraleloNombre: 'A' })).toBe('Paralelo A');
    expect(paraNiv.etiquetaParaleloNivelacionCorta(null)).toBeNull();
    const fus = paraNiv.fusionarPendientesNivelacion(
      [{ paralelo_gestion_id: 1, cantidad_estudiantes: 10 }, { paralelo_gestion_id: 2 }],
      [{ paraleloGestionId: 1, totalEstudiantes: 8, totalPendientes: 3 }],
    );
    expect(fus.map((f) => [f.totalEstudiantes, f.totalPendientes])).toEqual([[8, 3], [0, 0]]);
    expect(paraNiv.fusionarPendientesNivelacion(null, null)).toEqual([]);
  });
});

describe('libros', () => {
  it('constantes, rutas y estados', () => {
    expect(LIBRO_DOC.firmas).toHaveLength(3);
    expect(ESTUDIANTES_POR_FOLIO).toBe(10);
    expect(libPaths.libroDetallePath(3)).toBe('/academico/libros/3');
    expect(libPaths.libroAnuladosPath(3)).toMatch(/anulados$/);
    expect(libPaths.folioPreviewPath(3, 4)).toBe('/academico/libros/3/folios/4');
    expect(LIBROS_PERMISOS.libro).toBe('academico.libro');
    expect(Array.isArray(createLibrosBreadcrumbItems('ACA-LIB-LISTA', 'ACA', 'x', { id: 1 }))).toBe(true);
    expect(libEstados.formatLibroEstado('ABIERTO')).toBe('Abierto');
    expect(libEstados.formatLibroEstado(null)).toBe('—');
    expect(libEstados.getLibroEstadoPillClass('CERRADO')).toMatch(/default/);
    expect(libEstados.formatFolioEstado('ANULADO')).toBe('Anulado');
    expect(libEstados.getFolioEstadoPillClass('ANULADO')).toMatch(/danger/);
    expect(libEstados.formatFolioEstadoDisplay('ANULADO', 'CERRADO')).toBe('Anulado');
    expect(libEstados.formatFolioEstadoDisplay('BORRADOR', 'CERRADO')).toBe('Cerrado');
    expect(libEstados.formatFolioEstadoDisplay('BORRADOR', 'ABIERTO')).toBe('Borrador');
    expect(libEstados.getFolioEstadoDisplayPillClass('ANULADO', 'CERRADO')).toMatch(/danger/);
    expect(libEstados.getFolioEstadoDisplayPillClass('BORRADOR', 'CERRADO')).toMatch(/default/);
    expect(libEstados.getFolioEstadoDisplayPillClass('BORRADOR', 'ABIERTO')).toMatch(/default/);
    expect(libEstados.formatEstadoAcademico('APROBADO')).toBe('Aprobado');
    expect(libEstados.getEstadoAcademicoPillClass('CURSANDO')).toMatch(/info/);
    expect(libEstados.getEstadoAcademicoPillClass('x')).toMatch(/default/);
  });
});
