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
     * Valida y obtiene el estudiante por ID desde vista_estudiante_datos_personales.
     * Parsea apoderados, origenes y discapacidades (JSON de la vista) a arrays.
     *
     * @private
     * @param {number} studentId - ID del estudiante
     * @returns {Promise<Object>} Datos del estudiante (normalizados + apoderados, origenes, discapacidades como arrays)
     * @throws {NotFoundError} Si el estudiante no existe
     */
    async _validateAndGetStudent(studentId) {
        const results = await this.studentRepository.obtenerDatosPersonales({ id: studentId });

        if (!results || results.length === 0) {
            throw new NotFoundError(`Estudiante con ID ${studentId}`);
        }

        const row = results[0];
        return this._normalizeStudentFromView(row);
    }

    /**
     * Normaliza una fila de vista_estudiante_datos_personales.
     * Mapeo 1:1 con la vista; claves en español (como Acta). Sin duplicados.
     * Parsea apoderados, origenes y discapacidades (JSON de la vista) a arrays.
     *
     * @private
     * @param {Object} row - Fila plana de la vista (snake_case)
     * @returns {Object} Estudiante normalizado (claves español) con apoderados, origenes, discapacidades como Array
     */
    _normalizeStudentFromView(row) {
        const apoderados = this._ensureArray(row.apoderados);
        const origenes = this._ensureArray(row.origenes);
        const discapacidades = this._ensureArray(row.discapacidades);

        return {
            id: row.id,
            codigoEstudiante: row.codigo_estudiante,
            ci: row.ci,
            expedicion: row.expedicion,
            nombres: row.nombres,
            apellidoPaterno: row.apellido_paterno,
            apellidoMaterno: row.apellido_materno,
            fechaNacimiento: row.fecha_nacimiento,
            genero: row.genero,
            estadoCivilId: row.estado_civil_id,
            estadoCivilNombre: row.estado_civil_nombre,
            estadoCivilAbreviatura: row.estado_civil_abreviatura,
            tipoSangre: row.tipo_sangre,
            tieneDiscapacidad: row.tiene_discapacidad,
            emailPersonal: row.email_personal,
            celular: row.celular,
            telefonoFijo: row.telefono_fijo,
            direccion: row.direccion,
            municipioResidenciaId: row.municipio_residencia_id,
            zona: row.zona,
            residenciaMunicipioNombre: row.residencia_municipio_nombre,
            residenciaProvinciaNombre: row.residencia_provincia_nombre,
            residenciaDepartamentoNombre: row.residencia_departamento_nombre,
            apoderados,
            origenes,
            discapacidades,
        };
    }

    /**
     * Asegura que un valor (JSON string o ya parseado) sea un array.
     * Los COALESCE de la vista devuelven JSON; el driver puede devolver string u objeto.
     *
     * @private
     * @param {string|Array|null|undefined} value - Valor de apoderados, origenes o discapacidades
     * @returns {Array}
     */
    _ensureArray(value) {
        if (value == null) return [];
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        }
        return [];
    }

    /**
     * Genera el buffer del PDF del formulario de inscripción.
     * Pasa student con claves en español (como Acta): id, codigoEstudiante, ci, expedicion, nombres, apellidoPaterno, apellidoMaterno.
     * Calcula edad y fecha literal de nacimiento y las pasa en options.
     *
     * @private
     * @param {number} gestionYear - Año de gestión activa
     * @param {Object} student - Estudiante normalizado desde vista (claves español)
     * @returns {Promise<Buffer>} Buffer del PDF generado
     */
    async _generatePdfBuffer(gestionYear, student) {
        const fechaActual = this._getCurrentDate();
        const fechaNacimientoLiteral = this._formatFechaLiteral(student.fechaNacimiento);
        const edad = this._calcEdad(student.fechaNacimiento);

        return await this.pdfGenerator.generateFormularioInscripcion({
            gestion: gestionYear,
            student: {
                ...student,
                fechaNacimientoLiteral,
                edad,
            },
            fechaActual,
        });
    }

    /**
     * Formatea fecha YYYY-MM-DD a formato literal "día de mes de año" (ej: "25 de enero de 2026").
     * Similar a _getCurrentDate pero para fecha de nacimiento.
     *
     * @private
     * @param {string|undefined|null} fecha - fecha_nacimiento (YYYY-MM-DD)
     * @returns {string} Fecha formateada o '—' si falta o no parsea
     */
    _formatFechaLiteral(fecha) {
        if (fecha == null || fecha === '') return '—';
        const str = String(fecha).trim();
        const m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (!m) return '—';

        const day = Number(m[3]);
        const month = Number(m[2]) - 1; // 0-indexed
        const year = Number(m[1]);

        const monthNames = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];

        if (month < 0 || month >= 12) return '—';
        return `${day} de ${monthNames[month]} de ${year}`;
    }

    /**
     * Calcula edad en años desde fecha_nacimiento. Retorna '—' si falta o no parsea.
     *
     * @private
     * @param {string|undefined|null} fecha - fecha_nacimiento (YYYY-MM-DD)
     * @returns {string} Edad en años o '—'
     */
    _calcEdad(fecha) {
        if (fecha == null || fecha === '') return '—';
        const str = String(fecha).trim();
        const m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (!m) return '—';
        const birth = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const mDiff = today.getMonth() - birth.getMonth();
        if (mDiff < 0 || (mDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
        return age >= 0 ? String(age) : '—';
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
        const fileName = `formulario_inscripcion_${student.codigoEstudiante}.pdf`;

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
