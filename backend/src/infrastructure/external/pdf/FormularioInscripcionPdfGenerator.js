/**
 * FormularioInscripcionPdfGenerator
 *
 * Servicio de infraestructura que generará el FORMULARIO DE INSCRIPCIÓN a partir de una plantilla PDF.
 * Esqueleto base para la migración desde BoletaInscripcionWordGenerator (Word + PizZip).
 *
 * Tecnología: pdf-lib (misma que ActaCompromisoPdfGenerator). Usa IncosPDFLibBase.
 *
 * Estructura (título, subtítulo, secciones):
 * - Título: FORMULARIO DE INSCRIPCIÓN
 * - Subtítulo: GESTIÓN {año} (gestión desde caso de uso / BD)
 * - I. DATOS PERSONALES
 * - II. DATOS ACADÉMICOS
 * - III. DOCUMENTOS RECEPCIONADOS
 *
 * El contenido de cada sección se añadirá durante la migración (datos desde options.student, etc.).
 *
 * @module FormularioInscripcionPdfGenerator
 */

import { IncosPDFLibBase } from './IncosPDFLibBase.js';
import { IncosPDFBase } from './IncosPDFBase.js';

export class FormularioInscripcionPdfGenerator extends IncosPDFLibBase {
    /**
     * @param {Object} params - Dependencias inyectadas
     * @param {ILogger} [params.logger] - Logger para registro de eventos
     */
    constructor({ logger } = {}) {
        super({ logger });
    }

    /**
     * Genera un PDF de Formulario de Inscripción a partir de la plantilla.
     * Retorna Buffer. El guardado en uploads lo hace el caso de uso / almacenamiento.
     *
     * @param {Object} [options] - Opciones (estructura análoga a Acta: gestion, student, fechaActual)
     * @param {string|number} [options.gestion] - Año de gestión (desde BD, caso de uso)
     * @param {Object} [options.student] - Datos del estudiante (vista_estudiante_datos_personales normalizados)
     * @param {string} [options.fechaActual] - Fecha actual para el documento
     * @returns {Promise<Buffer>} Contenido del PDF generado
     */
    async generate(options = {}) {
        try {
            const pdfDoc = await this._loadTemplate('Plantilla.pdf');
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            this._initializeDocumentState(pdfDoc, firstPage, true);

            await this._buildHeader(options);
            await this._buildDatosPersonales(options);
            await this._buildDatosAcademicos(options);
            await this._buildDocumentosRecepcionados(options);

            const pdfBuffer = await this._saveDocument(pdfDoc);

            if (this.logger) {
                this.logger.info('[FormularioInscripcionPdfGenerator] Formulario de inscripción PDF generado (buffer)', {
                    size: pdfBuffer.length,
                });
            }

            return pdfBuffer;
        } catch (error) {
            if (this.logger) {
                this.logger.error('[FormularioInscripcionPdfGenerator] Error al generar formulario de inscripción PDF', {
                    error: error.message,
                    stack: error.stack,
                });
            }
            throw error;
        }
    }

    // ============================================
    // MÉTODOS DE CONSTRUCCIÓN (como ActaCompromiso: título, subtítulo, secciones)
    // ============================================

    /**
     * Construye el encabezado del documento (título y subtítulo).
     * Gestión desde caso de uso (BD). Acentos: GESTIÓN.
     *
     * @private
     * @param {Object} options - Opciones de generación
     * @returns {Promise<void>}
     */
    async _buildHeader(options) {
        await this._addDocumentTitle(IncosPDFBase.DOCUMENT_TITLES.FORMULARIO_INSCRIPCION);

        if (options.gestion) {
            const gestionYear = String(options.gestion);
            await this._addSubtitle(`GESTIÓN ${gestionYear}`);
        }

        this._addSpace();
    }

