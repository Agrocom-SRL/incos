/**
 * Tokens de Repositorios
 * 
 * Convenciones:
 * - Repositorios: camelCase + 'Repository' (ej: 'studentRepository')
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
    documentacionRepository: 'documentacionRepository',
    institutionRepository: 'institutionRepository',

    // CONFIGURACIÓN DEL SISTEMA
    configuracionSistemaRepository: 'configuracionSistemaRepository',

    // SISTEMA DE SEGURIDAD
    roleRepository: 'roleRepository',
    permissionRepository: 'permissionRepository',
    userRepository: 'userRepository',
    seguridadAltaUsuarioLookupRepository: 'seguridadAltaUsuarioLookupRepository',
    usuarioReferenciaVinculoRepository: 'usuarioReferenciaVinculoRepository',
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
    courseRepository: 'courseRepository',
    courseScheduleRepository: 'courseScheduleRepository',
    managementPlanRepository: 'managementPlanRepository',
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
    licenseRequestRepository: 'licenseRequestRepository',

    // INSCRIPCIONES
    enrollmentRepository: 'enrollmentRepository',
    enrollmentSubjectRepository: 'enrollmentSubjectRepository',

    // PAGOS ACADÉMICOS
    contributionConfigurationRepository: 'contributionConfigurationRepository',
    paymentMethodRepository: 'paymentMethodRepository',
    authorizedBankRepository: 'authorizedBankRepository',
    paymentAccountRepository: 'paymentAccountRepository',
    contributionPaymentRepository: 'contributionPaymentRepository',
    contributionPaymentInstallmentRepository: 'contributionPaymentInstallmentRepository',
    paymentAporteCareerExcelReportRepository: 'paymentAporteCareerExcelReportRepository',

    // TRANSITABILIDAD Y TRASPASOS
    transitabilityRepository: 'transitabilityRepository',
    transferRepository: 'transferRepository',

    // DASHBOARD
    dashboardRepository: 'dashboardRepository',
};

