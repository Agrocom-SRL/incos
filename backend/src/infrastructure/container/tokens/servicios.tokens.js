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
    historialAcademicoExcelGenerator: 'historialAcademicoExcelGenerator', // IHistorialAcademicoExcelGenerator (.xlsx)
    boletinPdfGenerator: 'boletinPdfGenerator', // IBoletinPdfGenerator (.pdf)
    historialAcademicoPdfGenerator: 'historialAcademicoPdfGenerator', // IHistorialAcademicoPdfGenerator (.pdf)
    becasReporteExcelGenerator: 'becasReporteExcelGenerator', // IBecasReporteExcelGenerator (.xlsx)
    cuentasPorCobrarReporteExcelGenerator: 'cuentasPorCobrarReporteExcelGenerator', // ICuentasPorCobrarReporteExcelGenerator (.xlsx)
    listadoInscritosCapacitacionExcelGenerator: 'listadoInscritosCapacitacionExcelGenerator', // IListadoInscritosCapacitacionExcelGenerator (.xlsx)
    asistenciaConsolidadoExcelGenerator: 'asistenciaConsolidadoExcelGenerator', // IAsistenciaConsolidadoExcelGenerator (.xlsx)
    libroRegistroExcelGenerator: 'libroRegistroExcelGenerator', // ILibroRegistroExcelGenerator (.xlsx, libros de registro ACA)
    avanceAcademicoExcelGenerator: 'avanceAcademicoExcelGenerator', // IAvanceAcademicoExcelGenerator (.xlsx)
    desercionExcelGenerator: 'desercionExcelGenerator', // IDesercionExcelGenerator (.xlsx)
    uploadsStorage: 'uploadsStorage', // IUploadsStorage (almacenamiento en uploads)
    designacionTutorPdfGenerator: 'designacionTutorPdfGenerator', // IDesignacionTutorPdfGenerator (.pdf, módulo TUT)
    viabilidadProyectoPdfGenerator: 'viabilidadProyectoPdfGenerator', // IViabilidadProyectoPdfGenerator (.pdf, módulo TUT)
    bitacoraMensualTutorPdfGenerator: 'bitacoraMensualTutorPdfGenerator', // IBitacoraMensualTutorPdfGenerator (.pdf, módulo TUT)
    panelAcompanamientoPdfGenerator: 'panelAcompanamientoPdfGenerator', // IPanelAcompanamientoPdfGenerator (.pdf, módulo TUT)
    fichaSeguimientoClasePdfGenerator: 'fichaSeguimientoClasePdfGenerator', // IFichaSeguimientoClasePdfGenerator (.pdf, módulo DOC · supervisión)
};
