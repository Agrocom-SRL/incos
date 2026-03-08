/**
 * DeclaracionJuradaPdfGenerator
 *
 * Genera la DECLARACIÓN JURADA para TRASPASO / TRANSITABILIDAD
 * reutilizando la plantilla base del Formulario de Inscripción pero
 * con una estructura de 5 secciones:
 *
 * I. DATOS PERSONALES
 * II. FORMACIÓN ACADÉMICA
 * III. JUSTIFICATIVO DE LA POSTULACIÓN
 * IV. DECLARACIÓN JURADA
 * V. CUMPLIMIENTO DE LOS REQUISITOS
 *
 * Se apoya en FormularioInscripcionPdfGenerator para reutilizar
 * los bloques de datos personales y helpers de layout.
 */

import { FormularioInscripcionPdfGenerator } from './FormularioInscripcionPdfGenerator.js';
import { IncosPDFBase } from './IncosPDFBase.js';

export class DeclaracionJuradaPdfGenerator extends FormularioInscripcionPdfGenerator {
    /**
     * @param {Object} params
     * @param {ILogger} [params.logger]
     */
    constructor({ logger } = {}) {
        super({ logger });
    }

    /**
     * Orquesta el build del PDF. Inserta "Documentos Presentados" (solo TRASPASO)
     * entre Formación académica y Declaración jurada.
     *
     * @override
     */
    async generate(options = {}) {
        const pdfDoc = await this._loadTemplate('Plantilla.pdf');
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        this._initializeDocumentState(pdfDoc, firstPage, true);

        await this._buildHeader(options);
        await this._buildDatosPersonales(options);
        await this._buildDatosAcademicos(options);

        const rawTipo = (options.tipoAdmision || options.academicData?.tipoAdmision || '').toString().trim().toUpperCase();
        if (rawTipo === 'TRASPASO') {
            await this._buildDocumentosPresentadosTraspaso(options);
        }

        await this._buildDocumentosRecepcionados(options);
        await this._buildFirma(options);

        return await this._saveDocument(pdfDoc);
    }

    /**
     * Encabezado específico para Declaración Jurada.
     * Elimina el recuadro "No. Registro" y el cuadro de foto,
     * y cambia el título del documento según tipo de admisión.
     *
     * - TRASPASO        -> "FORMULARIO DE TRASPASO"
     * - TRANSITABILIDAD -> "FORMULARIO DE TRANSITABILIDAD"
     * - Otro / vacío    -> "DECLARACIÓN JURADA"
     *
     * @override
     */
    async _buildHeader(options) {
        const student = options.student || {};

        // Solo encabezado institucional + título del documento
        await this._addInstitutionalHeader(IncosPDFBase.INSTITUTIONAL_HEADER_LINES);
        await this._addDocumentTitle(IncosPDFBase.INSTITUTE.name, false);

        const rawTipoAdmision = (
            options.tipoAdmision ??
            options.academicData?.tipoAdmision ??
            student.tipoAdmision ??
            ''
        )
            .toString()
            .trim()
            .toUpperCase();

        // Por defecto usar FORMULARIO DE TRANSITABILIDAD (caso más común)
        let documentTitle = 'FORMULARIO DE TRANSITABILIDAD';
        if (rawTipoAdmision === 'TRASPASO') {
            documentTitle = 'FORMULARIO DE TRASPASO';
        }

        await this._addDocumentTitle(documentTitle);

        if (options.gestion) {
            const gestionYear = String(options.gestion);
            await this._addSubtitle(`GESTIÓN ${gestionYear}`);
        }
    }

    /**
     * I. DATOS PERSONALES
     *
     * Mantiene la estructura base (nombres, CI, datos personales,
     * lugar de nacimiento y domicilio) pero elimina:
     * - Contacto de emergencia (apoderado)
     * - Datos del trabajo
     *
     * @override
     */
    async _buildDatosPersonales(options) {
        await this._addSection(IncosPDFBase.FORMULARIO_SECTION_TITLES.DATOS_PERSONALES);

        // Bloques heredados del formulario de inscripción hasta domicilio
        await this._buildIdentificacionPersonal(options);
        await this._buildLugarFechaNacimientoYDomicilio(options);

        // No se incluyen contacto de emergencia ni datos de trabajo
        this._addSpace();
    }

