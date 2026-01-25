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
 * Tecnología: pdf-lib (edita plantillas PDF o crea desde cero, retorna Buffer)
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
 * - IncosPDFLibBase: pdf-lib (edita plantillas o crea desde cero, retorna Buffer)
 * - NO comparten métodos porque las APIs son diferentes
 * 
 * @abstract
 * @example
 * // Ejemplo 1: Generador que usa plantilla
 * class MyTemplateGenerator extends IncosPDFLibBase {
 *   async generate(options = {}) {
 *     const pdfDoc = await this._loadTemplate('template.pdf');
 *     const page = pdfDoc.getPages()[0];
 *     let y = await this._addSubtitle(pdfDoc, page, 'Título', 700);
 *     return await this._saveDocument(pdfDoc);
 *   }
 * }
 * 
 * @example
 * // Ejemplo 2: Generador que crea desde cero
 * class MyBlankGenerator extends IncosPDFLibBase {
 *   async generate(options = {}) {
 *     const pdfDoc = await this._createBlankDocument({ pageSize: 'LETTER' });
 *     const page = pdfDoc.getPages()[0];
 *     let y = await this._addDocumentTitle(pdfDoc, page, 'Mi Documento', 750);
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
    }

    // ============================================
    // MÉTODOS DE CREACIÓN Y CARGA DE DOCUMENTOS
    // ============================================

    /**
     * Crea un documento PDF en blanco
     * 
     * Útil para generadores que no usan plantillas y crean el documento desde cero.
     * 
     * @protected
     * @param {Object} options - Opciones del documento
     * @param {string} [options.pageSize] - Tamaño de página: 'LETTER', 'A4', etc. (por defecto: 'LETTER')
     * @returns {Promise<PDFDocument>} Documento PDF en blanco
     */
    async _createBlankDocument(options = {}) {
        const opts = {
            pageSize: IncosPDFBase.LAYOUT.pageSize, // Tamaño por defecto desde configuración
            ...options,
        };

        const pdfDoc = await PDFDocument.create();

        // Registrar fontkit para poder usar fuentes personalizadas TTF/OTF
        pdfDoc.registerFontkit(fontkit);

        // Agregar una página inicial con el tamaño especificado desde configuración
        const dimensions = IncosPDFBase.PAGE_SIZES[opts.pageSize] || IncosPDFBase.PAGE_SIZES[IncosPDFBase.LAYOUT.pageSize];
        pdfDoc.addPage(dimensions);

        return pdfDoc;
    }

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

        return pdfDoc;
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
                this.logger.warn(`[IncosPDFLibBase] Fuente no encontrada, usando Helvetica-Bold como fallback`, {
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
     * Agrega el título principal del documento
     * 
     * Método simplificado que usa el estado interno (página y posición Y).
     * Usa automáticamente la fuente por defecto desde configuración.
     * 
     * @protected
     * @param {string} titleText - Texto del título
     * @param {Object} options - Opciones de personalización
     * @param {string|string[]} [options.fontName] - Nombre de fuente personalizada (por defecto: IncosPDFBase.FONTS.defaultTitleFont)
     * @param {number} [options.fontSize] - Tamaño de fuente (por defecto: IncosPDFBase.FONTS.title.size)
     * @param {string} [options.color] - Color en hexadecimal (por defecto: IncosPDFBase.COLORS.primary)
     * @param {string} [options.align] - Alineación: 'left', 'center', 'right' (por defecto: 'center')
     * @returns {Promise<void>} Actualiza el estado interno _currentY
     */
    async _addDocumentTitle(titleText, options = {}) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const opts = {
            fontName: IncosPDFBase.FONTS.defaultTitleFont, // Fuente por defecto desde configuración
            fontSize: IncosPDFBase.FONTS.title.size, // Tamaño desde configuración
            color: IncosPDFBase.COLORS.primary,
            align: 'center',
            ...options,
        };

        const { width: pageWidth } = this._currentPage.getSize();

        // Cargar fuente (puede ser personalizada o estándar)
        let titleFont;
        if (opts.fontName && !opts.fontName.startsWith('Helvetica') && !opts.fontName.startsWith('Times') && !opts.fontName.startsWith('Courier')) {
            // Es una fuente personalizada
            titleFont = await this._loadCustomFont(this._pdfDoc, opts.fontName);
        } else {
            // Es una fuente estándar - usar mapeo desde configuración
            const fontNameToUse = opts.fontName || IncosPDFBase.FONTS.title.font;
            const standardFont = this._mapFontNameToStandardFont(fontNameToUse);
            titleFont = await this._pdfDoc.embedFont(standardFont);
        }

        const titleRgb = this._hexToRgb(opts.color);

        // Calcular posición X según alineación
        const titleWidth = titleFont.widthOfTextAtSize(titleText, opts.fontSize);
        let titleX;
        if (opts.align === 'center') {
            titleX = (pageWidth - titleWidth) / 2;
        } else if (opts.align === 'right') {
            titleX = pageWidth - IncosPDFBase.LAYOUT.margins.right - titleWidth;
        } else {
            titleX = IncosPDFBase.LAYOUT.margins.left;
        }

        // Dibujar el título principal
        this._currentPage.drawText(titleText, {
            x: titleX,
            y: this._currentY,
            size: opts.fontSize,
            font: titleFont,
            color: titleRgb,
        });

        // Actualizar posición Y después del título
        this._currentY = this._currentY - opts.fontSize - IncosPDFBase.LAYOUT.spacing.section;
    }

    /**
     * Agrega un subtítulo (sección) al documento
     * 
     * Método simplificado que usa el estado interno (página y posición Y).
     * Usa automáticamente la fuente y tamaño desde configuración.
     * 
     * @protected
     * @param {string} text - Texto del subtítulo
     * @param {Object} options - Opciones adicionales
     * @param {string} [options.align] - Alineación: 'left', 'center', 'right' (por defecto: 'center')
     * @param {number} [options.indent] - Indentación desde el margen izquierdo (por defecto: 0)
     * @returns {Promise<void>} Actualiza el estado interno _currentY
     */
    async _addSubtitle(text, options = {}) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const opts = {
            align: 'center', // 'left', 'center', 'right'
            indent: 0,
            ...options,
        };

        const { width: pageWidth } = this._currentPage.getSize();
        // Usar fuente desde configuración: IncosPDFBase.FONTS.subtitle.font
        const subtitleFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.subtitle.font);
        const helveticaBoldFont = await this._pdfDoc.embedFont(subtitleFontName);
        const subtitleFontSize = IncosPDFBase.FONTS.subtitle.size;
        const subtitleRgb = this._hexToRgb(IncosPDFBase.COLORS.primary);

        let x;
        if (opts.align === 'center') {
            const textWidth = helveticaBoldFont.widthOfTextAtSize(text, subtitleFontSize);
            x = (pageWidth - textWidth) / 2;
        } else {
            x = IncosPDFBase.LAYOUT.margins.left + opts.indent;
        }

        this._currentPage.drawText(text.toUpperCase(), {
            x,
            y: this._currentY,
            size: subtitleFontSize,
            font: helveticaBoldFont,
            color: subtitleRgb,
        });

        // Actualizar posición Y después del subtítulo
        this._currentY = this._currentY - subtitleFontSize - IncosPDFBase.LAYOUT.spacing.subsection;
    }

    /**
     * Agrega un párrafo de texto normal
     * 
     * Método simplificado que usa el estado interno (página y posición Y).
     * 
     * @protected
     * @param {string} text - Texto del párrafo
     * @param {Object} options - Opciones adicionales
     * @returns {Promise<void>} Actualiza el estado interno _currentY
     */
    async _addParagraph(text, options = {}) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }
        const opts = {
            align: 'left', // 'left', 'center', 'right', 'justify'
            indent: 0,
            bold: false,
            fontSize: IncosPDFBase.FONTS.normal.size,
            ...options,
        };

        const { width: pageWidth } = this._currentPage.getSize();
        // Usar fuente desde configuración: IncosPDFBase.FONTS.normal.font o IncosPDFBase.FONTS.bold.font
        const configFontName = opts.bold ? IncosPDFBase.FONTS.bold.font : IncosPDFBase.FONTS.normal.font;
        const standardFont = this._mapFontNameToStandardFont(configFontName);
        const font = await this._pdfDoc.embedFont(standardFont);
        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);

        const maxWidth = pageWidth - IncosPDFBase.LAYOUT.margins.left - IncosPDFBase.LAYOUT.margins.right - opts.indent;
        const x = IncosPDFBase.LAYOUT.margins.left + opts.indent;

        // Dividir texto en líneas si es necesario
        const lines = this._wrapText(text, font, opts.fontSize, maxWidth);

        let currentY = this._currentY;
        for (const line of lines) {
            let lineX = x;

            // Calcular posición X según alineación
            if (opts.align === 'center') {
                const lineWidth = font.widthOfTextAtSize(line, opts.fontSize);
                lineX = (pageWidth - lineWidth) / 2;
            } else if (opts.align === 'right') {
                const lineWidth = font.widthOfTextAtSize(line, opts.fontSize);
                lineX = pageWidth - IncosPDFBase.LAYOUT.margins.right - lineWidth;
            }

            this._currentPage.drawText(line, {
                x: lineX,
                y: currentY,
                size: opts.fontSize,
                font,
                color: textRgb,
            });

            currentY -= opts.fontSize + IncosPDFBase.LAYOUT.spacing.line;
        }

        // Actualizar posición Y después del párrafo
        this._currentY = currentY - IncosPDFBase.LAYOUT.spacing.paragraph;
    }

    /**
     * Agrega un campo de formulario (etiqueta: valor)
     * 
     * Método simplificado que usa el estado interno (página y posición Y).
     * 
     * @protected
     * @param {string} label - Etiqueta del campo
     * @param {string} value - Valor del campo
     * @param {Object} options - Opciones adicionales
     * @returns {Promise<void>} Actualiza el estado interno _currentY
     */
    async _addField(label, value, options = {}) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }
        const opts = {
            labelWidth: IncosPDFBase.LAYOUT.labelWidth, // Ancho desde configuración
            indent: 0,
            bold: false,
            ...options,
        };

        // Usar fuentes desde configuración
        const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
        const boldFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.bold.font);
        const helveticaFont = await pdfDoc.embedFont(normalFontName);
        const helveticaBoldFont = await pdfDoc.embedFont(boldFontName);
        const fontSize = IncosPDFBase.FONTS.normal.size;
        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);

        const x = IncosPDFBase.LAYOUT.margins.left + opts.indent;

        // Dibujar etiqueta
        const labelFont = opts.bold ? helveticaBoldFont : helveticaFont;
        page.drawText(`${label}:`, {
            x,
            y,
            size: fontSize,
            font: labelFont,
            color: textRgb,
        });

        // Dibujar valor
        const valueX = x + opts.labelWidth;
        page.drawText(value || '', {
            x: valueX,
            y,
            size: fontSize,
            font: helveticaFont,
            color: textRgb,
        });

        // Retornar nueva posición Y
        return y - IncosPDFBase.LAYOUT.lineHeight;
    }

    /**
     * Agrega un checkbox (cuadrado con X si está marcado)
     * 
     * Método simplificado que usa el estado interno (página y posición Y).
     * 
     * @protected
     * @param {string} label - Etiqueta del checkbox
     * @param {boolean} checked - Si está marcado
     * @param {Object} options - Opciones adicionales
     * @param {number} [options.x] - Posición X (por defecto: margen izquierdo)
     * @param {number} [options.size] - Tamaño del checkbox (por defecto: 12)
     * @returns {Promise<void>} Actualiza el estado interno _currentY
     */
    async _addCheckbox(label, checked, options = {}) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const opts = {
            x: IncosPDFBase.LAYOUT.margins.left, // Posición X por defecto desde configuración
            size: 12,
            ...options,
        };

        // Usar fuentes desde configuración
        const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
        const boldFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.bold.font);
        const helveticaFont = await this._pdfDoc.embedFont(normalFontName);
        const helveticaBoldFont = await this._pdfDoc.embedFont(boldFontName);
        const fontSize = IncosPDFBase.FONTS.normal.size;
        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);
        const borderRgb = this._hexToRgb(IncosPDFBase.COLORS.border);

        // Dibujar cuadrado
        this._currentPage.drawRectangle({
            x: opts.x,
            y: this._currentY - opts.size,
            width: opts.size,
            height: opts.size,
            borderColor: borderRgb,
            borderWidth: 1,
        });

        // Dibujar X si está marcado
        if (checked) {
            const xText = 'X';
            const xWidth = helveticaBoldFont.widthOfTextAtSize(xText, opts.size - 4);
            const xX = opts.x + (opts.size - xWidth) / 2;
            const xY = this._currentY - opts.size + 2;

            this._currentPage.drawText(xText, {
                x: xX,
                y: xY,
                size: opts.size - 4,
                font: helveticaBoldFont,
                color: textRgb,
            });
        }

        // Dibujar etiqueta
        const labelX = opts.x + opts.size + 10;
        this._currentPage.drawText(label, {
            x: labelX,
            y: this._currentY,
            size: fontSize,
            font: helveticaFont,
            color: textRgb,
        });

        // Actualizar posición Y después del checkbox
        this._currentY = this._currentY - IncosPDFBase.LAYOUT.lineHeight;
    }

    /**
     * Agrega una línea horizontal
     * 
     * Método simplificado que usa el estado interno (página y posición Y).
     * 
     * @protected
     * @param {Object} options - Opciones adicionales
     * @returns {void} Actualiza el estado interno _currentY
     */
    _addLine(options = {}) {
        if (!this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }
        const opts = {
            width: 1,
            color: IncosPDFBase.COLORS.border,
            fullWidth: true,
            indent: 0,
            ...options,
        };

        const { width: pageWidth } = this._currentPage.getSize();
        const lineRgb = this._hexToRgb(opts.color);

        const startX = opts.fullWidth
            ? IncosPDFBase.LAYOUT.margins.left
            : IncosPDFBase.LAYOUT.margins.left + opts.indent;
        const endX = opts.fullWidth
            ? pageWidth - IncosPDFBase.LAYOUT.margins.right
            : pageWidth - IncosPDFBase.LAYOUT.margins.right - opts.indent;

        this._currentPage.drawLine({
            start: { x: startX, y: this._currentY },
            end: { x: endX, y: this._currentY },
            thickness: opts.width,
            color: lineRgb,
        });

        // Actualizar posición Y después de la línea
        this._currentY = this._currentY - opts.width - IncosPDFBase.LAYOUT.spacing.line;
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
        this._currentY = this._currentY - height;
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
            'Helvetica': StandardFonts.Helvetica,
            'Helvetica-Oblique': StandardFonts.HelveticaOblique,
            'Times-Roman': StandardFonts.TimesRoman,
            'Times-Bold': StandardFonts.TimesBold,
            'Courier': StandardFonts.Courier,
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
     * Envuelve texto en múltiples líneas según el ancho máximo
     * @protected
     * @param {string} text - Texto a envolver
     * @param {PDFFont} font - Fuente a usar
     * @param {number} fontSize - Tamaño de fuente
     * @param {number} maxWidth - Ancho máximo en puntos
     * @returns {Array<string>} Array de líneas
     */
    _wrapText(text, font, fontSize, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const testWidth = font.widthOfTextAtSize(testLine, fontSize);

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
