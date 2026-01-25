import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { UPLOAD } from '../../../infrastructure/config/uploads.config.js';

/**
 * Use Case Base para generación de documentos PDF
 * 
 * Implementa el patrón Template Method para proporcionar funcionalidad común
 * a todos los casos de uso de generación de documentos (actas, recibos, boletas, etc.)
 * 
 * RESPONSABILIDADES DEL BASE (solo orquestación):
 * - Preparar el uso del generador PDF (inyectado)
 * - Preparar el uso del storage de uploads (inyectado)
 * - Guardar información del documento en BD usando StudentDocumentRepository
 * - Obtener gestión activa del sistema (método común)
 * - Logging durante la operación
 * 
 * RESPONSABILIDADES DE CADA CASO DE USO (implementación específica):
 * - Validar estudiante (cada caso tiene su propia lógica de validación)
 * - Buscar sus propios datos (sin importar cuántos repositorios necesite)
 * - Construir la información que se va a escribir en el archivo
 * - Llamar al método específico del PDFGenerator con los datos preparados
 * - Definir nombre del archivo y ruta relativa
 * 
 * REPOSITORIOS COMUNES:
 * - StudentDocumentRepository: Para guardar información del archivo generado
 * - ConfiguracionSistemaRepository: Para obtener gestión activa (opcional, se inyecta si se necesita)
 * - ManagementRepository: Para obtener gestión activa (opcional, se inyecta si se necesita)
 * 
 * Principios SOLID:
 * - Single Responsibility: El base solo orquesta PDF y storage, cada caso maneja sus datos
 * - Template Method: Define el algoritmo común con hook methods
 * - Open/Closed: Permite personalizar el comportamiento mediante hook methods
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de casos de uso
 * - Depende de Repositories y servicios (Infrastructure) vía inyección
 * - No importa infraestructura; consume interfaces inyectadas
 * 
 * @abstract
 * @example
 * class GenerateActaCompromisoUseCase extends BaseDocumentGenerationUseCase {
 *   constructor({ studentDocumentRepository, pdfGenerator, uploadsStorage, logger, ... }) {
 *     super({ studentDocumentRepository, pdfGenerator, uploadsStorage, logger, ... });
 *     // Inyectar repositorios específicos que necesites
 *     this.studentRepository = studentRepository;
 *     this.studentDocumentDeliveryRepository = studentDocumentDeliveryRepository;
 *   }
 * 
 *   async execute(studentId, options = {}) {
 *     // 1. Validar estudiante (lógica propia)
 *     const student = await this.studentRepository.findById(studentId);
 *     if (!student) throw new NotFoundError(`Estudiante con ID ${studentId}`);
 * 
 *     // 2. Buscar tus propios datos (lógica específica)
 *     const entregas = await this.studentDocumentDeliveryRepository.obtenerEntregasConDetalle({...});
 * 
 *     // 3. Generar PDF usando el método específico del PDFGenerator (lógica específica)
 *     const pdfBuffer = await this.pdfGenerator.generateActaCompromiso();
 * 
 *     // 4. Guardar en uploads (usa método del base)
 *     const result = await this._saveToUploads(student, pdfBuffer, relativeScope, fileName);
 * 
 *     // 5. Guardar en BD (usa método del base)
 *     await this._saveDocumentToDatabase(studentId, {...});
 * 
 *     return result;
 *   }
 * }
 */
export class BaseDocumentGenerationUseCase {
    /**
     * @param {Object} params - Parámetros de configuración
     * @param {Object} params.studentDocumentRepository - Repositorio de documentos de estudiantes (requerido)
     * @param {IPDFGenerator} params.pdfGenerator - Servicio de generación PDF (requerido)
     * @param {IUploadsStorage} params.uploadsStorage - Servicio de almacenamiento en uploads (requerido)
     * @param {ILogger} params.logger - Logger para registro de eventos (requerido)
     * @param {string} params.moduleName - Nombre del módulo para logs (ej: 'Estudiantes', 'Pagos')
     * @param {string} params.documentType - Tipo de documento para logs (ej: 'ACTA DE COMPROMISO', 'RECIBO DE PAGO')
     * @param {Object} [params.configuracionSistemaRepository] - Repositorio de configuración del sistema (opcional, para obtener gestión activa)
     * @param {Object} [params.managementRepository] - Repositorio de gestiones (opcional, para obtener gestión activa)
     */
    constructor({
        studentDocumentRepository,
        pdfGenerator,
        uploadsStorage,
        logger,
        moduleName,
        documentType,
        configuracionSistemaRepository = null,
        managementRepository = null,
    }) {
        if (!studentDocumentRepository) {
            throw new Error('studentDocumentRepository es requerido');
        }
        if (!pdfGenerator) {
            throw new Error('pdfGenerator es requerido');
        }
        if (!uploadsStorage) {
            throw new Error('uploadsStorage es requerido');
        }
        if (!logger) {
            throw new Error('logger es requerido');
        }
        if (!moduleName) {
            throw new Error('moduleName es requerido');
        }
        if (!documentType) {
            throw new Error('documentType es requerido');
        }

        this.studentDocumentRepository = studentDocumentRepository;
        this.pdfGenerator = pdfGenerator;
        this.uploadsStorage = uploadsStorage;
        this.logger = logger;
        this.moduleName = moduleName;
        this.documentType = documentType;
        this.configuracionSistemaRepository = configuracionSistemaRepository;
        this.managementRepository = managementRepository;
    }

