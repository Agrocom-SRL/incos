/**
 * Tokens de Inyección de Dependencias
 * 
 * Convenciones:
 * - Servicios base: camelCase (ej: 'logger', 'fileUploadService')
 * - Repositorios: camelCase + 'Repository' (ej: 'studentRepository')
 * - Use Cases: {modulo}_list{Entity}UseCase (ej: 'estudiantes.listStudentsUseCase')
 * - Controllers: {modulo}_list{Entity}Controller (ej: 'estudiantes.listStudentsController')
 * - Routers: {modulo}_{entity}Router (ej: 'estudiantes.estudiantesRouter', 'configuracion.carrerasRouter')
 */

export const TOKENS = {
    // ============================================
    // SERVICIOS BASE
    // ============================================
    logger: 'logger',
    errorFormatter: 'errorFormatter',
    validateRequest: 'validateRequest',
    fileUploadService: 'fileUploadService',
    fileStorageService: 'fileStorageService', // Futuro

    // ============================================
    // REPOSITORIOS - CATÁLOGOS GEOGRÁFICOS
    // ============================================
    countryRepository: 'countryRepository',
    departmentRepository: 'departmentRepository',
    provinceRepository: 'provinceRepository',
    municipalityRepository: 'municipalityRepository',

    // ============================================
    // REPOSITORIOS - CATÁLOGOS DE REFERENCIA
    // ============================================
    languageRepository: 'languageRepository',
    civilStatusRepository: 'civilStatusRepository',
    disabilityTypeRepository: 'disabilityTypeRepository',
    relationshipTypeRepository: 'relationshipTypeRepository',
    documentacionRepository: 'documentacionRepository',

    // ============================================
    // REPOSITORIOS - CONFIGURACIÓN DEL SISTEMA
    // ============================================
    configuracionSistemaRepository: 'configuracionSistemaRepository',

    // ============================================
    // REPOSITORIOS - SISTEMA DE SEGURIDAD
    // ============================================
    roleRepository: 'roleRepository',
    permissionRepository: 'permissionRepository',
    userRepository: 'userRepository',
    rolePermissionRepository: 'rolePermissionRepository',
    sessionRepository: 'sessionRepository',
    staffRepository: 'staffRepository',

    // ============================================
    // REPOSITORIOS - ESTRUCTURA ACADÉMICA - PARTE 1
    // ============================================
    careerRepository: 'careerRepository',
    managementRepository: 'managementRepository',
    managementStageRepository: 'managementStageRepository',
    periodRepository: 'periodRepository',
    subjectRepository: 'subjectRepository',
    studyPlanRepository: 'studyPlanRepository',
    prerequisiteRepository: 'prerequisiteRepository',

    // ============================================
    // REPOSITORIOS - ESTRUCTURA ACADÉMICA - PARTE 2
    // ============================================
    courseRepository: 'courseRepository',
    teacherRepository: 'teacherRepository',
    teacherAssignmentRepository: 'teacherAssignmentRepository',
    shiftRepository: 'shiftRepository',
    courseShiftRepository: 'courseShiftRepository',

    // ============================================
    // REPOSITORIOS - ESTUDIANTES
    // ============================================
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

    // ============================================
    // MÓDULO ESTUDIANTES - VALIDATORS
    // ============================================
    est_studentValidator: 'estudiantes.studentValidator',

    // ============================================
    // MÓDULO ESTUDIANTES - USE CASES
    // ============================================
    est_listStudentsUseCase: 'estudiantes.listStudentsUseCase',
    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints
    // est_registerStudentUseCase: 'estudiantes.registerStudentUseCase',
    // est_getStudentByIdUseCase: 'estudiantes.getStudentByIdUseCase',
    // est_updateStudentUseCase: 'estudiantes.updateStudentUseCase',

    // ============================================
    // MÓDULO ESTUDIANTES - CONTROLLERS
    // ============================================
    est_listStudentsController: 'estudiantes.listStudentsController',
    // TODO: Agregar otros Controllers cuando se implementen sus endpoints
    // est_createStudentController: 'estudiantes.createStudentController',
    // est_getStudentByIdController: 'estudiantes.getStudentByIdController',
    // est_updateStudentController: 'estudiantes.updateStudentController',

    // ============================================
    // MÓDULO ESTUDIANTES - ROUTERS
    // ============================================
    est_estudiantesRouter: 'estudiantes.estudiantesRouter',

    // ============================================
    // MÓDULO CONFIGURACIÓN - USE CASES
    // ============================================
    cfg_listCarrerasUseCase: 'configuracion.listCarrerasUseCase',
    cfg_listMateriasUseCase: 'configuracion.listMateriasUseCase',

    // ============================================
    // MÓDULO CONFIGURACIÓN - CONTROLLERS
    // ============================================
    cfg_listCarrerasController: 'configuracion.listCarrerasController',
    cfg_listMateriasController: 'configuracion.listMateriasController',

    // ============================================
    // MÓDULO CONFIGURACIÓN - ROUTERS
    // ============================================
    cfg_carrerasRouter: 'configuracion.carrerasRouter',
    cfg_materiasRouter: 'configuracion.materiasRouter',

    // ============================================
    // MÓDULO GEOGRÁFICOS - USE CASES
    // ============================================
    geo_listPaisesUseCase: 'geograficos.listPaisesUseCase',
    geo_listDepartamentosUseCase: 'geograficos.listDepartamentosUseCase',
    geo_listProvinciasUseCase: 'geograficos.listProvinciasUseCase',
    geo_listMunicipiosUseCase: 'geograficos.listMunicipiosUseCase',

    // ============================================
    // MÓDULO GEOGRÁFICOS - CONTROLLERS
    // ============================================
    geo_listPaisesController: 'geograficos.listPaisesController',
    geo_listDepartamentosController: 'geograficos.listDepartamentosController',
    geo_listProvinciasController: 'geograficos.listProvinciasController',
    geo_listMunicipiosController: 'geograficos.listMunicipiosController',

    // ============================================
    // MÓDULO GEOGRÁFICOS - ROUTERS
    // ============================================
    geo_paisesRouter: 'geograficos.paisesRouter',
    geo_departamentosRouter: 'geograficos.departamentosRouter',
    geo_provinciasRouter: 'geograficos.provinciasRouter',
    geo_municipiosRouter: 'geograficos.municipiosRouter',

    // ============================================
    // MÓDULO REFERENCIA - USE CASES
    // ============================================
    ref_listIdiomasUseCase: 'referencia.listIdiomasUseCase',
    ref_listEstadosCivilesUseCase: 'referencia.listEstadosCivilesUseCase',
    ref_listTiposParentescoUseCase: 'referencia.listTiposParentescoUseCase',
    ref_listDocumentacionUseCase: 'referencia.listDocumentacionUseCase',
    ref_listDiscapacidadUseCase: 'referencia.listDiscapacidadUseCase',

    // ============================================
    // MÓDULO REFERENCIA - CONTROLLERS
    // ============================================
    ref_listIdiomasController: 'referencia.listIdiomasController',
    ref_listEstadosCivilesController: 'referencia.listEstadosCivilesController',
    ref_listTiposParentescoController: 'referencia.listTiposParentescoController',
    ref_listDocumentacionController: 'referencia.listDocumentacionController',
    ref_listDiscapacidadController: 'referencia.listDiscapacidadController',

    // ============================================
    // MÓDULO REFERENCIA - ROUTERS
    // ============================================
    ref_idiomasRouter: 'referencia.idiomasRouter',
    ref_estadosCivilesRouter: 'referencia.estadosCivilesRouter',
    ref_tiposParentescoRouter: 'referencia.tiposParentescoRouter',
    ref_documentacionRouter: 'referencia.documentacionRouter',
    ref_discapacidadRouter: 'referencia.discapacidadRouter',
};
