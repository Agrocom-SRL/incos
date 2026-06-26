/**
 * Tokens de Servicios Base (Infraestructura)
 *
 * Convenciones:
 * - Servicios base: camelCase (ej: 'logger', 'fileUploadService')
 */

export const SERVICIOS_TOKENS = {
    logger: 'logger', // Sistema de logging (Winston) - Implementa ILogger
    errorFormatter: 'errorFormatter', // Formateo de errores para respuestas HTTP
    responseFormatter: 'responseFormatter', // Formateo de respuestas exitosas
    validateRequest: 'validateRequest', // Middleware de validación de requests
    fileUploadService: 'fileUploadService', // Servicio de subida de archivos (Multer) - futuro
    actaCompromisoPdfGenerator: 'actaCompromisoPdfGenerator', // Generador de actas de compromiso (pdf-lib)
    formularioInscripcionPdfGenerator: 'formularioInscripcionPdfGenerator', // Generador de formulario de inscripción (pdf-lib)
    declaracionJuradaPdfGenerator: 'declaracionJuradaPdfGenerator', // Generador de formulario de declaración jurada (pdf-lib)
    reciboPagoPdfGenerator: 'reciboPagoPdfGenerator', // Generador de recibo de pago (pdf-lib)
    pdfGenerator: 'pdfGenerator', // IPDFGenerator (fachada única)
    registroPedagogicoExcelGenerator: 'registroPedagogicoExcelGenerator', // IRegistroPedagogicoExcelGenerator (.xlsx)
    centralizadorExcelGenerator: 'centralizadorExcelGenerator', // ICentralizadorExcelGenerator (.xlsx)
    becasReporteExcelGenerator: 'becasReporteExcelGenerator', // IBecasReporteExcelGenerator (.xlsx)
    cuentasPorCobrarReporteExcelGenerator: 'cuentasPorCobrarReporteExcelGenerator', // ICuentasPorCobrarReporteExcelGenerator (.xlsx)
    uploadsStorage: 'uploadsStorage', // IUploadsStorage (almacenamiento en uploads)
};
