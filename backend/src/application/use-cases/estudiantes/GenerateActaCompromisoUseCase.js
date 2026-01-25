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
     * Orquesta el flujo completo de generación del documento:
     * 1. Validar y obtener estudiante
     * 2. Buscar entregas de documentos
     * 3. Obtener gestión activa
     * 4. Generar PDF
     * 5. Guardar archivo y persistir en BD
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
            // 1. Validar y obtener estudiante
            const student = await this._validateAndGetStudent(studentId);

            // 2. Buscar entregas de documentos de inscripción
            await this._fetchDocumentDeliveries(studentId);

            // 3. Obtener año de gestión activa (usa método del base)
            const gestionYear = await this._getCurrentManagementYear();

            // 4. Generar PDF con gestión activa
            const pdfBuffer = await this._generatePdfBuffer(gestionYear);

            // 5. Guardar archivo y persistir en BD
            const result = await this._persistDocument(studentId, pdfBuffer, student);

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

    /**
     * Valida y obtiene el estudiante por ID
     * 
     * @private
     * @param {number} studentId - ID del estudiante
     * @returns {Promise<Object>} Datos del estudiante
     * @throws {NotFoundError} Si el estudiante no existe
     */
    async _validateAndGetStudent(studentId) {
        const student = await this.studentRepository.findById(studentId, {
            attributes: ['id', 'codigoEstudiante', 'ci', 'expedicion', 'nombres', 'apellidoPaterno', 'apellidoMaterno'],
        });

        if (!student) {
            throw new NotFoundError(`Estudiante con ID ${studentId}`);
        }

        return student;
    }

    /**
     * Busca las entregas de documentos de inscripción con detalle
     * 
     * @private
     * @param {number} studentId - ID del estudiante
     * @returns {Promise<Array>} Lista de entregas con detalle
     */
    async _fetchDocumentDeliveries(studentId) {
        const entregasConDetalle = await this.studentDocumentDeliveryRepository.obtenerEntregasConDetalle({
            estudiante_id: studentId,
            tipo_documento: TIPOS_DOCUMENTO_SISTEMA.INSCRIPCION,
            documento_padre_id: null,
        });

        this.logger.info('[Estudiantes] Entregas con detalle obtenidas', {
            studentId,
            cantidad: entregasConDetalle.length,
        });

        // Por ahora no se usan, pero se guardan para uso futuro
        return entregasConDetalle;
    }

    /**
     * Genera el buffer del PDF del acta de compromiso
     * 
     * @private
     * @param {number} gestionYear - Año de gestión activa
     * @returns {Promise<Buffer>} Buffer del PDF generado
     */
    async _generatePdfBuffer(gestionYear) {
        // Por ahora se usa plantilla vacía, después se pasarán los datos (entregasConDetalle)
        // Pasar la gestión activa para que se muestre en el subtítulo "GESTIÓN XXXX"
        return await this.pdfGenerator.generateActaCompromiso({
            gestion: gestionYear,
        });
    }

    /**
     * Persiste el documento: guarda en uploads y registra en BD
     * 
     * Prepara la información del archivo (ruta relativa y nombre) y luego
     * guarda el PDF en uploads y registra la información en la base de datos.
     * 
     * @private
     * @param {number} studentId - ID del estudiante
     * @param {Buffer} pdfBuffer - Buffer del PDF generado
     * @param {Object} student - Datos del estudiante
     * @returns {Promise<{filePath: string, fileName: string, absolutePath: string}>} Resultado del guardado
     */
    async _persistDocument(studentId, pdfBuffer, student) {
        // Preparar información del archivo
        const relativeScope = UPLOAD.studentDocuments(studentId);
        const fileName = `acta_compromiso_${student.codigoEstudiante}.pdf`;

        // Guardar PDF en uploads (usa método del base)
        const result = await this._saveToUploads(
            studentId,
            pdfBuffer,
            relativeScope,
            fileName
        );

        // Guardar información del documento en BD (usa método del base)
        await this._saveDocumentToDatabase(studentId, result, {
            extension: 'pdf',
            tipoDocumento: 'INSCRIPCION',
            documentacionId: null,
            state: 'APROBADO',
        });

        return result;
    }
}
