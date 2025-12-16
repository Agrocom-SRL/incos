/**
 * Registrador de dependencias de todos los repositorios de infraestructura
 * Centraliza la configuración de todos los repositorios de la aplicación
 *
 * Los repositorios se registran como singletons ya que son compartidos entre módulos
 * y no mantienen estado mutable.
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
import { ScholarshipRepository } from '../../../infrastructure/repositories/ScholarshipRepository.js';
import { StudentScholarshipRepository } from '../../../infrastructure/repositories/StudentScholarshipRepository.js';
import { LicenseRequestRepository } from '../../../infrastructure/repositories/LicenseRequestRepository.js';
import { StudentGuardianRepository } from '../../../infrastructure/repositories/StudentGuardianRepository.js';

/**
 * Registra todas las dependencias de repositorios
 * @param {Container} container - Contenedor de DI
 */
export function registerRepositoriesModule(container) {
  // ============================================
  // CATÁLOGOS GEOGRÁFICOS
  // ============================================
  if (!container.has('countryRepository')) {
    container.register('countryRepository', () => new CountryRepository(), true);
  }
  if (!container.has('departmentRepository')) {
    container.register('departmentRepository', () => new DepartmentRepository(), true);
  }
  if (!container.has('provinceRepository')) {
    container.register('provinceRepository', () => new ProvinceRepository(), true);
  }
  if (!container.has('municipalityRepository')) {
    container.register('municipalityRepository', () => new MunicipalityRepository(), true);
  }

  // ============================================
  // CATÁLOGOS DE REFERENCIA
  // ============================================
  if (!container.has('languageRepository')) {
    container.register('languageRepository', () => new LanguageRepository(), true);
  }
  if (!container.has('civilStatusRepository')) {
    container.register('civilStatusRepository', () => new CivilStatusRepository(), true);
  }
  if (!container.has('disabilityTypeRepository')) {
    container.register('disabilityTypeRepository', () => new DisabilityTypeRepository(), true);
  }
  if (!container.has('relationshipTypeRepository')) {
    container.register('relationshipTypeRepository', () => new RelationshipTypeRepository(), true);
  }
  if (!container.has('documentacionRepository')) {
    container.register('documentacionRepository', () => new DocumentacionRepository(), true);
  }

  // ============================================
  // SISTEMA DE SEGURIDAD
  // ============================================
  if (!container.has('roleRepository')) {
    container.register('roleRepository', () => new RoleRepository(), true);
  }
  if (!container.has('permissionRepository')) {
    container.register('permissionRepository', () => new PermissionRepository(), true);
  }
  if (!container.has('userRepository')) {
    container.register('userRepository', () => new UserRepository(), true);
  }
  if (!container.has('rolePermissionRepository')) {
    container.register('rolePermissionRepository', () => new RolePermissionRepository(), true);
  }
  if (!container.has('sessionRepository')) {
    container.register('sessionRepository', () => new SessionRepository(), true);
  }
  if (!container.has('staffRepository')) {
    container.register('staffRepository', () => new StaffRepository(), true);
  }

  // ============================================
  // ESTRUCTURA ACADÉMICA - PARTE 1
  // ============================================
  if (!container.has('careerRepository')) {
    container.register('careerRepository', () => new CareerRepository(), true);
  }
  if (!container.has('managementRepository')) {
    container.register('managementRepository', () => new ManagementRepository(), true);
  }
  if (!container.has('managementStageRepository')) {
    container.register('managementStageRepository', () => new ManagementStageRepository(), true);
  }
  if (!container.has('periodRepository')) {
    container.register('periodRepository', () => new PeriodRepository(), true);
  }
  if (!container.has('subjectRepository')) {
    container.register('subjectRepository', () => new SubjectRepository(), true);
  }
  if (!container.has('studyPlanRepository')) {
    container.register('studyPlanRepository', () => new StudyPlanRepository(), true);
  }
  if (!container.has('prerequisiteRepository')) {
    container.register('prerequisiteRepository', () => new PrerequisiteRepository(), true);
  }

  // ============================================
  // ESTRUCTURA ACADÉMICA - PARTE 2
  // ============================================
  if (!container.has('courseRepository')) {
    container.register('courseRepository', () => new CourseRepository(), true);
  }
  if (!container.has('teacherRepository')) {
    container.register('teacherRepository', () => new TeacherRepository(), true);
  }
  if (!container.has('teacherAssignmentRepository')) {
    container.register('teacherAssignmentRepository', () => new TeacherAssignmentRepository(), true);
  }
  if (!container.has('shiftRepository')) {
    container.register('shiftRepository', () => new ShiftRepository(), true);
  }
  if (!container.has('courseShiftRepository')) {
    container.register('courseShiftRepository', () => new CourseShiftRepository(), true);
  }

  // ============================================
  // ESTUDIANTES
  // ============================================
  if (!container.has('studentRepository')) {
    container.register('studentRepository', () => new StudentRepository(), true);
  }
  if (!container.has('studentAcademicDataRepository')) {
    container.register('studentAcademicDataRepository', () => new StudentAcademicDataRepository(), true);
  }
  if (!container.has('studentDocumentRepository')) {
    container.register('studentDocumentRepository', () => new StudentDocumentRepository(), true);
  }
  if (!container.has('scholarshipRepository')) {
    container.register('scholarshipRepository', () => new ScholarshipRepository(), true);
  }
  if (!container.has('studentScholarshipRepository')) {
    container.register('studentScholarshipRepository', () => new StudentScholarshipRepository(), true);
  }
  if (!container.has('licenseRequestRepository')) {
    container.register('licenseRequestRepository', () => new LicenseRequestRepository(), true);
  }
  if (!container.has('studentGuardianRepository')) {
    container.register('studentGuardianRepository', () => new StudentGuardianRepository(), true);
  }

  return container;
}

