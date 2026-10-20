import { GenerateFormularioInscripcionUseCase } from '../inscripciones/GenerateFormularioInscripcionUseCase.js';
import { TIPOS_DOCUMENTO_SISTEMA } from '../../../domain/constants/index.js';
import { UPLOAD } from '../../../infrastructure/config/uploads.config.js';

/**
 * Use Case: GenerateDeclaracionJuradaUseCase
 * Módulo: Estudiantes
 *
 * Genera la DECLARACIÓN JURADA para estudiantes con tipo de admisión
 * TRASPASO / TRANSITABILIDAD (o cualquier otro), reutilizando la misma
 * fuente de datos que el formulario de inscripción pero delegando en un
 * generador PDF específico (DeclaracionJuradaPdfGenerator).
 *
 * Diferencias principales respecto a GenerateFormularioInscripcionUseCase:
 * - Usa PDFGenerator.generateFormularioDeclaracionJurada en lugar de
 *   generateFormularioInscripcion.
 * - Permite recibir opciones adicionales (ej. tipoAdmision) desde el
 *   controlador y propagarlas hasta el generador.
 * - Persiste el documento con nombre de archivo específico y tipo de
 *   documento diferenciados.
 */
export class GenerateDeclaracionJuradaUseCase extends GenerateFormularioInscripcionUseCase {
    /**
     * @param {Object} deps - Dependencias inyectadas (mismas que GenerateFormularioInscripcionUseCase)
     */
    constructor(deps) {
        super(deps);
        // Sobrescribir el tipo de documento para registros en BD / logs
        this.documentType = 'DECLARACIÓN JURADA';

        // Repositorios adicionales para secciones de Formación Académica / Justificación / Documentos Presentados
        this.transitabilityRepository = deps.transitabilityRepository || null;
        this.transferRepository = deps.transferRepository || null;
        this.institutionRepository = deps.institutionRepository || null;
        this.documentacionRepository = deps.documentacionRepository || null;
    }

