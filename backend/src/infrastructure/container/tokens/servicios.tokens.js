/**
 * Tokens de Servicios Base (Infraestructura)
 * 
 * Convenciones:
 * - Servicios base: camelCase (ej: 'logger', 'fileUploadService')
 */

export const SERVICIOS_TOKENS = {
    logger: 'logger',
    errorFormatter: 'errorFormatter',
    responseFormatter: 'responseFormatter',
    validateRequest: 'validateRequest',
    fileUploadService: 'fileUploadService',
    fileStorageService: 'fileStorageService',
    actaCompromisoPdfGenerator: 'actaCompromisoPdfGenerator', // Interno, usado por PDFGenerator
    pdfGenerator: 'pdfGenerator', // IPDFGenerator (fachada única)
    uploadsStorage: 'uploadsStorage',
};

