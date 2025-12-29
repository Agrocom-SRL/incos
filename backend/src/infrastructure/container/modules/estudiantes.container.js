/**
 * Registro de dependencias del módulo Estudiantes (EST)
 * 
 * Responsabilidades:
 * - Registrar Use Cases con sus dependencias (repositorios, logger)
 * - Registrar Controllers vinculados a Use Cases
 * - Construir y registrar el router del módulo con middlewares
 * 
 * Nota: Los repositorios y servicios base se registran en sus propios containers.
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con módulo de estudiantes registrado
 */

import { TOKENS } from '../tokens.js';

// ============================================
// USE CASES
// ============================================
import { RegisterStudentUseCase } from '../../../application/use-cases/estudiantes/RegisterStudentUseCase.js';
import { ListStudentsUseCase } from '../../../application/use-cases/estudiantes/ListStudentsUseCase.js';
import { UploadDocumentUseCase } from '../../../application/use-cases/estudiantes/UploadDocumentUseCase.js';
import { GenerateCompromisoActaUseCase } from '../../../application/use-cases/estudiantes/GenerateCompromisoActaUseCase.js';

// ============================================
// CONTROLLERS
// ============================================
import {
    CreateStudentController,
    ListStudentsController,
} from '../../../presentation/controllers/estudiantes/index.js';

import { UploadDocumentController } from '../../../presentation/controllers/estudiantes/upload-document.controller.js';
import { GetStudentDocumentsController } from '../../../presentation/controllers/estudiantes/get-documents.controller.js';
import { GetStudentDocumentDeliveriesController } from '../../../presentation/controllers/estudiantes/get-document-deliveries.controller.js';
import { GetStudentAcademicDataController } from '../../../presentation/controllers/estudiantes/get-academic-data.controller.js';
import { GetStudentByIdController } from '../../../presentation/controllers/estudiantes/get-by-id.controller.js'
import { GenerateCompromisoActaController } from '../../../presentation/controllers/estudiantes/generate-compromiso-acta.controller.js';

// ============================================
// ROUTER BUILDER
// ============================================
import { buildStudentRouter } from '../../../presentation/routes/student.routes.js';

/**
 * Registra el módulo de Estudiantes en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerEstudiantesModule(container) {
    // ============================================
    // USE CASES
    // ============================================
    container.register(
        TOKENS.est_registerStudentUseCase,
        (c) =>
            new RegisterStudentUseCase({
                studentRepository: c.resolve(TOKENS.studentRepository),
                studentAcademicDataRepository: c.resolve(TOKENS.studentAcademicDataRepository),
                studentDocumentRepository: c.resolve(TOKENS.studentDocumentRepository),
                studentDocumentDeliveryRepository: c.resolve(TOKENS.studentDocumentDeliveryRepository),
                studentDisabilityRepository: c.resolve(TOKENS.studentDisabilityRepository),
                studentOriginRepository: c.resolve(TOKENS.studentOriginRepository),
                studentGuardianRepository: c.resolve(TOKENS.studentGuardianRepository),
                documentacionRepository: c.resolve(TOKENS.documentacionRepository),
                configuracionSistemaRepository: c.resolve(TOKENS.configuracionSistemaRepository),
                managementRepository: c.resolve(TOKENS.managementRepository),
                generateCompromisoActaUseCase: c.resolve(TOKENS.est_generateActaUseCase),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    container.register(
        TOKENS.est_listStudentsUseCase,
        (c) =>
            new ListStudentsUseCase({
                studentRepository: c.resolve(TOKENS.studentRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    container.register(
        TOKENS.est_uploadDocumentUseCase,
        (c) =>
            new UploadDocumentUseCase({
                studentRepository: c.resolve(TOKENS.studentRepository),
                documentacionRepository: c.resolve(TOKENS.documentacionRepository),
                studentDocumentRepository: c.resolve(TOKENS.studentDocumentRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    container.register(
        TOKENS.est_generateActaUseCase,
        (c) =>
            new GenerateCompromisoActaUseCase({
                studentRepository: c.resolve(TOKENS.studentRepository),
                documentacionRepository: c.resolve(TOKENS.documentacionRepository),
                studentAcademicDataRepository: c.resolve(TOKENS.studentAcademicDataRepository),
                studentDocumentRepository: c.resolve(TOKENS.studentDocumentRepository),
                careerRepository: c.resolve(TOKENS.careerRepository),
                managementRepository: c.resolve(TOKENS.managementRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // ============================================
    // CONTROLLERS
    // ============================================
    container.register(
        TOKENS.est_createStudentController,
        (c) =>
            new CreateStudentController({
                registerStudentUseCase: c.resolve(TOKENS.est_registerStudentUseCase),
            }),
        { singleton: true }
    );

    container.register(
        TOKENS.est_listStudentsController,
        (c) =>
            new ListStudentsController({
                listStudentsUseCase: c.resolve(TOKENS.est_listStudentsUseCase),
            }),
        { singleton: true }
    );

    container.register(
        TOKENS.est_uploadDocumentController,
        (c) =>
            new UploadDocumentController({
                uploadDocumentUseCase: c.resolve(TOKENS.est_uploadDocumentUseCase),
            }),
        { singleton: true }
    );

    container.register(
        TOKENS.est_getStudentByIdController,
        () => new GetStudentByIdController({
            getStudentByIdUseCase: null, // TODO
        }),
        { singleton: true }
    );


    // Controllers sin dependencias (pueden necesitar repositorios en el futuro)
    container.register(
        TOKENS.est_getDocumentsController,
        () => new GetStudentDocumentsController(),
        { singleton: true }
    );

    container.register(
        TOKENS.est_getDocumentDeliveriesController,
        () => new GetStudentDocumentDeliveriesController(),
        { singleton: true }
    );

    container.register(
        TOKENS.est_getAcademicDataController,
        () => new GetStudentAcademicDataController(),
        { singleton: true }
    );

    container.register(
        TOKENS.est_generateActaController,
        (c) =>
            new GenerateCompromisoActaController({
                generateCompromisoActaUseCase: c.resolve(TOKENS.est_generateActaUseCase),
            }),
        { singleton: true }
    );

    // ============================================
    // ROUTER
    // ============================================
    container.register(
        TOKENS.est_router,
        (c) => {
            // Resolver todos los controllers
            const controllers = {
                createStudentController: c.resolve(TOKENS.est_createStudentController),
                listStudentsController: c.resolve(TOKENS.est_listStudentsController),
                uploadDocumentController: c.resolve(TOKENS.est_uploadDocumentController),
                getStudentByIdController: c.resolve(TOKENS.est_getStudentByIdController),
                getStudentDocumentsController: c.resolve(TOKENS.est_getDocumentsController),
                getStudentDocumentDeliveriesController: c.resolve(TOKENS.est_getDocumentDeliveriesController),
                getStudentAcademicDataController: c.resolve(TOKENS.est_getAcademicDataController),
                generateCompromisoActaController: c.resolve(TOKENS.est_generateActaController),
            };

            // Resolver middlewares (servicios de infraestructura)
            const middlewares = {
                uploadStudentDocument: c.resolve(TOKENS.fileUploadService).uploadStudentDocument(),
            };

            // Construir router con inyección de dependencias
            return buildStudentRouter({ controllers, middlewares });
        },
        { singleton: true }
    );

    return container;
}