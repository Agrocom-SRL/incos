/**
 * Contrato común de los repositorios de lectura sobre vistas (infrastructure/repositories/views):
 * Sequelize simulado; se verifica que cada método emita SQL parametrizado (nunca interpolado),
 * con tantos `?` como valores, todos los `:nombre` presentes y el tipo SELECT.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const query = jest.fn();
jest.unstable_mockModule('../../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { query, QueryTypes: { SELECT: 'SELECT' } },
  default: { query },
}));

const load = async (name) => (await import(`../../../../src/infrastructure/repositories/views/${name}.js`))[name];

const EVIL = "x'; DROP TABLE usuarios;--";

const repos = {};
const REPO_NAMES = [
  'AcompanamientoSesionViewRepository', 'AsistenciaConsolidadoViewRepository', 'AsistenciaPlanillaViewRepository',
  'AsistenciaRegistroEstadoViewRepository', 'AsistenciaSesionViewRepository', 'AulasHorariosSemanaRepository',
  'AvanceAcademicoViewRepository', 'BecasPorCarreraViewRepository', 'CalificacionCentralizadorRepository',
  'CalificacionContextoRepository', 'CalificacionCoordinacionRepository', 'ComplementariosUsosViewRepository',
  'CronogramaGestionRepository', 'CuentasPorCobrarViewRepository', 'CursoCapacitacionFichaViewRepository',
  'DashboardRepository', 'DesercionViewRepository', 'FichaSeguimientoListadoViewRepository',
  'FinanzasUsosViewRepository', 'GrupoCapacitacionListadoViewRepository', 'HistorialAcademicoRepository',
  'IngresoRepository', 'LibroRegistroViewRepository', 'NivelacionParaleloViewRepository',
  'ParaleloGestionAsignacionCoberturaBloquesViewRepository', 'ParaleloGestionConflictoAulaBloqueViewRepository',
  'ParaleloGestionConflictoDocenteBloqueViewRepository', 'ParaleloGestionConflictoParaleloBloqueViewRepository',
  'ParaleloGestionFichaViewRepository', 'ParaleloGestionGrillaBloqueViewRepository', 'PasantiaViewRepository',
  'PaymentAporteCareerExcelReportRepository', 'ProyectoGradoListadoViewRepository', 'RiesgoAcademicoViewRepository',
  'SeguridadAltaUsuarioLookupRepository', 'StudentEnrollmentExcelReportRepository',
  'StudentEnrollmentStudentListExcelReportRepository', 'TutoriaAvanceViewRepository',
  'UsuarioReferenciaVinculoRepository',
];
for (const n of REPO_NAMES) repos[n] = await load(n);

const sqlOf = (c) => c[0].replace(/\s+/g, ' ');

beforeEach(() => {
  query.mockReset();
  query.mockImplementation(async (sql) => (/COUNT\(\*\) AS total FROM/.test(sql) ? [{ total: '7' }] : []));
});

// [repo, método, args]
const CASOS = [
  ['AcompanamientoSesionViewRepository', 'findSesiones', [{ gestionId: 1, docenteId: 2, asignacionDocenteId: 3, estado: EVIL, modalidad: 'X', search: EVIL }, 2, 10]],
  ['AcompanamientoSesionViewRepository', 'findSesionById', [EVIL]],
  ['AcompanamientoSesionViewRepository', 'findEstudiantesBySesionId', [5]],
  ['AcompanamientoSesionViewRepository', 'findResumenMensual', [4]],
  ['AcompanamientoSesionViewRepository', 'findResumenMensual', []],
  ['AsistenciaConsolidadoViewRepository', 'listarFilasConsolidado', [{ paraleloGestionId: 3, bimestre: 2 }]],
  ['AsistenciaConsolidadoViewRepository', 'listarFilasConsolidado', [{ paraleloGestionId: 3 }]],
  ['AsistenciaPlanillaViewRepository', 'listarCeldasPlanilla', [1, '2026-01-01', '2026-01-31']],
  ['AsistenciaPlanillaViewRepository', 'listarLicenciasRoster', [1, '2026-01-01', '2026-01-31']],
  ['AsistenciaPlanillaViewRepository', 'listarAsistenciaBimestreCurso', [1, 2, 3, '2026-01-01', '2026-03-01']],
  ['AsistenciaPlanillaViewRepository', 'listarRoster', [1]],
  ['AsistenciaRegistroEstadoViewRepository', 'obtenerEstadoBimestre', [1, 2]],
  ['AsistenciaSesionViewRepository', 'listarDiasTomados', [1, 'a', 'b']],
  ['AsistenciaSesionViewRepository', 'listarBloquesHorario', [1]],
  ['AsistenciaSesionViewRepository', 'listarFeriadosCalendario', [1, 'a', 'b']],
  ['AsistenciaSesionViewRepository', 'listarClasesNoDictadas', [1, 'a', 'b']],
  ['AulasHorariosSemanaRepository', 'findAll', [{ day: EVIL, shift: 'MANANA', classroomId: 4 }]],
  ['AulasHorariosSemanaRepository', 'findAll', []],
  ['AulasHorariosSemanaRepository', 'findByAulaId', [4]],
  ['AvanceAcademicoViewRepository', 'listarAvance', [{ carreraId: 1, estudianteId: 2 }]],
  ['AvanceAcademicoViewRepository', 'listarAvance', []],
  ['BecasPorCarreraViewRepository', 'findRowsByGestionId', [1]],
  ['CalificacionCentralizadorRepository', 'listarFilasCentralizadorPorParaleloGestion', [1]],
  ['CalificacionCentralizadorRepository', 'listarFilasCentralizadorPorEstudiante', [1]],
  ['CalificacionCentralizadorRepository', 'listarDesgloseBimestrePorEstudiante', [1, 2, 3]],
  ['CalificacionContextoRepository', 'obtenerContextoVigente', []],
  ['CalificacionContextoRepository', 'obtenerPeriodosBimestresGestion', [1]],
  ['CalificacionContextoRepository', 'obtenerGestionAnteriorPorAnio', [2026]],
  ['CalificacionContextoRepository', 'obtenerEstadoInstitucionalBimestre', [1, 2]],
  ['CalificacionCoordinacionRepository', 'listarDocentesCoordinacion', [{ preliminar: true, limit: 5 }]],
  ['CalificacionCoordinacionRepository', 'listarDocentesCoordinacion', [{ q: EVIL }]],
  ['CalificacionCoordinacionRepository', 'obtenerDocenteCalificaciones', [1]],
  ['CalificacionCoordinacionRepository', 'listarCursosPorDocente', [1]],
  ['CalificacionCoordinacionRepository', 'listarResumenBimestresCursosPorDocente', [1, 51]],
  ['CalificacionCoordinacionRepository', 'obtenerCursoPorAsignacion', [1]],
  ['CalificacionCoordinacionRepository', 'listarEstudiantesRegistroNotas', [1]],
  ['ComplementariosUsosViewRepository', 'getUsosByCatalogo', [EVIL]],
  ['CronogramaGestionRepository', 'obtenerActividadesGestion', [1]],
  ['CronogramaGestionRepository', 'obtenerActividadesAdmin', [1]],
  ['CronogramaGestionRepository', 'obtenerActividadAdminPorId', [1]],
  ['CronogramaGestionRepository', 'obtenerPeriodosGestion', [1]],
  ['CronogramaGestionRepository', 'obtenerCatalogoActividades', []],
  ['CuentasPorCobrarViewRepository', 'findRowsByGestionId', [1]],
  ['CuentasPorCobrarViewRepository', 'findUltimoPagoByGestionId', [1]],
  ['CursoCapacitacionFichaViewRepository', 'findListado', [{ estado: 'ABIERTO', search: EVIL, includeInactive: false }, 1, 20]],
  ['CursoCapacitacionFichaViewRepository', 'findListadoById', [1]],
  ['CursoCapacitacionFichaViewRepository', 'findHorariosByCapacitacionId', [1]],
  ['DashboardRepository', 'findActividadesRecientes', [5]],
  ['DashboardRepository', 'countEstudiantesRegistradosHoyYMes', []],
  ['DashboardRepository', 'countParticipantesRegistradosHoyYMes', []],
  ['DashboardRepository', 'findDocentesRecientes', [5]],
  ['DashboardRepository', 'findCarrerasDestacadas', [5]],
  ['DashboardRepository', 'findEstudiantesRecientes', [5]],
  ['DashboardRepository', 'findEstudianteResumen', [1]],
  ['DashboardRepository', 'findCarreraDeEstudiante', [1]],
  ['DashboardRepository', 'findDocentesDeEstudiante', [1, 5]],
  ['DashboardRepository', 'findActividadesDeEstudiante', [1, 5]],
  ['DashboardRepository', 'findActividadesDeDocente', [1, 5]],
  ['DashboardRepository', 'findEstudiantesDeDocente', [1, 2]],
  ['DashboardRepository', 'countSesionesUsuarioHoyYMes', [1]],
  ['DashboardRepository', 'findSaldoPendienteEstudiante', [1]],
  ['DashboardRepository', 'findCargaDocenteGestion', [1, 2026]],
  ['DashboardRepository', 'findHorarioBloquesDocenteGestion', [1, 2]],
  ['DesercionViewRepository', 'listarResumenCarreraGestion', [{ gestionId: 1, carreraId: 2 }]],
  ['DesercionViewRepository', 'listarDesertores', [{ gestionId: 1, carreraId: 2 }]],
  ['DesercionViewRepository', 'listarDesertores', []],
  ['FichaSeguimientoListadoViewRepository', 'findListado', [{ docenteId: 1, gestionId: 2, fechaDesde: 'a', fechaHasta: 'b', search: EVIL }, 1, 5]],
  ['FichaSeguimientoListadoViewRepository', 'findListadoById', [1]],
  ['FinanzasUsosViewRepository', 'getUsosByCatalogo', ['X']],
  ['GrupoCapacitacionListadoViewRepository', 'findListado', [{ cursoId: 1, search: EVIL, includeInactiveCursos: true }, 1, 5]],
  ['GrupoCapacitacionListadoViewRepository', 'findHorariosByGrupoIds', [[1, 2]]],
  ['HistorialAcademicoRepository', 'listarFilasHistorialPorEstudiante', [1]],
  ['HistorialAcademicoRepository', 'obtenerCabeceraEstudiante', [1]],
  ['IngresoRepository', 'findAll', [{ search: EVIL, origen: 'PAGO', soloInstituto: true, sortField: 'monto', sortOrder: 'asc' }]],
  ['LibroRegistroViewRepository', 'listarLibros', [{ gestionId: 1 }]],
  ['LibroRegistroViewRepository', 'obtenerLibroPorId', [1]],
  ['LibroRegistroViewRepository', 'listarFoliosPorLibro', [1, { paraleloGestionId: 2 }]],
  ['LibroRegistroViewRepository', 'obtenerFolioPorId', [1]],
  ['LibroRegistroViewRepository', 'listarNominaPorParaleloGestion', [1]],
  ['LibroRegistroViewRepository', 'listarParalelosPorGestion', [1, { libroId: 9 }]],
  ['LibroRegistroViewRepository', 'listarParalelosPorGestion', [1]],
  ['LibroRegistroViewRepository', 'listarFoliosPorParaleloGestion', [1]],
  ['LibroRegistroViewRepository', 'listarUbicacionEstudiantesPorParaleloGestion', [1]],
  ['NivelacionParaleloViewRepository', 'listarEventosPorParaleloGestion', [1]],
  ['NivelacionParaleloViewRepository', 'contarPendientesPorParalelo', []],
  ['NivelacionParaleloViewRepository', 'listarNivelacionesPendientes', []],
  ['NivelacionParaleloViewRepository', 'listarEventosPorEstudiante', [1]],
  ['ParaleloGestionAsignacionCoberturaBloquesViewRepository', 'findByParaleloGestionId', [1]],
  ['ParaleloGestionConflictoAulaBloqueViewRepository', 'findByParaleloGestionId', [1]],
  ['ParaleloGestionConflictoDocenteBloqueViewRepository', 'findByParaleloGestionId', [1]],
  ['ParaleloGestionConflictoParaleloBloqueViewRepository', 'findByParaleloGestionId', [1]],
  ['ParaleloGestionFichaViewRepository', 'findByManagementPlanId', [1]],
  ['ParaleloGestionFichaViewRepository', 'findById', [1]],
  ['ParaleloGestionFichaViewRepository', 'findByParallelId', [1]],
  ['ParaleloGestionFichaViewRepository', 'findOfertadoByGestionId', [1]],
  ['ParaleloGestionGrillaBloqueViewRepository', 'findByParaleloGestionId', [1]],
  ['ParaleloGestionGrillaBloqueViewRepository', 'findByAssignmentAndHorario', [{ asignacionDocenteId: 1, horarioId: 2, excludeAsignacionHorarioId: 3, excludeAsignacionHorarioIds: [4, 'x', -1] }]],
  ['ParaleloGestionGrillaBloqueViewRepository', 'findByAssignmentAndHorario', [{ asignacionDocenteId: 1, horarioId: 2 }]],
  ['ParaleloGestionGrillaBloqueViewRepository', 'findOtherAssignmentAtHorario', [{ paraleloGestionId: 1, horarioId: 2, asignacionDocenteId: 3, excludeAsignacionHorarioId: 8 }]],
  ['PasantiaViewRepository', 'findListado', [{ carreraId: 1, gestionId: 2, estado: 'A', tipo: 'B', docenteSupervisorId: 3, estudianteId: 4, search: EVIL }, 1, 5]],
  ['PasantiaViewRepository', 'findListadoById', [1]],
  ['PaymentAporteCareerExcelReportRepository', 'findRowsByGestionIdAndCarreraId', [1, 2]],
  ['ProyectoGradoListadoViewRepository', 'findListado', [{ gestionId: 1, carreraId: 2, modalidadId: 3, estado: 'E', tutorId: 4, search: EVIL }, 1, 5]],
  ['ProyectoGradoListadoViewRepository', 'findListadoById', [1]],
  ['ProyectoGradoListadoViewRepository', 'findIntegrantesByProyectoId', [1]],
  ['ProyectoGradoListadoViewRepository', 'findIntegranteRowsByEstudianteId', [1]],
  ['ProyectoGradoListadoViewRepository', 'findBitacoraMensual', [{ mes: '2026-03', gestionId: 1, tutorId: 2 }]],
  ['ProyectoGradoListadoViewRepository', 'findBitacoraMensual', []],
  ['RiesgoAcademicoViewRepository', 'findAlertas', [{ search: EVIL, gestionId: 1, carreraId: 2, paraleloGestionId: 3, docenteId: 4, asignacionDocenteIds: [5, 6] }, 1, 5]],
  ['RiesgoAcademicoViewRepository', 'findByEstudianteId', [1, { gestionId: 2 }]],
  ['RiesgoAcademicoViewRepository', 'findResumenCarrera', [1]],
  ['RiesgoAcademicoViewRepository', 'findReprobacionMateria', [1]],
  ['RiesgoAcademicoViewRepository', 'findResumenCarrera', []],
  ['SeguridadAltaUsuarioLookupRepository', 'buscarEstudiantesSinCuenta', [EVIL, 10]],
  ['SeguridadAltaUsuarioLookupRepository', 'buscarDocentesSinCuenta', [EVIL, 10]],
  ['StudentEnrollmentExcelReportRepository', 'findRowsByGestionId', [1]],
  ['StudentEnrollmentStudentListExcelReportRepository', 'findRowsByGestionIdAndCarreraId', [1, 2]],
  ['TutoriaAvanceViewRepository', 'findEstudiantesElegibles', [{ carreraId: 1, gestionId: 2, search: EVIL }, 1, 5]],
  ['TutoriaAvanceViewRepository', 'findAvancePorCarrera', [{ gestionId: 1, carreraId: 2 }]],
  ['TutoriaAvanceViewRepository', 'findSeguimientoTutoriaDocentes', [{ docenteId: 1, carreraId: 2, anio: 2026, mes: 3 }]],
  ['TutoriaAvanceViewRepository', 'findSeguimientoTutoriaDocentes', [{ anio: 2026, mes: 3 }]],
];

describe('repositorios de vistas: SQL parametrizado', () => {
  it.each(CASOS.map((c, i) => [`${c[0]}.${c[1]} #${i}`, ...c]))('%s', async (_n, repoName, method, args) => {
    const repo = new repos[repoName]();
    await repo[method](...args);

    expect(query).toHaveBeenCalled();
    for (const call of query.mock.calls) {
      const sql = call[0];
      const opts = call[1] ?? {};
      expect(typeof sql).toBe('string');
      expect(opts.type).toBe('SELECT');
      expect(sql).not.toMatch(/DROP TABLE/i);
      expect(sql).not.toContain(EVIL);
      const repl = opts.replacements;
      if (Array.isArray(repl)) {
        expect((sql.match(/\?/g) || []).length).toBe(repl.length);
      } else if (repl) {
        const tokens = [...sql.matchAll(/(?<![:\w'%]):([a-zA-Z_]\w*)/g)].map((m) => m[1]);
        for (const t of tokens) expect(Object.keys(repl)).toContain(t);
      } else {
        expect(sql).not.toMatch(/(?<![:\w'%]):[a-zA-Z_]\w*/);
      }
    }
  });

  it('todos los repositorios del directorio están cubiertos por la tabla', () => {
    const cubiertos = new Set(CASOS.map((c) => c[0]));
    // UsuarioReferenciaVinculoRepository (mapeo propio) y HorarioGrillaRepository (solo delega)
    // se prueban en bloques aparte.
    expect(REPO_NAMES.filter((n) => !cubiertos.has(n))).toEqual(['UsuarioReferenciaVinculoRepository']);
  });
});