    /**
     * Ejecuta el caso de uso de generación de Declaración Jurada.
     *
     * Orquesta el flujo completo:
     * 1. Validar y obtener estudiante (misma vista que formulario de inscripción)
     * 2. Obtener gestión activa
     * 3. Obtener datos académicos e inscripción actual
     * 4. Obtener documentos entregados
     * 5. Generar PDF específico de Declaración Jurada
     * 6. Guardar archivo y persistir en BD
     *
     * @param {number} studentId - ID del estudiante
     * @param {Object} options - Opciones adicionales (ej: { tipoAdmision })
     * @returns {Promise<{filePath: string, fileName: string, absolutePath: string}>}
     */
    async execute(studentId, options = {}) {
        this.logger.info('[Estudiantes] Iniciando generación de DECLARACIÓN JURADA', {
            studentId,
            tipoAdmision: options.tipoAdmision ?? null,
        });

        try {
            // 1. Validar y obtener estudiante (datos personales, origen, discapacidad, etc.)
            const student = await this._validateAndGetStudent(studentId);

            // 2. Obtener gestión activa (usa método del base)
            const currentManagement = await this._getCurrentManagement();
            const gestionYear = currentManagement.year || currentManagement.anio;

            // 3. Obtener datos académicos del estudiante (carrera, tipo de admisión, etc.)
            const academicData = await this._fetchAcademicData(studentId);

            // 4. Obtener inscripción actual con materias (se usará de forma resumida)
            const enrollmentData = await this._fetchEnrollmentData(studentId, currentManagement.id);

            // 5. Obtener documentos entregados
            const entregas = await this._fetchDocumentDeliveries(studentId);

            // 5b. Para TRASPASO: lista de documentos presentados desde vista (entregados), misma lógica que acta pero invertida (entregado: true)
            const documentosPresentadosTraspaso =
                (academicData?.tipoAdmision || student.tipoAdmision || '').toString().trim().toUpperCase() === 'TRASPASO'
                    ? await this._fetchDocumentosPresentadosTraspaso(studentId)
                    : null;

            // 6. Generar PDF de Declaración Jurada
            const pdfBuffer = await this._generatePdfBuffer(
                gestionYear,
                student,
                academicData,
                enrollmentData,
                entregas,
                documentosPresentadosTraspaso,
                options,
            );

            // 7. Guardar archivo y persistir en BD
            const result = await this._persistDocument(studentId, pdfBuffer, student);

            this.logger.info('[Estudiantes] Declaración jurada PDF generada correctamente', {
                studentId,
                filePath: result.filePath,
                absolutePath: result.absolutePath,
            });

            return result;
        } catch (error) {
            this.logger.error('[Estudiantes] Error al generar DECLARACIÓN JURADA', {
                studentId,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    /**
     * Genera el buffer del PDF de Declaración Jurada.
     * Reutiliza el cálculo de fecha de nacimiento literal y edad del
     * formulario de inscripción, pero delega en el nuevo generador PDF.
     *
     * @private
     * @param {number} gestionYear
     * @param {Object} student
     * @param {Object|null} academicData
     * @param {Object|null} enrollmentData
     * @param {Array} entregas
     * @param {Array|null} documentosPresentadosTraspaso - Para TRASPASO: [{ id, nombre, presentado }]
     * @param {Object} options - Opciones adicionales (ej: { tipoAdmision })
     * @returns {Promise<Buffer>}
     */
    async _generatePdfBuffer(gestionYear, student, academicData, enrollmentData, entregas,
      documentosPresentadosTraspaso, options = {}) {
        const fechaActual = this._getCurrentDate();
        const fechaNacimientoLiteral = this._formatFechaLiteral(student.fechaNacimiento);
        const edad = this._calcEdad(student.fechaNacimiento);

        const tipoAdmision =
            options.tipoAdmision ??
            academicData?.tipoAdmision ??
            student.tipoAdmision ??
            null;

        // Datos específicos de transitabilidad / traspaso e institución de origen
        const rawTipo = (tipoAdmision || '').toString().trim().toUpperCase();
        let transitabilityData = null;
        let transferData = null;
        let institutionData = null;

        if (rawTipo === 'TRASPASO' && this.transferRepository) {
            try {
                const transfer = await this.transferRepository.findBy({
                    studentId: student.id,
                });
                if (transfer) {
                    const plain =
                        typeof transfer.toPlainObject === 'function'
                            ? transfer.toPlainObject()
                            : transfer;
                    transferData = plain;
                    const institucionOrigenId =
                        plain.institucionOrigenId ?? plain.institucion_origen_id;
                    if (institucionOrigenId && this.institutionRepository) {
                        const institution = await this.institutionRepository.findById(
                            institucionOrigenId
                        );
                        if (institution) {
                            institutionData =
                                typeof institution.toPlainObject === 'function'
                                    ? institution.toPlainObject()
                                    : institution;
                        }
                    }
                }
            } catch (error) {
                this.logger.error(
                    '[Estudiantes] Error al obtener datos de traspaso/institución para declaración jurada',
                    { studentId: student.id, error: error.message, stack: error.stack }
                );
            }
        } else if (this.transitabilityRepository) {
            try {
                const transitability = await this.transitabilityRepository.findBy({
                    studentId: student.id,
                });

                if (transitability) {
                    const plain =
                        typeof transitability.toPlainObject === 'function'
                            ? transitability.toPlainObject()
                            : transitability;
                    transitabilityData = plain;

                    const institucionOrigenId =
                        plain.institucionOrigenId ?? plain.institucion_origen_id;

                    if (institucionOrigenId && this.institutionRepository) {
                        const institution = await this.institutionRepository.findById(
                            institucionOrigenId
                        );
                        if (institution) {
                            institutionData =
                                typeof institution.toPlainObject === 'function'
                                    ? institution.toPlainObject()
                                    : institution;
                        }
                    }
                }
            } catch (error) {
                this.logger.error(
                    '[Estudiantes] Error al obtener datos de transitabilidad/institución para declaración jurada',
                    {
                        studentId: student.id,
                        error: error.message,
                        stack: error.stack,
                    }
                );
            }
        }

        return await this.pdfGenerator.generateFormularioDeclaracionJurada({
            gestion: gestionYear,
            student: {
                ...student,
                fechaNacimientoLiteral,
                edad,
                tipoAdmision,
            },
            academicData: {
                ...(academicData || {}),
                tipoAdmision: academicData?.tipoAdmision ?? tipoAdmision ?? null,
            },
            enrollmentData,
            entregas,
            documentosPresentadosTraspaso: documentosPresentadosTraspaso || undefined,
            fechaActual,
            signatureTwoColumns: true,
            tipoAdmision,
            transitabilityData,
            transferData,
            institutionData,
        });
    }

    /**
     * Obtiene la lista de documentos presentados (entregados) para el formulario de Traspaso.
     * Usa la misma vista y repositorio que el acta de compromiso, pero con entregado: true
     * (inverso del acta, que lista los no entregados).
     * Orden: TRASPASO (por orden) + INSCRIPCION ids 3, 2, 1. Los últimos tres se muestran como "Fotocopia de ...".
     *
     * @private
     * @param {number} studentId
     * @returns {Promise<Array<{ nombre: string }>>}
     */
    async _fetchDocumentosPresentadosTraspaso(studentId) {
        try {
            const orderedDocIds = await this._getOrderedDocumentacionIdsTraspasoForm();
            if (orderedDocIds.length === 0) return [];

            const entregasEntregadas = await this.studentDocumentDeliveryRepository.obtenerEntregasConDetalle({
                estudiante_id: studentId,
                documento_padre_id: null,
                entregado: true,
            });

            const byDocId = new Map();
            for (const e of entregasEntregadas || []) {
                const id = e.documentacion_id != null ? Number(e.documentacion_id) : null;
                if (id != null && orderedDocIds.includes(id) && !byDocId.has(id)) {
                    byDocId.set(id, e);
                }
            }

            const idsUltimos3 = [3, 2, 1];
            const result = [];
            for (const id of orderedDocIds) {
                const entrega = byDocId.get(id);
                if (!entrega) continue;
                const nombreDoc = (entrega.nombre_documento || entrega.nombreDocumento || '').toString().trim();
                const nombre = idsUltimos3.includes(id)
                    ? (nombreDoc ? `Fotocopia de ${nombreDoc}` : '')
                    : nombreDoc;
                if (nombre) result.push({ nombre });
            }

            this.logger.info('[Estudiantes] Documentos presentados traspaso obtenidos desde vista', {
                studentId,
                cantidad: result.length,
            });
            return result;
        } catch (error) {
            this.logger.error('[Estudiantes] Error al obtener documentos presentados traspaso', {
                studentId,
                error: error.message,
            });
            return [];
        }
    }

    /**
     * Orden de documentacion_id para "Documentos Presentados" del formulario de Traspaso:
     * primero TRASPASO (por orden en BD), luego INSCRIPCION 3, 2, 1 (Carnet, Cert. Nacimiento, Diploma).
     *
     * @private
     * @returns {Promise<number[]>}
     */
    async _getOrderedDocumentacionIdsTraspasoForm() {
        const idsInscripcionUltimos3 = [3, 2, 1];
        if (!this.documentacionRepository) {
            return idsInscripcionUltimos3;
        }
        try {
            const docsTraspaso = await this.documentacionRepository.findAll(
                { documentType: TIPOS_DOCUMENTO_SISTEMA.TRASPASO, parentDocumentId: null },
                null,
                null
            );
            const listTraspaso = (docsTraspaso.documentations || [])
                .map((d) => ({ id: d.id, order: d.order ?? 0 }))
                .sort((a, b) => a.order - b.order);
            const traspasoIds = listTraspaso.map((d) => Number(d.id)).filter((id) => !Number.isNaN(id));
            return [...traspasoIds, ...idsInscripcionUltimos3];
        } catch (err) {
            this.logger.warn('[Estudiantes] Error al obtener IDs documentación traspaso, usando solo INSCRIPCION', {
                error: err.message,
            });
            return idsInscripcionUltimos3;
        }
    }

    /**
     * Persiste el documento: guarda en uploads y registra en BD.
     *
     * Sobrescribe solo el nombre de archivo y tipoDocumento para que
     * quede claro que se trata de una declaración jurada.
     *
     * @private
     * @param {number} studentId
     * @param {Buffer} pdfBuffer
     * @param {Object} student
     * @returns {Promise<{filePath: string, fileName: string, absolutePath: string}>}
     */
    async _persistDocument(studentId, pdfBuffer, student) {
        const relativeScope = UPLOAD.studentDocuments(studentId);
        const fileName = `declaracion_jurada_${student.codigoEstudiante}.pdf`;

        // Guardar PDF en uploads (método heredado de BaseDocumentGenerationUseCase)
        const result = await this._saveToUploads(studentId, pdfBuffer, relativeScope, fileName);

        // Guardar información del documento en BD
        // Nota: por ahora se registra como tipoDocumento 'INSCRIPCION';
        // si en el futuro se agrega un tipo específico, se puede cambiar aquí.
        await this._saveDocumentToDatabase(studentId, result, {
            extension: 'pdf',
            tipoDocumento: 'INSCRIPCION',
            documentacionId: null,
            state: 'APROBADO',
        });

        return result;
    }
}