    /**
     * Bloque 1 de DATOS PERSONALES: Identificación personal.
     *
     * Para la Declaración Jurada se reutilizan los datos básicos y de origen,
     * pero se omite explícitamente el bloque de discapacidad.
     *
     * @override
     * @param {Object} options - Opciones de generación (options.student)
     * @returns {Promise<void>}
     */
    async _buildIdentificacionPersonal(options) {
        const T = IncosPDFBase.FORMULARIO_TEXTS;
        const s = options.student || {};

        const nombresVal = [s.apellidoPaterno, s.apellidoMaterno, s.nombres]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

        await this._addBoxedField(
            T.NOMBRES_APELLIDOS_LABEL,
            nombresVal || '—',
            true,
            IncosPDFBase.FONTS.title.size
        );

        // Bloque 1: Datos básicos (CI, Género, Celular, Correo, Estado civil, Grupo sanguíneo)
        await this._buildDatosBasicosIdentificacion(options);

        // Bloque 2: Datos de origen (edad, fecha nacimiento, nacionalidad, idioma)
        // Se omite el bloque de discapacidad en este documento.
        await this._buildDatosOrigenIdentificacion(options);
    }

    /**
     * II. FORMACIÓN ACADÉMICA
     * III. JUSTIFICATIVO DE LA POSTULACIÓN (solo Transitabilidad)
     *
     * Para TRASPASO: solo Formación académica (Instituto, Carrera, Año cursado,
     * Departamento, Distrito, Régimen, Dependencia).
     * Para TRANSITABILIDAD: Formación académica + Justificativo.
     *
     * @override
     */
    async _buildDatosAcademicos(options) {
        const rawTipo = (options.tipoAdmision || '').toString().trim().toUpperCase();
        const isTraspaso = rawTipo === 'TRASPASO';

        if (isTraspaso) {
            await this._buildFormacionAcademicaTraspaso(options);
        } else {
            await this._buildFormacionAcademicaTransitabilidad(options);
            await this._buildJustificativoTransitabilidad(options);
        }
        this._addSpace();
    }