describe('filtros y paginación', () => {
  it('RiesgoAcademico.findAlertas arma WHERE idéntico en COUNT y SELECT, con LIKE y paginación', async () => {
    const repo = new repos.RiesgoAcademicoViewRepository();
    const res = await repo.findAlertas({ search: 'Pérez', gestionId: 1, asignacionDocenteIds: [5, 6] }, 3, 20);
    const [count, data] = query.mock.calls;
    expect(res).toEqual({ rows: [], total: 7 });
    expect(sqlOf(count)).toContain('en_riesgo = 1 OR en_riesgo_asistencia = 1');
    expect(sqlOf(count)).toContain('asignacion_docente_id IN (?, ?)');
    expect(count[1].replacements).toEqual([1, 5, 6, '%Pérez%', '%Pérez%', '%Pérez%', '%Pérez%']);
    expect(data[1].replacements).toEqual([...count[1].replacements, 20, 40]);
    expect(sqlOf(data)).toContain('LIMIT ? OFFSET ?');
  });

  it('RiesgoAcademico.findAlertas con soloEnRiesgo=false no filtra y normaliza page/limit inválidos', async () => {
    const repo = new repos.RiesgoAcademicoViewRepository();
    await repo.findAlertas({ soloEnRiesgo: false }, -4, 'abc');
    const [count, data] = query.mock.calls;
    expect(sqlOf(count)).not.toContain('WHERE');
    expect(data[1].replacements).toEqual([50, 0]);
  });

  it('limita el LIMIT a 10000', async () => {
    const repo = new repos.PasantiaViewRepository();
    await repo.findListado({}, 1, 99999);
    expect(query.mock.calls[1][1].replacements).toEqual([10000, 0]);
  });

  it('findListado sin total devuelve 0', async () => {
    query.mockResolvedValue([]);
    const repo = new repos.PasantiaViewRepository();
    expect((await repo.findListado()).total).toBe(0);
  });

  it('Pasantia.findListado combina todos los filtros con AND', async () => {
    const repo = new repos.PasantiaViewRepository();
    await repo.findListado({ carreraId: 1, estado: 'ACTIVA', search: 'ñandú' });
    const sql = sqlOf(query.mock.calls[0]);
    expect(sql).toContain('WHERE carrera_id = ? AND estado = ? AND (estudiante_nombre LIKE ?');
    expect(query.mock.calls[0][1].replacements).toEqual([1, 'ACTIVA', '%ñandú%', '%ñandú%', '%ñandú%']);
  });

  it('Cursos de capacitación excluye inactivos salvo includeInactive', async () => {
    const repo = new repos.CursoCapacitacionFichaViewRepository();
    await repo.findListado({});
    expect(sqlOf(query.mock.calls[0])).toContain('WHERE activo = TRUE');
    query.mockClear();
    await repo.findListado({ includeInactive: true });
    expect(sqlOf(query.mock.calls[0])).not.toContain('WHERE');
  });

  it('Grupos de capacitación: curso_activo por defecto y IN con arreglo de ids; sin ids no consulta', async () => {
    const repo = new repos.GrupoCapacitacionListadoViewRepository();
    await repo.findListado({ cursoId: 3 });
    expect(sqlOf(query.mock.calls[0])).toContain('WHERE curso_activo = TRUE AND curso_id = ?');
    query.mockClear();
    expect(await repo.findHorariosByGrupoIds([])).toEqual([]);
    expect(await repo.findHorariosByGrupoIds(null)).toEqual([]);
    expect(query).not.toHaveBeenCalled();
    await repo.findHorariosByGrupoIds([4, 5]);
    expect(query.mock.calls[0][1].replacements).toEqual({ grupoIds: [4, 5] });
  });

  it('Ingreso.findAll: orden permitido y rechazo de campos fuera de lista blanca', async () => {
    const repo = new repos.IngresoRepository();
    await repo.findAll({ sortField: 'monto', sortOrder: 'asc' });
    expect(sqlOf(query.mock.calls[1])).toContain('ORDER BY monto ASC');
    query.mockClear();
    await repo.findAll({ sortField: 'monto; DROP TABLE x', sortOrder: 'asc' });
    expect(sqlOf(query.mock.calls[1])).toContain('ORDER BY fecha_pago DESC, id_local DESC');
    expect(sqlOf(query.mock.calls[1])).not.toContain('DROP');
    query.mockClear();
    await repo.findAll({ sortField: 'concepto', sortOrder: 'raro' });
    expect(sqlOf(query.mock.calls[1])).toContain('ORDER BY concepto DESC');
  });

  it('Ingreso.findAll: soloInstituto, origen y búsqueda en blanco', async () => {
    const repo = new repos.IngresoRepository();
    await repo.findAll({ origen: 'CAPACITACION', soloInstituto: true, search: '   ' });
    const sql = sqlOf(query.mock.calls[0]);
    expect(sql).toContain('WHERE origen = ? AND cobra_instituto = 1');
    expect(sql).not.toContain('LIKE');
    expect(query.mock.calls[0][1].replacements).toEqual(['CAPACITACION']);
  });

  it('Ingreso.findAll: búsqueda con trim', async () => {
    const repo = new repos.IngresoRepository();
    await repo.findAll({ search: '  juan ' });
    expect(query.mock.calls[0][1].replacements).toEqual(Array(5).fill('%juan%'));
  });

  it('Aulas: where dinámico y respuesta con totales', async () => {
    query.mockResolvedValue([{ a: 1 }, { a: 2 }]);
    const repo = new repos.AulasHorariosSemanaRepository();
    const res = await repo.findAll({ day: 'LUNES', shift: 'TARDE', classroomId: 9 });
    expect(sqlOf(query.mock.calls[0])).toContain('WHERE dia = :dia AND turno = :turno AND aula_id = :aulaId');
    expect(query.mock.calls[0][1].replacements).toEqual({ dia: 'LUNES', turno: 'TARDE', aulaId: 9 });
    expect(res).toEqual({ bloques: [{ a: 1 }, { a: 2 }], total: 2, page: 1, limit: 2 });
  });

  it('Aulas.findByAulaId descarta bloques sin aula', async () => {
    await new repos.AulasHorariosSemanaRepository().findByAulaId(4);
    const sql = sqlOf(query.mock.calls[0]);
    expect(sql).toContain('tiene_aula = 1');
    expect(sql).toContain('es_sin_aula = 0');
  });

  it('Avance/Deserción: filtros solo si no son null', async () => {
    await new repos.AvanceAcademicoViewRepository().listarAvance({ carreraId: 0 });
    expect(sqlOf(query.mock.calls[0])).toContain('AND carrera_id = :carreraId');
    expect(sqlOf(query.mock.calls[0])).not.toContain('estudiante_id');
    query.mockClear();
    await new repos.DesercionViewRepository().listarResumenCarreraGestion({ gestionId: 3 });
    expect(sqlOf(query.mock.calls[0])).toContain('AND gestion_id = :gestionId');
    expect(sqlOf(query.mock.calls[0])).not.toContain('carrera_id = :carreraId');
  });

  it('Consolidado de asistencia filtra bimestre solo si se indica (0 incluido)', async () => {
    const repo = new repos.AsistenciaConsolidadoViewRepository();
    await repo.listarFilasConsolidado({ paraleloGestionId: 1, bimestre: 0 });
    expect(sqlOf(query.mock.calls[0])).toContain('AND bimestre = :bimestre');
    query.mockClear();
    await repo.listarFilasConsolidado({ paraleloGestionId: 1 });
    expect(sqlOf(query.mock.calls[0])).not.toContain('bimestre = :bimestre');
  });

  it('Riesgo.findByEstudianteId y resúmenes aplican gestión opcional', async () => {
    const repo = new repos.RiesgoAcademicoViewRepository();
    await repo.findByEstudianteId(7);
    expect(query.mock.calls[0][1].replacements).toEqual([7]);
    await repo.findResumenCarrera(2);
    expect(query.mock.calls[1][1].replacements).toEqual([2]);
    await repo.findReprobacionMateria();
    expect(query.mock.calls[2][1].replacements).toEqual([]);
  });

  it('Tutoría: elegibles filtra proyecto sin asignar y seguimiento usa :anio/:mes', async () => {
    const repo = new repos.TutoriaAvanceViewRepository();
    const res = await repo.findEstudiantesElegibles({ search: 'ana' }, 2, 10);
    expect(res.total).toBe(7);
    expect(sqlOf(query.mock.calls[0])).toContain('proyecto_grado_id IS NULL AND (estudiante_nombre_completo LIKE ? OR ci LIKE ?)');
    expect(query.mock.calls[1][1].replacements).toEqual(['%ana%', '%ana%', 10, 10]);
    query.mockClear();
    await repo.findSeguimientoTutoriaDocentes({ docenteId: 2, anio: 2026, mes: 5 });
    expect(query.mock.calls[0][1].replacements).toEqual({ anio: 2026, mes: 5, docenteId: 2 });
    expect(sqlOf(query.mock.calls[0])).toContain('WHERE roster.tutor_id = :docenteId');
  });

  it('Proyecto de grado: bitácora sin filtros no usa WHERE', async () => {
    await new repos.ProyectoGradoListadoViewRepository().findBitacoraMensual();
    expect(sqlOf(query.mock.calls[0])).not.toContain('WHERE');
  });

  it('Coordinación de calificaciones: preliminar, búsqueda corta y saneo de comodines', async () => {
    const repo = new repos.CalificacionCoordinacionRepository();
    await repo.listarDocentesCoordinacion({ preliminar: true, limit: 500 });
    expect(query.mock.calls[0][1].replacements).toEqual([100]);
    query.mockClear();
    expect(await repo.listarDocentesCoordinacion({ q: 'a' })).toEqual([]);
    expect(await repo.listarDocentesCoordinacion()).toEqual([]);
    expect(query).not.toHaveBeenCalled();
    await repo.listarDocentesCoordinacion({ q: ' 50%_ma ', limit: 'x' });
    expect(query.mock.calls[0][1].replacements).toEqual(['%50ma%', '%50ma%', '%50ma%', 50]);
  });

  it('Coordinación: nota mínima por defecto 61 y repetida para aprobados/reprobados', async () => {
    const repo = new repos.CalificacionCoordinacionRepository();
    await repo.listarResumenBimestresCursosPorDocente(9, 'abc');
    expect(query.mock.calls[0][1].replacements).toEqual([61, 61, 9]);
  });

  it('Seguridad: búsqueda mínima de 2 caracteres, saneo de comodines y límite 1..50', async () => {
    const repo = new repos.SeguridadAltaUsuarioLookupRepository();
    expect(await repo.buscarEstudiantesSinCuenta(' a ')).toEqual([]);
    expect(await repo.buscarDocentesSinCuenta(null)).toEqual([]);
    expect(query).not.toHaveBeenCalled();
    await repo.buscarEstudiantesSinCuenta('%j_u%', 999);
    expect(query.mock.calls[0][1].replacements).toEqual({ term: '%ju%', lim: 50 });
    await repo.buscarDocentesSinCuenta('juan', 0);
    expect(query.mock.calls[1][1].replacements).toEqual({ term: '%juan%', lim: 20 });
    await repo.buscarDocentesSinCuenta('juan', -3);
    expect(query.mock.calls[2][1].replacements.lim).toBe(1);
  });
});

