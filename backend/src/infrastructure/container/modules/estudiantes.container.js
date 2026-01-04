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
// VALIDATORS
// ============================================
import { StudentValidator } from '../../../application/validators/StudentValidator.js';

// ============================================
// USE CASES
// ============================================
import { ListStudentsUseCase } from '../../../application/use-cases/estudiantes/ListStudentsUseCase.js';
// TODO: Agregar otros Use Cases cuando se implementen sus endpoints
// import { RegisterStudentUseCase } from '../../../application/use-cases/estudiantes/RegisterStudentUseCase.js';
// import { GetStudentByIdUseCase } from '../../../application/use-cases/estudiantes/GetStudentByIdUseCase.js';
// import { UpdateStudentUseCase } from '../../../application/use-cases/estudiantes/UpdateStudentUseCase.js';

// ============================================
// CONTROLLERS
// ============================================
import { ListStudentsController } from '../../../presentation/controllers/estudiantes/index.js';
// TODO: Agregar otros Controllers cuando se implementen sus endpoints
// import { CreateStudentController } from '../../../presentation/controllers/estudiantes/create.controller.js';
// import { GetStudentByIdController } from '../../../presentation/controllers/estudiantes/get-by-id.controller.js';
// import { UpdateStudentController } from '../../../presentation/controllers/estudiantes/update.controller.js';

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
    // VALIDATORS
    // ============================================
    container.register(
        TOKENS.est_studentValidator,
        (c) =>
            new StudentValidator({
                studentRepository: c.resolve(TOKENS.studentRepository),
            }),
        { singleton: true }
    );

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
    //         studentValidator: c.resolve(TOKENS.est_studentValidator),
    //         logger: c.resolve(TOKENS.logger),
    //         // ... otras dependencias
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
    //     TOKENS.est_createStudentController,
    //     (c) => new CreateStudentController({ ... }),
    //     { singleton: true }
    // );

    // ============================================
    // ROUTERS
    // ============================================
    
    // Router de Estudiantes
    container.register(
        TOKENS.est_estudiantesRouter,
        (c) => {
            // Resolver solo los controllers que se usan en las rutas actuales
            const controllers = {
                listStudentsController: c.resolve(TOKENS.est_listStudentsController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
                // createStudentController: c.resolve(TOKENS.est_createStudentController),
                // getStudentByIdController: c.resolve(TOKENS.est_getStudentByIdController),
                // updateStudentController: c.resolve(TOKENS.est_updateStudentController),
            };

            // Resolver middlewares (servicios de infraestructura)
            const middlewares = {
                // uploadStudentDocument: c.resolve(TOKENS.fileUploadService).uploadStudentDocument(),
            };

            // Construir router con inyección de dependencias
            return buildStudentRouter({ controllers, middlewares });
        },
        { singleton: true }
    );

    return container;
}