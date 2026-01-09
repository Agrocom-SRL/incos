/**
 * Exportación centralizada de todos los mappers
 * Organizados por módulos para facilitar su uso
 */

// ============================================
// MAPPER BASE
// ============================================
export { BaseMapper } from './BaseMapper.js';

// ============================================
// CATÁLOGOS GEOGRÁFICOS
// ============================================
export { CountryMapper } from './CountryMapper.js';
export { DepartmentMapper } from './DepartmentMapper.js';
export { ProvinceMapper } from './ProvinceMapper.js';
export { MunicipalityMapper } from './MunicipalityMapper.js';

// ============================================
// CATÁLOGOS DE REFERENCIA
// ============================================
export { LanguageMapper } from './LanguageMapper.js';
export { CivilStatusMapper } from './CivilStatusMapper.js';
export { DisabilityTypeMapper } from './DisabilityTypeMapper.js';
export { RelationshipTypeMapper } from './RelationshipTypeMapper.js';
export { DocumentacionMapper } from './DocumentacionMapper.js';

// ============================================
// SISTEMA DE SEGURIDAD
// ============================================
export { UserMapper } from './UserMapper.js';
export { RoleMapper } from './RoleMapper.js';
export { PermissionMapper } from './PermissionMapper.js';
export { RolePermissionMapper } from './RolePermissionMapper.js';
export { TeacherMapper } from './TeacherMapper.js';
export { StaffMapper } from './StaffMapper.js';
// TODO: Agregar otros mappers cuando se refactorizen sus repositorios
// export { RectorMapper } from './RectorMapper.js';
// export { DirectorMapper } from './DirectorMapper.js';
// export { SecretaryMapper } from './SecretaryMapper.js';

// ============================================
// ESTRUCTURA ACADÉMICA
// ============================================
export { CareerMapper } from './CareerMapper.js';
export { SubjectMapper } from './SubjectMapper.js';
export { PeriodMapper } from './PeriodMapper.js';
export { ManagementMapper } from './ManagementMapper.js';
export { ActivityMapper } from './ActivityMapper.js';
export { AcademicPeriodMapper } from './AcademicPeriodMapper.js';
export { CalendarActivityMapper } from './CalendarActivityMapper.js';
export { ShiftMapper } from './ShiftMapper.js';
export { ScholarshipMapper } from './ScholarshipMapper.js';
export { StudyPlanMapper } from './StudyPlanMapper.js';
export { PlanSubjectMapper } from './PlanSubjectMapper.js';
export { PrerequisiteMapper } from './PrerequisiteMapper.js';
export { CourseMapper } from './CourseMapper.js';
export { CourseShiftMapper } from './CourseShiftMapper.js';
export { TeacherAssignmentMapper } from './TeacherAssignmentMapper.js';
// TODO: Agregar otros mappers académicos cuando se refactorizen sus repositorios

// ============================================
// ESTUDIANTES
// ============================================
export { StudentMapper } from './StudentMapper.js';
export { StudentAcademicDataMapper } from './StudentAcademicDataMapper.js';
export { StudentDocumentMapper } from './StudentDocumentMapper.js';
export { StudentDocumentDeliveryMapper } from './StudentDocumentDeliveryMapper.js';
export { StudentGuardianMapper } from './StudentGuardianMapper.js';
export { StudentScholarshipMapper } from './StudentScholarshipMapper.js';
export { StudentDisabilityMapper } from './StudentDisabilityMapper.js';
export { StudentOriginMapper } from './StudentOriginMapper.js';

// ============================================
// LICENCIAS
// ============================================
export { LicenseRequestMapper } from './LicenseRequestMapper.js';

// ============================================
// SESIONES
// ============================================
export { SessionMapper } from './SessionMapper.js';

// ============================================
// CONFIGURACIÓN
// ============================================
export { SystemConfigurationMapper } from './SystemConfigurationMapper.js';