describe('mapeo de resultados', () => {
  it('métodos "uno" devuelven la primera fila o null', async () => {
    query.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
    expect(await new repos.PasantiaViewRepository().findListadoById(1)).toEqual({ id: 1 });
    query.mockResolvedValueOnce([]);
    expect(await new repos.AcompanamientoSesionViewRepository().findSesionById(1)).toBeNull();
    query.mockResolvedValueOnce([]);
    expect(await new repos.AsistenciaRegistroEstadoViewRepository().obtenerEstadoBimestre(1, 2)).toBeNull();
    query.mockResolvedValueOnce([]);
    expect(await new repos.HistorialAcademicoRepository().obtenerCabeceraEstudiante(1)).toBeNull();
    query.mockResolvedValueOnce([{ id: 3 }]);
    expect(await new repos.CalificacionContextoRepository().obtenerContextoVigente()).toEqual({ id: 3 });
    query.mockResolvedValueOnce([]);
    expect(await new repos.CalificacionContextoRepository().obtenerGestionAnteriorPorAnio(2026)).toBeNull();
  });

  it('estado institucional del bimestre devuelve solo el valor', async () => {
    query.mockResolvedValueOnce([{ estado_institucional: 'ABIERTO' }]);
    const repo = new repos.CalificacionContextoRepository();
    expect(await repo.obtenerEstadoInstitucionalBimestre(1, 2)).toBe('ABIERTO');
    query.mockResolvedValueOnce([]);
    expect(await repo.obtenerEstadoInstitucionalBimestre(1, 2)).toBeNull();
  });

  it('usos por catálogo se indexan por item_id numérico con conteos numéricos (null -> 0)', async () => {
    query.mockResolvedValueOnce([
      { item_id: '3', cantidad_estudiantes: '5', cantidad_docentes: null, cantidad_personal: 'x' },
    ]);
    const usos = await new repos.ComplementariosUsosViewRepository().getUsosByCatalogo('GENERO');
    expect(usos.get(3)).toEqual({ cantidadEstudiantes: 5, cantidadDocentes: 0, cantidadPersonal: 0 });
    expect(query.mock.calls[0][1].replacements).toEqual({ catalogo: 'GENERO' });

    query.mockResolvedValueOnce([{ item_id: 1, cantidad_pagos: 2, cantidad_cuentas: '4' }]);
    const f = await new repos.FinanzasUsosViewRepository().getUsosByCatalogo('X');
    expect(f.get(1)).toEqual({ cantidadPagos: 2, cantidadCuentas: 4, cantidadAsignaciones: 0 });
  });

  it('Dashboard: contadores hoy/mes a número y por defecto 0', async () => {
    const repo = new repos.DashboardRepository();
    query.mockResolvedValueOnce([{ hoy: '2', mes: '9' }]);
    expect(await repo.countEstudiantesRegistradosHoyYMes()).toEqual({ hoy: 2, mes: 9 });
    query.mockResolvedValueOnce([{ hoy: null, mes: null }]);
    expect(await repo.countParticipantesRegistradosHoyYMes()).toEqual({ hoy: 0, mes: 0 });
    query.mockResolvedValueOnce([]);
    expect(await repo.countSesionesUsuarioHoyYMes(3)).toEqual({ hoy: 0, mes: 0 });
  });

  it('Dashboard: resumen de estudiante, saldo y carga con valores por defecto', async () => {
    const repo = new repos.DashboardRepository();
    query.mockResolvedValueOnce([]);
    expect(await repo.findEstudianteResumen(1)).toEqual({ nombre: '', codigo: '' });
    query.mockResolvedValueOnce([{ nombre: 'PEREZ JUAN', codigo: 'E1' }]);
    expect(await repo.findEstudianteResumen(1)).toEqual({ nombre: 'PEREZ JUAN', codigo: 'E1' });
    query.mockResolvedValueOnce([]);
    expect(await repo.findSaldoPendienteEstudiante(1)).toBe(0);
    query.mockResolvedValueOnce([{ saldo_pendiente_total: '150.5' }]);
    expect(await repo.findSaldoPendienteEstudiante(1)).toBe(150.5);
    query.mockResolvedValueOnce([]);
    expect(await repo.findCargaDocenteGestion(1, 2026)).toEqual({ total_asignaciones: 0, horas_semanales: 0 });
    query.mockResolvedValueOnce([{ total_asignaciones: '3', horas_semanales: '12' }]);
    expect(await repo.findCargaDocenteGestion(1, 2026)).toEqual({ total_asignaciones: 3, horas_semanales: 12 });
    query.mockResolvedValueOnce([]);
    expect(await repo.findCarreraDeEstudiante(1)).toBeNull();
  });

  it('Dashboard: límites de listados se acotan', async () => {
    const repo = new repos.DashboardRepository();
    await repo.findActividadesRecientes(5000);
    await repo.findDocentesRecientes(0);
    await repo.findCarrerasDestacadas('x');
    await repo.findActividadesDeEstudiante(1, 5000);
    expect(query.mock.calls.map((c) => c[1].replacements.at(-1))).toEqual([100, 10, 10, 50]);
  });

  it('Libros: ordena paralelos por carrera, periodo y nombre', async () => {
    query.mockResolvedValueOnce([
      { carrera_codigo: 'INF', periodo_numero: 1, paralelo_nombre: 'A' },
      { carrera_codigo: 'CON', periodo_numero: 2, paralelo_nombre: 'B' },
      { carrera_codigo: 'CON', periodo_numero: 2, paralelo_nombre: 'A' },
      { carrera_codigo: 'CON', periodo_numero: 1, paralelo_nombre: 'C' },
    ]);
    const { ordenCarreraLibro } = await import('../../../../src/domain/constants/libros.constants.js');
    const res = await new repos.LibroRegistroViewRepository().listarParalelosPorGestion(1);
    const ordenes = res.map((r) => ordenCarreraLibro(r.carrera_codigo));
    expect(ordenes).toEqual([...ordenes].sort((a, b) => a - b));
    const ids = res.map((r) => `${r.carrera_codigo}${r.periodo_numero}${r.paralelo_nombre}`);
    expect(ids.indexOf('CON2A')).toBeLessThan(ids.indexOf('CON2B'));
    expect(ids.indexOf('CON1C')).toBeLessThan(ids.indexOf('CON2A'));
  });

  it('Libros: con libroId agrega subconsulta de folios vigentes y excluye anulados', async () => {
    await new repos.LibroRegistroViewRepository().listarParalelosPorGestion(1, { libroId: 9 });
    const [sql, opts] = query.mock.calls[0];
    expect(sql).toContain('folios_vigentes');
    expect(opts.replacements).toEqual([9, 'ANULADO', 1]);
  });

  it('Libros: folios por libro filtra por paralelo opcional', async () => {
    const repo = new repos.LibroRegistroViewRepository();
    await repo.listarFoliosPorLibro(1);
    expect(query.mock.calls[0][1].replacements).toEqual([1]);
    await repo.listarLibros();
    expect(sqlOf(query.mock.calls[1])).not.toContain('WHERE');
  });

  it('Cronograma: vigente combina contexto y actividades; sin contexto devuelve null', async () => {
    const ctx = { obtenerContextoVigente: jest.fn().mockResolvedValue({ gestion_id: 4 }) };
    const repo = new repos.CronogramaGestionRepository({ calificacionContextoRepository: ctx });
    query.mockResolvedValueOnce([{ id: 1 }]);
    expect(await repo.obtenerCronogramaVigente()).toEqual({ contexto: { gestion_id: 4 }, actividades: [{ id: 1 }] });
    expect(query.mock.calls[0][1].replacements).toEqual([4]);

    ctx.obtenerContextoVigente.mockResolvedValue(null);
    expect(await repo.obtenerCronogramaVigente()).toBeNull();
    expect(await repo.obtenerAdminVigente()).toBeNull();
  });

  it('Cronograma: admin vigente trae actividades, periodos y catálogo', async () => {
    const ctx = { obtenerContextoVigente: jest.fn().mockResolvedValue({ gestion_id: 4 }) };
    const repo = new repos.CronogramaGestionRepository({ calificacionContextoRepository: ctx });
    query.mockResolvedValueOnce([{ a: 1 }]).mockResolvedValueOnce([{ p: 1 }]).mockResolvedValueOnce([{ c: 1 }]);
    const res = await repo.obtenerAdminVigente();
    expect(res).toEqual({ contexto: { gestion_id: 4 }, actividades: [{ a: 1 }], periodos: [{ p: 1 }], catalogo: [{ c: 1 }] });
    expect(new repos.CronogramaGestionRepository().contexto).toBeDefined();
    query.mockResolvedValueOnce([]);
    expect(await repo.obtenerActividadAdminPorId(1)).toBeNull();
  });
});

