/**
 * Exportación centralizada de todas las interfaces de repositorios
 * Organizadas por categorías
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

// ============================================
// SISTEMA DE SEGURIDAD
// ============================================
export { IRolRepository } from './IRolRepository.js';
export { IPermisoRepository } from './IPermisoRepository.js';
export { IUsuarioRepository } from './IUsuarioRepository.js';
export { IRolPermisoRepository } from './IRolPermisoRepository.js';
export { ISesionRepository } from './ISesionRepository.js';
export { IPersonalRepository } from './IPersonalRepository.js';
export { IConfiguracionSistemaRepository } from './IConfiguracionSistemaRepository.js';

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

// ============================================
// ESTRUCTURA ACADÉMICA - PARTE 3 (Calendario)
// ============================================
export { IActividadRepository } from './IActividadRepository.js';
export { IGestionRepository } from './IGestionRepository.js';
export { IManagementPlanRepository } from './IManagementPlanRepository.js';
export { IPeriodoAcademicoRepository } from './IPeriodoAcademicoRepository.js';
export { IActividadCalendarioRepository } from './IActividadCalendarioRepository.js';

// ============================================
// ESTRUCTURA ACADÉMICA - PARTE 2
// ============================================
export { IDocenteRepository } from './IDocenteRepository.js';
export { IParallelRepository } from './IParallelRepository.js';
export { IClassroomRepository } from './IClassroomRepository.js';
export { IScheduleRepository } from './IScheduleRepository.js';
export { ICursoRepository } from './ICursoRepository.js';
export { ICourseScheduleRepository } from './ICourseScheduleRepository.js';
export { IAsignacionDocenteRepository } from './IAsignacionDocenteRepository.js';

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
export { ILicenciaSolicitudRepository } from './ILicenciaSolicitudRepository.js';
export { IEstudianteApoderadoRepository } from './IEstudianteApoderadoRepository.js';
