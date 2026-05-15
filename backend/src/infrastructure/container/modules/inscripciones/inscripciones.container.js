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
import { ListEnrollmentsUseCase, CreateEnrollmentUseCase, GetEnrollmentByIdUseCase, DeleteEnrollmentUseCase, GenerateFormularioInscripcionUseCase, UpdateEnrollmentUseCase } from '../../../../application/use-cases/inscripciones/index.js';
import { ListEnrollmentsController, CreateEnrollmentController, GetEnrollmentByIdController, DeleteEnrollmentController, GenerateFormularioInscripcionController, UpdateEnrollmentController } from '../../../../presentation/controllers/inscripciones/index.js';
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
                subjectEnrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.subjectEnrollmentRepository),
                studentAcademicDataRepository: c.resolve(REPOSITORIOS_TOKENS.studentAcademicDataRepository),
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                careerRepository: c.resolve(REPOSITORIOS_TOKENS.careerRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        INSCRIPCIONES_TOKENS.createEnrollmentUseCase,
        (c) =>
            new CreateEnrollmentUseCase({
                enrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.enrollmentRepository),
                subjectEnrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.subjectEnrollmentRepository),
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                studentAcademicDataRepository: c.resolve(REPOSITORIOS_TOKENS.studentAcademicDataRepository),
                parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
                courseRepository: c.resolve(REPOSITORIOS_TOKENS.courseRepository),
                teacherAssignmentRepository: c.resolve(REPOSITORIOS_TOKENS.teacherAssignmentRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                managementPlanRepository: c.resolve(REPOSITORIOS_TOKENS.managementPlanRepository),
                studyPlanRepository: c.resolve(REPOSITORIOS_TOKENS.studyPlanRepository),
                configuracionSistemaRepository: c.resolve(REPOSITORIOS_TOKENS.configuracionSistemaRepository),
                careerRepository: c.resolve(REPOSITORIOS_TOKENS.careerRepository),
                studentDocumentRepository: c.resolve(REPOSITORIOS_TOKENS.studentDocumentRepository),
                studentDocumentDeliveryRepository: c.resolve(REPOSITORIOS_TOKENS.studentDocumentDeliveryRepository),
                civilStatusRepository: c.resolve(REPOSITORIOS_TOKENS.civilStatusRepository),
                municipalityRepository: c.resolve(REPOSITORIOS_TOKENS.municipalityRepository),
                provinceRepository: c.resolve(REPOSITORIOS_TOKENS.provinceRepository),
                departmentRepository: c.resolve(REPOSITORIOS_TOKENS.departmentRepository),
                languageRepository: c.resolve(REPOSITORIOS_TOKENS.languageRepository),
                planSubjectRepository: c.resolve(REPOSITORIOS_TOKENS.planSubjectRepository),
                contributionPaymentRepository: c.resolve(REPOSITORIOS_TOKENS.contributionPaymentRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        INSCRIPCIONES_TOKENS.getEnrollmentByIdUseCase,
        (c) =>
            new GetEnrollmentByIdUseCase({
                enrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.enrollmentRepository),
                subjectEnrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.subjectEnrollmentRepository),
                studentAcademicDataRepository: c.resolve(REPOSITORIOS_TOKENS.studentAcademicDataRepository),
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                careerRepository: c.resolve(REPOSITORIOS_TOKENS.careerRepository),
                studyPlanRepository: c.resolve(REPOSITORIOS_TOKENS.studyPlanRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                teacherAssignmentRepository: c.resolve(REPOSITORIOS_TOKENS.teacherAssignmentRepository),
                courseRepository: c.resolve(REPOSITORIOS_TOKENS.courseRepository),
                planSubjectRepository: c.resolve(REPOSITORIOS_TOKENS.planSubjectRepository),
                subjectRepository: c.resolve(REPOSITORIOS_TOKENS.subjectRepository),
                courseScheduleRepository: c.resolve(REPOSITORIOS_TOKENS.courseScheduleRepository),
                scheduleRepository: c.resolve(REPOSITORIOS_TOKENS.scheduleRepository),
                classroomRepository: c.resolve(REPOSITORIOS_TOKENS.classroomRepository),
                teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
                parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
                studentDocumentRepository: c.resolve(REPOSITORIOS_TOKENS.studentDocumentRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        INSCRIPCIONES_TOKENS.deleteEnrollmentUseCase,
        (c) =>
            new DeleteEnrollmentUseCase({
                enrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.enrollmentRepository),
                subjectEnrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.subjectEnrollmentRepository),
                studentAcademicDataRepository: c.resolve(REPOSITORIOS_TOKENS.studentAcademicDataRepository),
                studentDocumentRepository: c.resolve(REPOSITORIOS_TOKENS.studentDocumentRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        INSCRIPCIONES_TOKENS.generateFormularioInscripcionUseCase,
        (c) =>
            new GenerateFormularioInscripcionUseCase({
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                studentDocumentRepository: c.resolve(REPOSITORIOS_TOKENS.studentDocumentRepository),
                enrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.enrollmentRepository),
                studentAcademicDataRepository: c.resolve(REPOSITORIOS_TOKENS.studentAcademicDataRepository),
                studentDocumentDeliveryRepository: c.resolve(REPOSITORIOS_TOKENS.studentDocumentDeliveryRepository),
                configuracionSistemaRepository: c.resolve(REPOSITORIOS_TOKENS.configuracionSistemaRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                pdfGenerator: c.resolve(SERVICIOS_TOKENS.pdfGenerator),
                uploadsStorage: c.resolve(SERVICIOS_TOKENS.uploadsStorage),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        INSCRIPCIONES_TOKENS.updateEnrollmentUseCase,
        (c) =>
            new UpdateEnrollmentUseCase({
                enrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.enrollmentRepository),
                subjectEnrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.subjectEnrollmentRepository),
                studentAcademicDataRepository: c.resolve(REPOSITORIOS_TOKENS.studentAcademicDataRepository),
                parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
                courseRepository: c.resolve(REPOSITORIOS_TOKENS.courseRepository),
                teacherAssignmentRepository: c.resolve(REPOSITORIOS_TOKENS.teacherAssignmentRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                managementPlanRepository: c.resolve(REPOSITORIOS_TOKENS.managementPlanRepository),
                studyPlanRepository: c.resolve(REPOSITORIOS_TOKENS.studyPlanRepository),
                planSubjectRepository: c.resolve(REPOSITORIOS_TOKENS.planSubjectRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

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

    registerComponent(
        container,
        INSCRIPCIONES_TOKENS.deleteEnrollmentController,
        (c) =>
            new DeleteEnrollmentController({
                deleteEnrollmentUseCase: c.resolve(INSCRIPCIONES_TOKENS.deleteEnrollmentUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        INSCRIPCIONES_TOKENS.generateFormularioInscripcionController,
        (c) =>
            new GenerateFormularioInscripcionController({
                generateFormularioInscripcionUseCase: c.resolve(INSCRIPCIONES_TOKENS.generateFormularioInscripcionUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        INSCRIPCIONES_TOKENS.updateEnrollmentController,
        (c) =>
            new UpdateEnrollmentController({
                updateEnrollmentUseCase: c.resolve(INSCRIPCIONES_TOKENS.updateEnrollmentUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

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
                deleteEnrollmentController: c.resolve(INSCRIPCIONES_TOKENS.deleteEnrollmentController),
                generateFormularioInscripcionController: c.resolve(INSCRIPCIONES_TOKENS.generateFormularioInscripcionController),
                updateEnrollmentController: c.resolve(INSCRIPCIONES_TOKENS.updateEnrollmentController),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildInscripcionesRouter({ controllers, middlewares });
        }
    );

    return container;
}
