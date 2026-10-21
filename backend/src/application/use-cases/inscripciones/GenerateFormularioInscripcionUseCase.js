import fs from 'fs';
import path from 'path';
import { NotFoundError } from '../../../domain/errors/AppError.js';
import { TIPOS_DOCUMENTO_SISTEMA } from '../../../domain/constants/index.js';
import { UPLOAD } from '../../../infrastructure/config/uploads.config.js';
import { serverConfig } from '../../../infrastructure/config/server.config.js';
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
     * @param {Object} params.enrollmentRepository - Repositorio de inscripciones (para obtener inscripción actual con materias)
     * @param {Object} params.studentAcademicDataRepository - Repositorio de datos académicos (para obtener carrera y datos académicos)
     * @param {Object} params.studentDocumentDeliveryRepository - Repositorio de entregas de documentos (para obtener documentos entregados)
     * @param {Object} params.configuracionSistemaRepository - Repositorio de configuración del sistema (para obtener gestión activa)
     * @param {Object} params.managementRepository - Repositorio de gestiones (para obtener gestión activa)
     * @param {IPDFGenerator} params.pdfGenerator - Servicio de generación PDF (DI, implementa IPDFGenerator)
     * @param {IUploadsStorage} params.uploadsStorage - Servicio de almacenamiento en uploads (DI)
     * @param {ILogger} params.logger - Logger para registro de eventos
     */
    constructor({
        studentRepository,
        studentDocumentRepository,
        enrollmentRepository,
        studentAcademicDataRepository,
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
            moduleName: 'Inscripciones',
            documentType: 'FORMULARIO DE INSCRIPCIÓN',
            configuracionSistemaRepository,
            managementRepository,
        });

        // Repositorios específicos para obtener datos del estudiante
        this.studentRepository = studentRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.studentAcademicDataRepository = studentAcademicDataRepository;
        this.studentDocumentDeliveryRepository = studentDocumentDeliveryRepository;
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
    async execute(studentId, _options = {}) {
        this.logger.info('[Inscripciones] Iniciando generación de FORMULARIO DE INSCRIPCIÓN', {
            studentId,
        });

        try {
            // 0. Si ya existe el archivo en disco, retornar sus rutas sin regenerar
            const existing = await this._tryGetExistingFormularioFile(studentId);
            if (existing) {
                this.logger.info('[Inscripciones] Formulario de inscripción ya existe en disco, se retorna sin regenerar', {
                    studentId,
                    filePath: existing.filePath,
                });
                return existing;
            }

            // 1. Validar y obtener estudiante
            const student = await this._validateAndGetStudent(studentId);

            // 2. Obtener gestión activa (usa método del base)
            const currentManagement = await this._getCurrentManagement();
            const gestionYear = currentManagement.year || currentManagement.anio;

            // 3. Obtener datos académicos del estudiante (carrera, etc.)
            const academicData = await this._fetchAcademicData(studentId);

            // 4. Obtener inscripción actual con materias
            const enrollmentData = await this._fetchEnrollmentData(studentId, currentManagement.id);

            // 5. Obtener documentos entregados
            const entregas = await this._fetchDocumentDeliveries(studentId);

            // 6. Generar PDF con gestión activa, datos del estudiante, datos académicos, inscripción y entregas
            const pdfBuffer = await this._generatePdfBuffer(
              gestionYear,
              student,
              academicData,
              enrollmentData,
              entregas,
            );

            // 7. Guardar archivo y persistir en BD
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
     * Busca un documento de formulario de inscripción existente para el estudiante y verifica
     * si el archivo existe en disco. Si existe, retorna las rutas para descarga sin regenerar.
     *
     * @private
     * @param {number} studentId - ID del estudiante
     * @returns {Promise<{filePath: string, fileName: string, absolutePath: string}|null>} Rutas si el archivo existe, null en caso contrario
     */
    async _tryGetExistingFormularioFile(studentId) {
        try {
            const documentosResult = await this.studentDocumentRepository.findAll(
                {
                    studentId,
                    tipoDocumento: 'INSCRIPCION',
                    includeInactive: true,
                },
                null,
                null
            );
            const documentos = documentosResult.studentDocuments || [];

            const formulariosDocs = documentos
                .map((doc) => (doc?.toPlainObject ? doc.toPlainObject() : doc))
                .filter((doc) => {
                    const fileName = doc.fileName || doc.nombreArchivo || '';
                    const fileNameLower = (fileName || '').toLowerCase();
                    const isFormulario =
                        (fileName || '').includes('BOLETA_INSCRIPCION') ||
                        (fileName || '').includes('FORMULARIO_INSCRIPCION') ||
                        fileNameLower.includes('formulario_inscripcion');
                    const isPdf = (doc.extension || '').toLowerCase() === 'pdf' || fileNameLower.endsWith('.pdf');
                    return doc.tipoDocumento === 'INSCRIPCION' && isFormulario && isPdf;
                })
                .sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                    return dateB - dateA;
                });

            const doc = formulariosDocs[0];
            if (!doc) return null;

            const filePathRaw = (doc.filePath || doc.rutaArchivo || '').replace(/\\/g, '/');
            const fileNameRaw = doc.fileName || doc.nombreArchivo || 'formulario_inscripcion.pdf';
            let relativePath = filePathRaw.replace(/^\/+/, '').replace(/^uploads\//, '');
            if (!relativePath || (!relativePath.startsWith('documentos/') && !relativePath.includes('documentos'))) {
                relativePath = `documentos/estudiantes/${studentId}/${path.basename(fileNameRaw)}`;
            }

            const uploadDir = serverConfig.uploadsPath || 'uploads';
            const absolutePath = path.isAbsolute(uploadDir)
                ? path.join(uploadDir, relativePath)
                : path.resolve(serverConfig.backendRoot, uploadDir, relativePath);

            if (!fs.existsSync(absolutePath)) {
                this.logger.warn('[Inscripciones] Registro de formulario existe en BD pero el archivo no está en disco', {
                    studentId,
                    absolutePath,
                });
                return null;
            }

            const filePath = `/${path.join(uploadDir, relativePath).replace(/\\/g, '/')}`;
            return {
                filePath,
                fileName: fileNameRaw,
                absolutePath,
            };
        } catch (err) {
            this.logger.warn('[Inscripciones] Error al buscar formulario existente', {
                studentId,
                error: err.message,
            });
            return null;
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
            trabaja: row.trabaja === 1 || row.trabaja === true,
            empresaInstitucion: row.empresa_institucion || null,
            cargo: row.cargo || null,
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
     * Obtiene los datos académicos del estudiante desde vista_estudiante_datos_academicos
     *
     * @private
     * @param {number} studentId - ID del estudiante
     * @returns {Promise<Object|null>} Datos académicos o null si no existen
     */
    async _fetchAcademicData(studentId) {
        try {
            const results = await this.studentAcademicDataRepository.obtenerDatosAcademicos({
                estudiante_id: studentId,
            });

            if (!results || results.length === 0) {
                this.logger.warn('[Inscripciones] No se encontraron datos académicos para el estudiante', {
                    studentId,
                });
                return null;
            }

            const data = results[0];
            return {
                carreraNombre: data.carrera_nombre || data.carreraNombre || null,
                carreraCodigo: data.carrera_codigo || data.carreraCodigo || null,
                estadoAcademico: data.estado_academico || data.estadoAcademico || null,
                tipoAdmision: data.tipo_admision || data.tipoAdmision || null,
            };
        } catch (error) {
            this.logger.error('[Inscripciones] Error al obtener datos académicos', {
                studentId,
                error: error.message,
            });
            return null;
        }
    }

    /**
     * Obtiene la inscripción actual del estudiante con materias desde vista_estudiante_inscripcion_actual.
     * Paralelo y periodo vienen de esa vista (vista_base_paralelos_info); no de vista_estudiante_datos_academicos.
     *
     * @private
     * @param {number} studentId - ID del estudiante
     * @param {number} managementId - ID de la gestión activa
     * @returns {Promise<Object|null>} Datos de inscripción con materias, paraleloLabel (con periodo), periodoNombre
     */
    async _fetchEnrollmentData(studentId, managementId) {
        try {
            const results = await this.enrollmentRepository.obtenerInscripcionActual({
                estudiante_id: studentId,
                gestion_id: managementId,
            });

            if (!results || results.length === 0) {
                this.logger.warn('[Inscripciones] No se encontró inscripción actual para el estudiante', {
                    studentId,
                    managementId,
                });
                return null;
            }

            // Extraer datos únicos de la inscripción (todos los registros tienen los mismos datos de inscripción)
            const firstRow = results[0];
            // Cada fila de la vista trae paralelo y periodo de esa materia/curso (pueden variar por materia)
            const materias = results.map((row) => ({
                sigla: row.materia_sigla || row.materiaSigla || '',
                nombre: row.materia_nombre || row.materiaNombre || '',
                periodo: row.periodo_numero || row.periodoNumero || null,
                periodoNombre: row.periodo_nombre || row.periodoNombre || null,
                paraleloNombre: row.paralelo_nombre ?? row.paraleloNombre ?? null,
                paraleloTurno: row.paralelo_turno ?? row.paraleloTurno ?? null,
                horas: row.horas_semanales || row.horasSemanales || null,
            }));

            // Periodo: desde primera fila (vista_estudiante_inscripcion_actual trae periodo_nombre por paralelo)
            const periodoNombreFromRow = (firstRow.periodo_nombre ?? firstRow.periodoNombre ?? '').toString().trim() || null;
            const periodosUnicos = [...new Set(materias.map((m) => m.periodoNombre).filter(Boolean))];
            const periodoNombre = periodoNombreFromRow || (periodosUnicos.length === 1 ? periodosUnicos[0] : null);

            // Paralelo y turno desde la vista (una fila por materia; paralelo/periodo son iguales en todas)
            const paraleloNombre = firstRow.paralelo_nombre ?? firstRow.paraleloNombre ?? null;
            const paraleloTurno = firstRow.paralelo_turno ?? firstRow.paraleloTurno ?? null;
            const paraleloPart = [paraleloNombre, paraleloTurno].filter(Boolean).join(' - ');
            const paraleloLabel = paraleloPart
                ? (periodoNombre ? `${paraleloPart} (${periodoNombre})` : paraleloPart)
                : (periodoNombre || null);

            return {
                inscripcionId: firstRow.inscripcion_id || firstRow.inscripcionId,
                tipoInscripcion: firstRow.tipo_inscripcion || firstRow.tipoInscripcion,
                fechaInscripcion: firstRow.fecha_inscripcion || firstRow.fechaInscripcion,
                periodoNombre,
                paraleloNombre,
                paraleloTurno,
                paraleloLabel,
                materias,
            };
        } catch (error) {
            this.logger.error('[Inscripciones] Error al obtener inscripción actual', {
                studentId,
                managementId,
                error: error.message,
            });
            return null;
        }
    }

    /**
     * Busca las entregas de documentos de inscripción entregados (entregado: true)
     *
     * @private
     * @param {number} studentId - ID del estudiante
     * @returns {Promise<Array>} Lista de entregas entregadas
     */
    async _fetchDocumentDeliveries(studentId) {
        try {
            const entregasConDetalle = await this.studentDocumentDeliveryRepository.obtenerEntregasConDetalle({
                estudiante_id: studentId,
                tipo_documento: TIPOS_DOCUMENTO_SISTEMA.INSCRIPCION,
                documento_padre_id: null,
                entregado: true,
            });

            this.logger.info('[Inscripciones] Entregas entregadas obtenidas', {
                studentId,
                cantidad: entregasConDetalle.length,
            });

            return entregasConDetalle;
        } catch (error) {
            this.logger.error('[Inscripciones] Error al obtener entregas entregadas', {
                studentId,
                error: error.message,
            });
            return [];
        }
    }

    /**
     * Genera el buffer del PDF del formulario de inscripción.
     * Pasa student con claves en español (como Acta): id, codigoEstudiante, ci, expedicion, nombres, apellidoPaterno, apellidoMaterno.
     * Calcula edad y fecha literal de nacimiento y las pasa en options.
     *
     * @private
     * @param {number} gestionYear - Año de gestión activa
     * @param {Object} student - Estudiante normalizado desde vista (claves español)
     * @param {Object|null} academicData - Datos académicos (carrera, etc.)
     * @param {Object|null} enrollmentData - Datos de inscripción con materias
     * @param {Array} entregas - Lista de documentos entregados
     * @returns {Promise<Buffer>} Buffer del PDF generado
     */
    async _generatePdfBuffer(gestionYear, student, academicData, enrollmentData, entregas) {
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
            academicData,
            enrollmentData,
            entregas,
            fechaActual,
            signatureTwoColumns: true,
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
