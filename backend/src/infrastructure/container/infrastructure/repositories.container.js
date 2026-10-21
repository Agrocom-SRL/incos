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
import { registerRepository, registerComponent } from '../utils/container.helpers.js';

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
import { ComplementariosUsosViewRepository } from '../../repositories/views/ComplementariosUsosViewRepository.js';
import { FinanzasUsosViewRepository } from '../../repositories/views/FinanzasUsosViewRepository.js';

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
import { SeguridadAltaUsuarioLookupRepository } from '../../repositories/views/SeguridadAltaUsuarioLookupRepository.js';
import { UsuarioReferenciaVinculoRepository } from '../../repositories/views/UsuarioReferenciaVinculoRepository.js';
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
import { ParallelManagementRepository } from '../../repositories/ParallelManagementRepository.js';
import { CourseOfferRepository } from '../../repositories/CourseOfferRepository.js';
import { AcademicPeriodRepository } from '../../repositories/AcademicPeriodRepository.js';
import { CalendarActivityRepository } from '../../repositories/CalendarActivityRepository.js';

// ============================================
// ESTRUCTURA ACADÉMICA - PARTE 2
// ============================================
import { TeacherRepository } from '../../repositories/TeacherRepository.js';
import { ParallelRepository } from '../../repositories/ParallelRepository.js';
import { ClassroomRepository } from '../../repositories/ClassroomRepository.js';
import { ScheduleRepository } from '../../repositories/ScheduleRepository.js';
import { AsignacionHorarioRepository } from '../../repositories/AsignacionHorarioRepository.js';
import { HorarioGrillaRepository } from '../../repositories/views/HorarioGrillaRepository.js';
import { ParaleloGestionGrillaBloqueViewRepository } from '../../repositories/views/ParaleloGestionGrillaBloqueViewRepository.js';
import { ParaleloGestionFichaViewRepository } from '../../repositories/views/ParaleloGestionFichaViewRepository.js';
import { ParaleloGestionAsignacionCoberturaBloquesViewRepository } from '../../repositories/views/ParaleloGestionAsignacionCoberturaBloquesViewRepository.js';
import { ParaleloGestionConflictoParaleloBloqueViewRepository } from '../../repositories/views/ParaleloGestionConflictoParaleloBloqueViewRepository.js';
import { ParaleloGestionConflictoAulaBloqueViewRepository } from '../../repositories/views/ParaleloGestionConflictoAulaBloqueViewRepository.js';
import { ParaleloGestionConflictoDocenteBloqueViewRepository } from '../../repositories/views/ParaleloGestionConflictoDocenteBloqueViewRepository.js';
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
import { StudentEnrollmentExcelReportRepository } from '../../repositories/views/StudentEnrollmentExcelReportRepository.js';
import { StudentEnrollmentStudentListExcelReportRepository } from '../../repositories/views/StudentEnrollmentStudentListExcelReportRepository.js';
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
import { CuadernoRepository } from '../../repositories/CuadernoRepository.js';
import { CalificacionContextoRepository } from '../../repositories/views/CalificacionContextoRepository.js';
import { CalificacionCoordinacionRepository } from '../../repositories/views/CalificacionCoordinacionRepository.js';
import { CalificacionCentralizadorRepository } from '../../repositories/views/CalificacionCentralizadorRepository.js';
import { HistorialAcademicoRepository } from '../../repositories/views/HistorialAcademicoRepository.js';
import { GestionBimestresRepository } from '../../repositories/GestionBimestresRepository.js';
import { CronogramaGestionRepository } from '../../repositories/views/CronogramaGestionRepository.js';
import { LevelingRepository } from '../../repositories/LevelingRepository.js';
import { NivelacionParaleloViewRepository } from '../../repositories/views/NivelacionParaleloViewRepository.js';
import { AttendanceRepository } from '../../repositories/AttendanceRepository.js';
import { MissedClassRepository } from '../../repositories/MissedClassRepository.js';
import { SesionClaseRepository } from '../../repositories/SesionClaseRepository.js';
import { AsistenciaSesionViewRepository } from '../../repositories/views/AsistenciaSesionViewRepository.js';
import { AsistenciaPlanillaViewRepository } from '../../repositories/views/AsistenciaPlanillaViewRepository.js';
import { AsistenciaRegistroEstadoViewRepository } from '../../repositories/views/AsistenciaRegistroEstadoViewRepository.js';
import { AsistenciaConsolidadoViewRepository } from '../../repositories/views/AsistenciaConsolidadoViewRepository.js';
import { AvanceAcademicoViewRepository } from '../../repositories/views/AvanceAcademicoViewRepository.js';
import { DesercionViewRepository } from '../../repositories/views/DesercionViewRepository.js';
import { LibroRegistroRepository } from '../../repositories/LibroRegistroRepository.js';
import { LibroRegistroViewRepository } from '../../repositories/views/LibroRegistroViewRepository.js';