describe('vistas de paralelo gestión: ids inválidos no consultan', () => {
  it.each([
    ['ParaleloGestionAsignacionCoberturaBloquesViewRepository', 'findByParaleloGestionId'],
    ['ParaleloGestionConflictoAulaBloqueViewRepository', 'findByParaleloGestionId'],
    ['ParaleloGestionConflictoDocenteBloqueViewRepository', 'findByParaleloGestionId'],
    ['ParaleloGestionConflictoParaleloBloqueViewRepository', 'findByParaleloGestionId'],
    ['ParaleloGestionGrillaBloqueViewRepository', 'findByParaleloGestionId'],
    ['ParaleloGestionFichaViewRepository', 'findByManagementPlanId'],
    ['ParaleloGestionFichaViewRepository', 'findByParallelId'],
    ['ParaleloGestionFichaViewRepository', 'findOfertadoByGestionId'],
  ])('%s.%s', async (name, method) => {
    const repo = new repos[name]();
    for (const bad of [0, -1, 'abc', undefined, NaN]) expect(await repo[method](bad)).toEqual([]);
    expect(query).not.toHaveBeenCalled();
  });

  it('Ficha.findById inválido devuelve null; válido filtra por id numérico', async () => {
    const repo = new repos.ParaleloGestionFichaViewRepository();
    expect(await repo.findById('x')).toBeNull();
    expect(query).not.toHaveBeenCalled();
    query.mockResolvedValueOnce([{ id: 5 }]);
    expect(await repo.findById('5')).toEqual({ id: 5 });
    expect(query.mock.calls[0][1].replacements).toEqual({ id: 5 });
  });

  it('Grilla: findByAssignmentAndHorario excluye bloques, normaliza y devuelve id numérico o null', async () => {
    const repo = new repos.ParaleloGestionGrillaBloqueViewRepository();
    query.mockResolvedValueOnce([{ asignacionHorarioId: '12' }]);
    const id = await repo.findByAssignmentAndHorario({
      asignacionDocenteId: '1', horarioId: 2, excludeAsignacionHorarioId: 3, excludeAsignacionHorarioIds: [3, 4, 'x', 0],
    });
    expect(id).toBe(12);
    expect(query.mock.calls[0][1].replacements).toEqual({
      asignacionDocenteId: 1, horarioId: 2, excludeHorarioIds: [3, 4],
    });
    expect(sqlOf(query.mock.calls[0])).toContain('NOT IN (:excludeHorarioIds)');
    query.mockResolvedValueOnce([]);
    expect(await repo.findByAssignmentAndHorario({ asignacionDocenteId: 1, horarioId: 2 })).toBeNull();
    expect(query.mock.calls[1][1].replacements).toEqual({ asignacionDocenteId: 1, horarioId: 2 });
    expect(await repo.findByAssignmentAndHorario({ asignacionDocenteId: 'a', horarioId: 2 })).toBeNull();
  });

  it('Grilla: findOtherAssignmentAtHorario devuelve la otra asignación o null', async () => {
    const repo = new repos.ParaleloGestionGrillaBloqueViewRepository();
    query.mockResolvedValueOnce([{ asignacionDocenteId: '77' }]);
    expect(await repo.findOtherAssignmentAtHorario({ paraleloGestionId: 1, horarioId: 2, asignacionDocenteId: 3, excludeAsignacionHorarioIds: [9] })).toBe(77);
    expect(query.mock.calls[0][1].replacements.excludeHorarioIds).toEqual([9]);
    query.mockResolvedValueOnce([]);
    expect(await repo.findOtherAssignmentAtHorario({ paraleloGestionId: 1, horarioId: 2, asignacionDocenteId: 3 })).toBeNull();
    expect(await repo.findOtherAssignmentAtHorario({ paraleloGestionId: 'a', horarioId: 2, asignacionDocenteId: 3 })).toBeNull();
  });
});

