/**
 * Exportación centralizada de todas las interfaces de repositorios
 * Organizadas por categorías
 *
 * Convención: interfaces en español (I*Repository); implementaciones en inglés (*Repository).
 */

// ============================================
// INTERFAZ BASE
// ============================================
export { IRepository } from './IRepository.js';

// ============================================
// CATÁLOGOS GEOGRÁFICOS
// ============================================
export { IPaisRepository } from './IPaisRepository.js';
export { IDepartamentoRepository } from './IDepartamentoRepository.js';
export { IProvinciaRepository } from './IProvinciaRepository.js';
export { IMunicipioRepository } from './IMunicipioRepository.js';

// ============================================
// CATÁLOGOS DE REFERENCIA
// ============================================
export { IIdiomaRepository } from './IIdiomaRepository.js';
export { IEstadoCivilRepository } from './IEstadoCivilRepository.js';
export { ITipoDiscapacidadRepository } from './ITipoDiscapacidadRepository.js';
export { ITipoParentescoRepository } from './ITipoParentescoRepository.js';
export { IDocumentacionRepository } from './IDocumentacionRepository.js';
export { IInstitucionRepository } from './IInstitucionRepository.js';

// ============================================
// SISTEMA DE SEGURIDAD
// ============================================
export { IRolRepository } from './IRolRepository.js';
export { IPermisoRepository } from './IPermisoRepository.js';
export { IUsuarioRepository } from './IUsuarioRepository.js';
export { IRolPermisoRepository } from './IRolPermisoRepository.js';
export { IUsuarioPermisoRepository } from './IUsuarioPermisoRepository.js';
export { IAuthRepository } from './IAuthRepository.js';
export { ISesionRepository } from './ISesionRepository.js';
export { IPersonalRepository } from './IPersonalRepository.js';
export { IRectorRepository } from './IRectorRepository.js';
export { IDirectorRepository } from './IDirectorRepository.js';
export { ISecretariaRepository } from './ISecretariaRepository.js';
export { IConfiguracionSistemaRepository } from './IConfiguracionSistemaRepository.js';
export { ISeguridadAltaUsuarioLookupRepository } from './ISeguridadAltaUsuarioLookupRepository.js';
export { IUsuarioReferenciaVinculoRepository } from './IUsuarioReferenciaVinculoRepository.js';

// ============================================
// ESTRUCTURA ACADÉMICA - PARTE 1
// ============================================
export { ICarreraRepository } from './ICarreraRepository.js';
export { IGestionRepository } from './IGestionRepository.js';
export { IPeriodoRepository } from './IPeriodoRepository.js';
export { IMateriaRepository } from './IMateriaRepository.js';
export { IPlanEstudiosRepository } from './IPlanEstudiosRepository.js';
export { IPrerrequisitoRepository } from './IPrerrequisitoRepository.js';
export { IAsignaturaPlanRepository } from './IAsignaturaPlanRepository.js';
export { IOfertaCursoRepository } from './IOfertaCursoRepository.js';

// ============================================
// ESTRUCTURA ACADÉMICA - PARTE 3 (Calendario)
// ============================================
export { IActividadRepository } from './IActividadRepository.js';
export { IGestionPlanRepository } from './IGestionPlanRepository.js';
export { IPeriodoAcademicoRepository } from './IPeriodoAcademicoRepository.js';
export { IActividadCalendarioRepository } from './IActividadCalendarioRepository.js';
export { ICronogramaGestionRepository } from './ICronogramaGestionRepository.js';

// ============================================
// ESTRUCTURA ACADÉMICA - PARTE 2
// ============================================
export { IDocenteRepository } from './IDocenteRepository.js';
export { IParaleloRepository } from './IParaleloRepository.js';
export { IAulaRepository } from './IAulaRepository.js';
export { IHorarioRepository } from './IHorarioRepository.js';
export { IAsignacionHorarioRepository } from './IAsignacionHorarioRepository.js';
export { IAsignacionDocenteRepository } from './IAsignacionDocenteRepository.js';
export { IAulasHorariosSemanaRepository } from './IAulasHorariosSemanaRepository.js';
export { IHorarioGrillaRepository } from './IHorarioGrillaRepository.js';
export { IParaleloGestionFichaViewRepository } from './IParaleloGestionFichaViewRepository.js';
export { IParaleloGestionGrillaBloqueViewRepository } from './IParaleloGestionGrillaBloqueViewRepository.js';
export { IParaleloGestionAsignacionCoberturaBloquesViewRepository } from './IParaleloGestionAsignacionCoberturaBloquesViewRepository.js';
export { IParaleloGestionConflictoAulaBloqueViewRepository } from './IParaleloGestionConflictoAulaBloqueViewRepository.js';
export { IParaleloGestionConflictoDocenteBloqueViewRepository } from './IParaleloGestionConflictoDocenteBloqueViewRepository.js';
export { IParaleloGestionConflictoParaleloBloqueViewRepository } from './IParaleloGestionConflictoParaleloBloqueViewRepository.js';

