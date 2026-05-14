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
export { Documentation } from './Documentation.js';

// ============================================
// SISTEMA DE SEGURIDAD
// ============================================
export { Role } from './Role.js';
export { Permission } from './Permission.js';
export { User } from './User.js';
export { RolePermission } from './RolePermission.js';
export { UserPermission } from './UserPermission.js';
export { Session } from './Session.js';
export { Staff } from './Staff.js';
export { Rector } from './Rector.js';
export { Director } from './Director.js';
export { Secretary } from './Secretary.js';

// ============================================
// ESTRUCTURA ACADÉMICA - PARTE 1
// ============================================
export { Career } from './Career.js';
export { Subject } from './Subject.js';
export { StudyPlan } from './StudyPlan.js';
export { Period } from './Period.js';
export { PlanSubject } from './PlanSubject.js';
export { Prerequisite } from './Prerequisite.js';

// ============================================
// ESTRUCTURA ACADÉMICA - PARTE 3 (Calendario)
// ============================================
export { Activity } from './Activity.js';
export { Management } from './Management.js';
export { ManagementPlan } from './ManagementPlan.js';
export { AcademicPeriod } from './AcademicPeriod.js';
export { CalendarActivity } from './CalendarActivity.js';

// ============================================
// ESTRUCTURA ACADÉMICA - PARTE 2
// ============================================
export { Teacher } from './Teacher.js';
export { Parallel } from './Parallel.js';
export { Classroom } from './Classroom.js';
export { Schedule } from './Schedule.js';
export { Course } from './Course.js';
export { CourseSchedule } from './CourseSchedule.js';
export { TeacherAssignment } from './TeacherAssignment.js';

// ============================================
// ESTUDIANTES
// ============================================
export { Student } from './Student.js';
export { StudentAcademicData } from './StudentAcademicData.js';
export { StudentDocument } from './StudentDocument.js';
export { StudentDocumentDelivery } from './StudentDocumentDelivery.js';
export { StudentDisability } from './StudentDisability.js';
export { StudentOrigin } from './StudentOrigin.js';
export { Scholarship } from './Scholarship.js';
export { StudentScholarship } from './StudentScholarship.js';
export { LicenseRequest } from './LicenseRequest.js';
export { StudentGuardian } from './StudentGuardian.js';

// ============================================
// INSCRIPCIONES
// ============================================
export { Enrollment } from './Enrollment.js';
export { SubjectEnrollment } from './SubjectEnrollment.js';
export { SubjectEnrollmentHistory } from './SubjectEnrollmentHistory.js';

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================
export { SystemConfiguration } from './SystemConfiguration.js';

// ============================================
// PAGOS ACADÉMICOS
// ============================================
export { ContributionConfiguration } from './ContributionConfiguration.js';
export { PaymentMethod } from './PaymentMethod.js';
export { AuthorizedBank } from './AuthorizedBank.js';
export { PaymentAccount } from './PaymentAccount.js';
export { ContributionPayment } from './ContributionPayment.js';
export { ContributionPaymentInstallment } from './ContributionPaymentInstallment.js';
