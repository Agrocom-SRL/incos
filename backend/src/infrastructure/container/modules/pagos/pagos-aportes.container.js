/**
 * Registro de dependencias del recurso Pagos de Aportes Académicos
 *
 * Responsabilidades:
 * - Registrar Use Cases del recurso Pagos de Aportes
 * - Registrar Controllers del recurso Pagos de Aportes
 * - Construir y registrar el router del recurso Pagos de Aportes
 *
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Pagos de Aportes registrado
 */

import { PAGOS_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { RegisterAporteVoluntarioUseCase } from '../../../../application/use-cases/pagos/RegisterAporteVoluntarioUseCase.js';
import { ListPagosAportesUseCase } from '../../../../application/use-cases/pagos/ListPagosAportesUseCase.js';
import { GetPaymentAporteByIdUseCase } from '../../../../application/use-cases/pagos/GetPaymentAporteByIdUseCase.js';
import { GetMiAporteDetalleEstudianteUseCase } from '../../../../application/use-cases/pagos/GetMiAporteDetalleEstudianteUseCase.js';
import { GetEstadoAporteRegistroUseCase } from '../../../../application/use-cases/pagos/GetEstadoAporteRegistroUseCase.js';
import { DeletePaymentAporteUseCase } from '../../../../application/use-cases/pagos/DeletePaymentAporteUseCase.js';
import { DeletePaymentInstallmentUseCase } from '../../../../application/use-cases/pagos/DeletePaymentInstallmentUseCase.js';
import { UpdatePaymentInstallmentUseCase } from '../../../../application/use-cases/pagos/UpdatePaymentInstallmentUseCase.js';
import { GenerateReciboPagoUseCase } from '../../../../application/use-cases/pagos/GenerateReciboPagoUseCase.js';
import { ExportPaymentAporteByCareerExcelUseCase } from '../../../../application/use-cases/pagos/ExportPaymentAporteByCareerExcelUseCase.js';
import { GetBecasPorCarreraReporteUseCase } from '../../../../application/use-cases/pagos/GetBecasPorCarreraReporteUseCase.js';
import { ExportBecasPorCarreraReporteExcelUseCase } from '../../../../application/use-cases/pagos/ExportBecasPorCarreraReporteExcelUseCase.js';
import { SearchStudentsForAporteRegistroUseCase } from '../../../../application/use-cases/pagos/SearchStudentsForAporteRegistroUseCase.js';
import { GetCompromisoByPagoAporteUseCase } from '../../../../application/use-cases/pagos/GetCompromisoByPagoAporteUseCase.js';
import { UpsertCompromisoUseCase } from '../../../../application/use-cases/pagos/UpsertCompromisoUseCase.js';
import { UpdateCompromisoUseCase } from '../../../../application/use-cases/pagos/UpdateCompromisoUseCase.js';
import { DeleteCompromisoUseCase } from '../../../../application/use-cases/pagos/DeleteCompromisoUseCase.js';
import { GetCuentasPorCobrarReporteUseCase } from '../../../../application/use-cases/pagos/GetCuentasPorCobrarReporteUseCase.js';
import { ExportCuentasPorCobrarReporteExcelUseCase } from '../../../../application/use-cases/pagos/ExportCuentasPorCobrarReporteExcelUseCase.js';
import {
    RegisterPagoAporteController,
    ListPagosAportesController,
    GetPaymentAporteByIdController,
    MisAportesController,
    MisAporteDetailController,
    GetEstadoAporteRegistroController,
    DeletePaymentAporteController,
    DeletePaymentInstallmentController,
    UpdatePaymentInstallmentController,
    GenerateReciboPagoController,
    ExportListaAportesPorCarreraExcelController,
    GetBecasPorCarreraReporteController,
    ExportBecasPorCarreraReporteExcelController,
    SearchStudentsForAporteRegistroController,
    GetCompromisoController,
    UpsertCompromisoController,
    UpdateCompromisoController,
    DeleteCompromisoController,
    GetCuentasPorCobrarReporteController,
    ExportCuentasPorCobrarReporteExcelController,
} from '../../../../presentation/controllers/pagos/index.js';
import { buildPagosAportesRouter } from '../../../../presentation/routes/pagos-aportes.routes.js';

/**
 * Registra el recurso Pagos de Aportes en el contenedor
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerPagosAportesResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    registerComponent(
        container,
        PAGOS_TOKENS.registerPagoAporteUseCase,
        (c) =>
            new RegisterAporteVoluntarioUseCase({
                contributionPaymentRepository: c.resolve(REPOSITORIOS_TOKENS.contributionPaymentRepository),
                contributionPaymentInstallmentRepository: c.resolve(REPOSITORIOS_TOKENS.contributionPaymentInstallmentRepository),
                paymentMethodRepository: c.resolve(REPOSITORIOS_TOKENS.paymentMethodRepository),
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                studentScholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.studentScholarshipRepository),
                scholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.scholarshipRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                contributionConfigurationRepository: c.resolve(REPOSITORIOS_TOKENS.contributionConfigurationRepository),
                studentDocumentRepository: c.resolve(REPOSITORIOS_TOKENS.studentDocumentRepository),
                studentDocumentDeliveryRepository: c.resolve(REPOSITORIOS_TOKENS.studentDocumentDeliveryRepository),
                upsertCompromisoUseCase: c.resolve(PAGOS_TOKENS.upsertCompromisoUseCase),
                compromisoPagoRepository: c.resolve(REPOSITORIOS_TOKENS.compromisoPagoRepository),
                pdfGenerator: c.resolve(SERVICIOS_TOKENS.pdfGenerator),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.listPagosAportesUseCase,
        (c) =>
            new ListPagosAportesUseCase({
                contributionPaymentRepository: c.resolve(REPOSITORIOS_TOKENS.contributionPaymentRepository),
                compromisoPagoRepository: c.resolve(REPOSITORIOS_TOKENS.compromisoPagoRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.getPaymentAporteByIdUseCase,
        (c) =>
            new GetPaymentAporteByIdUseCase({
                contributionPaymentRepository: c.resolve(REPOSITORIOS_TOKENS.contributionPaymentRepository),
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                paymentMethodRepository: c.resolve(REPOSITORIOS_TOKENS.paymentMethodRepository),
                studentScholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.studentScholarshipRepository),
                scholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.scholarshipRepository),
                enrollmentRepository: c.resolve(REPOSITORIOS_TOKENS.enrollmentRepository),
                studentDocumentRepository: c.resolve(REPOSITORIOS_TOKENS.studentDocumentRepository),
                compromisoPagoRepository: c.resolve(REPOSITORIOS_TOKENS.compromisoPagoRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.getMiAporteDetalleEstudianteUseCase,
        (c) =>
            new GetMiAporteDetalleEstudianteUseCase({
                getPaymentAporteByIdUseCase: c.resolve(PAGOS_TOKENS.getPaymentAporteByIdUseCase),
                contributionPaymentInstallmentRepository: c.resolve(
                    REPOSITORIOS_TOKENS.contributionPaymentInstallmentRepository
                ),
                paymentMethodRepository: c.resolve(REPOSITORIOS_TOKENS.paymentMethodRepository),
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.getEstadoAporteRegistroUseCase,
        (c) =>
            new GetEstadoAporteRegistroUseCase({
                contributionPaymentRepository: c.resolve(REPOSITORIOS_TOKENS.contributionPaymentRepository),
                contributionPaymentInstallmentRepository: c.resolve(REPOSITORIOS_TOKENS.contributionPaymentInstallmentRepository),
                paymentMethodRepository: c.resolve(REPOSITORIOS_TOKENS.paymentMethodRepository),
                paymentAccountRepository: c.resolve(REPOSITORIOS_TOKENS.paymentAccountRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                contributionConfigurationRepository: c.resolve(REPOSITORIOS_TOKENS.contributionConfigurationRepository),
                studentScholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.studentScholarshipRepository),
                scholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.scholarshipRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.deletePaymentAporteUseCase,
        (c) =>
            new DeletePaymentAporteUseCase({
                contributionPaymentRepository: c.resolve(REPOSITORIOS_TOKENS.contributionPaymentRepository),
                contributionPaymentInstallmentRepository: c.resolve(REPOSITORIOS_TOKENS.contributionPaymentInstallmentRepository),
                studentDocumentRepository: c.resolve(REPOSITORIOS_TOKENS.studentDocumentRepository),
                studentDocumentDeliveryRepository: c.resolve(REPOSITORIOS_TOKENS.studentDocumentDeliveryRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.deletePaymentInstallmentUseCase,
        (c) =>
            new DeletePaymentInstallmentUseCase({
                contributionPaymentInstallmentRepository: c.resolve(
                    REPOSITORIOS_TOKENS.contributionPaymentInstallmentRepository
                ),
                contributionPaymentRepository: c.resolve(REPOSITORIOS_TOKENS.contributionPaymentRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.updatePaymentInstallmentUseCase,
        (c) =>
            new UpdatePaymentInstallmentUseCase({
                contributionPaymentInstallmentRepository: c.resolve(
                    REPOSITORIOS_TOKENS.contributionPaymentInstallmentRepository
                ),
                contributionPaymentRepository: c.resolve(REPOSITORIOS_TOKENS.contributionPaymentRepository),
                paymentMethodRepository: c.resolve(REPOSITORIOS_TOKENS.paymentMethodRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.generateReciboPagoUseCase,
        (c) =>
            new GenerateReciboPagoUseCase({
                contributionPaymentRepository: c.resolve(REPOSITORIOS_TOKENS.contributionPaymentRepository),
                contributionPaymentInstallmentRepository: c.resolve(REPOSITORIOS_TOKENS.contributionPaymentInstallmentRepository),
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                paymentMethodRepository: c.resolve(REPOSITORIOS_TOKENS.paymentMethodRepository),
                studentScholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.studentScholarshipRepository),
                scholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.scholarshipRepository),
                studentDocumentRepository: c.resolve(REPOSITORIOS_TOKENS.studentDocumentRepository),
                pdfGenerator: c.resolve(SERVICIOS_TOKENS.pdfGenerator),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.exportPaymentAporteByCareerExcelUseCase,
        (c) =>
            new ExportPaymentAporteByCareerExcelUseCase({
                paymentAporteCareerExcelReportRepository: c.resolve(
                    REPOSITORIOS_TOKENS.contributionPaymentByCareerExcelReportRepository
                ),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                careerRepository: c.resolve(REPOSITORIOS_TOKENS.careerRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.getBecasPorCarreraReporteUseCase,
        (c) =>
            new GetBecasPorCarreraReporteUseCase({
                becasPorCarreraViewRepository: c.resolve(REPOSITORIOS_TOKENS.becasPorCarreraViewRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                scholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.scholarshipRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.exportBecasPorCarreraReporteExcelUseCase,
        (c) =>
            new ExportBecasPorCarreraReporteExcelUseCase({
                getBecasPorCarreraReporteUseCase: c.resolve(PAGOS_TOKENS.getBecasPorCarreraReporteUseCase),
                becasReporteExcelGenerator: c.resolve(SERVICIOS_TOKENS.becasReporteExcelGenerator),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.searchStudentsForAporteRegistroUseCase,
        (c) =>
            new SearchStudentsForAporteRegistroUseCase({
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    // ---- Compromiso de pago (CRUD) ----
    registerComponent(
        container,
        PAGOS_TOKENS.getCompromisoByPagoAporteUseCase,
        (c) =>
            new GetCompromisoByPagoAporteUseCase({
                compromisoPagoRepository: c.resolve(REPOSITORIOS_TOKENS.compromisoPagoRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.upsertCompromisoUseCase,
        (c) =>
            new UpsertCompromisoUseCase({
                compromisoPagoRepository: c.resolve(REPOSITORIOS_TOKENS.compromisoPagoRepository),
                contributionPaymentRepository: c.resolve(REPOSITORIOS_TOKENS.contributionPaymentRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.updateCompromisoUseCase,
        (c) =>
            new UpdateCompromisoUseCase({
                compromisoPagoRepository: c.resolve(REPOSITORIOS_TOKENS.compromisoPagoRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.deleteCompromisoUseCase,
        (c) =>
            new DeleteCompromisoUseCase({
                compromisoPagoRepository: c.resolve(REPOSITORIOS_TOKENS.compromisoPagoRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    // ---- Cuentas por cobrar (reporte) ----
    registerComponent(
        container,
        PAGOS_TOKENS.getCuentasPorCobrarReporteUseCase,
        (c) =>
            new GetCuentasPorCobrarReporteUseCase({
                cuentasPorCobrarViewRepository: c.resolve(REPOSITORIOS_TOKENS.cuentasPorCobrarViewRepository),
                compromisoPagoRepository: c.resolve(REPOSITORIOS_TOKENS.compromisoPagoRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
                contributionConfigurationRepository: c.resolve(
                    REPOSITORIOS_TOKENS.contributionConfigurationRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.exportCuentasPorCobrarReporteExcelUseCase,
        (c) =>
            new ExportCuentasPorCobrarReporteExcelUseCase({
                getCuentasPorCobrarReporteUseCase: c.resolve(PAGOS_TOKENS.getCuentasPorCobrarReporteUseCase),
                cuentasPorCobrarReporteExcelGenerator: c.resolve(
                    SERVICIOS_TOKENS.cuentasPorCobrarReporteExcelGenerator
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        PAGOS_TOKENS.registerPagoAporteController,
        (c) =>
            new RegisterPagoAporteController({
                registerPagoAporteUseCase: c.resolve(PAGOS_TOKENS.registerPagoAporteUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.listPagosAportesController,
        (c) =>
            new ListPagosAportesController({
                listPagosAportesUseCase: c.resolve(PAGOS_TOKENS.listPagosAportesUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.getPaymentAporteByIdController,
        (c) =>
            new GetPaymentAporteByIdController({
                getPaymentAporteByIdUseCase: c.resolve(PAGOS_TOKENS.getPaymentAporteByIdUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.misAportesController,
        (c) =>
            new MisAportesController({
                listPagosAportesUseCase: c.resolve(PAGOS_TOKENS.listPagosAportesUseCase),
                studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
                userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.misAporteDetailController,
        (c) =>
            new MisAporteDetailController({
                getMiAporteDetalleEstudianteUseCase: c.resolve(
                    PAGOS_TOKENS.getMiAporteDetalleEstudianteUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.getEstadoAporteRegistroController,
        (c) =>
            new GetEstadoAporteRegistroController({
                getEstadoAporteRegistroUseCase: c.resolve(PAGOS_TOKENS.getEstadoAporteRegistroUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.deletePaymentAporteController,
        (c) =>
            new DeletePaymentAporteController({
                deletePaymentAporteUseCase: c.resolve(PAGOS_TOKENS.deletePaymentAporteUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.deletePaymentInstallmentController,
        (c) =>
            new DeletePaymentInstallmentController({
                deletePaymentInstallmentUseCase: c.resolve(PAGOS_TOKENS.deletePaymentInstallmentUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.updatePaymentInstallmentController,
        (c) =>
            new UpdatePaymentInstallmentController({
                updatePaymentInstallmentUseCase: c.resolve(PAGOS_TOKENS.updatePaymentInstallmentUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.generateReciboPagoController,
        (c) =>
            new GenerateReciboPagoController({
                generateReciboPagoUseCase: c.resolve(PAGOS_TOKENS.generateReciboPagoUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.exportListaAportesPorCarreraExcelController,
        (c) =>
            new ExportListaAportesPorCarreraExcelController({
                exportPaymentAporteByCareerExcelUseCase: c.resolve(
                    PAGOS_TOKENS.exportPaymentAporteByCareerExcelUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.getBecasPorCarreraReporteController,
        (c) =>
            new GetBecasPorCarreraReporteController({
                getBecasPorCarreraReporteUseCase: c.resolve(PAGOS_TOKENS.getBecasPorCarreraReporteUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.exportBecasPorCarreraReporteExcelController,
        (c) =>
            new ExportBecasPorCarreraReporteExcelController({
                exportBecasPorCarreraReporteExcelUseCase: c.resolve(
                    PAGOS_TOKENS.exportBecasPorCarreraReporteExcelUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.searchStudentsForAporteRegistroController,
        (c) =>
            new SearchStudentsForAporteRegistroController({
                searchStudentsForAporteRegistroUseCase: c.resolve(PAGOS_TOKENS.searchStudentsForAporteRegistroUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    // ---- Compromiso de pago (CRUD) ----
    registerComponent(
        container,
        PAGOS_TOKENS.getCompromisoController,
        (c) =>
            new GetCompromisoController({
                getCompromisoByPagoAporteUseCase: c.resolve(PAGOS_TOKENS.getCompromisoByPagoAporteUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.upsertCompromisoController,
        (c) =>
            new UpsertCompromisoController({
                upsertCompromisoUseCase: c.resolve(PAGOS_TOKENS.upsertCompromisoUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.updateCompromisoController,
        (c) =>
            new UpdateCompromisoController({
                updateCompromisoUseCase: c.resolve(PAGOS_TOKENS.updateCompromisoUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.deleteCompromisoController,
        (c) =>
            new DeleteCompromisoController({
                deleteCompromisoUseCase: c.resolve(PAGOS_TOKENS.deleteCompromisoUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    // ---- Cuentas por cobrar (reporte) ----
    registerComponent(
        container,
        PAGOS_TOKENS.getCuentasPorCobrarReporteController,
        (c) =>
            new GetCuentasPorCobrarReporteController({
                getCuentasPorCobrarReporteUseCase: c.resolve(PAGOS_TOKENS.getCuentasPorCobrarReporteUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        PAGOS_TOKENS.exportCuentasPorCobrarReporteExcelController,
        (c) =>
            new ExportCuentasPorCobrarReporteExcelController({
                exportCuentasPorCobrarReporteExcelUseCase: c.resolve(
                    PAGOS_TOKENS.exportCuentasPorCobrarReporteExcelUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    // ============================================
    // ROUTER
    // ============================================
    registerComponent(
        container,
        PAGOS_TOKENS.pagosAportesRouter,
        (c) => {
            const controllers = {
                registerPagoAporteController: c.resolve(PAGOS_TOKENS.registerPagoAporteController),
                listPagosAportesController: c.resolve(PAGOS_TOKENS.listPagosAportesController),
                getPaymentAporteByIdController: c.resolve(PAGOS_TOKENS.getPaymentAporteByIdController),
                misAportesController: c.resolve(PAGOS_TOKENS.misAportesController),
                misAporteDetailController: c.resolve(PAGOS_TOKENS.misAporteDetailController),
                getEstadoAporteRegistroController: c.resolve(PAGOS_TOKENS.getEstadoAporteRegistroController),
                searchStudentsForAporteRegistroController: c.resolve(PAGOS_TOKENS.searchStudentsForAporteRegistroController),
                deletePaymentAporteController: c.resolve(PAGOS_TOKENS.deletePaymentAporteController),
                deletePaymentInstallmentController: c.resolve(PAGOS_TOKENS.deletePaymentInstallmentController),
                updatePaymentInstallmentController: c.resolve(PAGOS_TOKENS.updatePaymentInstallmentController),
                generateReciboPagoController: c.resolve(PAGOS_TOKENS.generateReciboPagoController),
                exportListaAportesPorCarreraExcelController: c.resolve(
                    PAGOS_TOKENS.exportListaAportesPorCarreraExcelController
                ),
                getBecasPorCarreraReporteController: c.resolve(
                    PAGOS_TOKENS.getBecasPorCarreraReporteController
                ),
                exportBecasPorCarreraReporteExcelController: c.resolve(
                    PAGOS_TOKENS.exportBecasPorCarreraReporteExcelController
                ),
                getCompromisoController: c.resolve(PAGOS_TOKENS.getCompromisoController),
                upsertCompromisoController: c.resolve(PAGOS_TOKENS.upsertCompromisoController),
                updateCompromisoController: c.resolve(PAGOS_TOKENS.updateCompromisoController),
                deleteCompromisoController: c.resolve(PAGOS_TOKENS.deleteCompromisoController),
                getCuentasPorCobrarReporteController: c.resolve(
                    PAGOS_TOKENS.getCuentasPorCobrarReporteController
                ),
                exportCuentasPorCobrarReporteExcelController: c.resolve(
                    PAGOS_TOKENS.exportCuentasPorCobrarReporteExcelController
                ),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildPagosAportesRouter({ controllers, middlewares });
        }
    );

    return container;
}
