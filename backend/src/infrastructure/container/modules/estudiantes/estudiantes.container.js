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

import { ESTUDIANTES_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListStudentsUseCase, RegisterStudentUseCase, GetStudentByIdUseCase, SearchStudentUseCase, GenerateActaCompromisoUseCase } from '../../../../application/use-cases/estudiantes/index.js';
import { ListStudentsController, RegisterStudentController, GetStudentByIdController, SearchStudentController, ActaCompromisoController } from '../../../../presentation/controllers/estudiantes/index.js';
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
    registerComponent(
        container,
        ESTUDIANTES_TOKENS.listStudentsUseCase,
        (c) =>
            new ListStudentsUseCase({
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.registerStudentUseCase,
        (c) =>
            new RegisterStudentUseCase({
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                studentGuardianRepository: c.resolve(REPOSITORIOS_TOKENS.studentGuardianRepository),
                studentDisabilityRepository: c.resolve(REPOSITORIOS_TOKENS.studentDisabilityRepository),
                studentOriginRepository: c.resolve(REPOSITORIOS_TOKENS.studentOriginRepository),
                studentDocumentDeliveryRepository: c.resolve(REPOSITORIOS_TOKENS.studentDocumentDeliveryRepository),
                configuracionSistemaRepository: c.resolve(REPOSITORIOS_TOKENS.configuracionSistemaRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.getStudentByIdUseCase,
        (c) =>
            new GetStudentByIdUseCase({
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                studentGuardianRepository: c.resolve(REPOSITORIOS_TOKENS.studentGuardianRepository),
                studentDisabilityRepository: c.resolve(REPOSITORIOS_TOKENS.studentDisabilityRepository),
                studentOriginRepository: c.resolve(REPOSITORIOS_TOKENS.studentOriginRepository),
                studentDocumentDeliveryRepository: c.resolve(REPOSITORIOS_TOKENS.studentDocumentDeliveryRepository),
                countryRepository: c.resolve(REPOSITORIOS_TOKENS.countryRepository),
                departmentRepository: c.resolve(REPOSITORIOS_TOKENS.departmentRepository),
                provinceRepository: c.resolve(REPOSITORIOS_TOKENS.provinceRepository),
                municipalityRepository: c.resolve(REPOSITORIOS_TOKENS.municipalityRepository),
                languageRepository: c.resolve(REPOSITORIOS_TOKENS.languageRepository),
                civilStatusRepository: c.resolve(REPOSITORIOS_TOKENS.civilStatusRepository),
                disabilityTypeRepository: c.resolve(REPOSITORIOS_TOKENS.disabilityTypeRepository),
                relationshipTypeRepository: c.resolve(REPOSITORIOS_TOKENS.relationshipTypeRepository),
                documentacionRepository: c.resolve(REPOSITORIOS_TOKENS.documentacionRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.searchStudentUseCase,
        (c) =>
            new SearchStudentUseCase({
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.generateActaCompromisoUseCase,
        (c) =>
            new GenerateActaCompromisoUseCase({
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                documentacionRepository: c.resolve(REPOSITORIOS_TOKENS.documentacionRepository),
                studentDocumentDeliveryRepository: c.resolve(REPOSITORIOS_TOKENS.studentDocumentDeliveryRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        ESTUDIANTES_TOKENS.listStudentsController,
        (c) =>
            new ListStudentsController({
                listStudentsUseCase: c.resolve(ESTUDIANTES_TOKENS.listStudentsUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.registerStudentController,
        (c) =>
            new RegisterStudentController({
                registerStudentUseCase: c.resolve(ESTUDIANTES_TOKENS.registerStudentUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.getStudentByIdController,
        (c) =>
            new GetStudentByIdController({
                getStudentByIdUseCase: c.resolve(ESTUDIANTES_TOKENS.getStudentByIdUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.searchStudentController,
        (c) =>
            new SearchStudentController({
                searchStudentUseCase: c.resolve(ESTUDIANTES_TOKENS.searchStudentUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.actaCompromisoController,
        (c) =>
            new ActaCompromisoController({
                generateActaCompromisoUseCase: c.resolve(ESTUDIANTES_TOKENS.generateActaCompromisoUseCase),
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
        ESTUDIANTES_TOKENS.estudiantesRouter,
        (c) => {
            const controllers = {
                listStudentsController: c.resolve(ESTUDIANTES_TOKENS.listStudentsController),
                registerStudentController: c.resolve(ESTUDIANTES_TOKENS.registerStudentController),
                getStudentByIdController: c.resolve(ESTUDIANTES_TOKENS.getStudentByIdController),
                searchStudentController: c.resolve(ESTUDIANTES_TOKENS.searchStudentController),
                actaCompromisoController: c.resolve(ESTUDIANTES_TOKENS.actaCompromisoController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
                // updateStudentController: c.resolve(ESTUDIANTES_TOKENS.updateStudentController),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
                // uploadStudentDocument: c.resolve(SERVICIOS_TOKENS.fileUploadService).uploadStudentDocument(),
            };

            return buildEstudiantesRouter({ controllers, middlewares });
        }
    );

    return container;
}

