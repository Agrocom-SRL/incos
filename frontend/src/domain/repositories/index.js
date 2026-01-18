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

// ============================================
// MÓDULO: ACADÉMICO
// ============================================
export { IParaleloRepository } from './IParaleloRepository';

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