    /**
     * I. DATOS PERSONALES.
     * Label (bold) + valor (normal) en la misma línea. Opcionales en grid 2 columnas fijas.
     *
     * @private
     * @param {Object} options - Opciones de generación
     * @returns {Promise<void>}
     */
    async _buildDatosPersonales(options) {
        const T = IncosPDFBase.FORMULARIO_TEXTS;
        const s = options.student || {};

        await this._addSection(IncosPDFBase.FORMULARIO_SECTION_TITLES.DATOS_PERSONALES);

        // Label (T) + valor construido aquí; misma línea
        const nombresVal = [s.apellidoPaterno, s.apellidoMaterno, s.nombres]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        await this._addLabelValue(T.NOMBRES_APELLIDOS_LABEL, nombresVal || '—');

        // Grid 2 columnas fijas. Orden: C.I., Género, Email, Celular, Estado civil, Tipo sangre, Discapacidad.
        const gridItems = [];
        const ci = (s.ci ?? '').toString().trim();
        const exp = (s.expedicion ?? '').toString().trim();
        if (ci || exp) {
            const ciVal = [ci, exp].filter(Boolean).join(' ').trim();
            gridItems.push({ label: T.CI_LABEL, value: ciVal || '—' });
        }
        if (s.genero) {
            const g = String(s.genero).toLowerCase();
            const generoVal = g === 'masculino' ? 'Masculino' : g === 'femenino' ? 'Femenino' : g === 'otro' ? 'Otro' : s.genero;
            gridItems.push({ label: T.GENERO_LABEL, value: generoVal });
        }
        const emailVal = (s.emailPersonal ?? '').toString().trim();
        const celularVal = (s.celular ?? '').toString().trim();
        if (emailVal) gridItems.push({ label: T.EMAIL_LABEL, value: emailVal });
        if (celularVal) gridItems.push({ label: T.CELULAR_LABEL, value: celularVal });
        if (s.estadoCivilNombre) {
            gridItems.push({ label: T.ESTADO_CIVIL_LABEL, value: s.estadoCivilNombre });
        }
        if (s.tipoSangre) {
            gridItems.push({ label: T.TIPO_SANGRE_LABEL, value: s.tipoSangre });
        }
        if (s.tieneDiscapacidad !== undefined && s.tieneDiscapacidad !== null) {
            const disc = s.tieneDiscapacidad === true || s.tieneDiscapacidad === 1 ? 'Sí' : 'No';
            gridItems.push({ label: T.DISCAPACIDAD_LABEL, value: disc });
        }

        if (gridItems.length > 0) {
            await this._addLabelValueGrid(gridItems, 2);
        }

        // Si tiene discapacidad y hay datos de vista_base_estudiante_discapacidades: una línea debajo
        const tieneDisc = s.tieneDiscapacidad === true || s.tieneDiscapacidad === 1;
        const list = Array.isArray(s.discapacidades) ? s.discapacidades : [];
        if (tieneDisc && list.length > 0) {
            const detalleVal = this._buildDetalleDiscapacidad(list);
            if (detalleVal) {
                await this._addLabelValue(T.DETALLE_DISCAPACIDAD_LABEL, detalleVal);
            }
        }

        this._addSpace();

        // Lugar y Fecha de Nacimiento, Domicilio, Idioma de origen (orígenes + residencia + idiomas)
        await this._buildLugarFechaNacimientoYDomicilio(options);

        this._addSpace();
    }

    /**
     * Construye el texto de detalle desde discapacidades (vista_base_estudiante_discapacidades).
     * Usa DETALLE_DISCAPACIDAD_ITEM_FMT como texto con reemplazo (TEMPLATE_TEXTS); solo se incluyen segmentos con valor.
     *
     * @private
     * @param {Array<Object>} discapacidades - Items de la vista (snake_case o camelCase)
     * @returns {string}
     */
    _buildDetalleDiscapacidad(discapacidades) {
        const T = IncosPDFBase.FORMULARIO_TEXTS;
        const fmt = T.DETALLE_DISCAPACIDAD_ITEM_FMT ?? '';
        const sep = T.DETALLE_DISCAPACIDAD_SEP ?? ' — ';
        const segmentSep = '. ';

        const parts = discapacidades.map((d) => {
            const values = {
                TIPO: (d.tipo_discapacidad_nombre ?? d.tipoDiscapacidadNombre ?? '').toString().trim(),
                GRADO: (d.grado_discapacidad ?? d.gradoDiscapacidad ?? '').toString().trim(),
                DESCRIPCION: (d.discapacidad_descripcion ?? d.discapacidadDescripcion ?? '').toString().trim(),
                CAUSA: (d.discapacidad_causa ?? d.discapacidadCausa ?? '').toString().trim(),
            };
            const segments = fmt.split(segmentSep).map((s) => s.trim()).filter(Boolean);
            const out = [];
            for (const seg of segments) {
                const m = seg.match(/\{(\w+)\}/);
                if (!m) continue;
                const key = m[1];
                const val = values[key];
                if (val) out.push(seg.replace(`{${key}}`, val));
            }
            return out.join(segmentSep);
        }).filter((p) => p.length > 0);
        return parts.join(sep);
    }

