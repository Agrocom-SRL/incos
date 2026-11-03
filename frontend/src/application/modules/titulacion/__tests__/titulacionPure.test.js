import { describe, it, expect } from 'vitest';
import * as pg from '../proyectos-grado/mappers/proyectoGradoMapper';
import * as tut from '../proyectos-grado/mappers/tutoriaAvanceMapper';
import * as pas from '../pasantias/mappers/pasantiaMapper';
import * as tp from '../utils/titulacionPills';
import * as pp from '../utils/pasantiasPills';
import { TITULACION_PERMISOS } from '../utils/titulacionPermisos';
import { buildProyectoGradoTimeline } from '../proyectos-grado/utils/proyectoGradoTimeline';
import { getRequisitosTransicion } from '../proyectos-grado/utils/requisitosTransicionProyecto';
import { buildPasantiaTimeline } from '../pasantias/utils/pasantiaTimeline';
import * as paths from '../config/paths';

describe('proyectoGradoMapper', () => {
  it('mapProyectoGrado limita el avance y arma nombres', () => {
    expect(pg.mapProyectoGrado(null)).toBeNull();
    const p = pg.mapProyectoGrado({ id: 1, titulo: ' Sistema ', ultimoPorcentajeAvance: 140, tutorNombres: 'Ana', apellidoPaterno: 'Pérez', activo: 0, notaFinal: '75', ultimaBitacoraFecha: '2026-03-04', cantidadIntegrantes: '2' });
    expect(p).toMatchObject({ titulo: 'Sistema', porcentajeAvance: 100, activo: false, notaFinal: 75, ultimaTutoriaLabel: '04/03/2026', cantidadIntegrantes: 2 });
    expect(p.tutorNombre).toBe('Pérez Ana');
    expect(pg.mapProyectoGrado({ id: 2 })).toMatchObject({ titulo: 'Sin título', notaFinal: null, porcentajeAvance: 0, tutorNombre: null });
    expect(pg.mapProyectoGrado({ id: 3, tutorNombre: ' Dr. X ', porcentajeAvance: -5 })).toMatchObject({ tutorNombre: 'Dr. X', porcentajeAvance: 0 });
    expect(pg.mapProyectosGradoList(null)).toEqual([]);
    expect(pg.mapProyectosGradoList([{ id: 1 }, null])).toHaveLength(1);
  });
  it('integrantes, bitácora y avances', () => {
    expect(pg.mapIntegrante(null)).toBeNull();
    expect(pg.mapIntegrante({ id: 1, estudianteNombres: 'Juan', estudianteApellidoPaterno: 'Gómez', numeroDocumento: '123', fechaIncorporacion: '2026-01-02' })).toMatchObject({ nombreCompleto: 'Gómez Juan', ci: '123', rol: 'INTEGRANTE', estado: 'ACTIVO', fechaIncorporacionLabel: '02/01/2026' });
    expect(pg.mapIntegrante({ id: 2, nombreCompleto: 'Ana B' }).nombreCompleto).toBe('Ana B');
    expect(pg.mapBitacoraEntrada(undefined)).toBeNull();
    expect(pg.mapBitacoraEntrada({ id: 1, confirmadoEstudiante: 1, porcentajeAvance: '40', fecha: '2026-02-03' })).toMatchObject({ tipo: 'REUNION', estado: 'PENDIENTE', confirmadoEstudiante: true, porcentajeAvance: 40, fechaLabel: '03/02/2026' });
    expect(pg.mapBitacoraList('x')).toEqual([]);
    expect(pg.mapBitacoraList([{ id: 1 }])).toHaveLength(1);
    expect(pg.mapAvance(null)).toBeNull();
    expect(pg.mapAvance({ id: 1, tamanoBytes: 2048, createdAt: '2026-01-01' })).toMatchObject({ tamanoLabel: '2 KB', estadoRevision: 'PENDIENTE_REVISION', fechaSubidaLabel: '01/01/2026' });
    expect(pg.mapAvance({ id: 2, tamanoBytes: 3 * 1024 * 1024 }).tamanoLabel).toBe('3.0 MB');
    expect(pg.mapAvance({ id: 3, tamanoBytes: 0 }).tamanoLabel).toBeNull();
    expect(pg.mapAvance({ id: 4, subidoPorNombre: 'Ana' }).subidoPorNombre).toBe('Ana');
    expect(pg.mapAvancesList([{ id: 1 }, null])).toHaveLength(1);
  });
  it('dictámenes, tribunal y actas', () => {
    expect(pg.mapDictamen(null)).toBeNull();
    expect(pg.mapDictamen({ id: 1, rutaArchivo: '/x', fechaEmision: '2026-05-06' })).toMatchObject({ tieneArchivo: true, fechaEmisionLabel: '06/05/2026' });
    expect(pg.mapDictamen({ id: 2 }).tieneArchivo).toBe(false);
    expect(pg.mapDictamenesList([{ id: 1 }])).toHaveLength(1);
    expect(pg.mapTribunalMiembro({ id: 1, orden: 2 })).toMatchObject({ nombreCompleto: 'Miembro 2', cargo: 'Tribunal Evaluador' });
    expect(pg.mapTribunalMiembro(null)).toBeNull();
    const acta = pg.mapActaDefensa({ id: 1, numeroActa: 7, horaInicio: '10:30:00', calificacionFinal: '88', tribunal: [{ id: 2, orden: 2 }, { id: 1, orden: 1 }] });
    expect(acta).toMatchObject({ numeroActaFormateado: '007', horaInicio: '10:30', calificacionFinal: 88, estado: 'EMITIDA' });
    expect(acta.tribunal.map((t) => t.id)).toEqual([1, 2]);
    expect(pg.mapActaDefensa({ id: 2 })).toMatchObject({ numeroActaFormateado: '—', tribunal: [], calificacionFinal: null });
    expect(pg.mapActaDefensa(null)).toBeNull();
    expect(pg.mapActasDefensaList([{ id: 1 }])).toHaveLength(1);
  });
  it('detalle, modalidades y formularios', () => {
    expect(pg.mapProyectoGradoDetail(null)).toBeNull();
    const d = pg.mapProyectoGradoDetail({ id: 1, tutorCorreo: 'a@x', integrantes: [{ id: 1, rol: 'TITULAR', estado: 'ACTIVO', estudianteId: 5 }, null], notaPerfil: '60' });
    expect(d).toMatchObject({ tutorEmail: 'a@x', notaPerfil: 60, notaDefensa: null });
    expect(d.integrantes).toHaveLength(1);
    expect(pg.mapModalidadGrado({})).toBeNull();
    expect(pg.mapModalidadGrado({ id: 1, requiereTutor: 0 })).toMatchObject({ nombre: 'Modalidad 1', requiereTutor: false });
    expect(pg.mapModalidadesGradoList([{ id: 1 }, { nombre: 'x' }])).toHaveLength(1);
    expect(pg.mapFormValuesToProyectoPayload({ titulo: ' T ', estudianteId: '3', integranteIds: ['3', 4], modalidadId: 1, gestionId: '2' })).toEqual({
      titulo: 'T', objetivos: null, modalidadId: 1, carreraId: null, gestionId: 2, titularEstudianteId: 3, estudianteIds: [3, 4],
    });
    expect(pg.mapFormValuesToProyectoPayload()).toMatchObject({ titulo: '', estudianteIds: [], gestionId: undefined });
    const f = pg.mapProyectoToFormValues({ titulo: 'T', integrantes: [{ rol: 'TITULAR', estado: 'ACTIVO', estudianteId: 1 }, { rol: 'INTEGRANTE', estado: 'ACTIVO', estudianteId: 2 }, { rol: 'INTEGRANTE', estado: 'BAJA', estudianteId: 3 }] });
    expect(f).toMatchObject({ estudianteId: 1, integranteIds: [2] });
    expect(pg.mapProyectoToFormValues(null)).toMatchObject({ titulo: '', integranteIds: [] });
    expect(pg.mapProyectoToFormValues({ estudianteId: 9 }).estudianteId).toBe(9);
  });
});

