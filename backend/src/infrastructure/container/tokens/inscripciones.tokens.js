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
    // TODO: Agregar validators cuando se implementen
    // enrollmentValidator: 'inscripciones.enrollmentValidator',

    // USE CASES
    // TODO: Agregar Use Cases cuando se implementen
    // listEnrollmentsUseCase: 'inscripciones.listEnrollmentsUseCase',
    // createEnrollmentUseCase: 'inscripciones.createEnrollmentUseCase',
    // getEnrollmentByIdUseCase: 'inscripciones.getEnrollmentByIdUseCase',

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
