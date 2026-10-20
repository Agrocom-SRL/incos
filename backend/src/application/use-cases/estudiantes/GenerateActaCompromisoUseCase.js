import { NotFoundError } from '../../../domain/errors/AppError.js';
import { TIPOS_DOCUMENTO_SISTEMA } from '../../../domain/constants/index.js';
import { UPLOAD } from '../../../infrastructure/config/uploads.config.js';
import { BaseDocumentGenerationUseCase } from '../base/BaseDocumentGenerationUseCase.js';

/** Tipo de admisión TRASPASO para incluir documentos de traspaso en el acta */
const TIPO_ADMISION_TRASPASO = 'TRASPASO';

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
     * @param {Object} params.studentAcademicDataRepository - Repositorio de datos académicos (para saber si es TRASPASO)
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
        studentAcademicDataRepository,
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
        this.studentAcademicDataRepository = studentAcademicDataRepository || null;
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
    async execute(studentId, _options = {}) {
        this.logger.info('[Estudiantes] Iniciando generación de ACTA DE COMPROMISO', {
            studentId,
        });

        try {
            // 1. Validar y obtener estudiante
            const student = await this._validateAndGetStudent(studentId);

            // 2. Determinar si es estudiante de tipo TRASPASO (para incluir documentos de traspaso no entregados)
            const esTraspaso = await this._isStudentTraspaso(studentId);

            // 3. Buscar entregas de documentos no entregados: INSCRIPCION (raíz) y, si es TRASPASO, también TRASPASO (raíz)
            const entregasConDetalle = await this._fetchDocumentDeliveries(studentId, esTraspaso);

            // 4. Obtener año de gestión activa (usa método del base)
            const gestionYear = await this._getCurrentManagementYear();

            // 5. Generar PDF con gestión activa, datos del estudiante y entregas
            const pdfBuffer = await this._generatePdfBuffer(gestionYear, student, entregasConDetalle);

            // 6. Guardar archivo y persistir en BD
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
     * Indica si el estudiante es de tipo admisión TRASPASO (para incluir documentos de traspaso en el acta).
     *
     * @private
     * @param {number} studentId - ID del estudiante
     * @returns {Promise<boolean>} true si tipo admisión es TRASPASO
     */
    async _isStudentTraspaso(studentId) {
        if (!this.studentAcademicDataRepository) {
            return false;
        }
        try {
            const result = await this.studentAcademicDataRepository.findAll(
                { studentId },
                null,
                null
            );
            const list = result.studentAcademicData || [];
            if (list.length === 0) return false;
            const first = list[0];
            const plain = first.toPlainObject ? first.toPlainObject() : first;
            const tipo = (plain.tipoAdmision ?? plain.admissionType ?? '').toString().toUpperCase();
            return tipo === TIPO_ADMISION_TRASPASO;
        } catch (err) {
            this.logger.warn('[Estudiantes] Error al obtener tipo de admisión para acta', {
                studentId,
                error: err.message,
            });
            return false;
        }
    }

    /**
     * Busca las entregas de documentos no entregados: INSCRIPCION (raíz) y, si es TRASPASO, también TRASPASO (raíz).
     * El PDF espera filas con nombre_documento (snake_case desde la vista).
     *
     * @private
     * @param {number} studentId - ID del estudiante
     * @param {boolean} esTraspaso - Si el estudiante es de tipo admisión TRASPASO
     * @returns {Promise<Array>} Lista de entregas con detalle (no entregadas)
     */
    async _fetchDocumentDeliveries(studentId, esTraspaso = false) {
        const baseFilters = {
            estudiante_id: studentId,
            documento_padre_id: null,
            entregado: false,
        };

        const entregasInscripcion = await this.studentDocumentDeliveryRepository.obtenerEntregasConDetalle({
            ...baseFilters,
            tipo_documento: TIPOS_DOCUMENTO_SISTEMA.INSCRIPCION,
        });

        let entregasTraspaso = [];
        if (esTraspaso) {
            entregasTraspaso = await this.studentDocumentDeliveryRepository.obtenerEntregasConDetalle({
                ...baseFilters,
                tipo_documento: TIPOS_DOCUMENTO_SISTEMA.TRASPASO,
            });
        }

        const todas = [...entregasInscripcion, ...entregasTraspaso];

        this.logger.info('[Estudiantes] Entregas con detalle obtenidas para acta', {
            studentId,
            esTraspaso,
            cantidadInscripcion: entregasInscripcion.length,
            cantidadTraspaso: entregasTraspaso.length,
            cantidadTotal: todas.length,
        });

        return todas;
    }

    /**
     * Genera el buffer del PDF del acta de compromiso
     *
     * @private
     * @param {number} gestionYear - Año de gestión activa
     * @param {Object} student - Datos del estudiante
     * @param {Array} entregasConDetalle - Lista de entregas de documentos con detalle
     * @returns {Promise<Buffer>} Buffer del PDF generado
     */
    async _generatePdfBuffer(gestionYear, student, entregasConDetalle) {
        // Obtener fecha actual desde el método del base
        const fechaActual = this._getCurrentDate();

        // Valor estático de días de plazo (hasta que se implemente la lógica de plazos)
        const diasPlazo = 30;

        // Pasar todos los datos necesarios al generador de PDF
        return await this.pdfGenerator.generateActaCompromiso({
            gestion: gestionYear,
            student: {
                id: student.id,
                codigoEstudiante: student.codigoEstudiante,
                ci: student.ci,
                expedicion: student.expedition,
                nombres: student.firstName,
                apellidoPaterno: student.lastName,
                apellidoMaterno: student.motherLastName,
            },
            fechaActual,
            entregas: entregasConDetalle || [],
            diasPlazo,
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
        const fileName = `acta_compromiso_${student.studentCode}.pdf`;

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