describe('tutoriaAvanceMapper', () => {
  it('estudiantes elegibles y seguimiento', () => {
    expect(tut.mapEstudianteElegible({})).toBeNull();
    expect(tut.mapEstudianteElegible({ estudianteId: 4, periodoNumero: '3' })).toMatchObject({ nombreCompleto: 'Estudiante 4', periodoNumero: 3 });
    expect(tut.mapEstudiantesElegiblesList([{ estudianteId: 1 }, null])).toHaveLength(1);
    expect(tut.mapEstudiantesElegiblesList('x')).toEqual([]);
    expect(tut.mapSeguimientoTutoriado({})).toBeNull();
    expect(tut.mapSeguimientoTutoriado({ estudianteId: 1, tutoriasEjecutadasMes: '2', porcentajeAvance: '50' })).toMatchObject({ tutoriasEjecutadasMes: 2, porcentajeAvance: 50 });
    expect(tut.mapSeguimientoDocente({})).toBeNull();
    const d = tut.mapSeguimientoDocente({ docenteId: 1, carreras: [{ carreraId: 1 }, {}], tutoriados: [{ estudianteId: 2 }, {}] });
    expect(d).toMatchObject({ docenteNombre: 'Docente 1' });
    expect(d.carreras).toHaveLength(1);
    expect(d.tutoriados).toHaveLength(1);
    expect(tut.mapSeguimientoTutoriaDocentes(null)).toBeNull();
    expect(tut.mapSeguimientoTutoriaDocentes({ anio: 2026, mes: 3, docentes: [{ docenteId: 1 }, {}] }).docentes).toHaveLength(1);
    expect(tut.mapSeguimientoTutoriaDocentes({}).docentes).toEqual([]);
  });
});

