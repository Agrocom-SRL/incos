/**
 * Registrador de dependencias de todos los repositorios de infraestructura
 * Centraliza la configuración de todos los repositorios de la aplicación
 * 
 * Responsabilidades:
 * - Registrar todos los repositorios como singletons
 * - Organizar repositorios por categoría funcional
 * - Proveer punto único de configuración para la capa de persistencia
 * 
 * Todos los repositorios se registran como singletons porque:
 * - No mantienen estado mutable entre requests
 * - Son thread-safe (Node.js es single-threaded)
 * - Comparten la misma instancia de conexión a BD (Sequelize pool)
 * - Mejora el rendimiento (una sola instancia por tipo)
 * 
 * @param {Container} container - Contenedor de inyección de dependencias
 * @returns {Container} El mismo contenedor (para encadenamiento)
 */

// ============================================
// CATÁLOGOS GEOGRÁFICOS
// ============================================
import { CountryRepository } from '../../../infrastructure/repositories/CountryRepository.js';
import { DepartmentRepository } from '../../../infrastructure/repositories/DepartmentRepository.js';
import { ProvinceRepository } from '../../../infrastructure/repositories/ProvinceRepository.js';
import { MunicipalityRepository } from '../../../infrastructure/repositories/MunicipalityRepository.js';

// ============================================
// CATÁLOGOS DE REFERENCIA
// ============================================
import { LanguageRepository } from '../../../infrastructure/repositories/LanguageRepository.js';
import { CivilStatusRepository } from '../../../infrastructure/repositories/CivilStatusRepository.js';
import { DisabilityTypeRepository } from '../../../infrastructure/repositories/DisabilityTypeRepository.js';
import { RelationshipTypeRepository } from '../../../infrastructure/repositories/RelationshipTypeRepository.js';
import { DocumentacionRepository } from '../../../infrastructure/repositories/DocumentacionRepository.js';

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================
import { ConfiguracionSistemaRepository } from '../../../infrastructure/repositories/ConfiguracionSistemaRepository.js';

// ============================================
// SISTEMA DE SEGURIDAD
// ============================================
import { RoleRepository } from '../../../infrastructure/repositories/RoleRepository.js';
import { PermissionRepository } from '../../../infrastructure/repositories/PermissionRepository.js';
import { UserRepository } from '../../../infrastructure/repositories/UserRepository.js';
import { RolePermissionRepository } from '../../../infrastructure/repositories/RolePermissionRepository.js';
import { SessionRepository } from '../../../infrastructure/repositories/SessionRepository.js';
import { StaffRepository } from '../../../infrastructure/repositories/StaffRepository.js';

// ============================================
// ESTRUCTURA ACADÉMICA - PARTE 1
// ============================================
import { CareerRepository } from '../../../infrastructure/repositories/CareerRepository.js';
import { ManagementRepository } from '../../../infrastructure/repositories/ManagementRepository.js';
import { ManagementStageRepository } from '../../../infrastructure/repositories/ManagementStageRepository.js';
import { PeriodRepository } from '../../../infrastructure/repositories/PeriodRepository.js';
import { SubjectRepository } from '../../../infrastructure/repositories/SubjectRepository.js';
import { StudyPlanRepository } from '../../../infrastructure/repositories/StudyPlanRepository.js';
import { PrerequisiteRepository } from '../../../infrastructure/repositories/PrerequisiteRepository.js';

// ============================================
// ESTRUCTURA ACADÉMICA - PARTE 2
// ============================================
import { CourseRepository } from '../../../infrastructure/repositories/CourseRepository.js';
import { TeacherRepository } from '../../../infrastructure/repositories/TeacherRepository.js';
import { TeacherAssignmentRepository } from '../../../infrastructure/repositories/TeacherAssignmentRepository.js';
import { ShiftRepository } from '../../../infrastructure/repositories/ShiftRepository.js';
import { CourseShiftRepository } from '../../../infrastructure/repositories/CourseShiftRepository.js';

// ============================================
// ESTUDIANTES
// ============================================
import { StudentRepository } from '../../../infrastructure/repositories/StudentRepository.js';
import { StudentAcademicDataRepository } from '../../../infrastructure/repositories/StudentAcademicDataRepository.js';
import { StudentDocumentRepository } from '../../../infrastructure/repositories/StudentDocumentRepository.js';
import { StudentDocumentDeliveryRepository } from '../../../infrastructure/repositories/StudentDocumentDeliveryRepository.js';
import { StudentDisabilityRepository } from '../../../infrastructure/repositories/StudentDisabilityRepository.js';
import { StudentOriginRepository } from '../../../infrastructure/repositories/StudentOriginRepository.js';
import { ScholarshipRepository } from '../../../infrastructure/repositories/ScholarshipRepository.js';
import { StudentScholarshipRepository } from '../../../infrastructure/repositories/StudentScholarshipRepository.js';
import { LicenseRequestRepository } from '../../../infrastructure/repositories/LicenseRequestRepository.js';
import { StudentGuardianRepository } from '../../../infrastructure/repositories/StudentGuardianRepository.js';

