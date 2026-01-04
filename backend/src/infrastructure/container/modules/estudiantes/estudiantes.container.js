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
import { ListStudentsController } from '../../../../presentation/controllers/estudiantes/index.js';
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

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints
    // container.register(
    //     TOKENS.est_registerStudentUseCase,
    //     (c) => new RegisterStudentUseCase({
    //         studentRepository: c.resolve(TOKENS.studentRepository),
    //         studentAcademicDataRepository: c.resolve(TOKENS.studentAcademicDataRepository),
    //         studentDocumentRepository: c.resolve(TOKENS.studentDocumentRepository),
    //         studentDocumentDeliveryRepository: c.resolve(TOKENS.studentDocumentDeliveryRepository),
    //         studentDisabilityRepository: c.resolve(TOKENS.studentDisabilityRepository),
    //         studentOriginRepository: c.resolve(TOKENS.studentOriginRepository),
    //         studentGuardianRepository: c.resolve(TOKENS.studentGuardianRepository),
    //         documentacionRepository: c.resolve(TOKENS.documentacionRepository),
    //         configuracionSistemaRepository: c.resolve(TOKENS.configuracionSistemaRepository),
    //         managementRepository: c.resolve(TOKENS.managementRepository),
    //         generateCompromisoActaUseCase: c.resolve(TOKENS.est_generateCompromisoActaUseCase),
    //         studentValidator: c.resolve(TOKENS.est_studentValidator),
    //         logger: c.resolve(TOKENS.logger),
    //     }),
    //     { singleton: true }
    // );

    // ============================================
    // CONTROLLERS
    // ============================================
    container.register(
        TOKENS.est_listStudentsController,
        (c) =>
            new ListStudentsController({
                listStudentsUseCase: c.resolve(TOKENS.est_listStudentsUseCase),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Controllers cuando se implementen sus endpoints
    // container.register(
    //     TOKENS.est_registerStudentController,
    //     (c) => new RegisterStudentController({
    //         registerStudentUseCase: c.resolve(TOKENS.est_registerStudentUseCase),
    //         logger: c.resolve(TOKENS.logger),
    //     }),
    //     { singleton: true }
    // );

    // ============================================
    // ROUTER
    // ============================================
    container.register(
        TOKENS.est_estudiantesRouter,
        (c) => {
            const controllers = {
                listStudentsController: c.resolve(TOKENS.est_listStudentsController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
                // registerStudentController: c.resolve(TOKENS.est_registerStudentController),
                // getStudentByIdController: c.resolve(TOKENS.est_getStudentByIdController),
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