    /**
     * Lugar y Fecha de Nacimiento, Domicilio, Idioma de origen.
     * Datos desde origenes (vista_base_estudiante_origenes + idiomas), residencia (vista_base_estudiante_residencia)
     * y student.fechaNacimiento. Composición similar al formulario: título, línea lugar, grid 3 cols
     * (Localidad=fecha, Nacionalidad, Edad), Domicilio, grid 2 cols (Idioma de origen | Celular).
     *
     * @private
     * @param {Object} options - Opciones de generación (options.student)
     * @returns {Promise<void>}
     */
    async _buildLugarFechaNacimientoYDomicilio(options) {
        const T = IncosPDFBase.FORMULARIO_TEXTS;
        const s = options.student || {};
        const origenes = Array.isArray(s.origenes) ? s.origenes : [];
        const principal = origenes.find((o) => o.es_principal === 1 || o.es_principal === true) || origenes[0];

        await this._addLabelValue(T.LUGAR_FECHA_NACIMIENTO_TITLE, '');

        const lugarParts = [
            principal?.ciudad ?? principal?.ciudad_nacimiento_raw,
            principal?.nacimiento_municipio_nombre,
            principal?.nacimiento_provincia_nombre,
            principal?.nacimiento_departamento_nombre,
        ].filter(Boolean);
        const lugarVal = lugarParts.length > 0 ? lugarParts.join(', ') : '—';
        await this._addParagraph(lugarVal);

        this._addSpace(IncosPDFBase.LAYOUT.spacing.line);

        const fechaStr = this._formatFechaDDMMYYYY(s.fechaNacimiento);
        const edadVal = this._calcEdad(s.fechaNacimiento);
        const nacionalidadVal = (principal?.pais_nombre ?? principal?.paisNombre ?? '').trim() || '—';

        const lugarFechaItems = [
            { label: T.LOCALIDAD_LABEL, value: fechaStr },
            { label: T.NACIONALIDAD_LABEL, value: nacionalidadVal },
            { label: T.EDAD_LABEL, value: edadVal },
        ];
        await this._addLabelValueGrid(lugarFechaItems, 3);

        this._addSpace(IncosPDFBase.LAYOUT.spacing.line);

        const domicilioParts = [
            (s.direccion ?? '').toString().trim(),
            s.residenciaMunicipioNombre ?? s.residencia_municipio_nombre,
            s.residenciaProvinciaNombre ?? s.residencia_provincia_nombre,
            s.residenciaDepartamentoNombre ?? s.residencia_departamento_nombre,
        ].filter(Boolean);
        const domicilioVal = domicilioParts.length > 0 ? domicilioParts.join(', ') : '—';
        await this._addLabelValue(T.DOMICILIO_LABEL, domicilioVal);

        this._addSpace(IncosPDFBase.LAYOUT.spacing.line);

        const idiomaParts = [
            principal?.idioma_materno_nombre ?? principal?.idiomaMaternoNombre,
            principal?.idioma_secundario_nombre ?? principal?.idiomaSecundarioNombre,
        ].filter(Boolean);
        const idiomaVal = idiomaParts.length > 0 ? idiomaParts.join(' / ') : '—';
        const celularVal = (s.celular ?? '').toString().trim() || '—';
        await this._addLabelValueGrid(
            [
                { label: T.IDIOMA_ORIGEN_LABEL, value: idiomaVal },
                { label: T.CELULAR_LABEL, value: celularVal },
            ],
            2,
        );
    }

    /**
     * Formatea fecha YYYY-MM-DD a DD-MM-YYYY. Retorna '—' si falta o no parsea.
     *
     * @private
     * @param {string|undefined|null} fecha - fecha_nacimiento
     * @returns {string}
     */
    _formatFechaDDMMYYYY(fecha) {
        if (fecha == null || fecha === '') return '—';
        const str = String(fecha).trim();
        const m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (!m) return str || '—';
        return `${m[3]}-${m[2]}-${m[1]}`;
    }

    /**
     * Calcula edad en años desde fecha_nacimiento. Retorna '—' si falta o no parsea.
     *
     * @private
     * @param {string|undefined|null} fecha - fecha_nacimiento
     * @returns {string}
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
     * II. DATOS ACADÉMICOS. Solo título de sección; contenido en migración.
     *
     * @private
     * @param {Object} options - Opciones de generación
     * @returns {Promise<void>}
     */
    async _buildDatosAcademicos(options) {
        await this._addSection(IncosPDFBase.FORMULARIO_SECTION_TITLES.DATOS_ACADEMICOS);
        // TODO(migración): carrera, año, materias desde options
    }

    /**
     * III. DOCUMENTOS RECEPCIONADOS. Solo título de sección; contenido en migración.
     *
     * @private
     * @param {Object} options - Opciones de generación
     * @returns {Promise<void>}
     */
    async _buildDocumentosRecepcionados(options) {
        await this._addSection(IncosPDFBase.FORMULARIO_SECTION_TITLES.DOCUMENTOS_RECEPCIONADOS);
        // TODO(migración): lista de documentos desde options.documentos / entregas
    }
}
