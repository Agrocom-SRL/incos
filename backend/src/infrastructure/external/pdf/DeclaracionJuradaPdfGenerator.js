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
     * II. FORMACIÓN ACADÉMICA
     * III. JUSTIFICATIVO DE LA POSTULACIÓN
     *
     * Reemplaza la sección original de "II. DATOS ACADÉMICOS" por
     * dos secciones específicas del formulario de transitabilidad.
     *
     * @override
     */
    async _buildDatosAcademicos(options) {
        const academicData = options.academicData || {};
        const enrollmentData = options.enrollmentData || {};
        const transitability = options.transitabilityData || {};
        const institution = options.institutionData || {};

        // ============================================
        // II. FORMACIÓN ACADÉMICA
        // ============================================
        await this._addSection('II. FORMACIÓN ACADÉMICA');

        const formacionItems = [];

        // Nivel académico alcanzado (derivado del tipo de institución de origen)
        const tipoInstitucion = (institution.tipo || '').toString().toUpperCase();
        let nivelAcademico = '';
        if (tipoInstitucion === 'UETHP') {
            nivelAcademico = 'Técnico Medio UETHP';
        } else if (tipoInstitucion === 'CEA') {
            nivelAcademico = 'Técnico Medio CEA';
        } else if (tipoInstitucion) {
            nivelAcademico = tipoInstitucion;
        }
        if (nivelAcademico) {
            formacionItems.push({
                label: 'Nivel académico alcanzado:',
                value: nivelAcademico,
            });
        }

        // Carrera de origen (transitabilidad)
        const carreraOrigen = (transitability.carreraOrigen || '').toString().trim();
        if (carreraOrigen) {
            formacionItems.push({
                label: 'Carrera:',
                value: carreraOrigen,
            });
        }

        // Unidad educativa / institución de origen
        const institucionNombre = (institution.nombre || '').toString().trim();
        if (institucionNombre) {
            formacionItems.push({
                label: 'Unidad Educativa / Institución:',
                value: institucionNombre,
            });
        }

        // Código SIE-UE
        const codigoSie = (institution.codigoSie || '').toString().trim();
        if (codigoSie) {
            formacionItems.push({
                label: 'Código SIE-UE:',
                value: codigoSie,
            });
        }

        // Año de conclusión de estudios
        const anioConclusion =
            transitability.anioConclusion != null
                ? String(transitability.anioConclusion)
                : '';
        if (anioConclusion) {
            formacionItems.push({
                label: 'Año de conclusión de estudios:',
                value: anioConclusion,
            });
        }

        // Distrito educativo
        const distritoEducativo = (institution.distritoEducativo || '').toString().trim();
        if (distritoEducativo) {
            formacionItems.push({
                label: 'Distrito educativo:',
                value: distritoEducativo,
            });
        }

        if (formacionItems.length > 0) {
            // Hacer que cada fila ocupe el 100% del ancho (como Domicilio / Lugar de nacimiento)
            await this._addBoxedFieldGrid(formacionItems, [], 100, 100);
        } else {
            await this._addLabelValue(
                'Formación académica:',
                'No hay datos de formación académica disponibles'
            );
        }

        this._addSpace();

        // ============================================
        // III. JUSTIFICATIVO DE LA POSTULACIÓN
        // ============================================
        await this._addSection('III. JUSTIFICATIVO DE LA POSTULACIÓN');

        const justItems = [];

        // Instituto Técnico y Tecnológico (Razón social) - Instituto destino (INCOS)
        justItems.push({
            label: 'INSTITUTO TÉCNICO Y TECNOLÓGICO (Razón social):',
            value: IncosPDFBase.INSTITUTE.name,
        });

        // Carrera destino (desde datos académicos actuales)
        const carreraDestino =
            academicData.carreraNombre ||
            academicData.carrera_nombre ||
            carreraOrigen ||
            '';
        if (carreraDestino) {
            justItems.push({
                label: 'Carrera a la que postula:',
                value: carreraDestino,
            });
        }

        // Dependencia (usa dependencia de la institución de origen si existe)
        const dependencia = (institution.dependencia || '').toString().trim();
        if (dependencia) {
            justItems.push({
                label: 'Dependencia:',
                value: dependencia,
            });
        }

        // Régimen de estudios (desde transitabilidad)
        const regimenRaw = (transitability.regimenEstudios || '').toString().trim();
        if (regimenRaw) {
            const upper = regimenRaw.toUpperCase();
            const regimen =
                upper === 'SEMESTRAL'
                    ? 'Semestral'
                    : upper === 'ANUAL'
                    ? 'Anual'
                    : regimenRaw;
            justItems.push({
                label: 'Régimen de estudios:',
                value: regimen,
            });
        }

        if (justItems.length > 0) {
            // También a ancho completo para evitar sobreposiciones de texto
            await this._addBoxedFieldGrid(justItems, [], 100, 120);
        } else {
            await this._addLabelValue(
                'Justificativo de la postulación:',
                'No hay datos de justificación disponibles'
            );
        }

        this._addSpace();
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
            'presentados por la o el postulante y el análisis académico de la pertinencia de la solicitud en el marco de la normativa vigente, ' +
            'concluye: ____________________ (Procedente/No procedente).';

        // Párrafo de cumplimiento con fuente más grande
        currentY = this._currentY;
        const linesCumplimiento = this._wrapText(
            textoCumplimiento,
            font,
            fontSize,
            maxWidth
        );
        for (const line of linesCumplimiento) {
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

        // Líneas de firma para Dirección Académica y Rector del ITT
        const totalWidth = pageWidth - m.left - m.right;
        const bloqueAncho = IncosPDFBase.LAYOUT.signatureLineWidth ?? 150;
        const espacioEntreBloques = totalWidth - bloqueAncho * 2;
        const leftCenterX = m.left + bloqueAncho / 2;
        const rightCenterX = m.left + bloqueAncho + espacioEntreBloques + bloqueAncho / 2;
        const lineY5 = this._currentY - 16;

        // Línea izquierda: Dirección Académica
        this._currentPage.drawLine({
            start: { x: leftCenterX - bloqueAncho / 2, y: lineY5 },
            end: { x: leftCenterX + bloqueAncho / 2, y: lineY5 },
            thickness: lineThickness,
            color: textRgb,
        });

        const labelDir = 'Firma/sello dirección académica ITT';
        const labelDirWidth = font.widthOfTextAtSize(labelDir, fontSize);
        const labelDirY = lineY5 - fontSize - 2;
        this._currentPage.drawText(labelDir, {
            x: leftCenterX - labelDirWidth / 2,
            y: labelDirY,
            size: fontSize,
            font,
            color: textRgb,
        });

        // Línea derecha: Rector ITT
        this._currentPage.drawLine({
            start: { x: rightCenterX - bloqueAncho / 2, y: lineY5 },
            end: { x: rightCenterX + bloqueAncho / 2, y: lineY5 },
            thickness: lineThickness,
            color: textRgb,
        });

        const labelRector = 'Firma/sello rector del ITT';
        const labelRectorWidth = font.widthOfTextAtSize(labelRector, fontSize);
        const labelRectorY = lineY5 - fontSize - 2;
        this._currentPage.drawText(labelRector, {
            x: rightCenterX - labelRectorWidth / 2,
            y: labelRectorY,
            size: fontSize,
            font,
            color: textRgb,
        });

        this._currentY = labelRectorY - IncosPDFBase.LAYOUT.spacing.paragraph;

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