    /**
     * II. FORMACIÓN ACADÉMICA para formulario de Traspaso.
     * Usa transferData e institutionData (Instituto, Carrera, Año cursado, Departamento, Distrito, Régimen, Dependencia).
     * @private
     */
    async _buildFormacionAcademicaTraspaso(options) {
        const transfer = options.transferData || {};
        const institution = options.institutionData || {};

        await this._addSection('II. FORMACIÓN ACADÉMICA', true);
        const formacionItemsFullWidth = [];

        // Solo el instituto ocupa 100%; el resto va en la cuadrícula de 2 columnas
        const institucionNombre =
            (institution.nombre || '').toString().trim() ||
            (transfer.institucionNombre || '').toString().trim();
        if (institucionNombre) {
            formacionItemsFullWidth.push({
                label: 'Instituto en el que estudió:',
                value: institucionNombre,
            });
        }

        // Código RUDE/RUDEAL (exclusivo de traspaso)
        const codigoRude = (transfer.codigoRude || transfer.codigo_rude || '').toString().trim();

        // Departamento (institución o transfer) → va en la cuadrícula de 2 columnas
        const departamento =
            (institution.departamento || '').toString().trim() ||
            (transfer.departamentoNombre || transfer.departamento_nombre || '').toString().trim();

        // Distrito educativo → va en la cuadrícula de 2 columnas
        const distritoEducativo =
            (institution.distritoEducativo || institution.distrito_educativo || '').toString().trim() ||
            (transfer.distritoEducativo || transfer.distrito_educativo || '').toString().trim();

        // Campos que deben ocupar 2 columnas al 50% (según diseño solicitado)
        // Carrera | Año cursado
        // Régimen | Dependencia
        const carreraOrigenRaw = (transfer.carreraOrigen || transfer.carrera_origen || '').toString().trim();

        // Año cursado: PRIMERO -> "Primer Año", SEGUNDO -> "Segundo Año"
        const anioCursadoRaw = (transfer.anioCursado || transfer.anio_cursado || '').toString().trim();

        // Régimen de estudios
        const regimenRaw = (transfer.regimenOrigen || transfer.regimen_origen || '').toString().trim();

        // Dependencia
        const dependenciaRaw =
            (institution.dependencia || '').toString().trim() ||
            (transfer.dependencia || '').toString().trim();

        const hasAnyData =
            Boolean(institucionNombre) ||
            Boolean(codigoRude) ||
            Boolean(departamento) ||
            Boolean(distritoEducativo) ||
            Boolean(carreraOrigenRaw) ||
            Boolean(anioCursadoRaw) ||
            Boolean(regimenRaw) ||
            Boolean(dependenciaRaw);

        if (!hasAnyData) {
            await this._addLabelValue(
                'Formación académica:',
                'No hay datos de formación académica disponibles'
            );
            return;
        }

        const carreraOrigenVal = carreraOrigenRaw || '—';

        const anioCursadoUpper = anioCursadoRaw.toUpperCase();
        const anioCursadoVal =
            anioCursadoUpper === 'PRIMERO'
                ? 'Primer Año'
                : anioCursadoUpper === 'SEGUNDO'
                    ? 'Segundo Año'
                    : (anioCursadoRaw || '—');

        const regimenUpper = regimenRaw.toUpperCase();
        const regimenVal =
            regimenRaw
                ? (regimenUpper === 'SEMESTRAL' ? 'Semestral' : regimenUpper === 'ANUAL' ? 'Anual' : regimenRaw)
                : '—';

        const dependenciaUpper = dependenciaRaw.toUpperCase();
        const dependenciaVal =
            dependenciaRaw
                ? (dependenciaUpper === 'FISCAL'
                    ? 'Fiscal'
                    : dependenciaUpper === 'CONVENIO'
                        ? 'Convenio'
                        : dependenciaUpper === 'PRIVADO'
                            ? 'Privado'
                            : dependenciaRaw)
                : '—';

        if (formacionItemsFullWidth.length > 0) {
            // Solo el instituto a 100%
            await this._addBoxedFieldGrid(formacionItemsFullWidth, [], 100, 115);
        }

        // 2 columnas 50/50 con medidas constantes (50, 115, 115): Departamento, Distrito, Código RUDE, Carrera, Año cursado, Régimen, Dependencia
        const leftColumnItems = [];
        if (codigoRude) {
            leftColumnItems.push({
                label: 'Código RUDE/RUDEAL:',
                value: codigoRude,
            });
        }
        if (departamento) {
            leftColumnItems.push({ label: 'Departamento:', value: departamento });
        }
        leftColumnItems.push(
            { label: 'Carrera:', value: carreraOrigenVal },
            { label: 'Régimen de estudios:', value: regimenVal }
        );
        const rightColumnItems = [];
        if (distritoEducativo) {
            rightColumnItems.push({ label: 'Distrito educativo:', value: distritoEducativo });
        }
        rightColumnItems.push(
            { label: 'Año cursado:', value: anioCursadoVal },
            { label: 'Dependencia:', value: dependenciaVal }
        );
        await this._addBoxedFieldGrid(leftColumnItems, rightColumnItems, 50, 115, 115);
    }

