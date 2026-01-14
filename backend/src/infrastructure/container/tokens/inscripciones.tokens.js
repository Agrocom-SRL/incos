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
    // TODO: Agregar otros validators cuando se implementen
    // updateEnrollmentValidator: 'inscripciones.updateEnrollmentValidator',

    // USE CASES
    listEnrollmentsUseCase: 'inscripciones.listEnrollmentsUseCase',
    createEnrollmentUseCase: 'inscripciones.createEnrollmentUseCase',
    getEnrollmentByIdUseCase: 'inscripciones.getEnrollmentByIdUseCase',
    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints
    // updateEnrollmentUseCase: 'inscripciones.updateEnrollmentUseCase',
    // deleteEnrollmentUseCase: 'inscripciones.deleteEnrollmentUseCase',

    // CONTROLLERS
    listEnrollmentsController: 'inscripciones.listEnrollmentsController',
    createEnrollmentController: 'inscripciones.createEnrollmentController',
    getEnrollmentByIdController: 'inscripciones.getEnrollmentByIdController',
    // TODO: Agregar otros Controllers cuando se implementen sus endpoints
    // updateEnrollmentController: 'inscripciones.updateEnrollmentController',
    // deleteEnrollmentController: 'inscripciones.deleteEnrollmentController',

    // ROUTERS
    inscripcionesRouter: 'inscripciones.inscripcionesRouter',
};
