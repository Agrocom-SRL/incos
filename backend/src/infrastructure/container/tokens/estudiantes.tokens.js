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
    getStudentByIdUseCase: 'estudiantes.getStudentByIdUseCase',
    generateActaCompromisoUseCase: 'estudiantes.generateActaCompromisoUseCase',
    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints
    // updateStudentUseCase: 'estudiantes.updateStudentUseCase',

    // CONTROLLERS
    listStudentsController: 'estudiantes.listStudentsController',
    registerStudentController: 'estudiantes.registerStudentController',
    getStudentByIdController: 'estudiantes.getStudentByIdController',
    actaCompromisoController: 'estudiantes.actaCompromisoController',
    // TODO: Agregar otros Controllers cuando se implementen sus endpoints
    // updateStudentController: 'estudiantes.updateStudentController',

    // ROUTERS
    estudiantesRouter: 'estudiantes.estudiantesRouter',
};

