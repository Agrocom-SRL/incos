import { NotFoundError } from '../../../domain/errors/AppError.js';
import { UPLOAD } from '../../../infrastructure/config/uploads.config.js';
import { BaseDocumentGenerationUseCase } from '../base/BaseDocumentGenerationUseCase.js';

/**
 * Use Case: GenerateFormularioInscripcionUseCase
 * Módulo: Inscripciones
 * Genera el FORMULARIO DE INSCRIPCIÓN (PDF) para un estudiante.
 *
 * Extiende BaseDocumentGenerationUseCase para reutilizar lógica común de generación de documentos.
 *
 * Flujo: PDF directo desde plantilla (Plantilla.pdf) → guardar PDF en uploads →
 * retornar rutas del PDF generado.
 *
 * Tecnología: Usa IPDFGenerator (inyectado vía DI) que internamente usa FormularioInscripcionPdfGenerator
 * con pdf-lib para editar la plantilla PDF.
 *
 * Por ahora se genera documento base (título, secciones, placeholders). La construcción con datos
 * completos (inscripción, materias, etc.) se añadirá durante la migración.
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
 *
 * @module GenerateFormularioInscripcionUseCase
 */
export class GenerateFormularioInscripcionUseCase extends BaseDocumentGenerationUseCase {
    /**
     * @param {Object} params - Dependencias inyectadas
     * @param {Object} params.studentRepository - Repositorio de estudiantes (específico, para validar estudiante)
     * @param {Object} params.studentDocumentRepository - Repositorio de documentos de estudiantes (común, para guardar en BD)
     * @param {Object} params.configuracionSistemaRepository - Repositorio de configuración del sistema (para obtener gestión activa)
     * @param {Object} params.managementRepository - Repositorio de gestiones (para obtener gestión activa)
     * @param {IPDFGenerator} params.pdfGenerator - Servicio de generación PDF (DI, implementa IPDFGenerator)
     * @param {IUploadsStorage} params.uploadsStorage - Servicio de almacenamiento en uploads (DI)
     * @param {ILogger} params.logger - Logger para registro de eventos
     */
    constructor({
        studentRepository,
        studentDocumentRepository,
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
            moduleName: 'Inscripciones',
            documentType: 'FORMULARIO DE INSCRIPCIÓN',
            configuracionSistemaRepository,
            managementRepository,
        });

        // Repositorio específico para validar y obtener datos del estudiante
        this.studentRepository = studentRepository;
    }

    /**
     * Ejecuta el caso de uso de generación del formulario de inscripción
     *
     * Orquesta el flujo completo de generación del documento:
     * 1. Validar y obtener estudiante
     * 2. Obtener gestión activa
     * 3. Generar PDF
     * 4. Guardar archivo y persistir en BD
     *
     * @param {number} studentId - ID del estudiante
     * @param {Object} options - Opciones adicionales (por defecto vacío)
     * @returns {Promise<{filePath: string, fileName: string, absolutePath: string}>} Rutas del PDF generado
     * @throws {Error} Si falla la generación del PDF
     */
    async execute(studentId, options = {}) {
        this.logger.info('[Inscripciones] Iniciando generación de FORMULARIO DE INSCRIPCIÓN', {
            studentId,
        });

        try {
            // 1. Validar y obtener estudiante
            const student = await this._validateAndGetStudent(studentId);

            // 2. Obtener año de gestión activa (usa método del base)
            const gestionYear = await this._getCurrentManagementYear();

            // 3. Generar PDF con gestión activa y datos del estudiante
            const pdfBuffer = await this._generatePdfBuffer(gestionYear, student);

            // 4. Guardar archivo y persistir en BD
            const result = await this._persistDocument(studentId, pdfBuffer, student);

            this.logger.info('[Inscripciones] Formulario de inscripción PDF generado correctamente', {
                studentId,
                filePath: result.filePath,
                absolutePath: result.absolutePath,
            });

            return result;
        } catch (error) {
            this.logger.error('[Inscripciones] Error al generar FORMULARIO DE INSCRIPCIÓN', {
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
     * Genera el buffer del PDF del formulario de inscripción
     *
     * @private
     * @param {number} gestionYear - Año de gestión activa
     * @param {Object} student - Datos del estudiante
     * @returns {Promise<Buffer>} Buffer del PDF generado
     */
    async _generatePdfBuffer(gestionYear, student) {
        // Obtener fecha actual desde el método del base
        const fechaActual = this._getCurrentDate();

        // Pasar todos los datos necesarios al generador de PDF
        return await this.pdfGenerator.generateFormularioInscripcion({
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
            fechaActual: fechaActual,
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
        const fileName = `formulario_inscripcion_${student.studentCode}.pdf`;

        // Guardar PDF en uploads (usa método del base)
        const result = await this._saveToUploads(studentId, pdfBuffer, relativeScope, fileName);

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