    /**
     * Guarda el documento en uploads y retorna las rutas
     * 
     * Método helper común usado por todas las subclases
     * 
     * @protected
     * @param {number} studentId - ID del estudiante (para logging)
     * @param {Buffer} pdfBuffer - Buffer del PDF generado
     * @param {string} relativeScope - Ruta relativa dentro de uploads
     * @param {string} fileName - Nombre del archivo
     * @returns {Object} Objeto con filePath, fileName, absolutePath
     */
    async _saveToUploads(studentId, pdfBuffer, relativeScope, fileName) {
        const result = this.uploadsStorage.saveToUploads(relativeScope, fileName, pdfBuffer);

        this.logger.info(`[${this.moduleName}] Documento guardado en uploads`, {
            studentId,
            filePath: result.filePath,
            absolutePath: result.absolutePath,
        });

        return result;
    }

    /**
     * Guarda la información del documento en la base de datos
     * 
     * Método helper común usado por todas las subclases que necesitan guardar en BD.
     * Recibe el resultado de _saveToUploads y los metadatos específicos del documento.
     * 
     * @protected
     * @param {number} studentId - ID del estudiante
     * @param {Object} uploadResult - Resultado de _saveToUploads (contiene fileName, filePath, absolutePath)
     * @param {string} uploadResult.fileName - Nombre del archivo
     * @param {string} uploadResult.filePath - Ruta relativa del archivo
     * @param {string} uploadResult.absolutePath - Ruta absoluta del archivo
     * @param {Object} metadata - Metadatos específicos del documento
     * @param {string} metadata.extension - Extensión del archivo (ej: 'pdf'). Si no se proporciona, se infiere del fileName
     * @param {string} metadata.tipoDocumento - Tipo de documento (ej: 'ACTA_COMPROMISO', 'INSCRIPCION')
     * @param {number} [metadata.documentacionId] - ID de documentación específica (opcional)
     * @returns {Promise<Object|null>} Documento guardado en BD o null si ya existe
     */
    async _saveDocumentToDatabase(studentId, uploadResult, metadata) {
        try {
            // Inferir extensión del fileName si no se proporciona
            const extension = metadata.extension || uploadResult.fileName.split('.').pop() || 'pdf';

            // Verificar si ya existe un documento con el mismo filePath
            const existingDocument = await this.studentDocumentRepository.findBy({
                studentId,
                filePath: uploadResult.filePath,
            });

            if (existingDocument) {
                // Si existe, actualizar el documento existente
                this.logger.info(`[${this.moduleName}] Documento ya existe, actualizando`, {
                    studentId,
                    documentId: existingDocument.id,
                    filePath: uploadResult.filePath,
                });

                const updated = await this.studentDocumentRepository.update(existingDocument.id, {
                    fileName: uploadResult.fileName,
                    filePath: uploadResult.filePath,
                    extension: extension,
                    tipoMime: extension === 'pdf' ? 'application/pdf' : null,
                });

                return updated || existingDocument;
            }

            // Si no existe, crear nuevo documento
            const documentData = {
                studentId,
                tipoDocumento: metadata.tipoDocumento,
                documentacionId: metadata.documentacionId || null,
                fileName: uploadResult.fileName,
                filePath: uploadResult.filePath,
                extension: extension,
                tipoMime: extension === 'pdf' ? 'application/pdf' : null,
                contieneMultipleDocumentos: false,
                verified: true, // Documentos generados por el sistema se consideran verificados
                state: metadata.state || 'APROBADO', // Documentos generados por el sistema están aprobados automáticamente
            };

            const savedDocument = await this.studentDocumentRepository.create(documentData);

            this.logger.info(`[${this.moduleName}] Documento guardado en BD`, {
                studentId,
                documentId: savedDocument.id,
                fileName: uploadResult.fileName,
                filePath: uploadResult.filePath,
            });

            return savedDocument;
        } catch (error) {
            this.logger.error(`[${this.moduleName}] Error al guardar documento en BD`, {
                studentId,
                error: error.message,
                stack: error.stack,
                uploadResult,
                metadata,
            });
            // No lanzar error para no interrumpir el proceso si falla el guardado en BD
            return null;
        }
    }

