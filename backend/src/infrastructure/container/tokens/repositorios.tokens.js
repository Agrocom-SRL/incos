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

    // CONFIGURACIÓN DEL SISTEMA
    configuracionSistemaRepository: 'configuracionSistemaRepository',

    // SISTEMA DE SEGURIDAD
    roleRepository: 'roleRepository',
    permissionRepository: 'permissionRepository',
    userRepository: 'userRepository',
    rolePermissionRepository: 'rolePermissionRepository',
    sessionRepository: 'sessionRepository',
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
    scholarshipRepository: 'scholarshipRepository',
    studentScholarshipRepository: 'studentScholarshipRepository',
    licenseRequestRepository: 'licenseRequestRepository',
};

