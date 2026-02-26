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

import { ESTUDIANTES_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS, INSCRIPCIONES_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListStudentsUseCase, RegisterStudentUseCase, UpdateStudentUseCase, GetStudentByIdUseCase, SearchStudentUseCase, GenerateActaCompromisoUseCase, CreateStudentScholarshipUseCase, DeleteStudentScholarshipUseCase, DeleteStudentUseCase } from '../../../../application/use-cases/estudiantes/index.js';
import { GetStudentScholarshipsByStudentIdUseCase } from '../../../../application/use-cases/estudiantes/becas/GetStudentScholarshipsByStudentIdUseCase.js';
import { ListStudentScholarshipsUseCase } from '../../../../application/use-cases/estudiantes/becas/ListStudentScholarshipsUseCase.js';
import { ListStudentsController, RegisterStudentController, UpdateStudentController, GetStudentByIdController, SearchStudentController, ActaCompromisoController, AsignarBecaController, DeleteStudentScholarshipController, DeleteStudentController } from '../../../../presentation/controllers/estudiantes/index.js';
import { GetStudentScholarshipsController } from '../../../../presentation/controllers/estudiantes/becas/get-scholarships.controller.js';
import { ListStudentScholarshipsController } from '../../../../presentation/controllers/estudiantes/becas/list-student-scholarships.controller.js';
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
                studentAcademicDataRepository: c.resolve(REPOSITORIOS_TOKENS.studentAcademicDataRepository),
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
                contributionPaymentRepository: c.resolve(REPOSITORIOS_TOKENS.contributionPaymentRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                contributionConfigurationRepository: c.resolve(REPOSITORIOS_TOKENS.contributionConfigurationRepository),
                studentAcademicDataRepository: c.resolve(REPOSITORIOS_TOKENS.studentAcademicDataRepository),
                institutionRepository: c.resolve(REPOSITORIOS_TOKENS.institutionRepository),
                transitabilityRepository: c.resolve(REPOSITORIOS_TOKENS.transitabilityRepository),
                transferRepository: c.resolve(REPOSITORIOS_TOKENS.transferRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.updateStudentUseCase,
        (c) =>
            new UpdateStudentUseCase({
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                studentGuardianRepository: c.resolve(REPOSITORIOS_TOKENS.studentGuardianRepository),
                studentDisabilityRepository: c.resolve(REPOSITORIOS_TOKENS.studentDisabilityRepository),
                studentOriginRepository: c.resolve(REPOSITORIOS_TOKENS.studentOriginRepository),
                studentDocumentDeliveryRepository: c.resolve(REPOSITORIOS_TOKENS.studentDocumentDeliveryRepository),
                studentAcademicDataRepository: c.resolve(REPOSITORIOS_TOKENS.studentAcademicDataRepository),
                configuracionSistemaRepository: c.resolve(REPOSITORIOS_TOKENS.configuracionSistemaRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
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
                studentScholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.studentScholarshipRepository),
                scholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.scholarshipRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                studentDocumentRepository: c.resolve(REPOSITORIOS_TOKENS.studentDocumentRepository),
                studentAcademicDataRepository: c.resolve(REPOSITORIOS_TOKENS.studentAcademicDataRepository),
                enrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.enrollmentRepository),
                getEnrollmentByIdUseCase: c.resolve(INSCRIPCIONES_TOKENS.getEnrollmentByIdUseCase),
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
                studentDocumentRepository: c.resolve(REPOSITORIOS_TOKENS.studentDocumentRepository),
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
        ESTUDIANTES_TOKENS.createStudentScholarshipUseCase,
        (c) =>
            new CreateStudentScholarshipUseCase({
                studentScholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.studentScholarshipRepository),
                configuracionSistemaRepository: c.resolve(REPOSITORIOS_TOKENS.configuracionSistemaRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                scholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.scholarshipRepository),
                contributionConfigurationRepository: c.resolve(REPOSITORIOS_TOKENS.contributionConfigurationRepository),
                contributionPaymentRepository: c.resolve(REPOSITORIOS_TOKENS.contributionPaymentRepository),
                contributionPaymentInstallmentRepository: c.resolve(REPOSITORIOS_TOKENS.contributionPaymentInstallmentRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.deleteStudentScholarshipUseCase,
        (c) =>
            new DeleteStudentScholarshipUseCase({
                studentScholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.studentScholarshipRepository),
                contributionPaymentRepository: c.resolve(REPOSITORIOS_TOKENS.contributionPaymentRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.getStudentScholarshipsByStudentIdUseCase,
        (c) =>
            new GetStudentScholarshipsByStudentIdUseCase({
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                studentScholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.studentScholarshipRepository),
                scholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.scholarshipRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.listStudentScholarshipsUseCase,
        (c) =>
            new ListStudentScholarshipsUseCase({
                studentScholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.studentScholarshipRepository),
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                scholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.scholarshipRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.deleteStudentUseCase,
        (c) =>
            new DeleteStudentUseCase({
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                studentGuardianRepository: c.resolve(REPOSITORIOS_TOKENS.studentGuardianRepository),
                studentDisabilityRepository: c.resolve(REPOSITORIOS_TOKENS.studentDisabilityRepository),
                studentOriginRepository: c.resolve(REPOSITORIOS_TOKENS.studentOriginRepository),
                studentDocumentDeliveryRepository: c.resolve(REPOSITORIOS_TOKENS.studentDocumentDeliveryRepository),
                studentDocumentRepository: c.resolve(REPOSITORIOS_TOKENS.studentDocumentRepository),
                studentAcademicDataRepository: c.resolve(REPOSITORIOS_TOKENS.studentAcademicDataRepository),
                enrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.enrollmentRepository),
                contributionPaymentRepository: c.resolve(REPOSITORIOS_TOKENS.contributionPaymentRepository),
                contributionPaymentInstallmentRepository: c.resolve(REPOSITORIOS_TOKENS.contributionPaymentInstallmentRepository),
                studentScholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.studentScholarshipRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

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
        ESTUDIANTES_TOKENS.updateStudentController,
        (c) =>
            new UpdateStudentController({
                updateStudentUseCase: c.resolve(ESTUDIANTES_TOKENS.updateStudentUseCase),
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

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.asignarBecaController,
        (c) =>
            new AsignarBecaController({
                createStudentScholarshipUseCase: c.resolve(ESTUDIANTES_TOKENS.createStudentScholarshipUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.deleteStudentScholarshipController,
        (c) =>
            new DeleteStudentScholarshipController({
                deleteStudentScholarshipUseCase: c.resolve(ESTUDIANTES_TOKENS.deleteStudentScholarshipUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.getStudentScholarshipsController,
        (c) =>
            new GetStudentScholarshipsController({
                getStudentScholarshipsByStudentIdUseCase: c.resolve(ESTUDIANTES_TOKENS.getStudentScholarshipsByStudentIdUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.listStudentScholarshipsController,
        (c) =>
            new ListStudentScholarshipsController({
                listStudentScholarshipsUseCase: c.resolve(ESTUDIANTES_TOKENS.listStudentScholarshipsUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.deleteStudentController,
        (c) =>
            new DeleteStudentController({
                deleteStudentUseCase: c.resolve(ESTUDIANTES_TOKENS.deleteStudentUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

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
                updateStudentController: c.resolve(ESTUDIANTES_TOKENS.updateStudentController),
                getStudentByIdController: c.resolve(ESTUDIANTES_TOKENS.getStudentByIdController),
                searchStudentController: c.resolve(ESTUDIANTES_TOKENS.searchStudentController),
                actaCompromisoController: c.resolve(ESTUDIANTES_TOKENS.actaCompromisoController),
                asignarBecaController: c.resolve(ESTUDIANTES_TOKENS.asignarBecaController),
                deleteStudentScholarshipController: c.resolve(ESTUDIANTES_TOKENS.deleteStudentScholarshipController),
                getStudentScholarshipsController: c.resolve(ESTUDIANTES_TOKENS.getStudentScholarshipsController),
                listStudentScholarshipsController: c.resolve(ESTUDIANTES_TOKENS.listStudentScholarshipsController),
                deleteStudentController: c.resolve(ESTUDIANTES_TOKENS.deleteStudentController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
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

