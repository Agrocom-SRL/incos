/**
 * Tokens del Módulo Inscripciones
 * 
 * Convenciones:
 * - Use Cases: {modulo}_list{Entity}UseCase (ej: 'inscripciones.listEnrollmentsUseCase')
 * - Controllers: {modulo}_list{Entity}Controller (ej: 'inscripciones.listEnrollmentsController')
 * - Routers: {modulo}_{entity}Router (ej: 'inscripciones.inscripcionesRouter')
 * - Validators: {modulo}_{entity}Validator (ej: 'inscripciones.enrollmentValidator')
 */

export const INSCRIPCIONES_TOKENS = {
    // VALIDATORS
    createEnrollmentValidator: 'inscripciones.createEnrollmentValidator',
    updateEnrollmentValidator: 'inscripciones.updateEnrollmentValidator',
    updateEnrollmentPriorHistoryValidator: 'inscripciones.updateEnrollmentPriorHistoryValidator',

    // USE CASES
    listEnrollmentsUseCase: 'inscripciones.listEnrollmentsUseCase',
    createEnrollmentUseCase: 'inscripciones.createEnrollmentUseCase',
    getEnrollmentByIdUseCase: 'inscripciones.getEnrollmentByIdUseCase',
    deleteEnrollmentUseCase: 'inscripciones.deleteEnrollmentUseCase',
    generateFormularioInscripcionUseCase: 'inscripciones.generateFormularioInscripcionUseCase',
    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints
    updateEnrollmentUseCase: 'inscripciones.updateEnrollmentUseCase',
    cambiarEstadoMatriculaUseCase: 'inscripciones.cambiarEstadoMatriculaUseCase',
    getMatriculaContextoUseCase: 'inscripciones.getMatriculaContextoUseCase',

    // CONTROLLERS
    listEnrollmentsController: 'inscripciones.listEnrollmentsController',
    createEnrollmentController: 'inscripciones.createEnrollmentController',
    getEnrollmentByIdController: 'inscripciones.getEnrollmentByIdController',
    deleteEnrollmentController: 'inscripciones.deleteEnrollmentController',
    generateFormularioInscripcionController: 'inscripciones.generateFormularioInscripcionController',
    // TODO: Agregar otros Controllers cuando se implementen sus endpoints
    updateEnrollmentController: 'inscripciones.updateEnrollmentController',
    updateEnrollmentPriorHistoryController: 'inscripciones.updateEnrollmentPriorHistoryController',
    activarCursadoMatriculaController: 'inscripciones.activarCursadoMatriculaController',
    getMatriculaContextoController: 'inscripciones.getMatriculaContextoController',

    // ROUTERS
    inscripcionesRouter: 'inscripciones.inscripcionesRouter',
};