// ============================================
// PAGOS ACADÉMICOS
// ============================================
import { ContributionConfigurationRepository } from '../../repositories/ContributionConfigurationRepository.js';
import { PaymentMethodRepository } from '../../repositories/PaymentMethodRepository.js';
import { AuthorizedBankRepository } from '../../repositories/AuthorizedBankRepository.js';
import { PaymentAccountRepository } from '../../repositories/PaymentAccountRepository.js';
import { ContributionPaymentRepository } from '../../repositories/ContributionPaymentRepository.js';
import { ContributionPaymentInstallmentRepository } from '../../repositories/ContributionPaymentInstallmentRepository.js';
import { PaymentAporteCareerExcelReportRepository } from '../../repositories/views/PaymentAporteCareerExcelReportRepository.js';
import { BecasPorCarreraViewRepository } from '../../repositories/views/BecasPorCarreraViewRepository.js';
import { CompromisoPagoRepository } from '../../repositories/CompromisoPagoRepository.js';
import { CuentasPorCobrarViewRepository } from '../../repositories/views/CuentasPorCobrarViewRepository.js';
import { DashboardRepository } from '../../repositories/views/DashboardRepository.js';
import { AulasHorariosSemanaRepository } from '../../repositories/views/AulasHorariosSemanaRepository.js';

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
    registerRepository(
        container,
        REPOSITORIOS_TOKENS.complementariosUsosViewRepository,
        ComplementariosUsosViewRepository,
    );

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
    registerRepository(
        container,
        REPOSITORIOS_TOKENS.paraleloGestionFichaViewRepository,
        ParaleloGestionFichaViewRepository
    );
    registerComponent(container, REPOSITORIOS_TOKENS.parallelManagementRepository, (c) =>
        new ParallelManagementRepository({
            fichaViewRepository: c.resolve(REPOSITORIOS_TOKENS.paraleloGestionFichaViewRepository),
        })
    );
    registerRepository(container, REPOSITORIOS_TOKENS.courseOfferRepository, CourseOfferRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.academicPeriodRepository, AcademicPeriodRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.calendarActivityRepository, CalendarActivityRepository);

    // ============================================
    // ESTRUCTURA ACADÉMICA - PARTE 2
    // ============================================
    registerRepository(container, REPOSITORIOS_TOKENS.teacherRepository, TeacherRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.parallelRepository, ParallelRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.classroomRepository, ClassroomRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.scheduleRepository, ScheduleRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.asignacionHorarioRepository, AsignacionHorarioRepository);
    registerRepository(
        container,
        REPOSITORIOS_TOKENS.paraleloGestionGrillaBloqueViewRepository,
        ParaleloGestionGrillaBloqueViewRepository
    );
    registerRepository(
        container,
        REPOSITORIOS_TOKENS.paraleloGestionAsignacionCoberturaBloquesViewRepository,
        ParaleloGestionAsignacionCoberturaBloquesViewRepository
    );
    registerRepository(
        container,
        REPOSITORIOS_TOKENS.paraleloGestionConflictoParaleloBloqueViewRepository,
        ParaleloGestionConflictoParaleloBloqueViewRepository
    );
    registerRepository(
        container,
        REPOSITORIOS_TOKENS.paraleloGestionConflictoAulaBloqueViewRepository,
        ParaleloGestionConflictoAulaBloqueViewRepository
    );
    registerRepository(
        container,
        REPOSITORIOS_TOKENS.paraleloGestionConflictoDocenteBloqueViewRepository,
        ParaleloGestionConflictoDocenteBloqueViewRepository
    );
    registerComponent(container, REPOSITORIOS_TOKENS.horarioGrillaRepository, (c) =>
        new HorarioGrillaRepository({
            grillaBloqueViewRepository: c.resolve(
                REPOSITORIOS_TOKENS.paraleloGestionGrillaBloqueViewRepository
            ),
            asignacionCoberturaBloquesViewRepository: c.resolve(
                REPOSITORIOS_TOKENS.paraleloGestionAsignacionCoberturaBloquesViewRepository
            ),
            conflictoParaleloBloqueViewRepository: c.resolve(
                REPOSITORIOS_TOKENS.paraleloGestionConflictoParaleloBloqueViewRepository
            ),
            conflictoAulaBloqueViewRepository: c.resolve(
                REPOSITORIOS_TOKENS.paraleloGestionConflictoAulaBloqueViewRepository
            ),
            conflictoDocenteBloqueViewRepository: c.resolve(
                REPOSITORIOS_TOKENS.paraleloGestionConflictoDocenteBloqueViewRepository
            ),
        })
    );
    registerRepository(container, REPOSITORIOS_TOKENS.teacherAssignmentRepository, TeacherAssignmentRepository);

    // ============================================
    // ESTUDIANTES
    // ============================================
    registerRepository(container, REPOSITORIOS_TOKENS.studentRepository, StudentRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.studentAcademicDataRepository, StudentAcademicDataRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.studentDocumentRepository, StudentDocumentRepository);
    registerRepository(
      container,
      REPOSITORIOS_TOKENS.studentDocumentDeliveryRepository,
      StudentDocumentDeliveryRepository,
    );
    registerRepository(container, REPOSITORIOS_TOKENS.studentDisabilityRepository, StudentDisabilityRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.studentOriginRepository, StudentOriginRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.scholarshipRepository, ScholarshipRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.studentScholarshipRepository, StudentScholarshipRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.licenseRepository, LicenseRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.studentGuardianRepository, StudentGuardianRepository);
    registerRepository(
      container,
      REPOSITORIOS_TOKENS.studentEnrollmentExcelReportRepository,
      StudentEnrollmentExcelReportRepository,
    );
    registerRepository(
      container,
      REPOSITORIOS_TOKENS.studentEnrollmentStudentListExcelReportRepository,
      StudentEnrollmentStudentListExcelReportRepository,
    );

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
    registerRepository(
      container,
      REPOSITORIOS_TOKENS.subjectEnrollmentHistoryRepository,
      SubjectEnrollmentHistoryRepository,
    );
    registerRepository(
      container,
      REPOSITORIOS_TOKENS.priorEnrollmentHistoryRepository,
      PriorEnrollmentHistoryRepository,
    );

    // ============================================
    // EVALUACIONES
    // ============================================
    registerRepository(container, REPOSITORIOS_TOKENS.evaluationTypeRepository, EvaluationTypeRepository);
    registerRepository(
      container,
      REPOSITORIOS_TOKENS.evaluationConfigurationRepository,
      EvaluationConfigurationRepository,
    );
    registerRepository(
      container,
      REPOSITORIOS_TOKENS.subjectEnrollmentBimesterRepository,
      SubjectEnrollmentBimesterRepository,
    );
    registerRepository(container, REPOSITORIOS_TOKENS.bimesterEvaluationRepository, BimesterEvaluationRepository);
    registerRepository(
      container,
      REPOSITORIOS_TOKENS.bimesterEvaluationGradeRepository,
      BimesterEvaluationGradeRepository,
    );
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
    registerRepository(
      container,
      REPOSITORIOS_TOKENS.calificacionCentralizadorRepository,
      CalificacionCentralizadorRepository,
    );
    registerRepository(
      container,
      REPOSITORIOS_TOKENS.historialAcademicoRepository,
      HistorialAcademicoRepository,
    );
    registerComponent(
      container,
      REPOSITORIOS_TOKENS.gestionBimestresRepository,
      (c) =>
        new GestionBimestresRepository({
          calificacionContextoRepository: c.resolve(
            REPOSITORIOS_TOKENS.calificacionContextoRepository,
          ),
          subjectEnrollmentRepository: c.resolve(
            REPOSITORIOS_TOKENS.subjectEnrollmentRepository,
          ),
          configuracionSistemaRepository: c.resolve(
            REPOSITORIOS_TOKENS.systemConfigurationRepository,
          ),
        }),
    );
    registerComponent(
      container,
      REPOSITORIOS_TOKENS.cronogramaGestionRepository,
      (c) =>
        new CronogramaGestionRepository({
          calificacionContextoRepository: c.resolve(
            REPOSITORIOS_TOKENS.calificacionContextoRepository,
          ),
        }),
    );
    registerRepository(container, REPOSITORIOS_TOKENS.cuadernoRepository, CuadernoRepository);

    // ============================================
    // NIVELACIONES
    // ============================================
    registerRepository(container, REPOSITORIOS_TOKENS.levelingRepository, LevelingRepository);
    registerRepository(
      container,
      REPOSITORIOS_TOKENS.nivelacionParaleloViewRepository,
      NivelacionParaleloViewRepository,
    );

    // ============================================
    // ASISTENCIAS
    // ============================================
    registerRepository(container, REPOSITORIOS_TOKENS.attendanceRepository, AttendanceRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.missedClassRepository, MissedClassRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.sesionClaseRepository, SesionClaseRepository);
    registerRepository(
      container,
      REPOSITORIOS_TOKENS.asistenciaSesionViewRepository,
      AsistenciaSesionViewRepository,
    );
    registerRepository(
      container,
      REPOSITORIOS_TOKENS.asistenciaPlanillaViewRepository,
      AsistenciaPlanillaViewRepository,
    );
    registerRepository(
      container,
      REPOSITORIOS_TOKENS.asistenciaRegistroEstadoViewRepository,
      AsistenciaRegistroEstadoViewRepository,
    );
    registerRepository(
      container,
      REPOSITORIOS_TOKENS.asistenciaConsolidadoViewRepository,
      AsistenciaConsolidadoViewRepository,
    );

    // ============================================
    // AVANCE ACADÉMICO / DESERCIÓN (ACA, disolución REP 2026-07-29)
    // ============================================
    registerRepository(
      container,
      REPOSITORIOS_TOKENS.avanceAcademicoViewRepository,
      AvanceAcademicoViewRepository,
    );
    registerRepository(
      container,
      REPOSITORIOS_TOKENS.desercionViewRepository,
      DesercionViewRepository,
    );

    // ============================================
    // LIBROS DE REGISTRO (ACA, schema 25 — Fase 4)
    // ============================================
    registerRepository(
      container,
      REPOSITORIOS_TOKENS.libroRegistroRepository,
      LibroRegistroRepository,
    );
    registerRepository(
      container,
      REPOSITORIOS_TOKENS.libroRegistroViewRepository,
      LibroRegistroViewRepository,
    );

    // ============================================
    // PAGOS ACADÉMICOS
    // ============================================
    registerRepository(
      container,
      REPOSITORIOS_TOKENS.contributionConfigurationRepository,
      ContributionConfigurationRepository,
    );
    registerRepository(container, REPOSITORIOS_TOKENS.paymentMethodRepository, PaymentMethodRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.authorizedBankRepository, AuthorizedBankRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.paymentAccountRepository, PaymentAccountRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.contributionPaymentRepository, ContributionPaymentRepository);
    registerRepository(
      container,
      REPOSITORIOS_TOKENS.contributionPaymentInstallmentRepository,
      ContributionPaymentInstallmentRepository,
    );
    registerRepository(
      container,
      REPOSITORIOS_TOKENS.contributionPaymentByCareerExcelReportRepository,
      PaymentAporteCareerExcelReportRepository,
    );
    registerRepository(container, REPOSITORIOS_TOKENS.becasPorCarreraViewRepository, BecasPorCarreraViewRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.compromisoPagoRepository, CompromisoPagoRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.cuentasPorCobrarViewRepository, CuentasPorCobrarViewRepository);
    registerRepository(
        container,
        REPOSITORIOS_TOKENS.finanzasUsosViewRepository,
        FinanzasUsosViewRepository,
    );

    // ============================================
    // DASHBOARD
    // ============================================
    registerRepository(container, REPOSITORIOS_TOKENS.dashboardRepository, DashboardRepository);
    registerRepository(container, REPOSITORIOS_TOKENS.weeklyClassroomScheduleRepository, AulasHorariosSemanaRepository);

    return container;
}