    /**
     * II. FORMACIÓN ACADÉMICA para Transitabilidad.
     * Distribuido en 2 columnas al 50%.
     * @private
     */
    async _buildFormacionAcademicaTransitabilidad(options) {
        const transitability = options.transitabilityData || {};
        const institution = options.institutionData || {};

        await this._addSection('II. FORMACIÓN ACADÉMICA', true);

        const leftColumnItems = [];
        const rightColumnItems = [];

        const tipoInstitucion = (institution.tipo || '').toString().toUpperCase();
        let nivelAcademico = '';
        if (tipoInstitucion === 'UETHP') nivelAcademico = 'Técnico Medio UETHP';
        else if (tipoInstitucion === 'CEA') nivelAcademico = 'Técnico Medio CEA';
        else if (tipoInstitucion) nivelAcademico = tipoInstitucion;
        if (nivelAcademico) {
            leftColumnItems.push({ label: 'Nivel académico alcanzado:', value: nivelAcademico });
        }

        const carreraOrigen = (transitability.carreraOrigen || '').toString().trim();
        if (carreraOrigen) leftColumnItems.push({ label: 'Carrera:', value: carreraOrigen });

        const institucionNombre = (institution.nombre || '').toString().trim();
        if (institucionNombre) {
            leftColumnItems.push({ label: 'Unidad Educativa / Institución:', value: institucionNombre });
        }

        const codigoSie = (institution.codigoSie || '').toString().trim();
        if (codigoSie) rightColumnItems.push({ label: 'Código SIE-UE:', value: codigoSie });

        const anioConclusion =
            transitability.anioConclusion != null ? String(transitability.anioConclusion) : '';
        if (anioConclusion) {
            rightColumnItems.push({ label: 'Año de conclusión de estudios:', value: anioConclusion });
        }

        const distritoEducativo = (institution.distritoEducativo || '').toString().trim();
        if (distritoEducativo) {
            rightColumnItems.push({ label: 'Distrito educativo:', value: distritoEducativo });
        }

        const hasAnyData = leftColumnItems.length > 0 || rightColumnItems.length > 0;
        if (hasAnyData) {
            // Label width 115pt para que labels largos ("Unidad Educativa / Institución:", "Año de conclusión...") envuelvan sin desborde
            await this._addBoxedFieldGrid(leftColumnItems, rightColumnItems, 50, 115, 115);
        } else {
            await this._addLabelValue(
                'Formación académica:',
                'No hay datos de formación académica disponibles'
            );
        }
        this._addSpace();
    }

    /**
     * III. JUSTIFICATIVO DE LA POSTULACIÓN (solo Transitabilidad).
     * En 2 columnas al 50%. No se incluye "INSTITUTO TÉCNICO Y TECNOLÓGICO" (ya está en sección V).
     * @private
     */
    async _buildJustificativoTransitabilidad(options) {
        const academicData = options.academicData || {};
        const transitability = options.transitabilityData || {};
        const institution = options.institutionData || {};

        await this._addSection('III. JUSTIFICATIVO DE LA POSTULACIÓN', true);

        const leftColumnItems = [];
        const rightColumnItems = [];

        const carreraOrigen = (transitability.carreraOrigen || '').toString().trim();
        const carreraDestino =
            academicData.carreraNombre || academicData.carrera_nombre || carreraOrigen || '';
        if (carreraDestino) {
            leftColumnItems.push({ label: 'Carrera a la que postula:', value: carreraDestino });
        }

        const dependencia = (institution.dependencia || '').toString().trim();
        if (dependencia) {
            leftColumnItems.push({ label: 'Dependencia:', value: dependencia });
        }

        const regimenRaw = (transitability.regimenEstudios || '').toString().trim();
        if (regimenRaw) {
            const upper = regimenRaw.toUpperCase();
            const regimen = upper === 'SEMESTRAL' ? 'Semestral' : upper === 'ANUAL' ? 'Anual' : regimenRaw;
            rightColumnItems.push({ label: 'Régimen de estudios:', value: regimen });
        }

        const hasAnyData = leftColumnItems.length > 0 || rightColumnItems.length > 0;
        if (hasAnyData) {
            // Mismo ancho de label (115) que en Formación académica para que las cajas tengan la misma medida
            await this._addBoxedFieldGrid(leftColumnItems, rightColumnItems, 50, 115, 115);
        } else {
            await this._addLabelValue(
                'Justificativo de la postulación:',
                'No hay datos de justificación disponibles'
            );
        }
    }

