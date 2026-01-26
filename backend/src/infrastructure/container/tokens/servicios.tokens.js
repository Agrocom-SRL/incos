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
    reciboPagoPdfGenerator: 'reciboPagoPdfGenerator', // Generador de recibo de pago (pdf-lib)
    pdfGenerator: 'pdfGenerator', // IPDFGenerator (fachada única)
    uploadsStorage: 'uploadsStorage', // IUploadsStorage (almacenamiento en uploads)
};

