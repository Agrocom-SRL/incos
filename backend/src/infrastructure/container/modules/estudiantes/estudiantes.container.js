/**
 * Registro de dependencias del recurso Estudiantes (CRUD básico)
 * 
 * Responsabilidades:
 * - Registrar Use Cases del recurso Estudiantes (List, Register, GetById, Update, Delete)
 * - Registrar Controllers del recurso Estudiantes
 * - Construir y registrar el router del recurso Estudiantes
 * 
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Estudiantes registrado
 */

import { TOKENS } from '../../tokens.js';
import { ListStudentsUseCase } from '../../../../application/use-cases/estudiantes/ListStudentsUseCase.js';
import { RegisterStudentUseCase } from '../../../../application/use-cases/estudiantes/RegisterStudentUseCase.js';
import { GetStudentByIdUseCase } from '../../../../application/use-cases/estudiantes/GetStudentByIdUseCase.js';
import { ListStudentsController, RegisterStudentController, GetStudentByIdController } from '../../../../presentation/controllers/estudiantes/index.js';
import { buildEstudiantesRouter } from '../../../../presentation/routes/estudiantes.routes.js';

/**
 * Registra el recurso Estudiantes en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerEstudiantesResource(container) {
    // ============================================
    // USE CASES
    // ============================================
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
        TOKENS.est_registerStudentUseCase,
        (c) =>
            new RegisterStudentUseCase({
                studentRepository: c.resolve(TOKENS.studentRepository),
                studentGuardianRepository: c.resolve(TOKENS.studentGuardianRepository),
                studentDisabilityRepository: c.resolve(TOKENS.studentDisabilityRepository),
                studentOriginRepository: c.resolve(TOKENS.studentOriginRepository),
                studentDocumentDeliveryRepository: c.resolve(TOKENS.studentDocumentDeliveryRepository),
                configuracionSistemaRepository: c.resolve(TOKENS.configuracionSistemaRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    container.register(
        TOKENS.est_getStudentByIdUseCase,
        (c) =>
            new GetStudentByIdUseCase({
                studentRepository: c.resolve(TOKENS.studentRepository),
                studentGuardianRepository: c.resolve(TOKENS.studentGuardianRepository),
                studentDisabilityRepository: c.resolve(TOKENS.studentDisabilityRepository),
                studentOriginRepository: c.resolve(TOKENS.studentOriginRepository),
                studentDocumentDeliveryRepository: c.resolve(TOKENS.studentDocumentDeliveryRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints

    // ============================================
    // CONTROLLERS
    // ============================================
    container.register(
        TOKENS.est_listStudentsController,
        (c) =>
            new ListStudentsController({
                listStudentsUseCase: c.resolve(TOKENS.est_listStudentsUseCase),
                logger: c.resolve(TOKENS.logger),
                responseFormatter: c.resolve(TOKENS.responseFormatter),
            }),
        { singleton: true }
    );

    container.register(
        TOKENS.est_registerStudentController,
        (c) =>
            new RegisterStudentController({
                registerStudentUseCase: c.resolve(TOKENS.est_registerStudentUseCase),
                logger: c.resolve(TOKENS.logger),
                responseFormatter: c.resolve(TOKENS.responseFormatter),
            }),
        { singleton: true }
    );

    container.register(
        TOKENS.est_getStudentByIdController,
        (c) =>
            new GetStudentByIdController({
                getStudentByIdUseCase: c.resolve(TOKENS.est_getStudentByIdUseCase),
                logger: c.resolve(TOKENS.logger),
                responseFormatter: c.resolve(TOKENS.responseFormatter),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Controllers cuando se implementen sus endpoints

    // ============================================
    // ROUTER
    // ============================================
    container.register(
        TOKENS.est_estudiantesRouter,
        (c) => {
            const controllers = {
                listStudentsController: c.resolve(TOKENS.est_listStudentsController),
                registerStudentController: c.resolve(TOKENS.est_registerStudentController),
                getStudentByIdController: c.resolve(TOKENS.est_getStudentByIdController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
                // updateStudentController: c.resolve(TOKENS.est_updateStudentController),
            };

            const middlewares = {
                validateRequest: c.resolve(TOKENS.validateRequest),
                // uploadStudentDocument: c.resolve(TOKENS.fileUploadService).uploadStudentDocument(),
            };

            return buildEstudiantesRouter({ controllers, middlewares });
        },
        { singleton: true }
    );

    return container;
}

