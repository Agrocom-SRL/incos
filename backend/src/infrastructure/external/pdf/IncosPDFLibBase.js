/**
 * IncosPDFLibBase - Clase base para generadores de PDF que usan pdf-lib
 *
 * Esta clase proporciona funcionalidad común para generadores que usan pdf-lib.
 *
 * IMPORTANTE: Esta clase es SOLO para pdf-lib. Para pdfkit, usa IncosPDFBase.
 *
 * Proporciona:
 * - Métodos de construcción de componentes reutilizables (específicos de pdf-lib)
 * - Utilidades para fuentes personalizadas (TTF/OTF)
 * - Utilidades de formato y posicionamiento
 * - Constantes de estilo institucional (desde IncosPDFBase)
 *
 * Tecnología: pdf-lib (edita plantillas PDF, retorna Buffer)
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja operaciones de pdf-lib
 * - Open/Closed: Extensible mediante herencia
 * - Dependency Inversion: Usa constantes de IncosPDFBase (abstracción)
 * - No comparte métodos con IncosPDFBase (diferentes APIs)
 *
 * Clean Architecture:
 * - Infrastructure Layer: Operaciones de bajo nivel con pdf-lib
 * - Reutilizable por múltiples generadores de documentos que usan pdf-lib
 *
 * Diferencia con IncosPDFBase:
 * - IncosPDFBase: pdfkit (crea desde cero, escribe en disco)
 * - IncosPDFLibBase: pdf-lib (edita plantillas PDF, retorna Buffer)
 * - NO comparten métodos porque las APIs son diferentes
 *
 * @abstract
 * @example
 * // Ejemplo: Generador que usa plantilla
 * class MyTemplateGenerator extends IncosPDFLibBase {
 *   async generate(options = {}) {
 *     const pdfDoc = await this._loadTemplate('template.pdf');
 *     const page = pdfDoc.getPages()[0];
 *     this._initializeDocumentState(pdfDoc, page, true);
 *     await this._addDocumentTitle('Mi Documento');
 *     await this._addSubtitle('Subtítulo');
 *     return await this._saveDocument(pdfDoc);
 *   }
 * }
 */

import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { IncosPDFBase } from './IncosPDFBase.js';

export class IncosPDFLibBase {
    /**
     * @param {Object} params - Dependencias inyectadas
     * @param {ILogger} [params.logger] - Logger para registro de eventos
     */
    constructor({ logger } = {}) {
        this.logger = logger;
        this._currentPage = null;
        this._currentY = null;
        this._pdfDoc = null;
        // Nombre de la plantilla con la que se inicializó el documento (recordado
        // por _loadTemplate) y una copia prístina lazy para páginas adicionales
        // (_addTemplatePage) — la página 0 del documento de trabajo ya tiene
        // contenido dibujado, así que no sirve como plantilla en blanco.
        this._templateFileName = null;
        this._templatePageSource = null;
    }

    // ============================================
    // MÉTODOS DE CREACIÓN Y CARGA DE DOCUMENTOS
    // ============================================

    /**
     * Carga una plantilla PDF desde un archivo
     *
     * Útil para generadores que editan plantillas PDF existentes.
     *
     * @protected
     * @param {string} templateFileName - Nombre del archivo de plantilla (ej: 'Plantilla.pdf')
     *   Si se proporciona una ruta absoluta, se usa tal cual
     * @returns {Promise<PDFDocument>} Documento PDF cargado
     * @throws {Error} Si la plantilla no existe o no se puede cargar
     */
    async _loadTemplate(templateFileName) {
        // Si es una ruta absoluta, usarla tal cual; si no, buscar en TEMPLATES_DIR
        const templatePath = path.isAbsolute(templateFileName)
            ? templateFileName
            : path.join(IncosPDFBase.TEMPLATES_DIR, templateFileName);

        if (!fs.existsSync(templatePath)) {
            throw new Error(
                `No se encontró la plantilla en: ${templatePath}. ` +
                'Asegúrate de que la plantilla existe en la ruta especificada.'
            );
        }

        const templateBytes = fs.readFileSync(templatePath);
        const pdfDoc = await PDFDocument.load(templateBytes);

        // Registrar fontkit para poder usar fuentes personalizadas TTF/OTF
        pdfDoc.registerFontkit(fontkit);

        // Recordar el nombre para páginas adicionales (ver _addTemplatePage)
        this._templateFileName = templateFileName;

        return pdfDoc;
    }

    /**
     * Agrega una página nueva al documento de trabajo, reutilizando la misma
     * plantilla con la que se inicializó (mismo archivo que cargó _loadTemplate:
     * encabezado con logos + pie verde) y reinicia el cursor bajo su encabezado.
     * Sin plantilla registrada (documento en blanco), agrega una página del
     * mismo tamaño que la actual y reinicia el cursor bajo el margen superior.
     *
     * Pensado para tablas/contenido que exceden una página (ver `_addTable`
     * con `options.paginate`); mismo patrón que
     * `HistorialAcademicoPdfGenerator._nuevaPagina`, generalizado aquí para
     * cualquier generador.
     *
     * @protected
     * @returns {Promise<PDFPage>} La nueva página, ya activa como _currentPage
     */
    async _addTemplatePage() {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        if (!this._templateFileName) {
            const { width, height } = this._currentPage.getSize();
            const page = this._pdfDoc.addPage([width, height]);
            this._currentPage = page;
            this._currentY = height - IncosPDFBase.LAYOUT.margins.top;
            return page;
        }

        if (!this._templatePageSource) {
            // Fuente prístina separada del documento de trabajo (que ya tiene
            // contenido dibujado en su página 0, así que no sirve para copiar).
            this._templatePageSource = await this._loadTemplate(this._templateFileName);
        }
        const [page] = await this._pdfDoc.copyPages(this._templatePageSource, [0]);
        this._pdfDoc.addPage(page);
        this._currentPage = page;
        this._currentY = this._calculateInitialY(page);
        return page;
    }