// ============================================
// ESTUDIANTES
// ============================================
export { IEstudianteRepository } from './IEstudianteRepository.js';
export { IEstudianteDatosAcademicosRepository } from './IEstudianteDatosAcademicosRepository.js';
export { IDocumentoEstudianteRepository } from './IDocumentoEstudianteRepository.js';
export { IEstudianteDocumentoEntregaRepository } from './IEstudianteDocumentoEntregaRepository.js';
export { IEstudianteDiscapacidadRepository } from './IEstudianteDiscapacidadRepository.js';
export { IEstudianteOrigenRepository } from './IEstudianteOrigenRepository.js';
export { IBecaDescuentoRepository } from './IBecaDescuentoRepository.js';
export { IEstudianteBecaRepository } from './IEstudianteBecaRepository.js';
export { ILicenciaRepository } from './ILicenciaRepository.js';
export { IEstudianteApoderadoRepository } from './IEstudianteApoderadoRepository.js';

// ============================================
// TRANSITABILIDAD Y TRASPASOS
// ============================================
export { ITransitabilidadRepository } from './ITransitabilidadRepository.js';
export { ITraspasoRepository } from './ITraspasoRepository.js';

// ============================================
// INSCRIPCIONES
// ============================================
export { IInscripcionRepository } from './IInscripcionRepository.js';
export { IMatriculaMateriaRepository } from './IMatriculaMateriaRepository.js';
export { IHistorialMatriculaRepository } from './IHistorialMatriculaRepository.js';
export { IHistorialPrevioRepository } from './IHistorialPrevioRepository.js';

// ============================================
// EVALUACIONES
// ============================================
export { ITipoEvaluacionRepository } from './ITipoEvaluacionRepository.js';
export { IConfiguracionEvaluacionRepository } from './IConfiguracionEvaluacionRepository.js';
export { ICalificacionContextoRepository } from './ICalificacionContextoRepository.js';
export { ICalificacionCoordinacionRepository } from './ICalificacionCoordinacionRepository.js';
export { ICuadernoRepository } from './ICuadernoRepository.js';
export { IGestionBimestresRepository } from './IGestionBimestresRepository.js';
export { IBimestreMatriculaRepository } from './IBimestreMatriculaRepository.js';
export { IEvaluacionRepository } from './IEvaluacionRepository.js';
export { IEvaluacionNotaRepository } from './IEvaluacionNotaRepository.js';

// ============================================
// NIVELACIONES
// ============================================
export { INivelacionRepository } from './INivelacionRepository.js';

// ============================================
// ASISTENCIAS Y LICENCIAS
// ============================================
export { IAsistenciaRepository } from './IAsistenciaRepository.js';
export { IClaseNoDictadaRepository } from './IClaseNoDictadaRepository.js';

// ============================================
// PAGOS ACADÉMICOS
// ============================================
export { IConfiguracionAporteRepository } from './IConfiguracionAporteRepository.js';
export { IMetodoPagoRepository } from './IMetodoPagoRepository.js';
export { IBancoAutorizadoRepository } from './IBancoAutorizadoRepository.js';
export { ICuentaPagoRepository } from './ICuentaPagoRepository.js';
export { IPagoAporteRepository } from './IPagoAporteRepository.js';
export { IPagoCuotasRepository } from './IPagoCuotasRepository.js';
export { IPaymentAporteCareerExcelReportRepository } from './IPaymentAporteCareerExcelReportRepository.js';

// ============================================
// REPORTES EXCEL (ESTUDIANTES)
// ============================================
export { IStudentEnrollmentExcelReportRepository } from './IStudentEnrollmentExcelReportRepository.js';
export { IStudentEnrollmentStudentListExcelReportRepository } from './IStudentEnrollmentStudentListExcelReportRepository.js';

// ============================================
// DASHBOARD
// ============================================
export { IDashboardRepository } from './IDashboardRepository.js';
