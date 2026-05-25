/**
 * Registrador de dependencias de todos los repositorios de infraestructura
 * Centraliza la configuración de todos los repositorios de la aplicación
 * 
 * Responsabilidades:
 * - Registrar todos los repositorios como singletons
 * - Organizar repositorios por categoría funcional
 * - Proveer punto único de configuración para la capa de persistencia
 * - Validar que no se registren duplicados
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

import { REPOSITORIOS_TOKENS } from '../tokens/index.js';
import { registerRepository } from '../utils/container.helpers.js';

// ============================================
// CATÁLOGOS GEOGRÁFICOS
// ============================================
import { CountryRepository } from '../../repositories/CountryRepository.js';
import { DepartmentRepository } from '../../repositories/DepartmentRepository.js';
import { ProvinceRepository } from '../../repositories/ProvinceRepository.js';
import { MunicipalityRepository } from '../../repositories/MunicipalityRepository.js';

// ============================================
// CATÁLOGOS DE REFERENCIA
// ============================================
import { LanguageRepository } from '../../repositories/LanguageRepository.js';
import { CivilStatusRepository } from '../../repositories/CivilStatusRepository.js';
import { DisabilityTypeRepository } from '../../repositories/DisabilityTypeRepository.js';
import { RelationshipTypeRepository } from '../../repositories/RelationshipTypeRepository.js';
import { DocumentacionRepository } from '../../repositories/DocumentacionRepository.js';
import { InstitutionRepository } from '../../repositories/InstitutionRepository.js';

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================
import { ConfiguracionSistemaRepository } from '../../repositories/ConfiguracionSistemaRepository.js';

// ============================================
// SISTEMA DE SEGURIDAD
// ============================================
import { RoleRepository } from '../../repositories/RoleRepository.js';
import { PermissionRepository } from '../../repositories/PermissionRepository.js';
import { UserRepository } from '../../repositories/UserRepository.js';
import { SeguridadAltaUsuarioLookupRepository } from '../../repositories/SeguridadAltaUsuarioLookupRepository.js';
import { UsuarioReferenciaVinculoRepository } from '../../repositories/UsuarioReferenciaVinculoRepository.js';
import { RolePermissionRepository } from '../../repositories/RolePermissionRepository.js';
import { UserPermissionRepository } from '../../repositories/UserPermissionRepository.js';
import { SessionRepository } from '../../repositories/SessionRepository.js';
import { AuthRepository } from '../../repositories/AuthRepository.js';
import { StaffRepository } from '../../repositories/StaffRepository.js';
import { RectorRepository } from '../../repositories/RectorRepository.js';
import { DirectorRepository } from '../../repositories/DirectorRepository.js';
import { SecretaryRepository } from '../../repositories/SecretaryRepository.js';

// ============================================
// ESTRUCTURA ACADÉMICA - PARTE 1
// ============================================
import { CareerRepository } from '../../repositories/CareerRepository.js';
import { ManagementRepository } from '../../repositories/ManagementRepository.js';
import { PeriodRepository } from '../../repositories/PeriodRepository.js';
import { SubjectRepository } from '../../repositories/SubjectRepository.js';
import { StudyPlanRepository } from '../../repositories/StudyPlanRepository.js';
import { PrerequisiteRepository } from '../../repositories/PrerequisiteRepository.js';
import { PlanSubjectRepository } from '../../repositories/PlanSubjectRepository.js';

// ============================================
// ESTRUCTURA ACADÉMICA - PARTE 3 (Calendario)
// ============================================
import { ActivityRepository } from '../../repositories/ActivityRepository.js';
import { ManagementPlanRepository } from '../../repositories/ManagementPlanRepository.js';
import { AcademicPeriodRepository } from '../../repositories/AcademicPeriodRepository.js';
import { CalendarActivityRepository } from '../../repositories/CalendarActivityRepository.js';

// ============================================
// ESTRUCTURA ACADÉMICA - PARTE 2
// ============================================
import { TeacherRepository } from '../../repositories/TeacherRepository.js';
import { ParallelRepository } from '../../repositories/ParallelRepository.js';
import { ClassroomRepository } from '../../repositories/ClassroomRepository.js';
import { ScheduleRepository } from '../../repositories/ScheduleRepository.js';
import { CourseRepository } from '../../repositories/CourseRepository.js';
import { CourseScheduleRepository } from '../../repositories/CourseScheduleRepository.js';
import { TeacherAssignmentRepository } from '../../repositories/TeacherAssignmentRepository.js';

// ============================================
// ESTUDIANTES
// ============================================
import { StudentRepository } from '../../repositories/StudentRepository.js';
import { StudentAcademicDataRepository } from '../../repositories/StudentAcademicDataRepository.js';
import { StudentDocumentRepository } from '../../repositories/StudentDocumentRepository.js';
import { StudentDocumentDeliveryRepository } from '../../repositories/StudentDocumentDeliveryRepository.js';
import { StudentDisabilityRepository } from '../../repositories/StudentDisabilityRepository.js';
import { StudentOriginRepository } from '../../repositories/StudentOriginRepository.js';
import { ScholarshipRepository } from '../../repositories/ScholarshipRepository.js';
import { StudentScholarshipRepository } from '../../repositories/StudentScholarshipRepository.js';
import { LicenseRepository } from '../../repositories/LicenseRepository.js';
import { StudentGuardianRepository } from '../../repositories/StudentGuardianRepository.js';
import { StudentEnrollmentExcelReportRepository } from '../../repositories/StudentEnrollmentExcelReportRepository.js';
import { StudentEnrollmentStudentListExcelReportRepository } from '../../repositories/StudentEnrollmentStudentListExcelReportRepository.js';
import { TransitabilityRepository } from '../../repositories/TransitabilityRepository.js';
import { TransferRepository } from '../../repositories/TransferRepository.js';

// ============================================
// INSCRIPCIONES
// ============================================
import { EnrollmentRepository } from '../../repositories/EnrollmentRepository.js';
import { SubjectEnrollmentRepository } from '../../repositories/SubjectEnrollmentRepository.js';
import { SubjectEnrollmentHistoryRepository } from '../../repositories/SubjectEnrollmentHistoryRepository.js';
import { PriorEnrollmentHistoryRepository } from '../../repositories/PriorEnrollmentHistoryRepository.js';
import { EvaluationTypeRepository } from '../../repositories/EvaluationTypeRepository.js';
import { EvaluationConfigurationRepository } from '../../repositories/EvaluationConfigurationRepository.js';
import { SubjectEnrollmentBimesterRepository } from '../../repositories/SubjectEnrollmentBimesterRepository.js';
import { BimesterEvaluationRepository } from '../../repositories/BimesterEvaluationRepository.js';
import { BimesterEvaluationGradeRepository } from '../../repositories/BimesterEvaluationGradeRepository.js';
import { CalificacionRepository } from '../../repositories/CalificacionRepository.js';
import { CuadernoRepository } from '../../repositories/CuadernoRepository.js';
import { CalificacionContextoRepository } from '../../repositories/CalificacionContextoRepository.js';
import { CalificacionCoordinacionRepository } from '../../repositories/CalificacionCoordinacionRepository.js';
import { GestionBimestresRepository } from '../../repositories/GestionBimestresRepository.js';
import { LevelingRepository } from '../../repositories/LevelingRepository.js';
import { AttendanceRepository } from '../../repositories/AttendanceRepository.js';
import { MissedClassRepository } from '../../repositories/MissedClassRepository.js';

// ============================================
// PAGOS ACADÉMICOS
// ============================================
import { ContributionConfigurationRepository } from '../../repositories/ContributionConfigurationRepository.js';
import { PaymentMethodRepository } from '../../repositories/PaymentMethodRepository.js';
import { AuthorizedBankRepository } from '../../repositories/AuthorizedBankRepository.js';
import { PaymentAccountRepository } from '../../repositories/PaymentAccountRepository.js';
import { ContributionPaymentRepository } from '../../repositories/ContributionPaymentRepository.js';
import { ContributionPaymentInstallmentRepository } from '../../repositories/ContributionPaymentInstallmentRepository.js';
import { PaymentAporteCareerExcelReportRepository } from '../../repositories/PaymentAporteCareerExcelReportRepository.js';
import { DashboardRepository } from '../../repositories/DashboardRepository.js';
import { AulasHorariosSemanaRepository } from '../../repositories/AulasHorariosSemanaRepository.js';

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
    registerRepository(container, REPOSITORIOS_TOKENS.countryRepository, CountryRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.departmentRepository, DepartmentRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.provinceRepository, ProvinceRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.municipalityRepository, MunicipalityRepository);

    // ============================================
    // CATÁLOGOS DE REFERENCIA
    // ============================================
    registerRepository(container, REPOSITORIOS_TOKENS.languageRepository, LanguageRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.civilStatusRepository, CivilStatusRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.disabilityTypeRepository, DisabilityTypeRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.relationshipTypeRepository, RelationshipTypeRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.documentationRepository, DocumentacionRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.institutionRepository, InstitutionRepository);

    // ============================================
    // CONFIGURACIÓN DEL SISTEMA
    // ============================================
    registerRepository(container, REPOSITORIOS_TOKENS.systemConfigurationRepository, ConfiguracionSistemaRepository);

    // ============================================
    // SISTEMA DE SEGURIDAD
    // ============================================
    registerRepository(container, REPOSITORIOS_TOKENS.roleRepository, RoleRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.permissionRepository, PermissionRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.userRepository, UserRepository);
    registerRepository(
        container,
        REPOSITORIOS_TOKENS.securityUserRegistrationLookupRepository,
        SeguridadAltaUsuarioLookupRepository
    );
    registerRepository(
        container,
        REPOSITORIOS_TOKENS.userReferenceLinkRepository,
        UsuarioReferenciaVinculoRepository
    );
    registerRepository(container, REPOSITORIOS_TOKENS.rolePermissionRepository, RolePermissionRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.userPermissionRepository, UserPermissionRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.sessionRepository, SessionRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.authRepository, AuthRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.staffRepository, StaffRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.rectorRepository, RectorRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.directorRepository, DirectorRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.secretaryRepository, SecretaryRepository);

    // ============================================
    // ESTRUCTURA ACADÉMICA - PARTE 1
    // ============================================
    registerRepository(container, REPOSITORIOS_TOKENS.careerRepository, CareerRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.managementRepository, ManagementRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.periodRepository, PeriodRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.subjectRepository, SubjectRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.studyPlanRepository, StudyPlanRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.prerequisiteRepository, PrerequisiteRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.planSubjectRepository, PlanSubjectRepository);

    // ============================================
    // ESTRUCTURA ACADÉMICA - PARTE 3 (Calendario)
    // ============================================
    registerRepository(container, REPOSITORIOS_TOKENS.activityRepository, ActivityRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.managementPlanRepository, ManagementPlanRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.academicPeriodRepository, AcademicPeriodRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.calendarActivityRepository, CalendarActivityRepository);

    // ============================================
    // ESTRUCTURA ACADÉMICA - PARTE 2
    // ============================================
    registerRepository(container, REPOSITORIOS_TOKENS.teacherRepository, TeacherRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.parallelRepository, ParallelRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.classroomRepository, ClassroomRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.scheduleRepository, ScheduleRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.courseRepository, CourseRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.courseScheduleRepository, CourseScheduleRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.teacherAssignmentRepository, TeacherAssignmentRepository);

    // ============================================
    // ESTUDIANTES
    // ============================================
    registerRepository(container, REPOSITORIOS_TOKENS.studentRepository, StudentRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.studentAcademicDataRepository, StudentAcademicDataRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.studentDocumentRepository, StudentDocumentRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.studentDocumentDeliveryRepository, StudentDocumentDeliveryRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.studentDisabilityRepository, StudentDisabilityRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.studentOriginRepository, StudentOriginRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.scholarshipRepository, ScholarshipRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.studentScholarshipRepository, StudentScholarshipRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.licenseRepository, LicenseRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.studentGuardianRepository, StudentGuardianRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.studentEnrollmentExcelReportRepository, StudentEnrollmentExcelReportRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.studentEnrollmentStudentListExcelReportRepository, StudentEnrollmentStudentListExcelReportRepository);

    // ============================================
    // TRANSITABILIDAD Y TRASPASOS
    // ============================================
    registerRepository(container, REPOSITORIOS_TOKENS.transitabilityRepository, TransitabilityRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.transferRepository, TransferRepository);

    // ============================================
    // INSCRIPCIONES
    // ============================================
    registerRepository(container, REPOSITORIOS_TOKENS.enrollmentRepository, EnrollmentRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.subjectEnrollmentRepository, SubjectEnrollmentRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.subjectEnrollmentHistoryRepository, SubjectEnrollmentHistoryRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.priorEnrollmentHistoryRepository, PriorEnrollmentHistoryRepository);

    // ============================================
    // EVALUACIONES
    // ============================================
    registerRepository(container, REPOSITORIOS_TOKENS.evaluationTypeRepository, EvaluationTypeRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.evaluationConfigurationRepository, EvaluationConfigurationRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.subjectEnrollmentBimesterRepository, SubjectEnrollmentBimesterRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.bimesterEvaluationRepository, BimesterEvaluationRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.bimesterEvaluationGradeRepository, BimesterEvaluationGradeRepository);
    registerRepository(
      container,
      REPOSITORIOS_TOKENS.calificacionContextoRepository,
      CalificacionContextoRepository,
    );
    registerRepository(
      container,
      REPOSITORIOS_TOKENS.calificacionCoordinacionRepository,
      CalificacionCoordinacionRepository,
    );
    registerRepository(container, REPOSITORIOS_TOKENS.gestionBimestresRepository, GestionBimestresRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.calificacionRepository, CalificacionRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.cuadernoRepository, CuadernoRepository);

    // ============================================
    // NIVELACIONES
    // ============================================
    registerRepository(container, REPOSITORIOS_TOKENS.levelingRepository, LevelingRepository);

    // ============================================
    // ASISTENCIAS
    // ============================================
    registerRepository(container, REPOSITORIOS_TOKENS.attendanceRepository, AttendanceRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.missedClassRepository, MissedClassRepository);

    // ============================================
    // PAGOS ACADÉMICOS
    // ============================================
    registerRepository(container, REPOSITORIOS_TOKENS.contributionConfigurationRepository, ContributionConfigurationRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.paymentMethodRepository, PaymentMethodRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.authorizedBankRepository, AuthorizedBankRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.paymentAccountRepository, PaymentAccountRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.contributionPaymentRepository, ContributionPaymentRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.contributionPaymentInstallmentRepository, ContributionPaymentInstallmentRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.contributionPaymentByCareerExcelReportRepository, PaymentAporteCareerExcelReportRepository);

    // ============================================
    // DASHBOARD
    // ============================================
    registerRepository(container, REPOSITORIOS_TOKENS.dashboardRepository, DashboardRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.weeklyClassroomScheduleRepository, AulasHorariosSemanaRepository);

    return container;
}


