/**
 * Exportación centralizada de interfaces de repositorios
 * 
 * Organización por módulos/funcionalidad:
 * - Base: Interfaz base común a todos
 * - Estudiantes: Repositorios del módulo de estudiantes
 * - Configuración: Repositorios del módulo de configuración
 *   - Académico: Carreras, materias
 *   - Complementario: Discapacidades
 * - Geográficos: Países, departamentos, provincias, municipios
 * - Referencia: Idiomas, estados civiles, tipos de parentesco, documentación
 * 
 * Principio YAGNI: Solo exportamos repositorios que están en uso
 */

// ============================================
// INTERFAZ BASE
// ============================================
export { IBaseRepository } from './IBaseRepository';

// ============================================
// MÓDULO: DOCENTES
// ============================================
export { IDocenteRepository } from './IDocenteRepository';

// ============================================
// MÓDULO: ESTUDIANTES
// ============================================
export { IEstudianteRepository } from './IEstudianteRepository';
export { IBecaDescuentoRepository } from './IBecaDescuentoRepository';
export { IEstudianteBecaRepository } from './IEstudianteBecaRepository';

// ============================================
// MÓDULO: CONFIGURACIÓN
// ============================================
// Académico
export { ICarreraRepository } from './ICarreraRepository';
export { IMateriaRepository } from './IMateriaRepository';
// Complementario
export { IDiscapacidadRepository } from './IDiscapacidadRepository';
// Actividades (catálogo maestro)
export { IActividadRepository } from './IActividadRepository';
// Recursos académicos (catálogos de referencia usados por Oferta académica)
export { IAulaRepository } from './IAulaRepository';
export { ITipoEvaluacionAdminRepository } from './ITipoEvaluacionAdminRepository';

// ============================================
// MÓDULO: ACADÉMICO
// ============================================
export { IParaleloRepository } from './IParaleloRepository';
export { IGestionRepository } from './IGestionRepository';

// ============================================
// MÓDULO: INSCRIPCIONES
// ============================================
export { IInscripcionRepository } from './IInscripcionRepository';

// ============================================
// MÓDULO: GEOGRÁFICOS
// ============================================
export { IPaisRepository } from './IPaisRepository';
export { IDepartamentoRepository } from './IDepartamentoRepository';
export { IProvinciaRepository } from './IProvinciaRepository';
export { IMunicipioRepository } from './IMunicipioRepository';

// ============================================
// MÓDULO: REFERENCIA
// ============================================
export { IIdiomaRepository } from './IIdiomaRepository';
export { IEstadoCivilRepository } from './IEstadoCivilRepository';
export { ITipoParentescoRepository } from './ITipoParentescoRepository';
export { IDocumentacionRepository } from './IDocumentacionRepository';

// ============================================
// MÓDULO: PAGOS
// ============================================
export { IPaymentAccountRepository } from './IPaymentAccountRepository';
export { IAuthorizedBankRepository } from './IAuthorizedBankRepository';
export { IPaymentMethodRepository } from './IPaymentMethodRepository';
export { IContributionConfigurationRepository } from './IContributionConfigurationRepository';
export { IPagoAporteRepository } from './IPagoAporteRepository';
// ============================================
// MÓDULO: CAPACITACIÓN (CAP)
// ============================================
export { ICursoCapacitacionRepository } from './ICursoCapacitacionRepository';
export { IParticipanteCapacitacionRepository } from './IParticipanteCapacitacionRepository';
export { IInscripcionCapacitacionRepository } from './IInscripcionCapacitacionRepository';

// ============================================
// MÓDULO: SEGURIDAD
// ============================================
export { IUsuarioAdminRepository } from './IUsuarioAdminRepository';
export { IRolAdminRepository } from './IRolAdminRepository';
export { IPermisoRepository } from './IPermisoRepository';