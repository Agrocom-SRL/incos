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

// ============================================
// SISTEMA DE SEGURIDAD
// ============================================
export { IRolRepository } from './IRolRepository.js';
export { IPermisoRepository } from './IPermisoRepository.js';
export { IUsuarioRepository } from './IUsuarioRepository.js';
export { IRolPermisoRepository } from './IRolPermisoRepository.js';
export { ISesionRepository } from './ISesionRepository.js';
export { IPersonalRepository } from './IPersonalRepository.js';

// ============================================
// ESTRUCTURA ACADÉMICA - PARTE 1
// ============================================
export { ICarreraRepository } from './ICarreraRepository.js';
export { IGestionRepository } from './IGestionRepository.js';
export { IEtapaGestionRepository } from './IEtapaGestionRepository.js';
export { IPeriodoRepository } from './IPeriodoRepository.js';
export { IMateriaRepository } from './IMateriaRepository.js';
export { IPlanEstudiosRepository } from './IPlanEstudiosRepository.js';
export { IPrerrequisitoRepository } from './IPrerrequisitoRepository.js';

// ============================================
// ESTRUCTURA ACADÉMICA - PARTE 2
// ============================================
export { ICursoRepository } from './ICursoRepository.js';
export { IDocenteRepository } from './IDocenteRepository.js';
export { IAsignacionDocenteRepository } from './IAsignacionDocenteRepository.js';
export { ITurnoRepository } from './ITurnoRepository.js';
export { ITurnoCursoRepository } from './ITurnoCursoRepository.js';

// ============================================
// ESTUDIANTES
// ============================================
export { IStudentRepository } from './IStudentRepository.js';
export { IStudentAcademicDataRepository } from './IStudentAcademicDataRepository.js';
export { IDocumentoEstudianteRepository } from './IDocumentoEstudianteRepository.js';
export { IBecaDescuentoRepository } from './IBecaDescuentoRepository.js';
export { IStudentBecaRepository } from './IStudentBecaRepository.js';
export { ILicenciaSolicitudRepository } from './ILicenciaSolicitudRepository.js';
export { IStudentApoderadoRepository } from './IStudentApoderadoRepository.js';
