/**
 * Tokens de Inyección de Dependencias
 * 
 * Convenciones:
 * - Servicios base: camelCase (ej: 'logger', 'fileUploadService')
 * - Repositorios: camelCase + 'Repository' (ej: 'studentRepository')
 * - Use Cases: módulo + camelCase + 'UseCase' (ej: 'estudiantes.registerStudentUseCase')
 * - Controllers: módulo + camelCase + 'Controller'
 * - Routers: módulo + 'router'
 */

export const TOKENS = {
    // ============================================
    // SERVICIOS BASE
    // ============================================
    logger: 'logger',
    fileUploadService: 'fileUploadService',
    fileStorageService: 'fileStorageService', // Futuro

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

    // ============================================
    // REPOSITORIOS - CATÁLOGOS
    // ============================================
    documentacionRepository: 'documentacionRepository',
    configuracionSistemaRepository: 'configuracionSistemaRepository',
    managementRepository: 'managementRepository',
    careerRepository: 'careerRepository',
    subjectRepository: 'subjectRepository',
    disabilityTypeRepository: 'disabilityTypeRepository',
    countryRepository: 'countryRepository',
    departmentRepository: 'departmentRepository',
    provinceRepository: 'provinceRepository',
    municipalityRepository: 'municipalityRepository',
    languageRepository: 'languageRepository',
    civilStatusRepository: 'civilStatusRepository',
    relationshipTypeRepository: 'relationshipTypeRepository',

    // ============================================
    // MÓDULO ESTUDIANTES - USE CASES
    // ============================================
    est_registerStudentUseCase: 'estudiantes.registerStudentUseCase',
    est_listStudentsUseCase: 'estudiantes.listStudentsUseCase',
    est_uploadDocumentUseCase: 'estudiantes.uploadDocumentUseCase',
    est_generateActaUseCase: 'estudiantes.generateCompromisoActaUseCase',

    // ============================================
    // MÓDULO ESTUDIANTES - CONTROLLERS
    // ============================================
    est_createStudentController: 'estudiantes.createStudentController',
    est_listStudentsController: 'estudiantes.listStudentsController',
    est_getStudentByIdController: 'estudiantes.getStudentByIdController',
    est_updateStudentController: 'estudiantes.updateStudentController',
    est_uploadDocumentController: 'estudiantes.uploadDocumentController',
    est_getDocumentsController: 'estudiantes.getStudentDocumentsController',
    est_getDocumentDeliveriesController: 'estudiantes.getStudentDocumentDeliveriesController',
    est_getAcademicDataController: 'estudiantes.getStudentAcademicDataController',
    est_generateActaController: 'estudiantes.generateCompromisoActaController',

    // ============================================
    // MÓDULO ESTUDIANTES - ROUTER
    // ============================================
    est_router: 'estudiantes.router',

    // ============================================
    // MÓDULO CONFIGURACIÓN - USE CASES
    // ============================================
    cfg_listCarrerasUseCase: 'configuracion.listCarrerasUseCase',
    cfg_listMateriasUseCase: 'configuracion.listMateriasUseCase',
    cfg_listDiscapacidadUseCase: 'configuracion.listDiscapacidadUseCase',

    // ============================================
    // MÓDULO CONFIGURACIÓN - CONTROLLERS
    // ============================================
    cfg_listCarrerasController: 'configuracion.listCarrerasController',
    cfg_listMateriasController: 'configuracion.listMateriasController',
    cfg_listDiscapacidadController: 'configuracion.listDiscapacidadController',

    // ============================================
    // MÓDULO CONFIGURACIÓN - ROUTERS
    // ============================================
    cfg_carrerasRouter: 'configuracion.carrerasRouter',
    cfg_materiasRouter: 'configuracion.materiasRouter',
    cfg_discapacidadRouter: 'configuracion.discapacidadRouter',

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

    // ============================================
    // MÓDULO REFERENCIA - CONTROLLERS
    // ============================================
    ref_listIdiomasController: 'referencia.listIdiomasController',
    ref_listEstadosCivilesController: 'referencia.listEstadosCivilesController',
    ref_listTiposParentescoController: 'referencia.listTiposParentescoController',
    ref_listDocumentacionController: 'referencia.listDocumentacionController',

    // ============================================
    // MÓDULO REFERENCIA - ROUTERS
    // ============================================
    ref_idiomasRouter: 'referencia.idiomasRouter',
    ref_estadosCivilesRouter: 'referencia.estadosCivilesRouter',
    ref_tiposParentescoRouter: 'referencia.tiposParentescoRouter',
    ref_documentacionRouter: 'referencia.documentacionRouter',
};