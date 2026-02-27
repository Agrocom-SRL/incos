/**
 * Tokens del Módulo Estudiantes
 * 
 * Convenciones:
 * - Use Cases: {modulo}_list{Entity}UseCase (ej: 'estudiantes.listStudentsUseCase')
 * - Controllers: {modulo}_list{Entity}Controller (ej: 'estudiantes.listStudentsController')
 * - Routers: {modulo}_{entity}Router (ej: 'estudiantes.estudiantesRouter')
 * - Validators: {modulo}_{entity}Validator (ej: 'estudiantes.studentValidator')
 */

export const ESTUDIANTES_TOKENS = {
    // VALIDATORS
    studentValidator: 'estudiantes.studentValidator',

    // USE CASES
    listStudentsUseCase: 'estudiantes.listStudentsUseCase',
    registerStudentUseCase: 'estudiantes.registerStudentUseCase',
    updateStudentUseCase: 'estudiantes.updateStudentUseCase',
    getStudentByIdUseCase: 'estudiantes.getStudentByIdUseCase',
    searchStudentUseCase: 'estudiantes.searchStudentUseCase',
    generateActaCompromisoUseCase: 'estudiantes.generateActaCompromisoUseCase',
    generateDeclaracionJuradaUseCase: 'estudiantes.generateDeclaracionJuradaUseCase',
    listBecasDescuentosUseCase: 'estudiantes.listBecasDescuentosUseCase',
    createStudentScholarshipUseCase: 'estudiantes.createStudentScholarshipUseCase',
    deleteStudentScholarshipUseCase: 'estudiantes.deleteStudentScholarshipUseCase',
    getStudentScholarshipsByStudentIdUseCase: 'estudiantes.getStudentScholarshipsByStudentIdUseCase',
    listStudentScholarshipsUseCase: 'estudiantes.listStudentScholarshipsUseCase',
    deleteStudentUseCase: 'estudiantes.deleteStudentUseCase',

    // CONTROLLERS
    listStudentsController: 'estudiantes.listStudentsController',
    registerStudentController: 'estudiantes.registerStudentController',
    updateStudentController: 'estudiantes.updateStudentController',
    getStudentByIdController: 'estudiantes.getStudentByIdController',
    searchStudentController: 'estudiantes.searchStudentController',
    actaCompromisoController: 'estudiantes.actaCompromisoController',
    declaracionJuradaController: 'estudiantes.declaracionJuradaController',
    listBecasDescuentosController: 'estudiantes.listBecasDescuentosController',
    asignarBecaController: 'estudiantes.asignarBecaController',
    deleteStudentScholarshipController: 'estudiantes.deleteStudentScholarshipController',
    getStudentScholarshipsController: 'estudiantes.getStudentScholarshipsController',
    listStudentScholarshipsController: 'estudiantes.listStudentScholarshipsController',
    deleteStudentController: 'estudiantes.deleteStudentController',

    // ROUTERS
    estudiantesRouter: 'estudiantes.estudiantesRouter',
    becasDescuentosRouter: 'estudiantes.becasDescuentosRouter',
};