    /**
     * III. DOCUMENTOS PRESENTADOS (solo formulario de Traspaso).
     * Lista desde vista estudiantes_documentos_entrega (entregado: true). Mismo estilo que Documentos Recepcionados y Requisitos.
     *
     * @private
     */
    async _buildDocumentosPresentadosTraspaso(options) {
        const lista = options.documentosPresentadosTraspaso || [];

        await this._addSection('III. DOCUMENTOS PRESENTADOS');

        if (lista.length > 0) {
            for (const item of lista) {
                const nombre = (item.nombre || '').toString().trim() || 'Documento sin nombre';
                await this._addBulletPoint(nombre);
            }
        } else {
            await this._addBulletPoint('No hay documentos presentados');
        }
    }

    /**
     * IV. DECLARACIÓN JURADA
     * V. CUMPLIMIENTO DE LOS REQUISITOS
     *
     * Reemplaza la sección original de "III. DOCUMENTOS RECEPCIONADOS".
     *
     * @override
     */
    async _buildDocumentosRecepcionados(options) {
        // ============================================
        // IV. DECLARACIÓN JURADA
        // ============================================
        await this._addSection('IV. DECLARACIÓN JURADA');

        const textoDeclaracion =
            'Declaro que la documentación académica presentada para la postulación y otros fines es auténtica y verificable y me comprometo a respaldarla con los documentos originales, en caso de ser requerida.';

        if (!this._pdfDoc || !this._currentPage) {
            throw new Error(
                'Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes'
            );
        }

        const { width: pageWidth } = this._currentPage.getSize();
        const m = IncosPDFBase.LAYOUT.margins;
        const lineWidth = IncosPDFBase.LAYOUT.signatureLineWidth ?? 150;
        const lineThickness = IncosPDFBase.LAYOUT.signatureLineThickness ?? 1;
        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);
        const fontName = this._mapFontNameToStandardFont(
            IncosPDFBase.FONTS.normal.font
        );
        const font = await this._pdfDoc.embedFont(fontName);
        const fontSize = IncosPDFBase.FONTS.section.size; // un poco más grande

        const maxWidth = pageWidth - m.left - m.right;
        const x = m.left;
        const lineSpacing = IncosPDFBase.LAYOUT.spacing.line;

        // Párrafo de declaración con fuente más grande
        let currentY = this._currentY;
        const linesDeclaracion = this._wrapText(
            textoDeclaracion,
            font,
            fontSize,
            maxWidth
        );
        for (const line of linesDeclaracion) {
            this._currentPage.drawText(line, {
                x,
                y: currentY,
                size: fontSize,
                font,
                color: textRgb,
            });
            currentY -= fontSize + lineSpacing;
        }

        this._currentY = currentY - IncosPDFBase.LAYOUT.spacing.paragraph;

        // Línea de firma del postulante dentro de la sección IV
        const centerX = pageWidth / 2;
        const halfLine = lineWidth / 2;
        const lineY = this._currentY - 12;

        // Dibujar línea de firma del postulante
        this._currentPage.drawLine({
            start: { x: centerX - halfLine, y: lineY },
            end: { x: centerX + halfLine, y: lineY },
            thickness: lineThickness,
            color: textRgb,
        });

        // Texto "Firma del postulante" (mismo tamaño aumentado)
        const label = 'Firma del postulante';
        const labelWidth = font.widthOfTextAtSize(label, fontSize);
        const labelY = lineY - fontSize - 2;

        this._currentPage.drawText(label, {
            x: centerX - labelWidth / 2,
            y: labelY,
            size: fontSize,
            font,
            color: textRgb,
        });

        this._currentY = labelY - IncosPDFBase.LAYOUT.spacing.paragraph;

        // ============================================
        // V. CUMPLIMIENTO DE LOS REQUISITOS
        // ============================================
        await this._addSection('V. CUMPLIMIENTO DE LOS REQUISITOS');

