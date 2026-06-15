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

// ============================================
// ESTRUCTURA ACADÉMICA
// ============================================
export { CareerMapper } from './CareerMapper.js';
export { SubjectMapper } from './SubjectMapper.js';
export { PeriodMapper } from './PeriodMapper.js';
export { ManagementMapper } from './ManagementMapper.js';
export { ManagementPlanMapper } from './ManagementPlanMapper.js';
export { ActivityMapper } from './ActivityMapper.js';
export { AcademicPeriodMapper } from './AcademicPeriodMapper.js';
export { CalendarActivityMapper } from './CalendarActivityMapper.js';
export { ScholarshipMapper } from './ScholarshipMapper.js';
export { StudyPlanMapper } from './StudyPlanMapper.js';
export { PlanSubjectMapper } from './PlanSubjectMapper.js';
export { PrerequisiteMapper } from './PrerequisiteMapper.js';
export { ParallelMapper } from './ParallelMapper.js';
export { ClassroomMapper } from './ClassroomMapper.js';
export { ScheduleMapper } from './ScheduleMapper.js';
export { AsignacionHorarioMapper } from './AsignacionHorarioMapper.js';
export { TeacherAssignmentMapper } from './TeacherAssignmentMapper.js';

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
// INSCRIPCIONES
// ============================================
export { EnrollmentMapper } from './EnrollmentMapper.js';
export { PriorEnrollmentHistoryMapper } from './PriorEnrollmentHistoryMapper.js';
export { SubjectEnrollmentMapper } from './SubjectEnrollmentMapper.js';
export { SubjectEnrollmentHistoryMapper } from './SubjectEnrollmentHistoryMapper.js';

// ============================================
// EVALUACIONES
// ============================================
export { EvaluationTypeMapper } from './EvaluationTypeMapper.js';
export { EvaluationConfigurationMapper } from './EvaluationConfigurationMapper.js';
export { SubjectEnrollmentBimesterMapper } from './SubjectEnrollmentBimesterMapper.js';
export { BimesterEvaluationMapper } from './BimesterEvaluationMapper.js';
export { BimesterEvaluationGradeMapper } from './BimesterEvaluationGradeMapper.js';

// ============================================
// NIVELACIONES
// ============================================
export { LevelingMapper } from './LevelingMapper.js';

// ============================================
// ASISTENCIAS Y LICENCIAS
// ============================================
export { LicenseMapper } from './LicenseMapper.js';
export { MissedClassMapper } from './MissedClassMapper.js';
export { AttendanceMapper } from './AttendanceMapper.js';

// ============================================
// SESIONES
// ============================================
export { SessionMapper } from './SessionMapper.js';

// ============================================
// PAGOS ACADÉMICOS
// ============================================
export { ContributionPaymentMapper } from './ContributionPaymentMapper.js';
export { ContributionPaymentInstallmentMapper } from './ContributionPaymentInstallmentMapper.js';

// ============================================
// CONFIGURACIÓN
// ============================================
export { SystemConfigurationMapper } from './SystemConfigurationMapper.js';
