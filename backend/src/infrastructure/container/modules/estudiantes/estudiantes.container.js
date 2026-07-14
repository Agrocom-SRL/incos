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

import { ESTUDIANTES_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS, INSCRIPCIONES_TOKENS, ACADEMICO_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListStudentsUseCase, RegisterStudentUseCase, UpdateStudentUseCase, GetStudentByIdUseCase, GetMisDatosEstudianteUseCase, GetMiMatriculaEstudianteUseCase, SearchStudentUseCase, SearchStudentsForInscripcionUseCase, GenerateActaCompromisoUseCase, GenerateDeclaracionJuradaUseCase, CreateStudentScholarshipUseCase, DeleteStudentScholarshipUseCase, DeleteStudentUseCase, ExportStudentEnrollmentStatisticsExcelUseCase, ExportStudentEnrollmentStudentListExcelUseCase, SearchStudentsForBecaAsignacionUseCase, GetStudentScholarshipByIdUseCase } from '../../../../application/use-cases/estudiantes/index.js';
import { GetStudentScholarshipsByStudentIdUseCase } from '../../../../application/use-cases/estudiantes/becas/GetStudentScholarshipsByStudentIdUseCase.js';
import { GetHistorialAcademicoUseCase } from '../../../../application/use-cases/estudiantes/GetHistorialAcademicoUseCase.js';
import { ExportHistorialAcademicoExcelUseCase } from '../../../../application/use-cases/estudiantes/ExportHistorialAcademicoExcelUseCase.js';
import { ExportHistorialAcademicoPdfUseCase } from '../../../../application/use-cases/estudiantes/ExportHistorialAcademicoPdfUseCase.js';
import { GetHistorialAcademicoController } from '../../../../presentation/controllers/estudiantes/estudiantes/get-historial-academico.controller.js';
import { ExportHistorialAcademicoExcelController } from '../../../../presentation/controllers/estudiantes/estudiantes/export-historial-academico-excel.controller.js';
import { ExportHistorialAcademicoPdfController } from '../../../../presentation/controllers/estudiantes/estudiantes/export-historial-academico-pdf.controller.js';
import { ListStudentScholarshipsUseCase } from '../../../../application/use-cases/estudiantes/becas/ListStudentScholarshipsUseCase.js';
import { ListStudentsController, RegisterStudentController, UpdateStudentController, GetStudentByIdController, GetMisDatosEstudianteController, GetMiMatriculaEstudianteController, SearchStudentController, SearchStudentsForInscripcionController, ActaCompromisoController, DeclaracionJuradaController, AsignarBecaController, DeleteStudentScholarshipController, DeleteStudentController, ExportEstadisticaInscritosExcelController, ExportListaInscritosPorCarreraExcelController, SearchStudentsForBecaAsignacionController, GetStudentScholarshipByIdController } from '../../../../presentation/controllers/estudiantes/index.js';
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
                configuracionSistemaRepository: c.resolve(REPOSITORIOS_TOKENS.systemConfigurationRepository),
                contributionPaymentRepository: c.resolve(REPOSITORIOS_TOKENS.contributionPaymentRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                contributionConfigurationRepository: c.resolve(REPOSITORIOS_TOKENS.contributionConfigurationRepository),
                studentAcademicDataRepository: c.resolve(REPOSITORIOS_TOKENS.studentAcademicDataRepository),
                institutionRepository: c.resolve(REPOSITORIOS_TOKENS.institutionRepository),
                transitabilityRepository: c.resolve(REPOSITORIOS_TOKENS.transitabilityRepository),
                transferRepository: c.resolve(REPOSITORIOS_TOKENS.transferRepository),
                documentacionRepository: c.resolve(REPOSITORIOS_TOKENS.documentationRepository),
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
                configuracionSistemaRepository: c.resolve(REPOSITORIOS_TOKENS.systemConfigurationRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                institutionRepository: c.resolve(REPOSITORIOS_TOKENS.institutionRepository),
                transitabilityRepository: c.resolve(REPOSITORIOS_TOKENS.transitabilityRepository),
                transferRepository: c.resolve(REPOSITORIOS_TOKENS.transferRepository),
                documentacionRepository: c.resolve(REPOSITORIOS_TOKENS.documentationRepository),
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
                documentacionRepository: c.resolve(REPOSITORIOS_TOKENS.documentationRepository),
                studentScholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.studentScholarshipRepository),
                scholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.scholarshipRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                careerRepository: c.resolve(REPOSITORIOS_TOKENS.careerRepository),
                studentDocumentRepository: c.resolve(REPOSITORIOS_TOKENS.studentDocumentRepository),
                studentAcademicDataRepository: c.resolve(REPOSITORIOS_TOKENS.studentAcademicDataRepository),
                enrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.enrollmentRepository),
                getEnrollmentByIdUseCase: c.resolve(INSCRIPCIONES_TOKENS.getEnrollmentByIdUseCase),
                institutionRepository: c.resolve(REPOSITORIOS_TOKENS.institutionRepository),
                transitabilityRepository: c.resolve(REPOSITORIOS_TOKENS.transitabilityRepository),
                transferRepository: c.resolve(REPOSITORIOS_TOKENS.transferRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.getMisDatosEstudianteUseCase,
        (c) =>
            new GetMisDatosEstudianteUseCase({
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
                getStudentByIdUseCase: c.resolve(ESTUDIANTES_TOKENS.getStudentByIdUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.getMiMatriculaEstudianteUseCase,
        (c) =>
            new GetMiMatriculaEstudianteUseCase({
                calificacionCentralizadorRepository: c.resolve(
                    REPOSITORIOS_TOKENS.calificacionCentralizadorRepository
                ),
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
                parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
                getParaleloGestionGrillaHorarioUseCase: c.resolve(
                    ACADEMICO_TOKENS.getParaleloGestionGrillaHorarioUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.searchStudentUseCase,
        (c) =>
            new SearchStudentUseCase({
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                studentAcademicDataRepository: c.resolve(REPOSITORIOS_TOKENS.studentAcademicDataRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.searchStudentsForBecaAsignacionUseCase,
        (c) =>
            new SearchStudentsForBecaAsignacionUseCase({
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.searchStudentsForInscripcionUseCase,
        (c) =>
            new SearchStudentsForInscripcionUseCase({
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
                studentAcademicDataRepository: c.resolve(REPOSITORIOS_TOKENS.studentAcademicDataRepository),
                configuracionSistemaRepository: c.resolve(REPOSITORIOS_TOKENS.systemConfigurationRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                pdfGenerator: c.resolve(SERVICIOS_TOKENS.pdfGenerator),
                uploadsStorage: c.resolve(SERVICIOS_TOKENS.uploadsStorage),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.generateDeclaracionJuradaUseCase,
        (c) =>
            new GenerateDeclaracionJuradaUseCase({
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                studentDocumentRepository: c.resolve(REPOSITORIOS_TOKENS.studentDocumentRepository),
                enrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.enrollmentRepository),
                studentAcademicDataRepository: c.resolve(REPOSITORIOS_TOKENS.studentAcademicDataRepository),
                studentDocumentDeliveryRepository: c.resolve(REPOSITORIOS_TOKENS.studentDocumentDeliveryRepository),
                documentacionRepository: c.resolve(REPOSITORIOS_TOKENS.documentationRepository),
                configuracionSistemaRepository: c.resolve(REPOSITORIOS_TOKENS.systemConfigurationRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                transitabilityRepository: c.resolve(REPOSITORIOS_TOKENS.transitabilityRepository),
                transferRepository: c.resolve(REPOSITORIOS_TOKENS.transferRepository),
                institutionRepository: c.resolve(REPOSITORIOS_TOKENS.institutionRepository),
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
                configuracionSistemaRepository: c.resolve(REPOSITORIOS_TOKENS.systemConfigurationRepository),
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
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.getStudentScholarshipByIdUseCase,
        (c) =>
            new GetStudentScholarshipByIdUseCase({
                studentScholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.studentScholarshipRepository),
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                scholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.scholarshipRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                contributionPaymentRepository: c.resolve(REPOSITORIOS_TOKENS.contributionPaymentRepository),
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
                subjectEnrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.subjectEnrollmentRepository),
                contributionPaymentRepository: c.resolve(REPOSITORIOS_TOKENS.contributionPaymentRepository),
                contributionPaymentInstallmentRepository: c.resolve(REPOSITORIOS_TOKENS.contributionPaymentInstallmentRepository),
                studentScholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.studentScholarshipRepository),
                licenseRepository: c.resolve(REPOSITORIOS_TOKENS.licenseRepository),
                transferRepository: c.resolve(REPOSITORIOS_TOKENS.transferRepository),
                transitabilityRepository: c.resolve(REPOSITORIOS_TOKENS.transitabilityRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.exportStudentEnrollmentStatisticsExcelUseCase,
        (c) =>
            new ExportStudentEnrollmentStatisticsExcelUseCase({
                studentEnrollmentExcelReportRepository: c.resolve(
                    REPOSITORIOS_TOKENS.studentEnrollmentExcelReportRepository
                ),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.exportStudentEnrollmentStudentListExcelUseCase,
        (c) =>
            new ExportStudentEnrollmentStudentListExcelUseCase({
                studentEnrollmentStudentListExcelReportRepository: c.resolve(
                    REPOSITORIOS_TOKENS.studentEnrollmentStudentListExcelReportRepository
                ),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                careerRepository: c.resolve(REPOSITORIOS_TOKENS.careerRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.getHistorialAcademicoUseCase,
        (c) =>
            new GetHistorialAcademicoUseCase({
                historialAcademicoRepository: c.resolve(REPOSITORIOS_TOKENS.historialAcademicoRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.exportHistorialAcademicoExcelUseCase,
        (c) =>
            new ExportHistorialAcademicoExcelUseCase({
                getHistorialAcademicoUseCase: c.resolve(ESTUDIANTES_TOKENS.getHistorialAcademicoUseCase),
                historialAcademicoExcelGenerator: c.resolve(
                    SERVICIOS_TOKENS.historialAcademicoExcelGenerator
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.exportHistorialAcademicoPdfUseCase,
        (c) =>
            new ExportHistorialAcademicoPdfUseCase({
                getHistorialAcademicoUseCase: c.resolve(
                    ESTUDIANTES_TOKENS.getHistorialAcademicoUseCase
                ),
                historialAcademicoPdfGenerator: c.resolve(
                    SERVICIOS_TOKENS.historialAcademicoPdfGenerator
                ),
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
        ESTUDIANTES_TOKENS.getMisDatosEstudianteController,
        (c) =>
            new GetMisDatosEstudianteController({
                getMisDatosEstudianteUseCase: c.resolve(ESTUDIANTES_TOKENS.getMisDatosEstudianteUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.getMiMatriculaEstudianteController,
        (c) =>
            new GetMiMatriculaEstudianteController({
                getMiMatriculaEstudianteUseCase: c.resolve(ESTUDIANTES_TOKENS.getMiMatriculaEstudianteUseCase),
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
        ESTUDIANTES_TOKENS.searchStudentsForBecaAsignacionController,
        (c) =>
            new SearchStudentsForBecaAsignacionController({
                searchStudentsForBecaAsignacionUseCase: c.resolve(
                    ESTUDIANTES_TOKENS.searchStudentsForBecaAsignacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.searchStudentsForInscripcionController,
        (c) =>
            new SearchStudentsForInscripcionController({
                searchStudentsForInscripcionUseCase: c.resolve(
                    ESTUDIANTES_TOKENS.searchStudentsForInscripcionUseCase
                ),
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
        ESTUDIANTES_TOKENS.declaracionJuradaController,
        (c) =>
            new DeclaracionJuradaController({
                generateDeclaracionJuradaUseCase: c.resolve(ESTUDIANTES_TOKENS.generateDeclaracionJuradaUseCase),
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
        ESTUDIANTES_TOKENS.getStudentScholarshipByIdController,
        (c) =>
            new GetStudentScholarshipByIdController({
                getStudentScholarshipByIdUseCase: c.resolve(ESTUDIANTES_TOKENS.getStudentScholarshipByIdUseCase),
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

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.exportEstadisticaInscritosExcelController,
        (c) =>
            new ExportEstadisticaInscritosExcelController({
                exportStudentEnrollmentStatisticsExcelUseCase: c.resolve(
                    ESTUDIANTES_TOKENS.exportStudentEnrollmentStatisticsExcelUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.exportListaInscritosPorCarreraExcelController,
        (c) =>
            new ExportListaInscritosPorCarreraExcelController({
                exportStudentEnrollmentStudentListExcelUseCase: c.resolve(
                    ESTUDIANTES_TOKENS.exportStudentEnrollmentStudentListExcelUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.getHistorialAcademicoController,
        (c) =>
            new GetHistorialAcademicoController({
                getHistorialAcademicoUseCase: c.resolve(ESTUDIANTES_TOKENS.getHistorialAcademicoUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.exportHistorialAcademicoExcelController,
        (c) =>
            new ExportHistorialAcademicoExcelController({
                exportHistorialAcademicoExcelUseCase: c.resolve(
                    ESTUDIANTES_TOKENS.exportHistorialAcademicoExcelUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.exportHistorialAcademicoPdfController,
        (c) =>
            new ExportHistorialAcademicoPdfController({
                exportHistorialAcademicoPdfUseCase: c.resolve(
                    ESTUDIANTES_TOKENS.exportHistorialAcademicoPdfUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
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
                getMisDatosEstudianteController: c.resolve(ESTUDIANTES_TOKENS.getMisDatosEstudianteController),
                getMiMatriculaEstudianteController: c.resolve(ESTUDIANTES_TOKENS.getMiMatriculaEstudianteController),
                searchStudentController: c.resolve(ESTUDIANTES_TOKENS.searchStudentController),
                searchStudentsForBecaAsignacionController: c.resolve(
                    ESTUDIANTES_TOKENS.searchStudentsForBecaAsignacionController
                ),
                searchStudentsForInscripcionController: c.resolve(
                    ESTUDIANTES_TOKENS.searchStudentsForInscripcionController
                ),
                actaCompromisoController: c.resolve(ESTUDIANTES_TOKENS.actaCompromisoController),
                declaracionJuradaController: c.resolve(ESTUDIANTES_TOKENS.declaracionJuradaController),
                asignarBecaController: c.resolve(ESTUDIANTES_TOKENS.asignarBecaController),
                deleteStudentScholarshipController: c.resolve(ESTUDIANTES_TOKENS.deleteStudentScholarshipController),
                getStudentScholarshipsController: c.resolve(ESTUDIANTES_TOKENS.getStudentScholarshipsController),
                listStudentScholarshipsController: c.resolve(ESTUDIANTES_TOKENS.listStudentScholarshipsController),
                getStudentScholarshipByIdController: c.resolve(ESTUDIANTES_TOKENS.getStudentScholarshipByIdController),
                deleteStudentController: c.resolve(ESTUDIANTES_TOKENS.deleteStudentController),
                exportEstadisticaInscritosExcelController: c.resolve(
                    ESTUDIANTES_TOKENS.exportEstadisticaInscritosExcelController
                ),
                exportListaInscritosPorCarreraExcelController: c.resolve(
                    ESTUDIANTES_TOKENS.exportListaInscritosPorCarreraExcelController
                ),
                getHistorialAcademicoController: c.resolve(
                    ESTUDIANTES_TOKENS.getHistorialAcademicoController
                ),
                exportHistorialAcademicoExcelController: c.resolve(
                    ESTUDIANTES_TOKENS.exportHistorialAcademicoExcelController
                ),
                exportHistorialAcademicoPdfController: c.resolve(
                    ESTUDIANTES_TOKENS.exportHistorialAcademicoPdfController
                ),
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