describe('HorarioGrillaRepository (fachada)', () => {
  it('delega cada lectura en su repositorio de vista', async () => {
    const { HorarioGrillaRepository } = await import('../../../../src/infrastructure/repositories/views/HorarioGrillaRepository.js');
    const mk = () => ({ findByParaleloGestionId: jest.fn().mockReturnValue('r') });
    const deps = {
      grillaBloqueViewRepository: mk(), asignacionCoberturaBloquesViewRepository: mk(),
      conflictoParaleloBloqueViewRepository: mk(), conflictoAulaBloqueViewRepository: mk(),
      conflictoDocenteBloqueViewRepository: mk(),
    };
    const repo = new HorarioGrillaRepository(deps);
    expect(repo.findBloquesByParaleloGestionId(1)).toBe('r');
    expect(repo.findCoberturaBloquesByParaleloGestionId(2)).toBe('r');
    expect(repo.findConflictosParaleloByParaleloGestionId(3)).toBe('r');
    expect(repo.findConflictosAulaByParaleloGestionId(4)).toBe('r');
    expect(repo.findConflictosDocenteByParaleloGestionId(5)).toBe('r');
    expect(deps.grillaBloqueViewRepository.findByParaleloGestionId).toHaveBeenCalledWith(1);
    expect(deps.conflictoDocenteBloqueViewRepository.findByParaleloGestionId).toHaveBeenCalledWith(5);
  });
});

