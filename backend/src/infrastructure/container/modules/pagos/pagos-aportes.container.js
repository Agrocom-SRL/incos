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
import { GetEstadoAporteRegistroUseCase } from '../../../../application/use-cases/pagos/GetEstadoAporteRegistroUseCase.js';
import { DeletePaymentAporteUseCase } from '../../../../application/use-cases/pagos/DeletePaymentAporteUseCase.js';
import { GenerateReciboPagoUseCase } from '../../../../application/use-cases/pagos/GenerateReciboPagoUseCase.js';
import { RegisterPagoAporteController, ListPagosAportesController, GetPaymentAporteByIdController, GetEstadoAporteRegistroController, DeletePaymentAporteController, GenerateReciboPagoController } from '../../../../presentation/controllers/pagos/index.js';
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
        PAGOS_TOKENS.generateReciboPagoController,
        (c) =>
            new GenerateReciboPagoController({
                generateReciboPagoUseCase: c.resolve(PAGOS_TOKENS.generateReciboPagoUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
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
                getEstadoAporteRegistroController: c.resolve(PAGOS_TOKENS.getEstadoAporteRegistroController),
                deletePaymentAporteController: c.resolve(PAGOS_TOKENS.deletePaymentAporteController),
                generateReciboPagoController: c.resolve(PAGOS_TOKENS.generateReciboPagoController),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildPagosAportesRouter({ controllers, middlewares });
        }
    );

    return container;
}