    /**
     * Serializa un documento PDF a Buffer
     * @protected
     * @param {PDFDocument} pdfDoc - Documento PDF
     * @returns {Promise<Buffer>} Buffer del PDF serializado
     */
    async _saveDocument(pdfDoc) {
        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);
    }

    // ============================================
    // MÉTODOS DE FUENTES
    // ============================================

    /**
     * Carga una fuente personalizada desde archivo TTF/OTF
     * Busca múltiples nombres de fuente y extensiones (.ttf, .otf)
     * @protected
     * @param {PDFDocument} pdfDoc - Documento PDF
     * @param {string|string[]} fontNames - Nombre(s) base de la fuente sin extensión
     *   - String: un solo nombre (ej: 'Britannic')
     *   - Array: múltiples nombres a probar en orden (ej: ['OPTIBritannic-Bold', 'Britannic'])
     * @returns {Promise<PDFFont>} Fuente embedida
     */
    async _loadCustomFont(pdfDoc, fontNames) {
        // Normalizar a array si es string
        const namesToTry = Array.isArray(fontNames) ? fontNames : [fontNames];
        const extensions = ['.ttf', '.otf'];

        let fontPath = null;
        let foundName = null;
        let foundExtension = null;

        // Buscar en orden: primero por nombre, luego por extensión
        for (const baseName of namesToTry) {
            for (const ext of extensions) {
                const testPath = path.join(IncosPDFBase.FONTS_DIR, `${baseName}${ext}`);
                if (fs.existsSync(testPath)) {
                    fontPath = testPath;
                    foundName = baseName;
                    foundExtension = ext;
                    break;
                }
            }
            if (fontPath) break; // Si encontramos una, salir del bucle
        }

        if (!fontPath) {
            // Si no existe la fuente personalizada, usar Helvetica-Bold como fallback
            if (this.logger) {
                this.logger.warn('[IncosPDFLibBase] Fuente no encontrada, usando Helvetica-Bold como fallback', {
                    searchedNames: namesToTry,
                    searchedExtensions: extensions,
                    searchedPath: IncosPDFBase.FONTS_DIR,
                });
            }
            return await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        }

        try {
            const fontBytes = fs.readFileSync(fontPath);

            if (this.logger) {
                this.logger.debug(`[IncosPDFLibBase] Archivo de fuente leído: ${fontPath} (${fontBytes.length} bytes)`);
            }

            const font = await pdfDoc.embedFont(new Uint8Array(fontBytes));

            if (this.logger) {
                this.logger.info(`[IncosPDFLibBase] Fuente cargada exitosamente: ${foundName}${foundExtension}`);
            }

            return font;
        } catch (error) {
            if (this.logger) {
                this.logger.error(`[IncosPDFLibBase] Error al cargar fuente ${foundName}${foundExtension}`, {
                    error: error.message,
                    stack: error.stack,
                    fontPath,
                    fontExists: fs.existsSync(fontPath),
                });
            }
            // Fallback a Helvetica-Bold
            return await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        }
    }

    // ============================================
    // MÉTODOS DE CONSTRUCCIÓN DE COMPONENTES
    // ============================================

    /**
     * Inicializa el estado interno para construcción de documentos
     * Debe llamarse al inicio de la generación para configurar página y posición inicial
     *
     * @protected
     * @param {PDFDocument} pdfDoc - Documento PDF
     * @param {PDFPage} page - Página donde se construirá el documento
     * @param {boolean} [useInitialY=true] - Si es true, calcula automáticamente la posición inicial desde el encabezado
     */
    _initializeDocumentState(pdfDoc, page, useInitialY = true) {
        this._pdfDoc = pdfDoc;
        this._currentPage = page;

        if (useInitialY) {
            this._currentY = this._calculateInitialY(page);
        } else {
            const { height: pageHeight } = page.getSize();
            this._currentY = pageHeight - IncosPDFBase.LAYOUT.margins.top;
        }
    }

    /**
     * Calcula la posición Y inicial para documentos con plantilla (debajo del encabezado)
     *
     * Método helper para calcular la posición inicial cuando se usa una plantilla con encabezado.
     *
     * @protected
     * @param {PDFPage} page - Página del documento
     * @returns {number} Posición Y inicial (desde abajo)
     */
    _calculateInitialY(page) {
        const { height: pageHeight } = page.getSize();
        return pageHeight - IncosPDFBase.LAYOUT.headerHeight - IncosPDFBase.LAYOUT.spacingAfterHeader;
    }

    /**
     * Agrega el bloque de encabezado institucional (varias líneas centradas arriba del título).
     * Usa fuente normal, color primario. Actualiza _currentY después de cada línea.
     *
     * @protected
     * @param {string[]} [lines] - Líneas a dibujar (de arriba a abajo). Por defecto usa IncosPDFBase.INSTITUTIONAL_HEADER_LINES
     * @returns {Promise<void>}
     */
    async _addInstitutionalHeader(lines = IncosPDFBase.INSTITUTIONAL_HEADER_LINES) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }
        if (!lines || lines.length === 0) return;

        const { width: pageWidth } = this._currentPage.getSize();
        const font = await this._pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontSize = IncosPDFBase.FONTS.normal.size;
        const color = this._hexToRgb(IncosPDFBase.COLORS.text);
        const lineSpacing = IncosPDFBase.LAYOUT.spacing.line;

        for (const text of lines) {
            const textWidth = font.widthOfTextAtSize(text, fontSize);
            const x = (pageWidth - textWidth) / 2;
            this._currentPage.drawText(text, {
                x,
                y: this._currentY,
                size: fontSize,
                font,
                color,
            });
            this._currentY = this._currentY - fontSize - lineSpacing;
        }

        // Espacio entre bloque institucional y título del documento
        this._currentY -= IncosPDFBase.LAYOUT.spacing.line;
    }

    /**
     * Dibuja el recuadro "No. Registro" en la esquina superior derecha de la página.
     * Dos filas apiladas: primera con fondo verde primario y etiqueta en blanco; segunda con fondo blanco y valor centrado.
     * No modifica _currentY.
     *
     * @protected
     * @param {string} label - Texto de la etiqueta (ej. "No. Registro:")
     * @param {string} value - Código del estudiante (valor a mostrar en la segunda fila)
     * @returns {Promise<void>}
     */
    async _drawRegistrationBox(label, value) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const { width: pageWidth, height: pageHeight } = this._currentPage.getSize();
        const { margins } = IncosPDFBase.LAYOUT;
        const boxCfg = IncosPDFBase.LAYOUT.registrationBox || {};
        const boxWidth = boxCfg.width ?? 90;
        const borderWidth = boxCfg.borderWidth ?? 1;
        const rightMargin = boxCfg.rightMargin ?? margins.right;
        const offsetFromTop = boxCfg.offsetFromTop ?? 0;

        const primaryRgb = this._hexToRgb(IncosPDFBase.COLORS.primary);
        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);
        const borderRgb = this._hexToRgb(IncosPDFBase.COLORS.border);
        const whiteRgb = rgb(1, 1, 1);

        const labelFont = await this._pdfDoc.embedFont(StandardFonts.HelveticaOblique);
        // Usar tamaño de fuente "section" para ambos cuadros
        const labelFontSize = IncosPDFBase.FONTS.section.size;

        // Fuente bold y tamaño "section" para el valor del código
        const valueFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.bold.font);
        const valueFont = await this._pdfDoc.embedFont(valueFontName);
        const valueFontSize = IncosPDFBase.FONTS.section.size;

        // Calcular altura de filas basándose en el tamaño de fuente más grande
        const padding = boxCfg.padding ?? 6;
        const topRowHeight = Math.max(boxCfg.rowHeight ?? 18, labelFontSize + (padding * 2));
        const bottomRowHeight = Math.max(boxCfg.rowHeight ?? 18, valueFontSize + (padding * 2));

        const boxX = pageWidth - rightMargin - boxWidth;
        const topRowY = pageHeight - margins.top - offsetFromTop - topRowHeight;
        const bottomRowY = topRowY - bottomRowHeight;

        // Fila superior: fondo verde primario
        this._currentPage.drawRectangle({
            x: boxX,
            y: topRowY,
            width: boxWidth,
            height: topRowHeight,
            color: primaryRgb,
        });
        this._currentPage.drawRectangle({
            x: boxX,
            y: topRowY,
            width: boxWidth,
            height: topRowHeight,
            borderColor: borderRgb,
            borderWidth,
        });

        // Etiqueta en blanco, centrada en la fila (verticalmente mejor centrada)
        const labelStr = String(label ?? '').trim();
        if (labelStr) {
            const labelWidth = labelFont.widthOfTextAtSize(labelStr, labelFontSize);
            const labelX = boxX + (boxWidth - labelWidth) / 2;
            const labelY = topRowY + (topRowHeight - labelFontSize) / 2 + labelFontSize * 0.3;
            this._currentPage.drawText(labelStr, {
                x: labelX,
                y: labelY,
                size: labelFontSize,
                font: labelFont,
                color: whiteRgb,
            });
        }

        // Fila inferior: solo borde (sin fondo blanco)
        this._currentPage.drawRectangle({
            x: boxX,
            y: bottomRowY,
            width: boxWidth,
            height: bottomRowHeight,
            borderColor: borderRgb,
            borderWidth,
        });

        // Valor en negro, bold, tamaño del título, centrado (verticalmente mejor centrado)
        const valueStr = String(value ?? '').trim();
        if (valueStr) {
            const valueWidth = valueFont.widthOfTextAtSize(valueStr, valueFontSize);
            const valueX = boxX + (boxWidth - valueWidth) / 2;
            const valueY = bottomRowY + (bottomRowHeight - valueFontSize) / 2 + valueFontSize * 0.3;
            this._currentPage.drawText(valueStr, {
                x: valueX,
                y: valueY,
                size: valueFontSize,
                font: valueFont,
                color: textRgb,
            });
        }
    }

    /**
     * Dibuja un cuadro para foto 3x3 centímetros debajo del recuadro de registro.
     * El cuadro tiene un borde negro y está posicionado debajo del código de registro.
     * No modifica _currentY.
     *
     * @protected
     * @param {string} [photoPath] - Ruta opcional a una imagen para insertar (futuro)
     * @returns {Promise<void>}
     */
    async _drawPhotoBox(_photoPath = null) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const { width: pageWidth, height: pageHeight } = this._currentPage.getSize();
        const { margins } = IncosPDFBase.LAYOUT;
        const boxCfg = IncosPDFBase.LAYOUT.registrationBox || {};
        const photoCfg = IncosPDFBase.LAYOUT.photoBox || {};
        const rightMargin = boxCfg.rightMargin ?? margins.right;
        const offsetFromTop = boxCfg.offsetFromTop ?? 0;
        const registrationBoxWidth = boxCfg.width ?? 75;
        const registrationRowHeight = boxCfg.rowHeight ?? 14;
        const padding = boxCfg.padding ?? 4;
        const labelFontSize = IncosPDFBase.FONTS.title.size - 2;
        const valueFontSize = IncosPDFBase.FONTS.title.size - 2;
        const topRowHeight = Math.max(registrationRowHeight, labelFontSize + (padding * 2));
        const bottomRowHeight = Math.max(registrationRowHeight, valueFontSize + (padding * 2));
        const totalRegistrationHeight = topRowHeight + bottomRowHeight;
        const spacingBelowRegistration = photoCfg.spacingBelowRegistration ?? 8;

        // Tamaño de foto reducido: 2.5x2.5 cm (1 cm = 28.35 puntos, entonces 2.5 cm = 70.875 puntos)
        const photoSizeCm = 2.5;
        const cmToPoints = 28.35;
        const photoSize = photoSizeCm * cmToPoints; // ~71 puntos

        const borderWidth = photoCfg.borderWidth ?? 1;
        // Alinear el cuadro de foto con el borde izquierdo del cuadro de registro
        const boxX = pageWidth - rightMargin - registrationBoxWidth;
        const registrationTopY = pageHeight - margins.top - offsetFromTop;
        const registrationBottomY = registrationTopY - totalRegistrationHeight;
        const photoBoxY = registrationBottomY - spacingBelowRegistration - photoSize;

        const borderRgb = this._hexToRgb(IncosPDFBase.COLORS.border);

        // Dibujar cuadro de foto (borde negro)
        this._currentPage.drawRectangle({
            x: boxX,
            y: photoBoxY,
            width: photoSize,
            height: photoSize,
            borderColor: borderRgb,
            borderWidth,
        });

        // TODO: Si photoPath está proporcionado, insertar la imagen aquí
        // Por ahora solo dibujamos el cuadro vacío
    }

    /**
     * Agrega el título principal del documento
     *
     * Método simplificado que usa el estado interno (página y posición Y).
     * Siempre usa la fuente por defecto desde configuración (defaultTitleFont) y está centrado.
     *
     * @protected
     * @param {string} titleText - Texto del título
     * @param {boolean} [usePrimaryColor=true] - Si true usa color primario (verde); si false usa negro (COLORS.text)
     * @returns {Promise<void>} Actualiza el estado interno _currentY
     */
    async _addDocumentTitle(titleText, usePrimaryColor = true, options = {}) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const { width: pageWidth } = this._currentPage.getSize();

        // Siempre usar fuente personalizada por defecto desde configuración
        const titleFont = await this._loadCustomFont(this._pdfDoc, IncosPDFBase.FONTS.defaultTitleFont);
        const titleFontSize = options.fontSize ?? IncosPDFBase.FONTS.title.size;
        const titleRgb = this._hexToRgb(usePrimaryColor ? IncosPDFBase.COLORS.primary : IncosPDFBase.COLORS.text);

        // Siempre centrado
        const titleWidth = titleFont.widthOfTextAtSize(titleText, titleFontSize);
        const titleX = (pageWidth - titleWidth) / 2;

        // Dibujar el título principal
        this._currentPage.drawText(titleText, {
            x: titleX,
            y: this._currentY,
            size: titleFontSize,
            font: titleFont,
            color: titleRgb,
        });

        // Actualizar posición Y después del título (espaciado reducido para subtítulo)
        this._currentY = this._currentY - titleFontSize - IncosPDFBase.LAYOUT.spacing.line;
    }

    /**
     * Agrega un subtítulo (sección) al documento
     *
     * Método simplificado que usa el estado interno (página y posición Y).
     * Siempre usa la misma fuente, color y tamaño que el título, y está centrado.
     *
     * @protected
     * @param {string} text - Texto del subtítulo
     * @returns {Promise<void>} Actualiza el estado interno _currentY
     */
    async _addSubtitle(text, options = {}) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const { width: pageWidth } = this._currentPage.getSize();

        // Usar la misma fuente, color y tamaño que el título
        const subtitleFont = await this._loadCustomFont(this._pdfDoc, IncosPDFBase.FONTS.defaultTitleFont);
        const subtitleFontSize = options.fontSize ?? IncosPDFBase.FONTS.subtitle.size;
        const subtitleRgb = this._hexToRgb(IncosPDFBase.COLORS.primary);

        // Siempre centrado
        const textWidth = subtitleFont.widthOfTextAtSize(text, subtitleFontSize);
        const x = (pageWidth - textWidth) / 2;

        this._currentPage.drawText(text.toUpperCase(), {
            x,
            y: this._currentY,
            size: subtitleFontSize,
            font: subtitleFont,
            color: subtitleRgb,
        });

        // Actualizar posición Y después del subtítulo
        this._currentY = this._currentY - subtitleFontSize - IncosPDFBase.LAYOUT.spacing.paragraph;
    }

    /**
     * Agrega un título de sección al documento
     *
     * Método simplificado que usa el estado interno (página y posición Y).
     * Usa fuente Helvetica-Bold, color primario, alineado a la izquierda.
     *
     * @protected
     * @param {string} text - Texto del título de sección
     * @param {boolean} [compactSpacing=false] - Si true, solo se resta LAYOUT.spacing.line en Y (no sectionFontSize). Si false, se resta sectionFontSize + spacing.
     * @param {Object} [options]
     * @param {number} [options.marginLeft] - Override del margen izquierdo (por defecto LAYOUT.margins.left)
     * @param {number} [options.fontSize] - Override del tamaño de fuente (por defecto FONTS.section.size)
     * @returns {Promise<void>} Actualiza el estado interno _currentY
     */
    async _addSection(text, compactSpacing = false, options = {}) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        // Usar fuente Helvetica-Bold desde configuración
        const sectionFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.section.font);
        const sectionFont = await this._pdfDoc.embedFont(sectionFontName);
        const sectionFontSize = options.fontSize ?? IncosPDFBase.FONTS.section.size;
        const sectionRgb = this._hexToRgb(IncosPDFBase.COLORS.primary);

        // Siempre alineado a la izquierda (override opcional de margen)
        const x = options.marginLeft ?? IncosPDFBase.LAYOUT.margins.left;

        this._currentPage.drawText(text, {
            x,
            y: this._currentY,
            size: sectionFontSize,
            font: sectionFont,
            color: sectionRgb,
        });

        // Actualizar posición Y después del título de sección
        if (compactSpacing) {
            this._currentY -= IncosPDFBase.LAYOUT.spacing.line;
        } else {
            this._currentY = this._currentY - sectionFontSize - IncosPDFBase.LAYOUT.spacing.line;
        }
    }

    /**
     * Agrega un párrafo de texto normal
     *
     * Método simplificado que usa el estado interno (página y posición Y).
     * Siempre usa fuente Helvetica, tamaño normal, color texto, alineado a la izquierda.
     *
     * @protected
     * @param {string} text - Texto del párrafo
     * @param {Object} [options]
     * @param {number} [options.fontSize] - Override del tamaño de fuente (por defecto FONTS.normal.size)
     * @returns {Promise<void>} Actualiza el estado interno _currentY
     */
    async _addParagraph(text, options = {}) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const { width: pageWidth } = this._currentPage.getSize();

        // Usar fuente normal desde configuración
        const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
        const font = await this._pdfDoc.embedFont(normalFontName);
        const fontSize = options.fontSize ?? IncosPDFBase.FONTS.normal.size;
        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);

        const maxWidth = pageWidth - IncosPDFBase.LAYOUT.margins.left - IncosPDFBase.LAYOUT.margins.right;
        const x = IncosPDFBase.LAYOUT.margins.left;

        // Dividir texto en líneas si es necesario
        const lines = this._wrapText(text, font, fontSize, maxWidth);

        let currentY = this._currentY;
        for (const line of lines) {
            this._currentPage.drawText(line, {
                x,
                y: currentY,
                size: fontSize,
                font,
                color: textRgb,
            });

            currentY -= fontSize + IncosPDFBase.LAYOUT.spacing.line;
        }

        // Actualizar posición Y después del párrafo
        this._currentY = currentY - IncosPDFBase.LAYOUT.spacing.paragraph;
    }

    /**
     * Dibuja "label" (bold) y "value" (normal) en la misma línea, en (x, y).
     * No modifica _currentY. Usado por _addLabelValue y _addLabelValueGrid.
     * Si se proporciona maxWidth, envuelve el texto para que no se desborde.
     *
     * @protected
     * @param {number} x - Posición X (origen izquierdo)
     * @param {number} y - Posición Y (baseline)
     * @param {string} label - Texto en negrita (ej. "Nombres y Apellidos:")
     * @param {string} value - Texto normal a continuación
     * @param {number} [maxWidth] - Ancho máximo disponible (opcional, para evitar desbordamiento)
     * @param {number} [fontSize] - Override del tamaño de fuente (por defecto FONTS.normal.size)
     * @returns {Promise<number>} Altura total usada (para múltiples líneas)
     */
    async _drawLabelValueAt(x, y, label, value, maxWidth = null, fontSize = null) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const cfg = IncosPDFBase.LAYOUT;
        const gap = cfg.labelValueGap ?? 3;
        const boldFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.bold.font);
        const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
        const boldFont = await this._pdfDoc.embedFont(boldFontName);
        const normalFont = await this._pdfDoc.embedFont(normalFontName);
        // eslint-disable-next-line no-param-reassign -- valor por defecto del tamano de fuente
        fontSize = fontSize ?? IncosPDFBase.FONTS.normal.size;
        const lineSpacing = IncosPDFBase.LAYOUT.spacing.line;
        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);

        const labelStr = String(label ?? '');
        const valueStr = String(value ?? '');

        // Si no hay maxWidth, dibujar normalmente (comportamiento original)
        if (maxWidth === null) {
            this._currentPage.drawText(labelStr, {
                x,
                y,
                size: fontSize,
                font: boldFont,
                color: textRgb,
            });

            if (valueStr) {
                const labelWidth = boldFont.widthOfTextAtSize(labelStr, fontSize);
                const valueX = x + labelWidth + gap;
                this._currentPage.drawText(valueStr, {
                    x: valueX,
                    y,
                    size: fontSize,
                    font: normalFont,
                    color: textRgb,
                });
            }
            return fontSize; // Altura de una línea
        }

        // Con maxWidth: envolver texto si es necesario
        const labelWidth = boldFont.widthOfTextAtSize(labelStr, fontSize);
        const availableWidth = maxWidth - labelWidth - gap;

        if (availableWidth <= 0) {
            // Si el label es más ancho que el espacio disponible, solo dibujar el label
            this._currentPage.drawText(labelStr, {
                x,
                y,
                size: fontSize,
                font: boldFont,
                color: textRgb,
            });
            return fontSize;
        }

        // Dibujar label
        this._currentPage.drawText(labelStr, {
            x,
            y,
            size: fontSize,
            font: boldFont,
            color: textRgb,
        });

        if (!valueStr) {
            return fontSize;
        }

        // Envolver el value si es necesario
        const valueLines = this._wrapText(valueStr, normalFont, fontSize, availableWidth);
        const valueX = x + labelWidth + gap;
        let currentY = y;
        let totalHeight = fontSize;

        for (let i = 0; i < valueLines.length; i++) {
            const line = valueLines[i];
            // Primera línea al lado del label, siguientes líneas con indentación
            const lineX = i === 0 ? valueX : x + labelWidth + gap;

            this._currentPage.drawText(line, {
                x: lineX,
                y: currentY,
                size: fontSize,
                font: normalFont,
                color: textRgb,
            });

            if (i < valueLines.length - 1) {
                currentY -= fontSize + lineSpacing;
                totalHeight += fontSize + lineSpacing;
            }
        }

        return totalHeight;
    }

    /**
     * Agrega un campo con label normal y valor dentro de un recuadro con borde.
     * El recuadro ocupa el 100% del ancho menos los márgenes.
     * Label en texto normal (no bold), valor centrado dentro del recuadro.
     * Ajusta automáticamente la altura del cuadro si el contenido es más ancho.
     *
     * @protected
     * @param {string} label - Etiqueta en texto normal (incluir ":" si se desea)
     * @param {string} value - Valor a mostrar dentro del recuadro
     * @param {boolean} [valueBold=false] - Si es true, el valor se muestra en negrita
     * @param {number} [valueFontSize] - Tamaño de fuente para el valor. Si no se proporciona, usa fontSize normal o title.size si valueBold es true
     * @returns {Promise<void>}
     */
    async _addBoxedField(label, value, valueBold = false, valueFontSize = null) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const { width: pageWidth } = this._currentPage.getSize();
        const { margins } = IncosPDFBase.LAYOUT;
        // Aumentar tamaño de fuente para datos personales: 8pt -> 9pt (1 punto más)
        const fontSize = IncosPDFBase.FONTS.normal.size + 1;
        // Si valueBold es true y no se especifica valueFontSize, usar tamaño del título
        const finalValueFontSize = valueFontSize ?? (valueBold ? IncosPDFBase.FONTS.title.size : fontSize);
        const lineSpacing = IncosPDFBase.LAYOUT.spacing.line;
        const boxCfg = IncosPDFBase.LAYOUT.boxedFields || {};
        const boxHeight = boxCfg.boxHeight ?? 20;
        const borderWidth = boxCfg.borderWidth ?? 1;
        const labelBoxSpacing = boxCfg.labelBoxSpacing ?? 4;
        const verticalCenterFactor = boxCfg.verticalCenterFactor ?? 0.3;
        const cellPadding = boxCfg.cellPadding ?? 4;
        const lineHeight = finalValueFontSize * 1.2;

        const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
        const boldFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.bold.font);
        const labelFont = await this._pdfDoc.embedFont(normalFontName);
        const valueFont = await this._pdfDoc.embedFont(valueBold ? boldFontName : normalFontName);
        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);
        const borderRgb = this._hexToRgb(IncosPDFBase.COLORS.border);

        // Dibujar label en texto normal (no bold)
        const labelStr = String(label ?? '').trim();
        if (labelStr) {
            this._currentPage.drawText(labelStr, {
                x: margins.left,
                y: this._currentY,
                size: fontSize,
                font: labelFont,
                color: textRgb,
            });
            // Reducir espacio entre label y recuadro
            this._currentY -= fontSize - labelBoxSpacing;
        }

        // Calcular ancho del recuadro y dividir texto en líneas si es necesario
        const boxX = margins.left;
        const boxWidth = pageWidth - margins.left - margins.right;
        const availableTextWidth = boxWidth - (cellPadding * 2);

        const valueStr = String(value ?? '').trim();
        const valueLines = valueStr ? this._wrapText(valueStr, valueFont, finalValueFontSize, availableTextWidth) : [''];
        const numLines = valueLines.length;

        // Calcular altura real del cuadro (mínimo boxHeight, más espacio si hay múltiples líneas)
        const calculatedBoxHeight = Math.max(boxHeight, (numLines * lineHeight) + (cellPadding * 2));
        const boxY = this._currentY - calculatedBoxHeight;

        // Borde del recuadro
        this._currentPage.drawRectangle({
            x: boxX,
            y: boxY,
            width: boxWidth,
            height: calculatedBoxHeight,
            borderColor: borderRgb,
            borderWidth,
        });

        // Dibujar cada línea del valor centrado dentro del recuadro
        if (valueStr && valueLines.length > 0) {
            const totalTextHeight = numLines * lineHeight;
            const startTextY = boxY + (calculatedBoxHeight - totalTextHeight) / 2 + finalValueFontSize * verticalCenterFactor;

            for (let lineIdx = 0; lineIdx < numLines; lineIdx++) {
                const lineText = valueLines[lineIdx];
                if (lineText) {
                    const textWidth = valueFont.widthOfTextAtSize(lineText, finalValueFontSize);
                    const textX = boxX + (boxWidth - textWidth) / 2; // Centrado horizontal
                    const textY = startTextY + (numLines - 1 - lineIdx) * lineHeight;

                    this._currentPage.drawText(lineText, {
                        x: textX,
                        y: textY,
                        size: finalValueFontSize,
                        font: valueFont,
                        color: textRgb,
                    });
                }
            }
        }

        // Actualizar posición Y después del recuadro (menos espacio)
        this._currentY = boxY - lineSpacing;
    }

    /**
     * Agrega un grid de 2 columnas con campos con recuadro (label + cuadro con valor).
     * Cada columna tiene ancho proporcional según el porcentaje definido.
     * Dentro de cada columna: label con ancho fijo, cuadro con borde que ocupa el resto.
     * Las filas están alineadas horizontalmente entre columnas.
     * SIEMPRE respeta el porcentaje definido, incluso si una columna está vacía.
     * Si se proporciona leftColumnWidthPercent=100, se trata como una sola columna que ocupa todo el ancho.
     *
     * @protected
     * @param {{ label: string, value: string }[]} leftColumnItems - Items para la columna izquierda
     * @param {{ label: string, value: string }[]} [rightColumnItems] - Items para la columna derecha
     * @param {number} [leftColumnWidthPercent=40] - Porcentaje de ancho para la columna izquierda (0-100). Siempre se respeta este porcentaje
     * @param {number} [leftLabelWidth=80] - Ancho fijo para los labels de la columna izquierda
     * @param {number} [rightLabelWidth=100] - Ancho fijo para los labels de la columna derecha
     * @returns {Promise<void>}
     */
    async _addBoxedFieldGrid(leftColumnItems, rightColumnItems = [], leftColumnWidthPercent = 40, leftLabelWidth = 60, rightLabelWidth = 90) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const { width: pageWidth } = this._currentPage.getSize();
        const { margins } = IncosPDFBase.LAYOUT;
        // Aumentar tamaño de fuente para datos personales: 8pt -> 9pt (1 punto más)
        const fontSize = IncosPDFBase.FONTS.normal.size + 1;
        const lineSpacing = IncosPDFBase.LAYOUT.spacing.line;
        const boxCfg = IncosPDFBase.LAYOUT.boxedFields || {};
        const boxHeight = boxCfg.boxHeight ?? 20;
        const borderWidth = boxCfg.borderWidth ?? 1;
        const colGap = boxCfg.colGap ?? 16;
        const labelBoxGap = boxCfg.labelBoxGap ?? 4;

        const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
        const font = await this._pdfDoc.embedFont(normalFontName);
        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);
        const borderRgb = this._hexToRgb(IncosPDFBase.COLORS.border);

        // Normalizar arrays vacíos
        const leftItems = Array.isArray(leftColumnItems) ? leftColumnItems : [];
        const rightItems = Array.isArray(rightColumnItems) ? rightColumnItems : [];

        const totalWidth = pageWidth - margins.left - margins.right;

        let leftColWidth; let rightColWidth; let leftColX; let