describe('UsuarioReferenciaVinculoRepository', () => {
  const T = async () => (await import('../../../../src/domain/constants/usuarios.constants.js')).TIPOS_REFERENCIA;

  it('estudiante: arma líneas CI con expedición, código y email', async () => {
    const t = await T();
    query.mockResolvedValueOnce([{ nombres: 'Ana', apellido_paterno: 'Pérez', apellido_materno: null, ci: 123, expedicion: ' LP ', codigo_estudiante: 'E-1', email_personal: 'a@b.c' }]);
    const res = await new repos.UsuarioReferenciaVinculoRepository().findPerfilVinculado(t.ESTUDIANTE, '5');
    expect(res).toEqual({
      tipo_etiqueta: 'Estudiante', nombre_completo: 'Ana Pérez', referencia_id: 5, tipo_referencia: t.ESTUDIANTE,
      lineas: [
        { etiqueta: 'CI', valor: '123 LP' },
        { etiqueta: 'Código estudiante', valor: 'E-1' },
        { etiqueta: 'Email personal', valor: 'a@b.c' },
      ],
    });
    expect(query.mock.calls[0][1].replacements).toEqual({ id: 5 });
  });

  it('docente: incluye título profesional; CI sin expedición', async () => {
    const t = await T();
    query.mockResolvedValueOnce([{ nombres: 'Luis', ci: '99', titulo_profesional: 'Lic.' }]);
    const res = await new repos.UsuarioReferenciaVinculoRepository().findPerfilVinculado(t.DOCENTE, 1);
    expect(res.lineas).toEqual([{ etiqueta: 'CI', valor: '99' }, { etiqueta: 'Título profesional', valor: 'Lic.' }]);
  });

  it('personal (rector/director/secretaria y sin tipo) lee la tabla personal', async () => {
    const t = await T();
    const repo = new repos.UsuarioReferenciaVinculoRepository();
    query.mockResolvedValueOnce([{ nombres: 'Rosa', ci: 1, celular: '7000', email_personal: 'r@x' }]);
    const r1 = await repo.findPerfilVinculado(t.RECTOR, 2);
    expect(r1.tipo_etiqueta).toBe('Rector');
    expect(r1.lineas.map((l) => l.etiqueta)).toEqual(['CI', 'Email personal', 'Celular']);
    expect(sqlOf(query.mock.calls[0])).toContain('FROM personal');
    query.mockResolvedValueOnce([{ nombres: 'Admin' }]);
    const r2 = await repo.findPerfilVinculado('', 3);
    expect(r2).toMatchObject({ tipo_etiqueta: 'Personal', tipo_referencia: null, lineas: [] });
  });

  it('devuelve null con id inválido, tipo desconocido, fila ausente o sin nombre', async () => {
    const t = await T();
    const repo = new repos.UsuarioReferenciaVinculoRepository();
    expect(await repo.findPerfilVinculado(t.ESTUDIANTE, null)).toBeNull();
    expect(await repo.findPerfilVinculado(t.ESTUDIANTE, 0)).toBeNull();
    expect(await repo.findPerfilVinculado('NOEXISTE', 1)).toBeNull();
    expect(query).not.toHaveBeenCalled();
    query.mockResolvedValueOnce([]);
    expect(await repo.findPerfilVinculado(t.ESTUDIANTE, 1)).toBeNull();
    query.mockResolvedValueOnce([{ ci: 1 }]);
    expect(await repo.findPerfilVinculado(t.DOCENTE, 1)).toBeNull();
    query.mockResolvedValueOnce([]);
    expect(await repo.findPerfilVinculado(t.DIRECTOR, 1)).toBeNull();
    query.mockResolvedValueOnce([{ ci: 1 }]);
    expect(await repo.findPerfilVinculado(t.SECRETARIA, 1)).toBeNull();
  });
});