describe('pasantiaMapper', () => {
  it('mapPasantia calcula horas y porcentaje', () => {
    expect(pas.mapPasantia(null)).toBeNull();
    const p = pas.mapPasantia({ id: 1, horasRequeridas: 300, horasCumplidas: 150, estudianteNombres: 'Juan', estudianteApellidoPaterno: 'Pérez', fechaInicio: '2026-02-03' });
    expect(p).toMatchObject({ porcentajeHoras: 50, horasLabel: '150 / 300 h', estudianteNombre: 'Pérez Juan', fechaInicioLabel: '03/02/2026' });
    expect(pas.mapPasantia({ id: 2, horasCumplidas: 900 })).toMatchObject({ porcentajeHoras: 100, horasLabel: '900 / — h' });
    expect(pas.mapPasantia({ id: 3 })).toMatchObject({ porcentajeHoras: null, horasLabel: null });
    expect(pas.mapPasantiasList([{ id: 1 }, null])).toHaveLength(1);
  });
  it('detalle, empresas, informes, seguimientos', () => {
    expect(pas.mapPasantiaDetail(null)).toBeNull();
    expect(pas.mapPasantiaDetail({ id: 1, empresaEnFuncionamiento: 1, totalInformes: '2', createdAt: '2026-01-02' })).toMatchObject({ empresaEnFuncionamiento: true, totalInformes: 2, createdAtLabel: '02/01/2026' });
    expect(pas.mapPasantiaDetail({ id: 1 }).empresaEnFuncionamiento).toBeNull();
    expect(pas.mapEmpresa({})).toBeNull();
    expect(pas.mapEmpresa({ id: 1, enFuncionamiento: 0, activo: 0 })).toMatchObject({ nombre: 'Empresa 1', enFuncionamiento: false, activo: false });
    expect(pas.mapEmpresa({ id: 2 }).enFuncionamiento).toBeNull();
    expect(pas.mapEmpresasList([{ id: 1 }, {}])).toHaveLength(1);
    expect(pas.mapInforme({})).toBeNull();
    expect(pas.mapInforme({ id: 1, nombreArchivo: 'a.pdf', fechaEmision: '2026-03-04' })).toMatchObject({ tienePdf: true, fechaEmisionLabel: '04/03/2026' });
    expect(pas.mapInformesList([{ id: 1 }])).toHaveLength(1);
    expect(pas.mapSeguimiento({})).toBeNull();
    expect(pas.mapSeguimiento({ id: 1, firmadoDocente: 1 })).toMatchObject({ firmadoDocente: true, firmadoEmpresa: false });
    expect(pas.mapSeguimientosList(null)).toEqual([]);
  });
  it('formularios de pasantía y empresa', () => {
    const conv = pas.mapFormValuesToPasantiaPayload({ tipo: 'CONVALIDACION', estudianteId: '4', fechaInicio: '2026-01-01', tipoContrato: 'PERMANENTE', tipoContratoDetalle: ' x ', horasRequeridas: '300' });
    expect(conv).toMatchObject({ estudianteId: 4, fechaInicio: '2026-01-01', tipoContrato: 'PERMANENTE', tipoContratoDetalle: 'x', horasRequeridas: 300 });
    const pasantia = pas.mapFormValuesToPasantiaPayload({ tipo: 'PASANTIA', tipoContrato: 'PERMANENTE', tipoContratoDetalle: 'x' });
    expect(pasantia).toMatchObject({ tipoContrato: null, tipoContratoDetalle: null, fechaInicio: null });
    expect(pas.mapFormValuesToPasantiaPayload().estudianteId).toBeNull();
    expect(pas.mapPasantiaToFormValues(null)).toMatchObject({ tipo: 'PASANTIA', horasRequeridas: 300 });
    expect(pas.mapPasantiaToFormValues({ fechaInicio: '2026-01-01', horasRequeridas: 320 }).fechaInicio.format('YYYY-MM-DD')).toBe('2026-01-01');
    expect(pas.mapFormValuesToEmpresaPayload({ nombre: ' E ', enFuncionamiento: true })).toMatchObject({ nombre: 'E', enFuncionamiento: true, nit: null });
    expect(pas.mapFormValuesToEmpresaPayload().enFuncionamiento).toBe(false);
    expect(pas.mapEmpresaToFormValues(null)).toMatchObject({ enFuncionamiento: true, nombre: '' });
    expect(pas.mapEmpresaToFormValues({ nombre: 'E', enFuncionamiento: false }).enFuncionamiento).toBe(false);
  });
});

