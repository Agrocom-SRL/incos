/**
 * Registro de dependencias del recurso Inscripciones (CRUD básico)
 * 
 * Responsabilidades:
 * - Registrar Use Cases del recurso Inscripciones (List, Create, GetById, Update, Delete)
 * - Registrar Controllers del recurso Inscripciones
 * - Construir y registrar el router del recurso Inscripciones
 * 
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Inscripciones registrado
 */

import { INSCRIPCIONES_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListEnrollmentsUseCase, CreateEnrollmentUseCase, GetEnrollmentByIdUseCase } from '../../../../application/use-cases/inscripciones/index.js';
import { ListEnrollmentsController, CreateEnrollmentController, GetEnrollmentByIdController } from '../../../../presentation/controllers/inscripciones/index.js';
import { buildInscripcionesRouter } from '../../../../presentation/routes/inscripciones.routes.js';

/**
 * Registra el recurso Inscripciones en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */

export function registerInscripcionesResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    registerComponent(
        container,
        INSCRIPCIONES_TOKENS.listEnrollmentsUseCase,
        (c) =>
            new ListEnrollmentsUseCase({
                enrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.enrollmentRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        INSCRIPCIONES_TOKENS.createEnrollmentUseCase,
        (c) =>
            new CreateEnrollmentUseCase({
                enrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.enrollmentRepository),
                enrollmentSubjectRepository: c.resolve(REPOSITORIOS_TOKENS.enrollmentSubjectRepository),
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                studentAcademicDataRepository: c.resolve(REPOSITORIOS_TOKENS.studentAcademicDataRepository),
                parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
                courseRepository: c.resolve(REPOSITORIOS_TOKENS.courseRepository),
                teacherAssignmentRepository: c.resolve(REPOSITORIOS_TOKENS.teacherAssignmentRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                managementPlanRepository: c.resolve(REPOSITORIOS_TOKENS.managementPlanRepository),
                studyPlanRepository: c.resolve(REPOSITORIOS_TOKENS.studyPlanRepository),
                configuracionSistemaRepository: c.resolve(REPOSITORIOS_TOKENS.configuracionSistemaRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        INSCRIPCIONES_TOKENS.getEnrollmentByIdUseCase,
        (c) =>
            new GetEnrollmentByIdUseCase({
                enrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.enrollmentRepository),
                enrollmentSubjectRepository: c.resolve(REPOSITORIOS_TOKENS.enrollmentSubjectRepository),
                studentAcademicDataRepository: c.resolve(REPOSITORIOS_TOKENS.studentAcademicDataRepository),
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                careerRepository: c.resolve(REPOSITORIOS_TOKENS.careerRepository),
                studyPlanRepository: c.resolve(REPOSITORIOS_TOKENS.studyPlanRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                teacherAssignmentRepository: c.resolve(REPOSITORIOS_TOKENS.teacherAssignmentRepository),
                courseRepository: c.resolve(REPOSITORIOS_TOKENS.courseRepository),
                planSubjectRepository: c.resolve(REPOSITORIOS_TOKENS.planSubjectRepository),
                subjectRepository: c.resolve(REPOSITORIOS_TOKENS.subjectRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        INSCRIPCIONES_TOKENS.listEnrollmentsController,
        (c) =>
            new ListEnrollmentsController({
                listEnrollmentsUseCase: c.resolve(INSCRIPCIONES_TOKENS.listEnrollmentsUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        INSCRIPCIONES_TOKENS.createEnrollmentController,
        (c) =>
            new CreateEnrollmentController({
                createEnrollmentUseCase: c.resolve(INSCRIPCIONES_TOKENS.createEnrollmentUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        INSCRIPCIONES_TOKENS.getEnrollmentByIdController,
        (c) =>
            new GetEnrollmentByIdController({
                getEnrollmentByIdUseCase: c.resolve(INSCRIPCIONES_TOKENS.getEnrollmentByIdUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    // TODO: Agregar otros Controllers cuando se implementen sus endpoints

    // ============================================
    // ROUTER
    // ============================================
    registerComponent(
        container,
        INSCRIPCIONES_TOKENS.inscripcionesRouter,
        (c) => {
            const controllers = {
                listEnrollmentsController: c.resolve(INSCRIPCIONES_TOKENS.listEnrollmentsController),
                createEnrollmentController: c.resolve(INSCRIPCIONES_TOKENS.createEnrollmentController),
                getEnrollmentByIdController: c.resolve(INSCRIPCIONES_TOKENS.getEnrollmentByIdController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildInscripcionesRouter({ controllers, middlewares });
        }
    );

    return container;
}
