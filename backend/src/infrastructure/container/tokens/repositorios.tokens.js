/**
 * Tokens de Repositorios
 *
 * Convenciones:
 * - Claves en inglés, camelCase + 'Repository' (ej: 'studentRepository')
 * - Interfaces de dominio en español (IEstudianteRepository); implementaciones en inglés (StudentRepository)
 */

export const REPOSITORIOS_TOKENS = {
    // CATÁLOGOS GEOGRÁFICOS
    countryRepository: 'countryRepository',
    departmentRepository: 'departmentRepository',
    provinceRepository: 'provinceRepository',
    municipalityRepository: 'municipalityRepository',

    // CATÁLOGOS DE REFERENCIA
    languageRepository: 'languageRepository',
    civilStatusRepository: 'civilStatusRepository',
    disabilityTypeRepository: 'disabilityTypeRepository',
    relationshipTypeRepository: 'relationshipTypeRepository',
    documentationRepository: 'documentationRepository',
    institutionRepository: 'institutionRepository',

    // CONFIGURACIÓN DEL SISTEMA
    systemConfigurationRepository: 'systemConfigurationRepository',

    // SISTEMA DE SEGURIDAD
    roleRepository: 'roleRepository',
    permissionRepository: 'permissionRepository',
    userRepository: 'userRepository',
    securityUserRegistrationLookupRepository: 'securityUserRegistrationLookupRepository',
    userReferenceLinkRepository: 'userReferenceLinkRepository',
    rolePermissionRepository: 'rolePermissionRepository',
    userPermissionRepository: 'userPermissionRepository',
    sessionRepository: 'sessionRepository',
    authRepository: 'authRepository',
    rectorRepository: 'rectorRepository',
    directorRepository: 'directorRepository',
    secretaryRepository: 'secretaryRepository',
    staffRepository: 'staffRepository',

    // ESTRUCTURA ACADÉMICA - PARTE 1
    careerRepository: 'careerRepository',
    managementRepository: 'managementRepository',
    periodRepository: 'periodRepository',
    subjectRepository: 'subjectRepository',
    studyPlanRepository: 'studyPlanRepository',
    prerequisiteRepository: 'prerequisiteRepository',
    planSubjectRepository: 'planSubjectRepository',

    // ESTRUCTURA ACADÉMICA - PARTE 3 (Calendario)
    activityRepository: 'activityRepository',
    academicPeriodRepository: 'academicPeriodRepository',
    calendarActivityRepository: 'calendarActivityRepository',

    // ESTRUCTURA ACADÉMICA - PARTE 2
    teacherRepository: 'teacherRepository',
    parallelRepository: 'parallelRepository',
    classroomRepository: 'classroomRepository',
    scheduleRepository: 'scheduleRepository',
    asignacionHorarioRepository: 'asignacionHorarioRepository',
    paraleloGestionGrillaBloqueViewRepository: 'paraleloGestionGrillaBloqueViewRepository',
    paraleloGestionFichaViewRepository: 'paraleloGestionFichaViewRepository',
    paraleloGestionAsignacionCoberturaBloquesViewRepository:
        'paraleloGestionAsignacionCoberturaBloquesViewRepository',
    paraleloGestionConflictoParaleloBloqueViewRepository:
        'paraleloGestionConflictoParaleloBloqueViewRepository',
    paraleloGestionConflictoAulaBloqueViewRepository: 'paraleloGestionConflictoAulaBloqueViewRepository',
    paraleloGestionConflictoDocenteBloqueViewRepository:
        'paraleloGestionConflictoDocenteBloqueViewRepository',
    horarioGrillaRepository: 'horarioGrillaRepository',
    managementPlanRepository: 'managementPlanRepository',
    parallelManagementRepository: 'parallelManagementRepository',
    courseOfferRepository: 'courseOfferRepository',
    teacherAssignmentRepository: 'teacherAssignmentRepository',

    // ESTUDIANTES
    studentRepository: 'studentRepository',
    studentAcademicDataRepository: 'studentAcademicDataRepository',
    studentDocumentRepository: 'studentDocumentRepository',
    studentDocumentDeliveryRepository: 'studentDocumentDeliveryRepository',
    studentDisabilityRepository: 'studentDisabilityRepository',
    studentOriginRepository: 'studentOriginRepository',
    studentGuardianRepository: 'studentGuardianRepository',
    studentEnrollmentExcelReportRepository: 'studentEnrollmentExcelReportRepository',
    studentEnrollmentStudentListExcelReportRepository: 'studentEnrollmentStudentListExcelReportRepository',
    scholarshipRepository: 'scholarshipRepository',
    studentScholarshipRepository: 'studentScholarshipRepository',
    licenseRepository: 'licenseRepository',

    // INSCRIPCIONES
    enrollmentRepository: 'enrollmentRepository',
    subjectEnrollmentRepository: 'subjectEnrollmentRepository',
    subjectEnrollmentHistoryRepository: 'subjectEnrollmentHistoryRepository',
    priorEnrollmentHistoryRepository: 'priorEnrollmentHistoryRepository',

    // EVALUACIONES
    evaluationTypeRepository: 'evaluationTypeRepository',
    evaluationConfigurationRepository: 'evaluationConfigurationRepository',
    subjectEnrollmentBimesterRepository: 'subjectEnrollmentBimesterRepository',
    bimesterEvaluationRepository: 'bimesterEvaluationRepository',
    bimesterEvaluationGradeRepository: 'bimesterEvaluationGradeRepository',
    cuadernoRepository: 'cuadernoRepository',
    calificacionContextoRepository: 'calificacionContextoRepository',
    calificacionCoordinacionRepository: 'calificacionCoordinacionRepository',
    gestionBimestresRepository: 'gestionBimestresRepository',
    cronogramaGestionRepository: 'cronogramaGestionRepository',

    // NIVELACIONES
    levelingRepository: 'levelingRepository',

    // ASISTENCIAS
    attendanceRepository: 'attendanceRepository',
    missedClassRepository: 'missedClassRepository',
    sesionClaseRepository: 'sesionClaseRepository',
    asistenciaSesionViewRepository: 'asistenciaSesionViewRepository',
    asistenciaPlanillaViewRepository: 'asistenciaPlanillaViewRepository',
    asistenciaRegistroEstadoViewRepository: 'asistenciaRegistroEstadoViewRepository',

    // PAGOS ACADÉMICOS
    contributionConfigurationRepository: 'contributionConfigurationRepository',
    paymentMethodRepository: 'paymentMethodRepository',
    authorizedBankRepository: 'authorizedBankRepository',
    paymentAccountRepository: 'paymentAccountRepository',
    contributionPaymentRepository: 'contributionPaymentRepository',
    contributionPaymentInstallmentRepository: 'contributionPaymentInstallmentRepository',
    contributionPaymentByCareerExcelReportRepository: 'contributionPaymentByCareerExcelReportRepository',

    // TRANSITABILIDAD Y TRASPASOS
    transitabilityRepository: 'transitabilityRepository',
    transferRepository: 'transferRepository',

    // DASHBOARD
    dashboardRepository: 'dashboardRepository',
    weeklyClassroomScheduleRepository: 'weeklyClassroomScheduleRepository',
};