    /**
     * Obtiene la gestión vigente actual desde la configuración del sistema
     * 
     * Método común usado por casos de uso que necesitan la gestión activa
     * Similar al método en CreateStudentScholarshipUseCase, RegisterAporteVoluntarioUseCase y GenerateBoletaInscripcionUseCase
     * 
     * @protected
     * @returns {Promise<Object>} Entidad Management
     * @throws {NotFoundError} Si no se encuentra la configuración o la gestión
     * @throws {ValidationError} Si la gestión no está vigente o los repositorios no están inyectados
     */
    async _getCurrentManagement() {
        if (!this.configuracionSistemaRepository) {
            throw new ValidationError('configuracionSistemaRepository no está inyectado. Inyéctalo en el constructor si necesitas obtener la gestión activa.');
        }
        if (!this.managementRepository) {
            throw new ValidationError('managementRepository no está inyectado. Inyéctalo en el constructor si necesitas obtener la gestión activa.');
        }

        // 1. Obtener la gestión actual desde la configuración del sistema
        const gestionActualConfig = await this.configuracionSistemaRepository.findBy({
            key: 'gestion_actual',
        });

        // 2. Validar que se encontró la configuración
        if (!gestionActualConfig) {
            throw new NotFoundError('Configuración de gestión actual no encontrada');
        }

        // 3. Convertir el año académico a número
        const gestionAnio = parseInt(gestionActualConfig.value, 10);
        if (isNaN(gestionAnio)) {
            throw new ValidationError('La gestión actual configurada no es un año válido');
        }

        // 4. Buscar la gestión vigente por año usando findBy
        // Filtrar directamente por año y vigente: true en la consulta
        const management = await this.managementRepository.findBy({
            year: gestionAnio,
            vigente: true,
        });

        // 5. Validar que se encontró la gestión vigente
        if (!management) {
            throw new NotFoundError(`No se encontró una gestión vigente para el año ${gestionAnio}`);
        }

        this.logger.info(`[${this.moduleName}] Gestión vigente obtenida desde configuración`, {
            managementId: management.id,
            year: management.year,
        });

        return management;
    }

    /**
     * Obtiene el año de la gestión vigente actual
     * 
     * Método helper que extrae el año de la gestión activa con fallback
     * Usa _getCurrentManagement() internamente y maneja la extracción del año
     * 
     * @protected
     * @returns {Promise<number>} Año de la gestión activa
     * @throws {NotFoundError} Si no se encuentra la configuración o la gestión
     * @throws {ValidationError} Si la gestión no está vigente o los repositorios no están inyectados
     */
    async _getCurrentManagementYear() {
        const management = await this._getCurrentManagement();
        const gestionYear = management.year || management.anio || new Date().getFullYear();

        this.logger.info(`[${this.moduleName}] Año de gestión obtenido`, {
            gestionYear,
            managementId: management.id,
        });

        return gestionYear;
    }

    /**
     * Ejecuta el caso de uso de generación de documento
     * 
     * NOTA: Este método debe ser sobrescrito por cada caso de uso particular.
     * El base solo proporciona métodos helper (_saveToUploads, _saveDocumentToDatabase, _getCurrentManagement, _getCurrentManagementYear).
     * 
     * Cada caso de uso es responsable de:
     * 1. Validar estudiante (lógica propia, cada caso tiene sus necesidades)
     * 2. Buscar sus propios datos (lógica específica)
     * 3. Construir la información para el PDF (lógica específica)
     * 4. Llamar al método específico del PDFGenerator (lógica específica)
     * 5. Guardar en uploads (usar _saveToUploads)
     * 6. Guardar en BD si es necesario (usar _saveDocumentToDatabase con el result de _saveToUploads y los metadatos)
     * 
     * @abstract
     * @param {number} studentId - ID del estudiante
     * @param {Object} options - Opciones adicionales (por defecto vacío)
     * @returns {Promise<{filePath: string, fileName: string, absolutePath: string}>} Rutas del documento generado
     * @throws {Error} Si falla la generación del documento
     */
    async execute(studentId, options = {}) {
        throw new Error('Method execute must be implemented by subclass');
    }
}
