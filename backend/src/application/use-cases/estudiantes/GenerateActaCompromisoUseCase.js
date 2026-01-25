import { NotFoundError } from '../../../domain/errors/AppError.js';
import { TIPOS_DOCUMENTO_SISTEMA } from '../../../domain/constants/index.js';
import { UPLOAD } from '../../../infrastructure/config/uploads.config.js';
import { BaseDocumentGenerationUseCase } from '../base/BaseDocumentGenerationUseCase.js';

/**
 * Use Case: GenerateActaCompromisoUseCase
 * Módulo: Estudiantes
 * Genera el ACTA DE COMPROMISO para la entrega de documentos.
 *
 * Extiende BaseDocumentGenerationUseCase para reutilizar lógica común de generación de documentos.
 *
 * Flujo: PDF directo desde plantilla (Plantilla.pdf) → guardar PDF en uploads →
 * retornar rutas del PDF generado.
 *
 * Tecnología: Usa IPDFGenerator (inyectado vía DI) que internamente usa ActaCompromisoPdfGenerator
 * con pdf-lib para editar la plantilla PDF.
 * NOTA: Ya no se usa Word. El flujo anterior (Word → DOCX → PDF con LibreOffice) fue eliminado.
 *
 * Por ahora se usa plantilla vacía (Plantilla.pdf). La construcción con datos se añadirá después.
 *
 * Principios SOLID:
 * - Single Responsibility: Orquesta validación, datos y delegación a servicios
 * - Dependency Inversion: Repositorios y servicios inyectados (abstracciones)
 * - Template Method: Extiende BaseDocumentGenerationUseCase para reutilizar lógica común
 *
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio
 * - Depende de Repositories y servicios (Infrastructure) vía inyección
 * - No importa infraestructura; consume interfaces inyectadas
 */
export class GenerateActaCompromisoUseCase extends BaseDocumentGenerationUseCase {
    /**
     * @param {Object} params - Dependencias inyectadas
     * @param {Object} params.studentRepository - Repositorio de estudiantes (específico, para validar estudiante)
     * @param {Object} params.studentDocumentRepository - Repositorio de documentos de estudiantes (común, para guardar en BD)
     * @param {Object} params.studentDocumentDeliveryRepository - Repositorio de entregas de documentos (específico, para buscar datos)
     * @param {Object} params.configuracionSistemaRepository - Repositorio de configuración del sistema (para obtener gestión activa)
     * @param {Object} params.managementRepository - Repositorio de gestiones (para obtener gestión activa)
     * @param {IPDFGenerator} params.pdfGenerator - Servicio de generación PDF (DI, implementa IPDFGenerator)
     * @param {IUploadsStorage} params.uploadsStorage - Servicio de almacenamiento en uploads (DI)
     * @param {ILogger} params.logger - Logger para registro de eventos
     */
    constructor({
        studentRepository,
        studentDocumentRepository,
        studentDocumentDeliveryRepository,
        configuracionSistemaRepository,
        managementRepository,
        pdfGenerator,
        uploadsStorage,
        logger,
    }) {
        super({
            studentDocumentRepository,
            pdfGenerator,
            uploadsStorage,
            logger,
            moduleName: 'Estudiantes',
            documentType: 'ACTA DE COMPROMISO',
            configuracionSistemaRepository,
            managementRepository,
        });

        // Repositorios específicos para buscar datos necesarios
        this.studentRepository = studentRepository;
        this.studentDocumentDeliveryRepository = studentDocumentDeliveryRepository;
    }

    /**
     * Ejecuta el caso de uso de generación de acta de compromiso
     * 
     * Flujo:
     * 1. Validar estudiante (lógica propia)
     * 2. Buscar entregas de documentos (lógica específica)
     * 3. Obtener gestión activa del sistema (usa método del base: _getCurrentManagement)
     * 4. Generar PDF usando PDFGenerator con gestión activa (lógica específica)
     * 5. Guardar en uploads (usa método del base: _saveToUploads)
     * 6. Guardar en BD (usa método del base: _saveDocumentToDatabase)
     * 
     * @param {number} studentId - ID del estudiante
     * @param {Object} options - Opciones adicionales (por defecto vacío)
     * @returns {Promise<{filePath: string, fileName: string, absolutePath: string}>} Rutas del PDF generado
     * @throws {Error} Si falla la generación del PDF
     */
    async execute(studentId, options = {}) {
        this.logger.info('[Estudiantes] Iniciando generación de ACTA DE COMPROMISO', {
            studentId,
        });

        try {
            // 1. Validar y obtener estudiante (lógica propia)
            const student = await this.studentRepository.findById(studentId, {
                attributes: ['id', 'codigoEstudiante', 'ci', 'expedicion', 'nombres', 'apellidoPaterno', 'apellidoMaterno'],
            });

            if (!student) {
                throw new NotFoundError(`Estudiante con ID ${studentId}`);
            }

            // 2. Buscar entregas de documentos de inscripción con detalle (lógica específica)
            const entregasConDetalle = await this.studentDocumentDeliveryRepository.obtenerEntregasConDetalle({
                estudiante_id: studentId,
                tipo_documento: TIPOS_DOCUMENTO_SISTEMA.INSCRIPCION,
                documento_padre_id: null,
            });

            this.logger.info('[Estudiantes] Entregas con detalle obtenidas', {
                studentId,
                cantidad: entregasConDetalle.length,
            });

            // 3. Obtener gestión activa del sistema (usa método del base)
            const management = await this._getCurrentManagement();
            const gestionYear = management.year || management.anio || new Date().getFullYear();

            this.logger.info('[Estudiantes] Gestión activa obtenida', {
                studentId,
                gestionYear,
                managementId: management.id,
            });

            // 4. Generar PDF usando el método específico del PDFGenerator (lógica específica)
            // Por ahora se usa plantilla vacía, después se pasarán los datos (entregasConDetalle)
            // Pasar la gestión activa para que se muestre en el subtítulo "GESTIÓN XXXX"
            const pdfBuffer = await this.pdfGenerator.generateActaCompromiso({
                gestion: gestionYear,
            });

            // 5. Preparar información para guardar
            const relativeScope = UPLOAD.actaCompromiso(studentId);
            const pdfFileName = `acta_compromiso_${student.studentCode}.pdf`;

            // 6. Guardar PDF en uploads (usa método del base)
            const result = await this._saveToUploads(studentId, pdfBuffer, relativeScope, pdfFileName);

            // 7. Guardar información del documento en BD (usa método del base)
            await this._saveDocumentToDatabase(studentId, {
                fileName: result.fileName,
                filePath: result.filePath,
                absolutePath: result.absolutePath,
                extension: 'pdf',
                tipoDocumento: 'INSCRIPCION',
                documentacionId: null,
            });

            this.logger.info('[Estudiantes] Acta PDF generada correctamente', {
                studentId,
                filePath: result.filePath,
                absolutePath: result.absolutePath,
            });

            return result;
        } catch (error) {
            this.logger.error('[Estudiantes] Error al generar ACTA DE COMPROMISO', {
                studentId,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
}