        const instituteName = IncosPDFBase.INSTITUTE.name;

        const textoCumplimiento =
            `La Dirección Académica del ${instituteName} tras realizar la revisión del cumplimiento de los requisitos ` +
            'presentados por la o el postulante y el análisis académico de la pertinencia de la solicitud en el marco de la normativa vigente, concluye:';

        // Párrafo de cumplimiento; las casillas Procedente / No procedente van en la misma línea que "concluye:"
        currentY = this._currentY;
        const linesCumplimiento = this._wrapText(
            textoCumplimiento,
            font,
            fontSize,
            maxWidth
        );
        let lastLineY = currentY;
        for (const line of linesCumplimiento) {
            this._currentPage.drawText(line, {
                x,
                y: currentY,
                size: fontSize,
                font,
                color: textRgb,
            });
            lastLineY = currentY;
            currentY -= fontSize + lineSpacing;
        }

        // Casillas vacías (para que el rector marque) al lado del texto "concluye:" en la misma línea
        const boxSize = 10;
        const boxGap = 6;
        const gapAfterText = 8;

        const procedenteLabel = 'Procedente';
        const noProcedenteLabel = 'No procedente';

        const lastLineText = linesCumplimiento.length > 0 ? linesCumplimiento[linesCumplimiento.length - 1] : '';
        const lastLineWidth = lastLineText ? font.widthOfTextAtSize(lastLineText, fontSize) : 0;
        const optionsStartX = x + lastLineWidth + gapAfterText;

        // Misma línea que el último renglón: texto y casillas comparten la misma baseline
        const optionTextY = lastLineY;
        // Centrar la casilla con la línea de texto; offset hacia arriba para alinear con la altura visual del texto
        const boxUpOffset = 10;
        const boxBottomY = lastLineY - (fontSize / 2) - (boxSize / 2) + boxUpOffset;

        // Casilla "Procedente" (siempre vacía)
        const procBoxX = optionsStartX;
        this._currentPage.drawRectangle({
            x: procBoxX,
            y: boxBottomY,
            width: boxSize,
            height: boxSize,
            borderColor: textRgb,
            borderWidth: 1,
        });
        const procTextX = procBoxX + boxSize + boxGap;
        this._currentPage.drawText(procedenteLabel, {
            x: procTextX,
            y: optionTextY,
            size: fontSize,
            font,
            color: textRgb,
        });

        // Casilla "No procedente" (siempre vacía), a la derecha de "Procedente"
        const procLabelWidth = font.widthOfTextAtSize(procedenteLabel, fontSize);
        const noProcBoxX = procTextX + procLabelWidth + 24;
        this._currentPage.drawRectangle({
            x: noProcBoxX,
            y: boxBottomY,
            width: boxSize,
            height: boxSize,
            borderColor: textRgb,
            borderWidth: 1,
        });
        const noProcTextX = noProcBoxX + boxSize + boxGap;
        this._currentPage.drawText(noProcedenteLabel, {
            x: noProcTextX,
            y: optionTextY,
            size: fontSize,
            font,
            color: textRgb,
        });

        this._currentY = boxBottomY - IncosPDFBase.LAYOUT.spacing.paragraph;

        // Líneas de firma: Dirección Académica (izq) y SELLO (der)
        const totalWidth = pageWidth - m.left - m.right;
        const bloqueAncho = IncosPDFBase.LAYOUT.signatureLineWidth ?? 150;
        const espacioEntreBloques = totalWidth - bloqueAncho * 2;
        const leftCenterX = m.left + bloqueAncho / 2;
        const rightCenterX = m.left + bloqueAncho + espacioEntreBloques + bloqueAncho / 2;
        const lineY5 = this._currentY - IncosPDFBase.LAYOUT.spacing.section - IncosPDFBase.LAYOUT.spacing.paragraph;

