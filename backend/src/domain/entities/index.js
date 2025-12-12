/**
 * Exportación centralizada de todas las entidades de dominio
 * Organizadas por categorías para facilitar su uso
 */

// ============================================
// ENTIDAD BASE
// ============================================
export { BaseEntity } from './BaseEntity.js';

// ============================================
// CATÁLOGOS GEOGRÁFICOS
// ============================================
export { Country } from './Country.js';
export { Department } from './Department.js';
export { Province } from './Province.js';
export { Municipality } from './Municipality.js';

// ============================================
// CATÁLOGOS DE REFERENCIA
// ============================================
export { Language } from './Language.js';
export { CivilStatus } from './CivilStatus.js';
export { DisabilityType } from './DisabilityType.js';
export { RelationshipType } from './RelationshipType.js';

// ============================================
// SISTEMA DE SEGURIDAD
// ============================================
export { Role } from './Role.js';
export { Permission } from './Permission.js';
export { User } from './User.js';
export { RolePermission } from './RolePermission.js';
export { Session } from './Session.js';
export { Staff } from './Staff.js';
export { Rector } from './Rector.js';
export { Director } from './Director.js';
export { Secretary } from './Secretary.js';

// ============================================
// ESTRUCTURA ACADÉMICA - PARTE 1
// ============================================
export { Career } from './Career.js';
export { Management } from './Management.js';
export { ManagementStage } from './ManagementStage.js';
export { Period } from './Period.js';
export { Subject } from './Subject.js';
export { StudyPlan } from './StudyPlan.js';
export { Prerequisite } from './Prerequisite.js';

// ============================================
// ESTRUCTURA ACADÉMICA - PARTE 2
// ============================================
export { Course } from './Course.js';
export { Teacher } from './Teacher.js';
export { TeacherAssignment } from './TeacherAssignment.js';
export { Shift } from './Shift.js';
export { CourseShift } from './CourseShift.js';

// ============================================
// ESTUDIANTES
// ============================================
export { Student } from './Student.js';
export { StudentAcademicData } from './StudentAcademicData.js';
export { StudentDocument } from './StudentDocument.js';
export { Scholarship } from './Scholarship.js';
export { StudentScholarship } from './StudentScholarship.js';
export { LicenseRequest } from './LicenseRequest.js';
export { StudentGuardian } from './StudentGuardian.js';