describe('pills de titulación y pasantías', () => {
  it('proyectos de grado', () => {
    expect(tp.formatEstadoProyecto('DESARROLLO')).toBe('En desarrollo');
    expect(tp.formatEstadoProyecto('x')).toBe('x');
    expect(tp.formatEstadoProyecto(null)).toBe('—');
    expect(tp.getEstadoProyectoPillClass('APROBADO')).toMatch(/success/);
    expect(tp.getEstadoProyectoPillClass('zz')).toMatch(/default/);
    for (const e of tp.ESTADOS_PROYECTO_GRADO) expect(tp.TRANSICIONES_PROYECTO).toHaveProperty(e);
    expect(tp.formatExplicacionTransicionProyecto('DEFENSA')).toMatch(/fecha de defensa/);
    expect(tp.formatExplicacionTransicionProyecto('x')).toBeNull();
    expect(tp.formatEstadoAvance('OBSERVADO')).toBe('Observado');
    expect(tp.getEstadoAvancePillClass('OBSERVADO')).toMatch(/danger/);
    expect(tp.formatEstadoBitacora('PENDIENTE')).toBe('Pendiente');
    expect(tp.getEstadoBitacoraPillClass('SUBSANADO')).toMatch(/success/);
    expect(tp.formatTipoBitacora('REUNION')).toBe('Reunión de tutoría');
    expect(tp.formatTipoDictamen('VIABILIDAD_TECNICA')).toBe('Viabilidad técnica');
    expect(tp.formatTipoDictamen(undefined)).toBe('—');
    expect(tp.formatResultadoActaDefensa('APRUEBA')).toBe('Aprueba');
    expect(tp.getResultadoActaDefensaPillClass('REPRUEBA')).toMatch(/warning/);
    expect(tp.formatEstadoActaDefensa('ANULADA')).toBe('Anulada');
    expect(tp.getEstadoActaDefensaPillClass('EMITIDA')).toMatch(/success/);
    expect(tp.esModalidadGrupal('PSP')).toBe(true);
    expect(tp.esModalidadGrupal('X')).toBe(false);
    expect(tp.NOTA_MINIMA_APROBACION_ACTA_PREVIEW).toBe(61);
  });
  it('pasantías', () => {
    expect(pp.formatTipoPasantia('PASANTIA')).toBe('Pasantía');
    expect(pp.getTipoPasantiaPillClass('x')).toMatch(/default/);
    expect(pp.TIPO_PASANTIA_OPTIONS).toHaveLength(2);
    expect(pp.formatEstadoPasantia('EN_CURSO')).toBe('En curso');
    expect(pp.getEstadoPasantiaPillClass('RECHAZADA')).toMatch(/danger/);
    expect(pp.ESTADO_PASANTIA_OPTIONS).toHaveLength(6);
    expect(pp.TRANSICIONES_PASANTIA.PASANTIA.SOLICITADA).toContain('EN_CURSO');
    expect(pp.formatExplicacionTransicionPasantia('FINALIZADA')).toMatch(/horas requeridas/);
    expect(pp.formatExplicacionTransicionPasantia('x')).toBeNull();
    expect(pp.ESTADOS_TRANSICION_PASANTIA_IRREVERSIBLES).toEqual(['RECHAZADA', 'CANCELADA']);
    expect(pp.HORAS_PASANTIA_MIN).toBeLessThan(pp.HORAS_PASANTIA_MAX);
    expect(pp.formatTipoSocietario('SRL')).toBe('S.R.L.');
    expect(pp.TIPO_SOCIETARIO_OPTIONS).toHaveLength(5);
    expect(pp.formatTipoContrato('PERMANENTE')).toBe('Permanente');
    expect(pp.TIPO_CONTRATO_OPTIONS).toHaveLength(2);
    expect(pp.formatTipoInforme('VERIFICACION_EMPRESA')).toBe('Verificación de empresa');
    expect(pp.TIPO_INFORME_POR_TIPO_PASANTIA.CONVALIDACION).toBe('CONVALIDACION_TRABAJO');
    expect(pp.formatResultadoInforme('VIABLE')).toBe('Viable');
    expect(pp.getResultadoInformePillClass('NO_VIABLE')).toMatch(/danger/);
    expect(pp.RESULTADO_INFORME_OPTIONS).toHaveLength(2);
    expect(pp.formatNivelDesempeno('ALTO')).toBe('Alto');
    expect(pp.getNivelDesempenoPillClass('x')).toMatch(/default/);
    expect(pp.NIVEL_DESEMPENO_OPTIONS.map((o) => o.value)).toEqual(['ALTO', 'MEDIO', 'BAJO']);
    expect(TITULACION_PERMISOS.proyecto).toBe('titulacion.proyecto');
  });
});

