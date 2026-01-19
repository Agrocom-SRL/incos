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
    listBecasDescuentosUseCase: 'estudiantes.listBecasDescuentosUseCase',
    createStudentScholarshipUseCase: 'estudiantes.createStudentScholarshipUseCase',
    getStudentScholarshipsByStudentIdUseCase: 'estudiantes.getStudentScholarshipsByStudentIdUseCase',
    listStudentScholarshipsUseCase: 'estudiantes.listStudentScholarshipsUseCase',
    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints
    // deleteStudentUseCase: 'estudiantes.deleteStudentUseCase',

    // CONTROLLERS
    listStudentsController: 'estudiantes.listStudentsController',
    registerStudentController: 'estudiantes.registerStudentController',
    updateStudentController: 'estudiantes.updateStudentController',
    getStudentByIdController: 'estudiantes.getStudentByIdController',
    searchStudentController: 'estudiantes.searchStudentController',
    actaCompromisoController: 'estudiantes.actaCompromisoController',
    listBecasDescuentosController: 'estudiantes.listBecasDescuentosController',
    asignarBecaController: 'estudiantes.asignarBecaController',
    getStudentScholarshipsController: 'estudiantes.getStudentScholarshipsController',
    listStudentScholarshipsController: 'estudiantes.listStudentScholarshipsController',
    // TODO: Agregar otros Controllers cuando se implementen sus endpoints
    // deleteStudentController: 'estudiantes.deleteStudentController',

    // ROUTERS
    estudiantesRouter: 'estudiantes.estudiantesRouter',
    becasDescuentosRouter: 'estudiantes.becasDescuentosRouter',
};