/**
 * Registra todas las dependencias de repositorios
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con repositorios registrados
 */
export function registerRepositoriesModule(container) {
    // ============================================
    // CATÁLOGOS GEOGRÁFICOS
    // ============================================
    container.register('countryRepository', () => new CountryRepository(), { singleton: true });
    container.register('departmentRepository', () => new DepartmentRepository(), { singleton: true });
    container.register('provinceRepository', () => new ProvinceRepository(), { singleton: true });
    container.register('municipalityRepository', () => new MunicipalityRepository(), { singleton: true });

    // ============================================
    // CATÁLOGOS DE REFERENCIA
    // ============================================
    container.register('languageRepository', () => new LanguageRepository(), { singleton: true });
    container.register('civilStatusRepository', () => new CivilStatusRepository(), { singleton: true });
    container.register('disabilityTypeRepository', () => new DisabilityTypeRepository(), { singleton: true });
    container.register('relationshipTypeRepository', () => new RelationshipTypeRepository(), { singleton: true });
    container.register('documentacionRepository', () => new DocumentacionRepository(), { singleton: true });

    // ============================================
    // CONFIGURACIÓN DEL SISTEMA
    // ============================================
    container.register('configuracionSistemaRepository', () => new ConfiguracionSistemaRepository(), { singleton: true });

    // ============================================
    // SISTEMA DE SEGURIDAD
    // ============================================
    container.register('roleRepository', () => new RoleRepository(), { singleton: true });
    container.register('permissionRepository', () => new PermissionRepository(), { singleton: true });
    container.register('userRepository', () => new UserRepository(), { singleton: true });
    container.register('rolePermissionRepository', () => new RolePermissionRepository(), { singleton: true });
    container.register('sessionRepository', () => new SessionRepository(), { singleton: true });
    container.register('staffRepository', () => new StaffRepository(), { singleton: true });

    // ============================================
    // ESTRUCTURA ACADÉMICA - PARTE 1
    // ============================================
    container.register('careerRepository', () => new CareerRepository(), { singleton: true });
    container.register('managementRepository', () => new ManagementRepository(), { singleton: true });
    container.register('managementStageRepository', () => new ManagementStageRepository(), { singleton: true });
    container.register('periodRepository', () => new PeriodRepository(), { singleton: true });
    container.register('subjectRepository', () => new SubjectRepository(), { singleton: true });
    container.register('studyPlanRepository', () => new StudyPlanRepository(), { singleton: true });
    container.register('prerequisiteRepository', () => new PrerequisiteRepository(), { singleton: true });

    // ============================================
    // ESTRUCTURA ACADÉMICA - PARTE 2
    // ============================================
    container.register('courseRepository', () => new CourseRepository(), { singleton: true });
    container.register('teacherRepository', () => new TeacherRepository(), { singleton: true });
    container.register('teacherAssignmentRepository', () => new TeacherAssignmentRepository(), { singleton: true });
    container.register('shiftRepository', () => new ShiftRepository(), { singleton: true });
    container.register('courseShiftRepository', () => new CourseShiftRepository(), { singleton: true });

    // ============================================
    // ESTUDIANTES
    // ============================================
    container.register('studentRepository', () => new StudentRepository(), { singleton: true });
    container.register('studentAcademicDataRepository', () => new StudentAcademicDataRepository(), { singleton: true });
    container.register('studentDocumentRepository', () => new StudentDocumentRepository(), { singleton: true });
    container.register('studentDocumentDeliveryRepository', () => new StudentDocumentDeliveryRepository(), { singleton: true });
    container.register('studentDisabilityRepository', () => new StudentDisabilityRepository(), { singleton: true });
    container.register('studentOriginRepository', () => new StudentOriginRepository(), { singleton: true });
    container.register('scholarshipRepository', () => new ScholarshipRepository(), { singleton: true });
    container.register('studentScholarshipRepository', () => new StudentScholarshipRepository(), { singleton: true });
    container.register('licenseRequestRepository', () => new LicenseRequestRepository(), { singleton: true });
    container.register('studentGuardianRepository', () => new StudentGuardianRepository(), { singleton: true });

    return container;
}