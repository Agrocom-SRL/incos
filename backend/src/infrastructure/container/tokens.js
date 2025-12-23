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

    // ============================================
    // REPOSITORIOS - CATÁLOGOS
    // ============================================
    documentacionRepository: 'documentacionRepository',
    configuracionSistemaRepository: 'configuracionSistemaRepository',
    managementRepository: 'managementRepository',

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
    est_getAcademicDataController: 'estudiantes.getStudentAcademicDataController',
    est_generateActaController: 'estudiantes.generateCompromisoActaController',

    // ============================================
    // MÓDULO ESTUDIANTES - ROUTER
    // ============================================
    est_router: 'estudiantes.router',
};