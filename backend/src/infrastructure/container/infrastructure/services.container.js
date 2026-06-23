/**
 * Registrador de servicios base (infraestructura)
 * 
 * Servicios registrados:
 * - logger: Sistema de logging (Winston) - Implementa ILogger
 * - errorFormatter: Formateo de errores para respuestas HTTP
 * - responseFormatter: Formateo de respuestas exitosas
 * - validateRequest: Middleware de validación de requests
 * - actaCompromisoPdfGenerator: Generador interno de actas (pdf-lib, usado por PDFGenerator)
 * - formularioInscripcionPdfGenerator: Generador de formulario de inscripción (pdf-lib, usado por PDFGenerator)
 * - pdfGenerator: Implementa IPDFGenerator, fachada única para generación de PDFs
 * - uploadsStorage: Implementa IUploadsStorage, almacenamiento de archivos en uploads
 * 
 * Servicios disponibles pero no registrados hasta que se necesiten:
 * - fileUploadService: Servicio de subida de archivos (Multer)
 * - emailService: Envío de emails
 * 
 * Todos los servicios se registran como singleton ya que:
 * - No mantienen estado mutable por request
 * - Son compartidos entre módulos
 * - Mejora el rendimiento (una sola instancia)
 * 
 * Nota: El logger implementa ILogger del dominio (backend/src/domain/interfaces/services/ILogger.js)
 */

import { SERVICIOS_TOKENS } from '../tokens/index.js';
import { registerService } from '../utils/container.helpers.js';
import { logger } from '../../services/WinstonLoggerFactory.js';
import { errorFormatter } from '../../services/ErrorFormatter.js';
import { responseFormatter } from '../../services/ResponseFormatter.js';
import { createValidateRequest } from '../../../presentation/middleware/validation.middleware.js';
import { ActaCompromisoPdfGenerator } from '../../external/pdf/ActaCompromisoPdfGenerator.js';
import { FormularioInscripcionPdfGenerator } from '../../external/pdf/FormularioInscripcionPdfGenerator.js';
import { DeclaracionJuradaPdfGenerator } from '../../external/pdf/DeclaracionJuradaPdfGenerator.js';
import { ReciboPagoPdfGenerator } from '../../external/pdf/ReciboPagoPdfGenerator.js';
import { PDFGenerator } from '../../external/pdf/PDFGenerator.js';
import { RegistroPedagogicoExcelBuilder } from '../../external/excel/RegistroPedagogicoExcelBuilder.js';
import { BecasReporteExcelBuilder } from '../../external/excel/finanzas-reportes/BecasReporteExcelBuilder.js';
import { CuentasPorCobrarExcelBuilder } from '../../external/excel/finanzas-reportes/CuentasPorCobrarExcelBuilder.js';
import { UploadsStorageAdapter } from '../../services/UploadsStorageAdapter.js';

export function registerServicesModule(container) {
    // ============================================
    // LOGGING (DI: instancia singleton)
    // ============================================
    registerService(container, SERVICIOS_TOKENS.logger, logger);

    // ============================================
    // ERROR FORMATTING
    // ============================================
    registerService(container, SERVICIOS_TOKENS.errorFormatter, errorFormatter);

    // ============================================
    // SUCCESS RESPONSE FORMATTING
    // ============================================
    registerService(container, SERVICIOS_TOKENS.responseFormatter, responseFormatter);

    // ============================================
    // VALIDATION MIDDLEWARE
    // ============================================
    registerService(
        container,
        SERVICIOS_TOKENS.validateRequest,
        (c) => createValidateRequest(c.resolve(SERVICIOS_TOKENS.logger))
    );

    // ============================================
    // ACTA COMPROMISO PDF GENERATOR (interno)
    // ============================================
    registerService(
        container,
        SERVICIOS_TOKENS.actaCompromisoPdfGenerator,
        (c) => new ActaCompromisoPdfGenerator({
            logger: c.resolve(SERVICIOS_TOKENS.logger),
        })
    );

    registerService(
        container,
        SERVICIOS_TOKENS.formularioInscripcionPdfGenerator,
        (c) => new FormularioInscripcionPdfGenerator({
            logger: c.resolve(SERVICIOS_TOKENS.logger),
        })
    );

    // ============================================
    // DECLARACIÓN JURADA PDF GENERATOR (interno)
    // ============================================
    registerService(
        container,
        SERVICIOS_TOKENS.declaracionJuradaPdfGenerator,
        (c) => new DeclaracionJuradaPdfGenerator({
            logger: c.resolve(SERVICIOS_TOKENS.logger),
        })
    );

    // ============================================
    // RECIBO PAGO PDF GENERATOR (interno)
    // ============================================
    registerService(
        container,
        SERVICIOS_TOKENS.reciboPagoPdfGenerator,
        (c) => new ReciboPagoPdfGenerator({
            logger: c.resolve(SERVICIOS_TOKENS.logger),
        })
    );

    // ============================================
    // PDF GENERATOR (IPDFGenerator - Fachada única)
    // ============================================
    registerService(
        container,
        SERVICIOS_TOKENS.pdfGenerator,
        (c) => new PDFGenerator({
            actaCompromisoPdfGenerator: c.resolve(SERVICIOS_TOKENS.actaCompromisoPdfGenerator),
            formularioInscripcionPdfGenerator: c.resolve(SERVICIOS_TOKENS.formularioInscripcionPdfGenerator),
            declaracionJuradaPdfGenerator: c.resolve(SERVICIOS_TOKENS.declaracionJuradaPdfGenerator),
            reciboPagoPdfGenerator: c.resolve(SERVICIOS_TOKENS.reciboPagoPdfGenerator),
            logger: c.resolve(SERVICIOS_TOKENS.logger),
        })
    );

    // ============================================
    // EXCEL GENERATOR (IRegistroPedagogicoExcelGenerator)
    // ============================================
    registerService(
        container,
        SERVICIOS_TOKENS.registroPedagogicoExcelGenerator,
        () => new RegistroPedagogicoExcelBuilder()
    );
    registerService(
        container,
        SERVICIOS_TOKENS.becasReporteExcelGenerator,
        () => new BecasReporteExcelBuilder()
    );
    registerService(
        container,
        SERVICIOS_TOKENS.cuentasPorCobrarReporteExcelGenerator,
        () => new CuentasPorCobrarExcelBuilder()
    );

    // ============================================
    // UPLOADS STORAGE (IUploadsStorage)
    // ============================================
    registerService(
        container,
        SERVICIOS_TOKENS.uploadsStorage,
        () => new UploadsStorageAdapter()
    );

    // ============================================
    // FILE STORAGE & FILE UPLOAD
    // ============================================
    // Estos servicios se registrarán cuando se implementen y se necesiten
    // Por ahora no están en uso, así que no se registran aquí

    return container;
}