describe('líneas de tiempo y requisitos', () => {
  it('proyecto en curso marca la etapa actual', () => {
    const t = buildProyectoGradoTimeline({ estado: 'DESARROLLO', fechaPresentacionPerfil: '2026-01-02' });
    expect(t.map((i) => i.stepStatus)).toEqual(['finish', 'finish', 'process', 'wait', 'wait', 'wait', 'wait']);
    expect(t[0].fecha).toBe('02/01/2026');
    expect(buildProyectoGradoTimeline(null)).toEqual([]);
    expect(buildProyectoGradoTimeline({ estado: 'raro' })[0].stepStatus).toBe('process');
  });
  it('proyecto aprobado, reprobado y cancelado agregan el cierre', () => {
    const ap = buildProyectoGradoTimeline({ estado: 'APROBADO', fechaAprobacion: '2026-06-07' });
    expect(ap).toHaveLength(8);
    expect(ap[7]).toMatchObject({ stepStatus: 'finish', fecha: '07/06/2026', pillLabel: 'Aprobado' });
    expect(ap.slice(0, 7).every((i) => i.stepStatus === 'finish')).toBe(true);
    expect(buildProyectoGradoTimeline({ estado: 'REPROBADO' }).at(-1).stepStatus).toBe('error');
    const can = buildProyectoGradoTimeline({ estado: 'CANCELADO', fechaPresentacionPerfil: 'x', fechaAprobacionPerfil: 'y' });
    expect(can.slice(0, 3).map((i) => i.stepStatus)).toEqual(['finish', 'finish', 'wait']);
    expect(can.at(-1).fecha).toBeNull();
  });
  it('requisitos de transición', () => {
    expect(getRequisitosTransicion('NADA', {})).toEqual({ automaticos: [], manuales: [] });
    expect(getRequisitosTransicion('APROBADO_PERFIL', {}).manuales).toHaveLength(1);
    expect(getRequisitosTransicion('DESARROLLO', { proyecto: { tutorId: 3 } }).automaticos[0].cumplido).toBe(true);
    expect(getRequisitosTransicion('DESARROLLO', { proyecto: {} }).automaticos[0].cumplido).toBe(false);
    expect(getRequisitosTransicion('PREDEFENSA', { bitacoraCount: 2 }).automaticos[0].cumplido).toBe(true);
    expect(getRequisitosTransicion('PREDEFENSA', {}).automaticos[0].cumplido).toBe(false);
    expect(getRequisitosTransicion('DEFENSA', { proyecto: { porcentajeAvance: 100 } }).automaticos[0].cumplido).toBe(true);
    expect(getRequisitosTransicion('APROBADO_PREDEFENSA', {}).automaticos).toEqual([]);
  });
  it('pasantía: PASANTIA y CONVALIDACION', () => {
    expect(buildPasantiaTimeline(null)).toEqual([]);
    expect(buildPasantiaTimeline({ tipo: 'PASANTIA', estado: 'EN_CURSO' }).map((i) => i.stepStatus)).toEqual(['finish', 'process']);
    expect(buildPasantiaTimeline({ tipo: 'PASANTIA', estado: 'SOLICITADA' }).map((i) => i.stepStatus)).toEqual(['process', 'wait']);
    const fin = buildPasantiaTimeline({ tipo: 'PASANTIA', estado: 'FINALIZADA' });
    expect(fin.map((i) => i.stepStatus)).toEqual(['finish', 'finish', 'finish']);
    expect(fin[2].pillLabel).toBe('Finalizada');
    expect(buildPasantiaTimeline({ tipo: 'PASANTIA', estado: 'RECHAZADA' }).map((i) => i.stepStatus)).toEqual(['finish', 'wait', 'error']);
    expect(buildPasantiaTimeline({ tipo: 'PASANTIA', estado: 'CANCELADA' }).map((i) => i.stepStatus)).toEqual(['finish', 'finish', 'finish']);
    expect(buildPasantiaTimeline({ tipo: 'CONVALIDACION', estado: 'CONVALIDADA' }).map((i) => i.stepStatus)).toEqual(['finish', 'finish']);
    expect(buildPasantiaTimeline({ tipo: 'CONVALIDACION', estado: 'RECHAZADA' }).at(-1).stepStatus).toBe('error');
    expect(buildPasantiaTimeline({ tipo: 'X', estado: 'raro' })[0].stepStatus).toBe('process');
  });
});

describe('paths de titulación', () => {
  it('construye rutas', () => {
    expect(paths.proyectoGradoDetallePath(3)).toBe('/titulacion/proyectos-grado/3');
    expect(paths.proyectoGradoEditarPath(3)).toMatch(/3\/editar$/);
    expect(paths.proyectoGradoActaDefensaPath(3)).toMatch(/acta-defensa$/);
    expect(paths.pasantiaDetallePath(2)).toBe('/titulacion/pasantias/2');
    expect(paths.pasantiaEditarPath(2)).toMatch(/editar$/);
    expect(paths.pasantiaEmpresaDetallePath(5)).toMatch(/empresas\/5$/);
    expect(paths.pasantiaEmpresaEditarPath(5)).toMatch(/5\/editar$/);
    expect(paths.PROYECTOS_GRADO_LIST_PATH).toBe('/titulacion/proyectos-grado');
    expect(paths.TIT_MI_PASANTIA_KEY).toBe('TIT-MI-PASANTIA');
  });
});