        this._currentPage.drawLine({
            start: { x: leftCenterX - bloqueAncho / 2, y: lineY5 },
            end: { x: leftCenterX + bloqueAncho / 2, y: lineY5 },
            thickness: lineThickness,
            color: textRgb,
        });

        const labelDir = 'Firma/sello dirección académica ITT';
        const labelFontSize = IncosPDFBase.FONTS.normal.size || fontSize;
        const labelDirWidth = font.widthOfTextAtSize(labelDir, labelFontSize);
        const labelDirY = lineY5 - labelFontSize - 2;
        this._currentPage.drawText(labelDir, {
            x: leftCenterX - labelDirWidth / 2,
            y: labelDirY,
            size: labelFontSize,
            font,
            color: textRgb,
        });

        this._currentPage.drawLine({
            start: { x: rightCenterX - bloqueAncho / 2, y: lineY5 },
            end: { x: rightCenterX + bloqueAncho / 2, y: lineY5 },
            thickness: lineThickness,
            color: textRgb,
        });

        const labelSello = 'SELLO';
        const labelSelloWidth = font.widthOfTextAtSize(labelSello, labelFontSize);
        this._currentPage.drawText(labelSello, {
            x: rightCenterX - labelSelloWidth / 2,
            y: labelDirY,
            size: labelFontSize,
            font,
            color: textRgb,
        });

        const extraSpaceBelowSignatures = 20;
        this._currentY = labelDirY - IncosPDFBase.LAYOUT.spacing.paragraph - extraSpaceBelowSignatures;

        // Lugar y fecha al final de la sección V
        const fechaLiteral = (options.fechaActual || '').toString().trim();
        const lugarBase = 'Santa Cruz de la Sierra, Bolivia';
        const lugarYFecha = fechaLiteral
            ? `${lugarBase}, ${fechaLiteral}`
            : lugarBase;

        // "Lugar y fecha" con fuente aumentada (mismo tamaño que párrafos)
        const lugarLabel = 'Lugar y fecha:';
        const lugarText = `${lugarLabel} ${lugarYFecha}`;
        const linesLugar = this._wrapText(
            lugarText,
            font,
            fontSize,
            maxWidth
        );

        let yLugar = this._currentY;
        for (const line of linesLugar) {
            this._currentPage.drawText(line, {
                x,
                y: yLugar,
                size: fontSize,
                font,
                color: textRgb,
            });
            yLugar -= fontSize + lineSpacing;
        }

        this._currentY = yLugar;
    }

    /**
     * Dibuja una marca de verificación (check) dentro de un cuadrado de referencia.
     * @param {number} x - Origen X (esquina inferior izquierda del área del check)
     * @param {number} y - Origen Y (esquina inferior izquierda)
     * @param {number} size - Tamaño del lado del área (aprox. ancho y alto del check)
     * @param {Object} colorRgb - { red, green, blue } en 0-1
     * @private
     */
    _drawCheckmark(x, y, size, colorRgb) {
        if (!this._currentPage) return;
        const thickness = Math.max(1, size / 6);
        // Línea inferior-izq -> centro
        this._currentPage.drawLine({
            start: { x: x + size * 0.1, y: y + size * 0.35 },
            end: { x: x + size * 0.4, y: y + size * 0.65 },
            thickness,
            color: colorRgb,
        });
        // Centro -> superior-der
        this._currentPage.drawLine({
            start: { x: x + size * 0.4, y: y + size * 0.65 },
            end: { x: x + size * 0.95, y: y + size * 0.05 },
            thickness,
            color: colorRgb,
        });
    }

    /**
     * Bloque de firma adaptado para Declaración Jurada.
     *
     * Para el formulario de transitabilidad, las firmas y el texto de
     * lugar/fecha ya se dibujan dentro de las secciones IV y V, por lo que
     * aquí no es necesario agregar un bloque adicional en el footer.
     *
     * @override
     */
    async _buildFirma(options) {
        // No-op: la firma del postulante y las firmas de dirección/rector
        // ya están incluidas en los bloques de las secciones IV y V.
        return;
    }
}