rightColX;

        // Si el porcentaje es 100, se trata como una sola columna que ocupa todo el ancho
        if (leftColumnWidthPercent >= 100) {
            leftColWidth = totalWidth;
            rightColWidth = totalWidth;
            leftColX = margins.left;
            rightColX = margins.left;
        } else {
            // Dos columnas: siempre calcular proporciones según el porcentaje definido
            // Respeta el porcentaje incluso si una columna está vacía
            leftColWidth = (totalWidth - colGap) * (leftColumnWidthPercent / 100);
            rightColWidth = totalWidth - colGap - leftColWidth;
            leftColX = margins.left;
            rightColX = margins.left + leftColWidth + colGap;
        }

        const isSingleColumn = leftColumnWidthPercent >= 100;

        // Calcular número máximo de filas
        const maxRows = Math.max(leftItems.length, rightItems.length);

        // Dibujar fila por fila
        for (let row = 0; row < maxRows; row++) {
            const rowY = this._currentY;
            let maxRowHeight = boxHeight; // Altura mínima

            // Columna izquierda (o única columna si solo hay leftItems)
            if (row < leftItems.length) {
                const { label, value } = leftItems[row];
                const actualHeight = await this._drawBoxedFieldInColumn(
                    leftColX,
                    rowY,
                    leftColWidth,
                    leftLabelWidth,
                    labelBoxGap,
                    boxHeight,
                    borderWidth,
                    label,
                    value,
                    font,
                    fontSize,
                    textRgb,
                    borderRgb
                );
                maxRowHeight = Math.max(maxRowHeight, actualHeight);
            }

            // Columna derecha (solo si hay dos columnas o si es una sola columna con rightItems)
            if (!isSingleColumn && row < rightItems.length) {
                const { label, value } = rightItems[row];
                const actualHeight = await this._drawBoxedFieldInColumn(
                    rightColX,
                    rowY,
                    rightColWidth,
                    rightLabelWidth,
                    labelBoxGap,
                    boxHeight,
                    borderWidth,
                    label,
                    value,
                    font,
                    fontSize,
                    textRgb,
                    borderRgb
                );
                maxRowHeight = Math.max(maxRowHeight, actualHeight);
            }

            // Mover a la siguiente fila usando la altura máxima de la fila
            this._currentY -= maxRowHeight + lineSpacing;
        }
    }

    // ============================================
    // CABECERA Y TABLA DE IDENTIFICACIÓN OFICIALES
    // (formularios/actas del Ministerio de Educación — FMDG-1, actas de
    // defensa, dictámenes — que replican el membrete físico real: escudo del
    // Ministerio + logo INCOS, SIN la franja verde ni el pie de redes
    // sociales de `Plantilla.pdf`, que es el membrete corporativo moderno
    // usado en otros documentos. Ver memoria de proyecto
    // "PDFs oficiales: fidelidad a plantilla física".)
    // ============================================

    /**
     * Tamaños de fuente para los documentos oficiales en tamaño oficio
     * (`PAGE_SIZE = [612.12, 935.58]` en cada generador de `titulacion/`),
     * escalados ~18% respecto a `IncosPDFBase.FONTS` (935.58/792 ≈ 1.18, la
     * razón entre el alto de oficio y el alto de carta): el mismo tamaño de
     * `IncosPDFBase.FONTS` que se ve bien en carta queda pequeño en una hoja
     * más alta. Exclusivo de los métodos `_addOfficial*`,
     * `_addIdentificationTable` y `_addSignatureBlockInFlow` (y de los
     * métodos privados de cada generador de titulación) — NO reemplaza
     * `IncosPDFBase.FONTS`, que sigue igual para el resto de PDFs del
     * sistema (recibos, historial académico...) en tamaño carta.
     */
    static OFICIO_FONTS = {
        title: 17,
        subtitle: 14,
        section: 12,
        normal: 9.5,
        small: 7,
        bold: 9.5,
    };

    /** Alto (pt) de los logos de `_addOfficialLogosHeader`, mismo criterio de escala que OFICIO_FONTS. */
    static OFICIO_LOGO_HEIGHTS = {
        ministerio: 50,
        incos: 57,
    };

    /**
     * Cabecera oficial con ambos logos del documento físico: escudo del
     * Ministerio de Educación (izquierda) + logo INCOS con la resolución
     * ministerial debajo (derecha). Pensada para documentos SIN plantilla de
     * fondo (`_initializeDocumentState(doc, page, false)`): dibuja sobre
     * fondo blanco y deja `_currentY` debajo de ambos logos.
     *
     * @protected
     * @param {Object} [options]
     * @param {string} [options.motto='RESOLUCIÓN MINISTERIAL 426/2016'] - Texto bajo el logo INCOS
     * @returns {Promise<void>}
     */
    async _addOfficialLogosHeader(options = {}) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const { width: pageWidth, height: pageHeight } = this._currentPage.getSize();
        const { margins } = IncosPDFBase.LAYOUT;
        const topY = pageHeight - margins.top;
        const motto = options.motto ?? 'RESOLUCIÓN MINISTERIAL 426/2016';

        const ministerioPath = path.join(IncosPDFBase.TEMPLATES_DIR, 'ministerio.png');
        const incosPath = path.join(IncosPDFBase.TEMPLATES_DIR, 'logo.png');

        let bottomY = topY;

        if (fs.existsSync(ministerioPath)) {
            const image = await this._pdfDoc.embedPng(fs.readFileSync(ministerioPath));
            const height = IncosPDFLibBase.OFICIO_LOGO_HEIGHTS.ministerio;
            const dims = image.scale(1);
            const width = dims.width * (height / dims.height);
            this._currentPage.drawImage(image, {
                x: margins.left,
                y: topY - height,
                width,
                height,
            });
            bottomY = Math.min(bottomY, topY - height);
        }

        if (fs.existsSync(incosPath)) {
            const image = await this._pdfDoc.embedPng(fs.readFileSync(incosPath));
            const height = IncosPDFLibBase.OFICIO_LOGO_HEIGHTS.incos;
            const dims = image.scale(1);
            const width = dims.width * (height / dims.height);
            const x = pageWidth - margins.right - width;
            this._currentPage.drawImage(image, { x, y: topY - height, width, height });

            if (motto) {
                const mottoFont = await this._pdfDoc.embedFont(StandardFonts.HelveticaBold);
                const mottoFontSize = IncosPDFLibBase.OFICIO_FONTS.small;
                const mottoWidth = mottoFont.widthOfTextAtSize(motto, mottoFontSize);
                const mottoY = topY - height - mottoFontSize - 3;
                this._currentPage.drawText(motto, {
                    x: x + (width - mottoWidth) / 2,
                    y: mottoY,
                    size: mottoFontSize,
                    font: mottoFont,
                    color: this._hexToRgb(IncosPDFBase.COLORS.text),
                });
                bottomY = Math.min(bottomY, mottoY);
            } else {
                bottomY = Math.min(bottomY, topY - height);
            }
        }

        this._currentY = bottomY - IncosPDFBase.LAYOUT.spacing.section;
    }

    /**
     * Título/línea centrada en Helvetica-Bold (NO la fuente decorativa
     * institucional de `_addDocumentTitle`): los formularios/actas físicos
     * oficiales del Ministerio usan tipografía sans-serif simple, no la
     * fuente de marca de otros documentos (cartas, informes). Acepta varias
     * líneas (una por elemento de `lines`).
     *
     * @protected
     * @param {string|string[]} lines - Una línea o varias (se dibujan en orden, centradas)
     * @param {Object} [options]
     * @param {number} [options.fontSize] - Por defecto OFICIO_FONTS.subtitle
     * @returns {Promise<void>}
     */
    async _addOfficialDocumentTitle(lines, options = {}) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }
        const { width: pageWidth } = this._currentPage.getSize();
        const font = await this._pdfDoc.embedFont(
            this._mapFontNameToStandardFont(IncosPDFBase.FONTS.section.font),
        );
        const fontSize = options.fontSize ?? IncosPDFLibBase.OFICIO_FONTS.subtitle;
        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);
        const arr = Array.isArray(lines) ? lines : [lines];

        arr.forEach((text) => {
            const textWidth = font.widthOfTextAtSize(text, fontSize);
            this._currentPage.drawText(text, {
                x: (pageWidth - textWidth) / 2,
                y: this._currentY,
                size: fontSize,
                font,
                color: textRgb,
            });
            this._currentY -= fontSize + IncosPDFBase.LAYOUT.spacing.line;
        });
    }

    /**
     * Tabla de identificación de 2 columnas (etiqueta con fondo gris + valor
     * con borde), réplica del "cuadro de datos" de los formularios físicos
     * oficiales (p. ej. FMDG-1: NOMBRES/APELLIDOS/CÉDULA DE IDENTIDAD/
     * INSTITUTO/CARRERA/...). Cada fila ocupa el ancho completo entre
     * márgenes; la altura se ajusta al contenido (wrap automático).
     *
     * @protected
     * @param {Array<{label: string, value?: string, subFields?: {label:string, value:string}[], minHeight?: number}>} rows
     *   `subFields` divide la columna de valor en N sub-columnas con su
     *   propio mini-encabezado (p. ej. CÉDULA DE IDENTIDAD: Nº/EXPEDIDO/Nº DE CELULAR).
     * @param {Object} [options]
     * @param {number} [options.labelWidth=130] - Ancho fijo de la columna de etiquetas
     * @returns {Promise<void>}
     */
    async _addIdentificationTable(rows, options = {}) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }
        if (!Array.isArray(rows) || rows.length === 0) return;

        const { width: pageWidth } = this._currentPage.getSize();
        const { margins } = IncosPDFBase.LAYOUT;
        const labelWidth = options.labelWidth ?? 130;
        const cellPadding = 6;
        const borderWidth = 1;
        const fontSize = IncosPDFLibBase.OFICIO_FONTS.normal + 1;
        const lineHeight = fontSize * 1.3;

        const tableX = margins.left;
        const tableWidth = pageWidth - margins.left - margins.right;
        const valueX = tableX + labelWidth;
        const valueWidth = tableWidth - labelWidth;

        const labelFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.bold.font);
        const valueFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
        const labelFont = await this._pdfDoc.embedFont(labelFontName);
        const valueFont = await this._pdfDoc.embedFont(valueFontName);
        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);
        const borderRgb = this._hexToRgb(IncosPDFBase.COLORS.border);
        const labelBgRgb = rgb(0.9, 0.9, 0.9);
        const geometry = { tableX, labelWidth, valueX, valueWidth };
        const cellStyle = {
            labelFont,
            valueFont,
            fontSize,
            lineHeight,
            cellPadding,
            textRgb,
            borderRgb,
            labelBgRgb,
            borderWidth,
        };

        for (const row of rows) {
            const rowY = this._currentY;
            const hasSubFields = Array.isArray(row.subFields) && row.subFields.length > 0;
            const rowHeight = hasSubFields
                ? this._drawIdTableSubFieldsRow(row, rowY, geometry, cellStyle)
                : this._drawIdTableSimpleRow(row, rowY, geometry, cellStyle);
            this._currentY = rowY - rowHeight;
        }
    }

    /** @private */
    _drawIdTableSubFieldsRow(row, rowY, geometry, cellStyle) {
        const { tableX, labelWidth, valueX, valueWidth } = geometry;
        const {
            labelFont,
            valueFont,
            fontSize,
            lineHeight,
            cellPadding,
            textRgb,
            borderRgb,
            labelBgRgb,
            borderWidth,
        } = cellStyle;
        const subCount = row.subFields.length;
        const subWidth = valueWidth / subCount;
        const subHeaderFontSize = IncosPDFLibBase.OFICIO_FONTS.small;
        const subHeaderHeight = subHeaderFontSize + cellPadding * 2;
        const subValueHeight = lineHeight + cellPadding;
        const rowHeight = Math.max(row.minHeight ?? 0, subHeaderHeight + subValueHeight);

        this._drawIdTableLabelCell(tableX, rowY, labelWidth, rowHeight, row.label, cellStyle);

        row.subFields.forEach((sub, i) => {
            const subX = valueX + i * subWidth;

            this._currentPage.drawRectangle({
                x: subX,
                y: rowY - subHeaderHeight,
                width: subWidth,
                height: subHeaderHeight,
                color: labelBgRgb,
                borderColor: borderRgb,
                borderWidth,
            });
            const subLabelStr = String(sub.label ?? '').toUpperCase();
            const subLabelWidth = labelFont.widthOfTextAtSize(subLabelStr, subHeaderFontSize);
            this._currentPage.drawText(subLabelStr, {
                x: subX + (subWidth - subLabelWidth) / 2,
                y: rowY - subHeaderHeight + (subHeaderHeight - subHeaderFontSize) / 2 + 1,
                size: subHeaderFontSize,
                font: labelFont,
                color: textRgb,
            });

            this._currentPage.drawRectangle({
                x: subX,
                y: rowY - subHeaderHeight - subValueHeight,
                width: subWidth,
                height: subValueHeight,
                borderColor: borderRgb,
                borderWidth,
            });
            const subValueStr = String(sub.value ?? '').trim();
            if (subValueStr) {
                const subValueWidth = valueFont.widthOfTextAtSize(subValueStr, fontSize);
                const subValueBoxY = rowY - subHeaderHeight - subValueHeight;
                const subValueY = subValueBoxY + (subValueHeight - fontSize) / 2 + 1;
                this._currentPage.drawText(subValueStr, {
                    x: subX + (subWidth - subValueWidth) / 2,
                    y: subValueY,
                    size: fontSize,
                    font: valueFont,
                    color: textRgb,
                });
            }
        });

        return rowHeight;
    }

    /** @private */
    _drawIdTableSimpleRow(row, rowY, geometry, cellStyle) {
        const { tableX, labelWidth, valueX, valueWidth } = geometry;
        const {
            valueFont, fontSize, lineHeight, cellPadding, textRgb, borderRgb, borderWidth,
        } = cellStyle;
        const valueStr = String(row.value ?? '').trim();
        const availableTextWidth = valueWidth - cellPadding * 2;
        // Preserva párrafos separados por línea en blanco (p. ej. "Objetivo
        // General" / "Objetivos Específicos" en la celda OBJETIVOS del
        // FMDG-1): `_wrapText` por sí solo colapsaría el salto a un espacio.
        const paragraphs = valueStr
            ? valueStr.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
            : [];
        const valueLines = paragraphs.length > 0
            ? paragraphs.flatMap((paragraph, idx) => {
                const wrapped = this._wrapText(paragraph, valueFont, fontSize, availableTextWidth);
                return idx < paragraphs.length - 1 ? [...wrapped, ''] : wrapped;
            })
            : [''];
        const contentHeight = valueLines.length * lineHeight;
        const rowHeight = Math.max(row.minHeight ?? 22, contentHeight + cellPadding * 2);

        this._drawIdTableLabelCell(tableX, rowY, labelWidth, rowHeight, row.label, cellStyle);

        this._currentPage.drawRectangle({
            x: valueX,
            y: rowY - rowHeight,
            width: valueWidth,
            height: rowHeight,
            borderColor: borderRgb,
            borderWidth,
        });

        // Texto alineado arriba de la celda (fiel al original: párrafos
        // largos como OBJETIVOS empiezan pegados al borde superior, no
        // centrados verticalmente).
        let lineY = rowY - cellPadding - fontSize;
        valueLines.forEach((line) => {
            if (line) {
                this._currentPage.drawText(line, {
                    x: valueX + cellPadding,
                    y: lineY,
                    size: fontSize,
                    font: valueFont,
                    color: textRgb,
                });
            }
            lineY -= lineHeight;
        });

        return rowHeight;
    }

    /** @private */
    _drawIdTableLabelCell(x, rowY, width, height, label, cellStyle) {
        const { labelFont, fontSize, textRgb, borderRgb, labelBgRgb, borderWidth } = cellStyle;
        this._currentPage.drawRectangle({
            x,
            y: rowY - height,
            width,
            height,
            color: labelBgRgb,
            borderColor: borderRgb,
            borderWidth,
        });
        const labelStr = String(label ?? '').toUpperCase();
        const labelLines = this._wrapText(labelStr, labelFont, fontSize, width - 12);
        const lineHeight = fontSize * 1.2;
        const totalHeight = labelLines.length * lineHeight;
        let textY = rowY - (height - totalHeight) / 2 - fontSize;
        labelLines.forEach((line) => {
            this._currentPage.drawText(line, {
                x: x + 6,
                y: textY,
                size: fontSize,
                font: labelFont,
                color: textRgb,
            });
            textY -= lineHeight;
        });
    }

    /**
     * Dibuja una tabla con encabezado y filas de datos.
     * El encabezado tiene fondo de color primario y texto blanco.
     * Las filas tienen bordes negros.
     *
     * @protected
     * @param {string[]} headers - Títulos de las columnas del encabezado
     * @param {number[]} columnWidths - Anchos de cada columna (en puntos o porcentajes). Si son porcentajes, deben sumar 100
     * @param {Array<Array<string>>} rows - Filas de datos (cada fila es un array de strings, uno por columna)
     * @param {number} [tableWidth] - Ancho total de la tabla. Si no se proporciona, usa el ancho disponible menos márgenes
     * @param {string[]} [alignments] - Alineación de cada columna ('left', 'center', 'right'). Por defecto todas 'left'
     * @param {number} [tableX] - Posición X de la tabla. Si no se proporciona, se centra si tableWidth está definido, o usa margins.left
     * @param {Object} [options]
     * @param {number} [options.fontSize] - Override del tamaño de fuente del contenido (por defecto FONTS.small.size)
     * @param {number} [options.headerFontSize] - Override del tamaño de fuente del encabezado (por defecto FONTS.normal.size)
     * @param {boolean} [options.paginate=false] - Si true, cuando una fila no entra sobre el pie de
     *   página (`options.footerHeight`) cierra la tabla en la página actual, agrega una página nueva
     *   con `_addTemplatePage()` y repite el encabezado antes de seguir. Default false: comportamiento
     *   idéntico al de siempre (sin este flag NINGÚN otro llamador de `_addTable` cambia).
     * @param {number} [options.footerHeight] - Alto del pie visual de la plantilla a NO invadir (por
     *   defecto `LAYOUT.signatureTemplateFooterHeight` cuando `paginate` es true, 0 si no)
     * @returns {Promise<void>}
     */
    async _addTable(headers, columnWidths, rows, tableWidth = null, alignments = [], tableX = null, options = {}) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const { width: pageWidth } = this._currentPage.getSize();
        const { margins } = IncosPDFBase.LAYOUT;
        const tableCfg = IncosPDFBase.LAYOUT.table || {};
        const rowHeight = tableCfg.rowHeight ?? 18;
        const headerHeight = tableCfg.headerHeight ?? 20;
        const borderWidth = tableCfg.borderWidth ?? 1;
        const cellPadding = tableCfg.cellPadding ?? 4;

        const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
        const boldFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.bold.font);
        const font = await this._pdfDoc.embedFont(normalFontName);
        const headerFont = await this._pdfDoc.embedFont(boldFontName);
        // Contenido usa small.size / header usa normal.size, salvo override explícito (options.fontSize/headerFontSize)
        const fontSize = options.fontSize ?? IncosPDFBase.FONTS.small.size;
        const headerFontSize = options.headerFontSize ?? IncosPDFBase.FONTS.normal.size;

        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);
        const borderRgb = this._hexToRgb(IncosPDFBase.COLORS.border);
        const headerBgRgb = this._hexToRgb(IncosPDFBase.COLORS.primary);
        const whiteRgb = rgb(1, 1, 1);

        // Salto de página (opt-in): sin options.paginate, comportamiento idéntico al de siempre.
        const paginate = Boolean(options.paginate);
        const footerHeight = options.footerHeight
            ?? (paginate ? (IncosPDFBase.LAYOUT.signatureTemplateFooterHeight ?? 0) : 0);
        const floorY = margins.bottom + footerHeight;

        // Calcular ancho de la tabla
        const availableWidth = tableWidth ?? (pageWidth - margins.left - margins.right);
        // Calcular posición X: si se proporciona tableX, usarlo; si hay tableWidth pero no tableX, centrar; si no, usar margins.left
        const finalTableX = tableX !== null ? tableX : (tableWidth ? (pageWidth - tableWidth) / 2 : margins.left);

        // Normalizar anchos de columnas (convertir porcentajes a puntos si es necesario)
        const numCols = headers.length;
        const normalizedWidths = [];
        let totalPercent = 0;
        let totalPoints = 0;

        for (let i = 0; i < columnWidths.length; i++) {
            const width = columnWidths[i];
            if (width < 1) {
                // Es un porcentaje (0-1)
                normalizedWidths.push(width);
                totalPercent += width;
            } else if (width <= 100 && i === 0 && columnWidths.every((w) => w <= 100)) {
                // Podrían ser porcentajes (0-100)
                normalizedWidths.push(width / 100);
                totalPercent += width / 100;
            } else {
                // Son puntos absolutos
                normalizedWidths.push(null);
                totalPoints += width;
            }
        }

        // Si hay porcentajes, calcular anchos absolutos
        const actualWidths = [];
        if (totalPercent > 0) {
            const widthForPercent = availableWidth - totalPoints;
            for (let i = 0; i < normalizedWidths.length; i++) {
                if (normalizedWidths[i] !== null) {
                    actualWidths[i] = widthForPercent * normalizedWidths[i];
                } else {
                    actualWidths[i] = columnWidths[i];
                }
            }
        } else {
            // Todos son puntos absolutos
            actualWidths.push(...columnWidths);
        }

        // Normalizar alineaciones
        const normalizedAlignments = [];
        for (let i = 0; i < numCols; i++) {
            normalizedAlignments[i] = alignments[i] || 'left';
        }

        // Helper: Divide texto en líneas que caben en el ancho disponible (normaliza \n/\r para WinAnsi)
        const wrapText = (text, maxWidth, font, fontSize) => {
            if (text == null || text === '') return [''];
            const normalized = String(text).replace(/\r\n|\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
            const words = normalized.split(' ');
            const lines = [];
            let currentLine = '';

            for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const testWidth = font.widthOfTextAtSize(testLine, fontSize);

                if (testWidth <= maxWidth) {
                    currentLine = testLine;
                } else {
                    if (currentLine) {
                        lines.push(currentLine);
                    }
                    // Si una palabra sola es más ancha que el espacio, dividirla
                    if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
                        // Dividir palabra en caracteres
                        let charLine = '';
                        for (const char of word) {
                            const testCharLine = charLine + char;
                            if (font.widthOfTextAtSize(testCharLine, fontSize) <= maxWidth) {
                                charLine = testCharLine;
                            } else {
                                if (charLine) lines.push(charLine);
                                charLine = char;
                            }
                        }
                        currentLine = charLine;
                    } else {
                        currentLine = word;
                    }
                }
            }
            if (currentLine) {
                lines.push(currentLine);
            }
            return lines.length > 0 ? lines : [''];
        };

        // Calcular posición inicial
        let currentY = this._currentY;

        // Encabezado con wrap: calcular líneas por columna y altura dinámica
        const headerLinesByCol = [];
        const headerLineHeight = headerFontSize * 1.2;
        let maxHeaderLines = 1;
        for (let col = 0; col < numCols; col++) {
            const colWidth = actualWidths[col];
            const headerText = String(headers[col] ?? '').trim().toUpperCase();
            const availableHeaderWidth = colWidth - (cellPadding * 2);
            const lines = wrapText(headerText, availableHeaderWidth, headerFont, headerFontSize);
            headerLinesByCol[col] = lines;
            maxHeaderLines = Math.max(maxHeaderLines, lines.length);
        }
        const actualHeaderHeight = Math.max(headerHeight, maxHeaderLines * headerLineHeight + (cellPadding * 2));

        // Dibuja el encabezado en la posición Y dada (se repite en cada página cuando paginate=true).
        const drawHeader = (topY) => {
            const hY = topY - actualHeaderHeight;

            this._currentPage.drawRectangle({
                x: finalTableX,
                y: hY,
                width: availableWidth,
                height: actualHeaderHeight,
                color: headerBgRgb,
            });

            this._currentPage.drawRectangle({
                x: finalTableX,
                y: hY,
                width: availableWidth,
                height: actualHeaderHeight,
                borderColor: borderRgb,
                borderWidth,
            });

            let hX = finalTableX;
            for (let col = 0; col < numCols; col++) {
                const colWidth = actualWidths[col];
                const lines = headerLinesByCol[col] || [''];
                const alignment = normalizedAlignments[col];
                const numLines = lines.length;

                for (let lineIdx = 0; lineIdx < numLines; lineIdx++) {
                    const lineText = lines[lineIdx];
                    if (lineText) {
                        const textWidth = headerFont.widthOfTextAtSize(lineText, headerFontSize);
                        let textX;
                        if (alignment === 'center') {
                            textX = hX + (colWidth - textWidth) / 2;
                        } else if (alignment === 'right') {
                            textX = hX + colWidth - textWidth - cellPadding;
                        } else {
                            textX = hX + cellPadding;
                        }
                        const totalTextHeight = numLines * headerLineHeight;
                        const startTextY = hY + (actualHeaderHeight - totalTextHeight) / 2 + headerFontSize * 0.3;
                        const textY = startTextY + (numLines - 1 - lineIdx) * headerLineHeight;
                        this._currentPage.drawText(lineText, {
                            x: textX,
                            y: textY,
                            size: headerFontSize,
                            font: headerFont,
                            color: whiteRgb,
                        });
                    }
                }

                if (col < numCols - 1) {
                    this._currentPage.drawLine({
                        start: { x: hX + colWidth, y: hY },
                        end: { x: hX + colWidth, y: hY + actualHeaderHeight },
                        thickness: borderWidth,
                        color: borderRgb,
                    });
                }
                hX += colWidth;
            }

            return hY;
        };

        // Cierra los bordes (izquierdo/derecho/inferior) del segmento de tabla dibujado
        // en la página actual — se usa antes de saltar de página y al final de la tabla.
        const closeTableBorders = (segmentTopY, segmentBottomY) => {
            this._currentPage.drawLine({
                start: { x: finalTableX, y: segmentBottomY },
                end: { x: finalTableX + availableWidth, y: segmentBottomY },
                thickness: borderWidth,
                color: borderRgb,
            });
            this._currentPage.drawLine({
                start: { x: finalTableX, y: segmentTopY },
                end: { x: finalTableX, y: segmentBottomY },
                thickness: borderWidth,
                color: borderRgb,
            });
            const rightX = finalTableX + availableWidth;
            this._currentPage.drawLine({
                start: { x: rightX, y: segmentTopY },
                end: { x: rightX, y: segmentBottomY },
                thickness: borderWidth,
                color: borderRgb,
            });
        };

        // Dibujar filas de datos
        let headerY = drawHeader(currentY);
        currentY = headerY;
        let tableTopY = headerY + actualHeaderHeight;
        let tableBottomY = headerY;

        for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
            const row = rows[rowIdx];

            // Calcular altura necesaria para esta fila (basada en el contenido más alto)
            let maxLines = 1;
            const cellLines = [];
            for (let col = 0; col < numCols; col++) {
                const colWidth = actualWidths[col];
                const cellValue = String(row[col] ?? '').trim();
                const availableTextWidth = colWidth - (cellPadding * 2);
                const lines = wrapText(cellValue, availableTextWidth, font, fontSize);
                cellLines[col] = lines;
                maxLines = Math.max(maxLines, lines.length);
            }

            // Calcular altura de la fila (mínimo rowHeight, más espacio si hay múltiples líneas)
            const lineHeight = fontSize * 1.2; // Espacio entre líneas
            const calculatedRowHeight = Math.max(rowHeight, (maxLines * lineHeight) + (cellPadding * 2));

            // Salto de página: esta fila no entra sobre el pie de la plantilla.
            if (paginate && (currentY - calculatedRowHeight) < floorY) {
                closeTableBorders(tableTopY, currentY);
                // eslint-disable-next-line no-await-in-loop
                await this._addTemplatePage();
                currentY = this._currentY;
                headerY = drawHeader(currentY);
                currentY = headerY;
                tableTopY = headerY + actualHeaderHeight;
            }

            currentY -= calculatedRowHeight;
            let currentX = finalTableX;
            tableBottomY = currentY; // Actualizar la parte inferior de la tabla

            // Borde superior de la fila
            this._currentPage.drawLine({
                start: { x: finalTableX, y: currentY },
                end: { x: finalTableX + availableWidth, y: currentY },
                thickness: borderWidth,
                color: borderRgb,
            });

            // Dibujar celdas de la fila
            for (let col = 0; col < numCols; col++) {
                const colWidth = actualWidths[col];
                const lines = cellLines[col] || [''];
                const alignment = normalizedAlignments[col];
                const numLines = lines.length;

                // Dibujar cada línea del texto
                for (let lineIdx = 0; lineIdx < numLines; lineIdx++) {
                    const lineText = lines[lineIdx];
                    if (lineText) {
                        const textWidth = font.widthOfTextAtSize(lineText, fontSize);
                        let textX;
                        if (alignment === 'center') {
                            textX = currentX + (colWidth - textWidth) / 2;
                        } else if (alignment === 'right') {
                            textX = currentX + colWidth - textWidth - cellPadding;
                        } else {
                            textX = currentX + cellPadding;
                        }

                        // Calcular posición Y: centrar verticalmente todas las líneas dentro de la celda
                        const totalTextHeight = numLines * lineHeight;
                        const startTextY = currentY + (calculatedRowHeight - totalTextHeight) / 2 + fontSize * 0.3;
                        const textY = startTextY + (numLines - 1 - lineIdx) * lineHeight;

                        this._currentPage.drawText(lineText, {
                            x: textX,
                            y: textY,
                            size: fontSize,
                            font,
                            color: textRgb,
                        });
                    }
                }

                // Línea vertical entre columnas
                if (col < numCols - 1) {
                    this._currentPage.drawLine({
                        start: { x: currentX + colWidth, y: currentY },
                        end: { x: currentX + colWidth, y: currentY + calculatedRowHeight },
                        thickness: borderWidth,
                        color: borderRgb,
                    });
                }

                currentX += colWidth;
            }
        }

        // Cierra los bordes del último segmento (o de toda la tabla si no hubo saltos de página)
        closeTableBorders(tableTopY, tableBottomY);

        // Actualizar posición Y después de la tabla
        this._currentY = currentY - IncosPDFBase.LAYOUT.spacing.line;
    }

    /**
     * Dibuja campos con recuadro dentro de un ancho específico de columna.
     * Este método es similar a _addBoxedFieldGrid pero respeta el ancho de columna proporcionado.
     * Ajusta automáticamente la altura de cada cuadro según su contenido.
     *
     * @protected
     * @param {{ label: string, value: string }[]} items - Items a dibujar (label + cuadro con valor)
     * @param {number} colX - Posición X de la columna
     * @param {number} colWidth - Ancho total de la columna
     * @param {number} [labelWidth=60] - Ancho fijo para los labels
     * @returns {Promise<void>}
     */
    async _addBoxedFieldsInColumn(items, colX, colWidth, labelWidth = 60) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        if (!items || items.length === 0) {
            return;
        }

        const boxCfg = IncosPDFBase.LAYOUT.boxedFields || {};
        const boxHeight = boxCfg.boxHeight ?? 18;
        const borderWidth = boxCfg.borderWidth ?? 1;
        const labelBoxGap = boxCfg.labelBoxGap ?? 4;
        const lineSpacing = IncosPDFBase.LAYOUT.spacing.line;
        // Aumentar tamaño de fuente para datos personales: 8pt -> 9pt (1 punto más)
        const fontSize = IncosPDFBase.FONTS.normal.size + 1;

        const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
        const font = await this._pdfDoc.embedFont(normalFontName);
        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);
        const borderRgb = this._hexToRgb(IncosPDFBase.COLORS.border);

        // Dibujar cada campo y usar la altura real retornada
        for (const item of items) {
            const { label, value } = item;
            const actualBoxHeight = await this._drawBoxedFieldInColumn(
                colX,
                this._currentY,
                colWidth,
                labelWidth,
                labelBoxGap,
                boxHeight,
                borderWidth,
                label,
                value,
                font,
                fontSize,
                textRgb,
                borderRgb
            );

            // Mover a la siguiente fila usando la altura real del cuadro
            this._currentY -= actualBoxHeight + lineSpacing;
        }
    }

    /**
     * Agrega un layout de dos columnas con contenido diferente en cada lado.
     * Columna izquierda: campos con recuadro (usando _addBoxedFieldsInColumn).
     * Columna derecha: tabla (usando _addTable).
     * Las columnas están alineadas horizontalmente en la parte superior.
     *
     * @protected
     * @param {{ label: string, value: string }[]} leftColumnItems - Items para la columna izquierda (campos con recuadro)
     * @param {Object} rightTableConfig - Configuración de la tabla derecha
     * @param {string[]} rightTableConfig.headers - Títulos de las columnas de la tabla
     * @param {number[]} rightTableConfig.columnWidths - Anchos de cada columna (porcentajes 0-1 o puntos)
     * @param {Array<Array<string>>} rightTableConfig.rows - Filas de datos de la tabla
     * @param {string[]} [rightTableConfig.alignments] - Alineación de cada columna ('left', 'center', 'right')
     * @param {number} [leftColumnWidthPercent=40] - Porcentaje de ancho para la columna izquierda (0-100)
     * @param {number} [leftLabelWidth=60] - Ancho fijo para los labels de la columna izquierda
     * @param {Object} [options] - Opciones
     * @param {number} [options.topOffset] - Puntos a subir el Y de inicio (positivo = contenido más pegado al título de sección; ahorra espacio)
     * @returns {Promise<void>}
     */
    async _addTwoColumnLayout(leftColumnItems, rightTableConfig, leftColumnWidthPercent = 40, leftLabelWidth = 60, options = {}) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const { width: pageWidth } = this._currentPage.getSize();
        const { margins } = IncosPDFBase.LAYOUT;
        const boxCfg = IncosPDFBase.LAYOUT.boxedFields || {};
        const colGap = boxCfg.colGap ?? 16;

        const totalWidth = pageWidth - margins.left - margins.right;
        const leftColWidth = (totalWidth - colGap) * (leftColumnWidthPercent / 100);
        const rightColWidth = totalWidth - colGap - leftColWidth;

        const leftColX = margins.left;
        const rightColX = margins.left + leftColWidth + colGap;

        // Opcional: subir el Y de inicio para que el contenido empiece más cerca del título de sección
        const topOffset = options.topOffset ?? 0;
        if (topOffset > 0) {
            this._currentY += topOffset;
        }

        // Guardar posición Y inicial
        const startY = this._currentY;
        let leftColumnEndY = startY;
        let rightColumnEndY = startY;

        // Dibujar columna izquierda (campos con recuadro) con ancho específico
        if (leftColumnItems && leftColumnItems.length > 0) {
            await this._addBoxedFieldsInColumn(leftColumnItems, leftColX, leftColWidth, leftLabelWidth);
            leftColumnEndY = this._currentY;
        }

        // Restaurar posición Y para la tabla derecha
        this._currentY = startY;

        // Dibujar tabla derecha
        if (rightTableConfig && rightTableConfig.headers && rightTableConfig.rows) {
            await this._addTable(
                rightTableConfig.headers,
                rightTableConfig.columnWidths,
                rightTableConfig.rows,
                rightColWidth,
                rightTableConfig.alignments,
                rightColX
            );
            rightColumnEndY = this._currentY;
        }

        // Actualizar posición Y al mínimo de ambas columnas (el que esté más abajo)
        this._currentY = Math.min(leftColumnEndY, rightColumnEndY);
    }

    /**
     * Helper: Dibuja un campo con label y cuadro dentro de una columna específica.
     * Ajusta automáticamente la altura del cuadro si el contenido es más ancho.
     *
     * @private
     * @param {number} colX - Posición X de la columna
     * @param {number} rowY - Posición Y de la fila
     * @param {number} colWidth - Ancho total de la columna
     * @param {number} labelWidth - Ancho fijo del label
     * @param {number} labelBoxGap - Espacio entre label y cuadro
     * @param {number} boxHeight - Altura mínima del cuadro
     * @param {number} borderWidth - Grosor del borde
     * @param {string} label - Texto del label
     * @param {string} value - Valor a mostrar en el cuadro
     * @param {PDFFont} font - Fuente a usar
     * @param {number} fontSize - Tamaño de fuente
     * @param {RGB} textRgb - Color del texto
     * @param {RGB} borderRgb - Color del borde
     * @returns {Promise<number>} Altura real del cuadro (puede ser mayor que boxHeight si hay múltiples líneas)
     */
    async _drawBoxedFieldInColumn(colX, rowY, colWidth, labelWidth, labelBoxGap, boxHeight, borderWidth, label, value, font, fontSize, textRgb, borderRgb) {
        const labelStr = String(label ?? '').trim();
        const valueStr = String(value ?? '').trim();

        // Calcular posición y tamaño del cuadro
        const boxX = colX + labelWidth + labelBoxGap;
        const boxWidth = colWidth - labelWidth - labelBoxGap;
        const boxCfg = IncosPDFBase.LAYOUT.boxedFields || {};
        const cellPadding = boxCfg.cellPadding ?? 4;
        const lineHeight = fontSize * 1.2; // Espacio entre líneas

        // Si el label es largo, envolver en varias líneas para evitar desborde
        const labelLines = labelStr ? this._wrapText(labelStr, font, fontSize, labelWidth) : [];
        const totalLabelHeight = labelLines.length * lineHeight;

        // Dividir el texto del valor en líneas si es necesario
        const availableTextWidth = boxWidth - (cellPadding * 2);
        const valueLines = valueStr ? this._wrapText(valueStr, font, fontSize, availableTextWidth) : [''];
        const numLines = valueLines.length;

        // Calcular altura real del cuadro (mínimo boxHeight, más espacio si hay múltiples líneas)
        const calculatedBoxHeight = Math.max(boxHeight, (numLines * lineHeight) + (cellPadding * 2));
        const boxY = rowY - calculatedBoxHeight;

        // Dibujar label: una línea centrada con el cuadro; varias líneas alineadas al tope del cuadro
        if (labelLines.length > 0) {
            if (labelLines.length === 1) {
                const labelY = boxY + (calculatedBoxHeight - fontSize) / 2 + fontSize * 0.3;
                this._currentPage.drawText(labelLines[0], {
                    x: colX,
                    y: labelY,
                    size: fontSize,
                    font,
                    color: textRgb,
                });
            } else {
                for (let i = 0; i < labelLines.length; i++) {
                    const labelY = boxY + calculatedBoxHeight - (i + 1) * lineHeight - (fontSize * 0.15);
                    this._currentPage.drawText(labelLines[i], {
                        x: colX,
                        y: labelY,
                        size: fontSize,
                        font,
                        color: textRgb,
                    });
                }
            }
        }

        // Dibujar borde del recuadro
        this._currentPage.drawRectangle({
            x: boxX,
            y: boxY,
            width: boxWidth,
            height: calculatedBoxHeight,
            borderColor: borderRgb,
            borderWidth,
        });

        // Dibujar cada línea del valor centrado dentro del cuadro
        if (valueStr && valueLines.length > 0) {
            const verticalCenterFactor = boxCfg.verticalCenterFactor ?? 0.3;
            const totalTextHeight = numLines * lineHeight;
            const startTextY = boxY + (calculatedBoxHeight - totalTextHeight) / 2 + fontSize * verticalCenterFactor;

            for (let lineIdx = 0; lineIdx < numLines; lineIdx++) {
                const lineText = valueLines[lineIdx];
                if (lineText) {
                    const textWidth = font.widthOfTextAtSize(lineText, fontSize);
                    const textX = boxX + (boxWidth - textWidth) / 2; // Centrado horizontal
                    const textY = startTextY + (numLines - 1 - lineIdx) * lineHeight;

                    this._currentPage.drawText(lineText, {
                        x: textX,
                        y: textY,
                        size: fontSize,
                        font,
                        color: textRgb,
                    });
                }
            }
        }

        // La altura de la fila debe contemplar tanto el cuadro como el label si ocupa más de una línea
        const effectiveRowHeight = Math.max(calculatedBoxHeight, totalLabelHeight);
        return effectiveRowHeight;
    }

    /**
     * Agrega una línea "label (bold): value (normal)" en la misma línea.
     * Usa margen izquierdo y _currentY; avanza _currentY una línea.
     *
     * @protected
     * @param {string} label - Etiqueta en negrita (incluir ":" si se desea)
     * @param {string} value - Valor en texto normal
     * @returns {Promise<void>}
     */
    async _addLabelValue(label, value) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const m = IncosPDFBase.LAYOUT.margins;
        const x = m.left;
        const fontSize = IncosPDFBase.FONTS.normal.size;
        const lineSpacing = IncosPDFBase.LAYOUT.bulletSpacing;

        await this._drawLabelValueAt(x, this._currentY, label, value);
        this._currentY -= fontSize + lineSpacing;
    }

    /**
     * Dibuja un grid de "label: value" en 2 o 3 columnas.
     * items = [{ label, value }, ...]. Envuelve texto si es necesario para evitar desbordamiento.
     *
     * @protected
     * @param {{ label: string, value: string }[]} items - Lista de { label, value }
     * @param {number} numCols - Número de columnas (2 o 3)
     * @param {Object} [options]
     * @param {number} [options.fontSize] - Override del tamaño de fuente (por defecto FONTS.normal.size)
     * @returns {Promise<void>}
     */
    async _addLabelValueGrid(items, numCols = 2, options = {}) {
        if (!this._pdfDoc || !this._currentPage || !items.length) return;

        const { width: pageWidth } = this._currentPage.getSize();
        const m = IncosPDFBase.LAYOUT.margins;
        const cfg = IncosPDFBase.LAYOUT;
        const colGap = cfg.gridColGap ?? 16;
        const fontSize = options.fontSize ?? IncosPDFBase.FONTS.normal.size;
        const lineSpacing = IncosPDFBase.LAYOUT.spacing.line;

        const totalWidth = pageWidth - m.left - m.right;
        const colWidth = (totalWidth - (numCols - 1) * colGap) / numCols;
        const numRows = Math.ceil(items.length / numCols);
        const baseX = m.left;

        // Primero calcular alturas de cada fila sin dibujar
        const boldFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.bold.font);
        const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
        const boldFont = await this._pdfDoc.embedFont(boldFontName);
        const normalFont = await this._pdfDoc.embedFont(normalFontName);
        const gap = cfg.labelValueGap ?? 3;

        const rowHeights = [];

        for (let row = 0; row < numRows; row++) {
            let maxRowHeight = fontSize; // Altura mínima de una fila

            for (let col = 0; col < numCols; col++) {
                const idx = row * numCols + col;
                if (idx >= items.length) break;
                const { label, value } = items[idx];

                const labelStr = String(label ?? '');
                const valueStr = String(value ?? '');
                const labelWidth = boldFont.widthOfTextAtSize(labelStr, fontSize);
                const availableWidth = colWidth - labelWidth - gap;

                if (availableWidth > 0 && valueStr) {
                    // Calcular cuántas líneas necesita el value
                    const valueLines = this._wrapText(valueStr, normalFont, fontSize, availableWidth);
                    const cellHeight = valueLines.length * fontSize + (valueLines.length - 1) * lineSpacing;
                    maxRowHeight = Math.max(maxRowHeight, cellHeight);
                }
            }

            rowHeights.push(maxRowHeight);
        }

        // Ahora dibujar todas las celdas
        let currentY = this._currentY;
        for (let row = 0; row < numRows; row++) {
            const rowY = currentY;

            for (let col = 0; col < numCols; col++) {
                const idx = row * numCols + col;
                if (idx >= items.length) break;
                const { label, value } = items[idx];
                const x = baseX + col * (colWidth + colGap);

                // Dibujar con el ancho máximo de columna para evitar desbordamiento
                await this._drawLabelValueAt(x, rowY, label, value, colWidth, fontSize);
            }

            // Mover a la siguiente fila
            currentY -= rowHeights[row] + lineSpacing;
        }

        // Actualizar _currentY con la altura total usada
        this._currentY = currentY;
    }

    /**
     * Agrega una viñeta con círculo negro rellenado seguido de texto
     *
     * Método simplificado que usa el estado interno (página y posición Y).
     * Dibuja un círculo negro rellenado y luego el texto al lado.
     * Las viñetas tienen indentación adicional respecto a las secciones.
     *
     * @protected
     * @param {string} text - Texto de la viñeta
     * @returns {Promise<void>} Actualiza el estado interno _currentY
     */
    async _addBulletPoint(text) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const { width: pageWidth } = this._currentPage.getSize();

        // Usar fuente normal desde configuración
        const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
        const font = await this._pdfDoc.embedFont(normalFontName);
        const fontSize = IncosPDFBase.FONTS.section.size;
        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);
        const bulletRgb = this._hexToRgb(IncosPDFBase.COLORS.text); // Círculo negro

        // Indentación y tamaño desde configuración
        const { bulletIndent } = IncosPDFBase.LAYOUT;
        const bulletX = IncosPDFBase.LAYOUT.margins.left + bulletIndent;
        const { bulletDiameter } = IncosPDFBase.LAYOUT;
        const bulletRadius = bulletDiameter / 2;

        // Calcular posición Y del círculo: centrado verticalmente con la línea de texto
        const bulletY = this._currentY + (fontSize * 0.3); // Centro vertical del texto (mitad de la altura)

        // Dibujar círculo negro rellenado
        this._currentPage.drawCircle({
            x: bulletX + bulletRadius,
            y: bulletY,
            size: bulletDiameter, // Diámetro en pdf-lib
            color: bulletRgb,
        });

        // Posición del texto (después del círculo con espacio desde configuración)
        const { bulletSpacing } = IncosPDFBase.LAYOUT;
        const textX = bulletX + bulletDiameter + bulletSpacing;
        const maxWidth = pageWidth - IncosPDFBase.LAYOUT.margins.right - textX;

        // Dividir texto en líneas si es necesario
        const lines = this._wrapText(text, font, fontSize, maxWidth);

        let currentY = this._currentY;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Primera línea alineada con texto después del círculo, siguientes líneas con la misma indentación
            const lineX = i === 0 ? textX : bulletX + bulletDiameter + bulletSpacing;

            this._currentPage.drawText(line, {
                x: lineX,
                y: currentY,
                size: fontSize,
                font,
                color: textRgb,
            });

            currentY -= fontSize + IncosPDFBase.LAYOUT.spacing.line;
        }

        // Actualizar posición Y después de la viñeta
        this._currentY = currentY - IncosPDFBase.LAYOUT.spacing.bullet;
    }

    /**
     * Agrega un espacio en blanco
     *
     * Método simplificado que usa el estado interno (posición Y).
     *
     * @protected
     * @param {number} height - Altura del espacio (por defecto: IncosPDFBase.LAYOUT.spacing.paragraph)
     * @returns {void} Actualiza el estado interno _currentY
     */
    _addSpace(height = IncosPDFBase.LAYOUT.spacing.paragraph) {
        if (this._currentY === null) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }
        this._currentY -= height;
    }

    /**
     * Dibuja un bloque de firma tipo footer: línea horizontal centrada y líneas de texto debajo.
     * Posición fija al final de la página (footer), no depende de _currentY.
     * No maneja contenidos: quien llama proporciona las cadenas a mostrar.
     *
     * @protected
     * @param {Object} opts - Opciones
     * @param {string[]} opts.lines - Líneas de texto centradas bajo la línea (orden: primera más cerca de la línea)
     * @param {number} [opts.fontSize] - Tamaño de fuente (por defecto FONTS.normal.size)
     * @returns {Promise<void>}
     */
    async _addSignatureBlock(opts = {}) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const lines = Array.isArray(opts.lines) ? opts.lines : [];
        const { width: pageWidth } = this._currentPage.getSize();
        const cfg = IncosPDFBase.LAYOUT;
        const { margins } = cfg;
        const lineWidth = cfg.signatureLineWidth ?? 150;
        const lineThickness = cfg.signatureLineThickness ?? 1;
        const footerPadding = cfg.signatureFooterPadding ?? 10;
        const templateFooterHeight = cfg.signatureTemplateFooterHeight ?? 0;
        const spaceLineToFirst = cfg.signatureSpacingLineToFirstText ?? 8;
        const spaceBetweenLines = cfg.signatureSpacingBetweenTextLines ?? 4;

        const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
        const font = await this._pdfDoc.embedFont(normalFontName);
        const fontSize = opts.fontSize ?? IncosPDFBase.FONTS.normal.size;
        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);

        const centerX = pageWidth / 2;
        const halfLine = lineWidth / 2;

        const blockHeight = lineThickness + spaceLineToFirst +
            lines.length * fontSize + Math.max(0, lines.length - 1) * spaceBetweenLines;
        const blockBottomY = margins.bottom + templateFooterHeight + footerPadding;
        const lineY = blockBottomY + blockHeight - lineThickness;

        this._currentPage.drawLine({
            start: { x: centerX - halfLine, y: lineY },
            end: { x: centerX + halfLine, y: lineY },
            thickness: lineThickness,
            color: textRgb,
        });

        let textY = lineY - lineThickness - spaceLineToFirst;
        for (let i = 0; i < lines.length; i++) {
            const str = String(lines[i] ?? '').trim();
            const w = str ? font.widthOfTextAtSize(str, fontSize) : 0;
            if (str) {
                this._currentPage.drawText(str, {
                    x: centerX - w / 2,
                    y: textY,
                    size: fontSize,
                    font,
                    color: textRgb,
                });
            }
            textY -= fontSize + (i < lines.length - 1 ? spaceBetweenLines : 0);
        }
    }

    /**
     * Bloque de firma dibujado en el FLUJO normal (línea horizontal + líneas
     * de texto centradas debajo, usa y actualiza `_currentY`) — a diferencia
     * de `_addSignatureBlock`, NO se ancla al pie de página. Pensado para
     * documentos SIN plantilla de fondo (`_addOfficialLogosHeader`) donde,
     * en el físico real, la firma queda a media hoja seguida de más texto
     * (p. ej. "Lugar y fecha" después de la firma en el FMDG-1), no pegada
     * al borde inferior.
     *
     * @protected
     * @param {string[]} lines - Líneas de texto centradas bajo la línea de firma
     * @returns {Promise<void>}
     */
    async _addSignatureBlockInFlow(lines = []) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const { width: pageWidth } = this._currentPage.getSize();
        const cfg = IncosPDFBase.LAYOUT;
        const lineWidth = cfg.signatureLineWidth ?? 150;
        const lineThickness = cfg.signatureLineThickness ?? 1;
        const spaceLineToFirst = cfg.signatureSpacingLineToFirstText ?? 8;
        const spaceBetweenLines = cfg.signatureSpacingBetweenTextLines ?? 4;
        const centerX = pageWidth / 2;

        const font = await this._pdfDoc.embedFont(
            this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font),
        );
        const fontSize = IncosPDFLibBase.OFICIO_FONTS.normal;
        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);

        this._addSpace(cfg.spacing.section);
        const lineY = this._currentY;
        this._currentPage.drawLine({
            start: { x: centerX - lineWidth / 2, y: lineY },
            end: { x: centerX + lineWidth / 2, y: lineY },
            thickness: lineThickness,
            color: textRgb,
        });

        let cursorY = lineY - lineThickness - spaceLineToFirst;
        lines.forEach((line) => {
            const baselineY = cursorY - fontSize;
            const str = String(line ?? '').trim();
            if (str) {
                const w = font.widthOfTextAtSize(str, fontSize);
                this._currentPage.drawText(str, {
                    x: centerX - w / 2,
                    y: baselineY,
                    size: fontSize,
                    font,
                    color: textRgb,
                });
            }
            cursorY = baselineY - spaceBetweenLines;
        });
        this._currentY = cursorY;
    }

    /**
     * Agrega un párrafo con estilos MIXTOS por palabra (negrita y/o subrayado),
     * con word-wrap continuo a través de TODO el párrafo (no por segmento).
     * Pensado para textos tipo formulario legal: una oración corrida donde
     * algunos datos variables van subrayados (como si se hubiesen escrito a
     * máquina sobre un espacio en blanco) y alguna frase fija va en negrita.
     *
     * @protected
     * @param {Array<{text: string, bold?: boolean, underline?: boolean}>} runs -
     *   Segmentos en orden; cada uno hereda su estilo a todas sus palabras.
     * @param {Object} [options]
     * @param {number} [options.fontSize] - Tamaño de fuente (por defecto FONTS.normal.size)
     * @param {number} [options.lineSpacing] - Espacio entre líneas (por defecto LAYOUT.spacing.line)
     * @param {number} [options.paragraphSpacing] - Espacio después del párrafo (por defecto LAYOUT.spacing.paragraph)
     * @param {number} [options.underlineOffset] - Distancia del subrayado bajo la línea base (por defecto 2)
     * @param {number} [options.marginLeft] - Override del margen izquierdo (por defecto LAYOUT.margins.left)
     * @param {number} [options.marginRight] - Override del margen derecho (por defecto LAYOUT.margins.right)
     * @returns {Promise<void>} Actualiza el estado interno _currentY
     */
    async _addRichParagraph(runs, options = {}) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }
        if (!Array.isArray(runs) || runs.length === 0) return;

        const { width: pageWidth } = this._currentPage.getSize();
        const fontSize = options.fontSize ?? IncosPDFBase.FONTS.normal.size;
        const lineSpacing = options.lineSpacing ?? IncosPDFBase.LAYOUT.spacing.line;
        const paragraphSpacing = options.paragraphSpacing ?? IncosPDFBase.LAYOUT.spacing.paragraph;
        const underlineOffset = options.underlineOffset ?? 2;

        const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
        const boldFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.bold.font);
        const normalFont = await this._pdfDoc.embedFont(normalFontName);
        const boldFont = await this._pdfDoc.embedFont(boldFontName);
        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);

        const { margins } = IncosPDFBase.LAYOUT;
        const marginLeft = options.marginLeft ?? margins.left;
        const marginRight = options.marginRight ?? margins.right;
        const maxWidth = pageWidth - marginLeft - marginRight;
        const x0 = marginLeft;

        // Tokenizar por palabra, preservando el estilo del segmento de origen.
        const tokens = [];
        for (const run of runs) {
            const words = String(run?.text ?? '').split(' ').filter((w) => w !== '');
            for (const word of words) {
                tokens.push({ word, bold: !!run.bold, underline: !!run.underline });
            }
        }
        if (tokens.length === 0) return;

        const spaceWidth = normalFont.widthOfTextAtSize(' ', fontSize);

        // Empaquetar tokens en líneas respetando maxWidth (wrap continuo).
        const lines = [];
        let currentLine = [];
        let currentWidth = 0;
        for (const token of tokens) {
            const font = token.bold ? boldFont : normalFont;
            const wordWidth = font.widthOfTextAtSize(token.word, fontSize);
            const extra = currentLine.length > 0 ? spaceWidth : 0;
            if (currentWidth + extra + wordWidth > maxWidth && currentLine.length > 0) {
                lines.push(currentLine);
                currentLine = [token];
                currentWidth = wordWidth;
            } else {
                currentLine.push(token);
                currentWidth += extra + wordWidth;
            }
        }
        if (currentLine.length > 0) lines.push(currentLine);

        // _drawUnderlineSegment vive FUERA del loop de líneas (no-loop-func):
        // recibe start/end/y explícitos en vez de cerrar sobre variables
        // mutables del loop.
        const drawUnderlineSegment = (startX, endX, y) => {
            this._currentPage.drawLine({
                start: { x: startX, y: y - underlineOffset },
                end: { x: endX, y: y - underlineOffset },
                thickness: 0.75,
                color: textRgb,
            });
        };

        // Dibujar línea por línea; agrupa palabras subrayadas consecutivas en
        // un solo trazo continuo (no un subrayado cortado por cada palabra).
        let currentY = this._currentY;
        for (const line of lines) {
            let x = x0;
            let underlineStart = null;
            let underlineEnd = null;

            for (const token of line) {
                const font = token.bold ? boldFont : normalFont;
                const wordWidth = font.widthOfTextAtSize(token.word, fontSize);
                this._currentPage.drawText(token.word, {
                    x,
                    y: currentY,
                    size: fontSize,
                    font,
                    color: textRgb,
                });

                if (token.underline) {
                    if (underlineStart === null) underlineStart = x;
                    underlineEnd = x + wordWidth;
                } else if (underlineStart !== null) {
                    drawUnderlineSegment(underlineStart, underlineEnd, currentY);
                    underlineStart = null;
                    underlineEnd = null;
                }

                x += wordWidth + spaceWidth;
            }
            if (underlineStart !== null) {
                drawUnderlineSegment(underlineStart, underlineEnd, currentY);
            }

            currentY -= fontSize + lineSpacing;
        }

        this._currentY = currentY - paragraphSpacing;
    }

    // ============================================
    // UTILIDADES
    // ============================================

    /**
     * Mapea un nombre de fuente de configuración a StandardFonts de pdf-lib
     *
     * Este mapeo es específico de pdf-lib y convierte los nombres de fuente
     * declarados en IncosPDFBase.FONTS a StandardFonts de pdf-lib.
     *
     * Las fuentes declaradas en IncosPDFBase.FONTS son:
     * - 'Helvetica-Bold' (usado en: title, subtitle, heading, bold)
     * - 'Helvetica' (usado en: normal, small)
     *
     * @protected
     * @param {string} fontName - Nombre de fuente desde IncosPDFBase.FONTS (ej: 'Helvetica-Bold', 'Helvetica')
     * @returns {StandardFonts} Fuente estándar de pdf-lib
     */
    _mapFontNameToStandardFont(fontName) {
        // Mapeo directo de nombres de configuración a StandardFonts de pdf-lib
        const fontMap = {
            'Helvetica-Bold': StandardFonts.HelveticaBold,
            Helvetica: StandardFonts.Helvetica,
            'Helvetica-Oblique': StandardFonts.HelveticaOblique,
            'Times-Roman': StandardFonts.TimesRoman,
            'Times-Bold': StandardFonts.TimesBold,
            Courier: StandardFonts.Courier,
            'Courier-Bold': StandardFonts.CourierBold,
        };

        return fontMap[fontName] || StandardFonts.Helvetica; // Fallback a Helvetica
    }

    /**
     * Convierte un color hexadecimal a RGB para pdf-lib
     * @protected
     * @param {string} hex - Color en formato hexadecimal (#RRGGBB)
     * @returns {RGB} Objeto RGB de pdf-lib con valores 0-1
     */
    _hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        const rgbValues = result
            ? {
                r: parseInt(result[1], 16) / 255,
                g: parseInt(result[2], 16) / 255,
                b: parseInt(result[3], 16) / 255,
            }
            : { r: 0, g: 0, b: 0 };

        return rgb(rgbValues.r, rgbValues.g, rgbValues.b);
    }

    /**
     * Envuelve texto en múltiples líneas según el ancho máximo.
     * Normaliza el texto para que no contenga \\n o \\r (WinAnsi no puede codificarlos).
     * @protected
     * @param {string} text - Texto a envolver
     * @param {PDFFont} font - Fuente a usar
     * @param {number} fontSize - Tamaño de fuente
     * @param {number} maxWidth - Ancho máximo en puntos
     * @returns {Array<string>} Array de líneas
     */
    _wrapText(text, font, fontSize, maxWidth) {
        if (text == null || text === '') return [];
        // Limpiar el texto: reemplazar saltos de línea y caracteres problemáticos con espacios
        const cleanText = String(text)
            .replace(/\r\n/g, ' ') // Windows line breaks
            .replace(/\n/g, ' ') // Unix line breaks
            .replace(/\r/g, ' ') // Old Mac line breaks
            .replace(/\t/g, ' ') // Tabs
            .replace(/\s+/g, ' ') // Múltiples espacios
            .trim();
        const words = cleanText.split(' ');
        const lines = [];
        let currentLine = '';

        for (const word of words) {
            if (!word) continue; // Saltar palabras vacías
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            let testWidth = 0;
            try {
                testWidth = font.widthOfTextAtSize(testLine, fontSize);
            } catch (widthError) {
                // Si widthOfTextAtSize falla (puede pasar con algunas fuentes), usar estimación
                // Estimación aproximada: 0.6 puntos por carácter
                testWidth = testLine.length * fontSize * 0.6;
                if (this.logger) {
                    this.logger.warn('[IncosPDFLibBase] Error al calcular ancho en _wrapText, usando estimación', {
                        error: widthError.message,
                    });
                }
            }

            if (testWidth > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    }
}
