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
import { CentralizadorExcelBuilder } from '../../external/excel/centralizador/CentralizadorExcelBuilder.js';
import { HistorialAcademicoExcelBuilder } from '../../external/excel/historial-academico/HistorialAcademicoExcelBuilder.js';
import { BoletinPdfGenerator } from '../../external/pdf/boletin/BoletinPdfGenerator.js';
import { HistorialAcademicoPdfGenerator } from '../../external/pdf/historial-academico/HistorialAcademicoPdfGenerator.js';
import { BecasReporteExcelBuilder } from '../../external/excel/finanzas-reportes/BecasReporteExcelBuilder.js';
import { CuentasPorCobrarExcelBuilder } from '../../external/excel/finanzas-reportes/CuentasPorCobrarExcelBuilder.js';
import { ListadoInscritosCapacitacionExcelBuilder } from '../../external/excel/capacitacion/ListadoInscritosCapacitacionExcelBuilder.js';
import { AsistenciaConsolidadoExcelBuilder } from '../../external/excel/asistencia-consolidado/AsistenciaConsolidadoExcelBuilder.js';
import { LibroRegistroExcelBuilder } from '../../external/excel/libro-registro/LibroRegistroExcelBuilder.js';
import { AvanceAcademicoExcelBuilder } from '../../external/excel/avance-academico/AvanceAcademicoExcelBuilder.js';
import { DesercionExcelBuilder } from '../../external/excel/desercion/DesercionExcelBuilder.js';
import { DesignacionTutorPdfGenerator } from '../../external/pdf/titulacion/DesignacionTutorPdfGenerator.js';
import { ViabilidadProyectoPdfGenerator } from '../../external/pdf/titulacion/ViabilidadProyectoPdfGenerator.js';
import { BitacoraMensualTutorPdfGenerator } from '../../external/pdf/titulacion/BitacoraMensualTutorPdfGenerator.js';
import { PanelAcompanamientoPdfGenerator } from '../../external/pdf/academico/PanelAcompanamientoPdfGenerator.js';
import { FichaSeguimientoClasePdfGenerator } from '../../external/pdf/docentes/FichaSeguimientoClasePdfGenerator.js';
import { FormularioModalidadGradoPdfGenerator } from '../../external/pdf/titulacion/FormularioModalidadGradoPdfGenerator.js';
import { AvanceTutoriaCarreraPdfGenerator } from '../../external/pdf/titulacion/AvanceTutoriaCarreraPdfGenerator.js';
import { ActaDefensaPdfGenerator } from '../../external/pdf/titulacion/ActaDefensaPdfGenerator.js';
import { PlanillaAvanceTutoriaExcelBuilder } from '../../external/excel/titulacion-planilla-avance/PlanillaAvanceTutoriaExcelBuilder.js';
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
        SERVICIOS_TOKENS.centralizadorExcelGenerator,
        () => new CentralizadorExcelBuilder()
    );
    registerService(
        container,
        SERVICIOS_TOKENS.historialAcademicoExcelGenerator,
        () => new HistorialAcademicoExcelBuilder()
    );
    registerService(
        container,
        SERVICIOS_TOKENS.boletinPdfGenerator,
        (c) => new BoletinPdfGenerator({ logger: c.resolve(SERVICIOS_TOKENS.logger) })
    );
    registerService(
        container,
        SERVICIOS_TOKENS.historialAcademicoPdfGenerator,
        (c) => new HistorialAcademicoPdfGenerator({ logger: c.resolve(SERVICIOS_TOKENS.logger) })
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
    registerService(
        container,
        SERVICIOS_TOKENS.listadoInscritosCapacitacionExcelGenerator,
        () => new ListadoInscritosCapacitacionExcelBuilder()
    );
    // Consolidado asistencia / Avance / Deserción (ACA, disolución REP 2026-07-29)
    registerService(
        container,
        SERVICIOS_TOKENS.asistenciaConsolidadoExcelGenerator,
        () => new AsistenciaConsolidadoExcelBuilder()
    );
    registerService(
        container,
        SERVICIOS_TOKENS.avanceAcademicoExcelGenerator,
        () => new AvanceAcademicoExcelBuilder()
    );
    registerService(
        container,
        SERVICIOS_TOKENS.desercionExcelGenerator,
        () => new DesercionExcelBuilder()
    );
    // Libro de registro del centralizador (ACA, schema 25 — Fase 4)
    registerService(
        container,
        SERVICIOS_TOKENS.libroRegistroExcelGenerator,
        () => new LibroRegistroExcelBuilder()
    );

    // ============================================
    // PDF GENERATORS DEL MÓDULO TITULACIÓN (TIT)
    // ============================================
    registerService(
        container,
        SERVICIOS_TOKENS.designacionTutorPdfGenerator,
        (c) => new DesignacionTutorPdfGenerator({ logger: c.resolve(SERVICIOS_TOKENS.logger) })
    );
    registerService(
        container,
        SERVICIOS_TOKENS.viabilidadProyectoPdfGenerator,
        (c) => new ViabilidadProyectoPdfGenerator({ logger: c.resolve(SERVICIOS_TOKENS.logger) })
    );
    registerService(
        container,
        SERVICIOS_TOKENS.bitacoraMensualTutorPdfGenerator,
        (c) => new BitacoraMensualTutorPdfGenerator({ logger: c.resolve(SERVICIOS_TOKENS.logger) })
    );

    // ============================================
    // GENERADORES DEL MÓDULO TITULACIÓN (TIT) · extensión 2026-07-31
    // (formulario de modalidad de graduación, reporte de avance por carrera,
    // planilla de avance "10 en 10")
    // ============================================
    registerService(
        container,
        SERVICIOS_TOKENS.formularioModalidadGradoPdfGenerator,
        (c) =>
            new FormularioModalidadGradoPdfGenerator({ logger: c.resolve(SERVICIOS_TOKENS.logger) })
    );
    registerService(
        container,
        SERVICIOS_TOKENS.avanceTutoriaCarreraPdfGenerator,
        (c) => new AvanceTutoriaCarreraPdfGenerator({ logger: c.resolve(SERVICIOS_TOKENS.logger) })
    );
    registerService(
        container,
        SERVICIOS_TOKENS.planillaAvanceTutoriaExcelGenerator,
        () => new PlanillaAvanceTutoriaExcelBuilder()
    );

    // ============================================
    // GENERADOR DEL MÓDULO TITULACIÓN (TIT) · extensión 2026-08-01
    // (acta de defensa de grado)
    // ============================================
    registerService(
        container,
        SERVICIOS_TOKENS.actaDefensaPdfGenerator,
        (c) => new ActaDefensaPdfGenerator({ logger: c.resolve(SERVICIOS_TOKENS.logger) })
    );

    // ============================================
    // PDF GENERATOR DEL MÓDULO ACADÉMICO (ACA) · ACOMPAÑAMIENTO
    // ============================================
    registerService(
        container,
        SERVICIOS_TOKENS.panelAcompanamientoPdfGenerator,
        (c) => new PanelAcompanamientoPdfGenerator({ logger: c.resolve(SERVICIOS_TOKENS.logger) })
    );

    // ============================================
    // PDF GENERATORS DEL MÓDULO DOCENTES (DOC)
    // ============================================
    registerService(
        container,
        SERVICIOS_TOKENS.fichaSeguimientoClasePdfGenerator,
        (c) => new FichaSeguimientoClasePdfGenerator({ logger: c.resolve(SERVICIOS_TOKENS.logger) })
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
