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
     * Siempre usa la fuente por defecto desde configuración (defaultTitleFont) y está centrado.
     * 
     * @protected
     * @param {string} titleText - Texto del título
     * @returns {Promise<void>} Actualiza el estado interno _currentY
     */
    async _addDocumentTitle(titleText) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const { width: pageWidth } = this._currentPage.getSize();

        // Siempre usar fuente personalizada por defecto desde configuración
        const titleFont = await this._loadCustomFont(this._pdfDoc, IncosPDFBase.FONTS.defaultTitleFont);
        const titleFontSize = IncosPDFBase.FONTS.title.size;
        const titleRgb = this._hexToRgb(IncosPDFBase.COLORS.primary);

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
    async _addSubtitle(text) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const { width: pageWidth } = this._currentPage.getSize();

        // Usar la misma fuente, color y tamaño que el título
        const subtitleFont = await this._loadCustomFont(this._pdfDoc, IncosPDFBase.FONTS.defaultTitleFont);
        const subtitleFontSize = IncosPDFBase.FONTS.subtitle.size;
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
     * @returns {Promise<void>} Actualiza el estado interno _currentY
     */
    async _addSection(text) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        // Usar fuente Helvetica-Bold desde configuración
        const sectionFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.section.font);
        const sectionFont = await this._pdfDoc.embedFont(sectionFontName);
        const sectionFontSize = IncosPDFBase.FONTS.section.size;
        const sectionRgb = this._hexToRgb(IncosPDFBase.COLORS.primary);

        // Siempre alineado a la izquierda
        const x = IncosPDFBase.LAYOUT.margins.left;

        this._currentPage.drawText(text, {
            x,
            y: this._currentY,
            size: sectionFontSize,
            font: sectionFont,
            color: sectionRgb,
        });

        // Actualizar posición Y después del título de sección (con salto de línea)
        this._currentY = this._currentY - sectionFontSize - IncosPDFBase.LAYOUT.spacing.paragraph;
    }

    /**
     * Agrega un párrafo de texto normal
     * 
     * Método simplificado que usa el estado interno (página y posición Y).
     * Siempre usa fuente Helvetica, tamaño normal, color texto, alineado a la izquierda.
     * 
     * @protected
     * @param {string} text - Texto del párrafo
     * @returns {Promise<void>} Actualiza el estado interno _currentY
     */
    async _addParagraph(text) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const { width: pageWidth } = this._currentPage.getSize();
        
        // Usar fuente normal desde configuración
        const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
        const font = await this._pdfDoc.embedFont(normalFontName);
        const fontSize = IncosPDFBase.FONTS.normal.size;
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
     *
     * @protected
     * @param {number} x - Posición X (origen izquierdo)
     * @param {number} y - Posición Y (baseline)
     * @param {string} label - Texto en negrita (ej. "Nombres y Apellidos:")
     * @param {string} value - Texto normal a continuación
     * @returns {Promise<void>}
     */
    async _drawLabelValueAt(x, y, label, value) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const cfg = IncosPDFBase.LAYOUT;
        const gap = cfg.labelValueGap ?? 3;
        const boldFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.bold.font);
        const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
        const boldFont = await this._pdfDoc.embedFont(boldFontName);
        const normalFont = await this._pdfDoc.embedFont(normalFontName);
        const fontSize = IncosPDFBase.FONTS.normal.size;
        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);

        const labelStr = String(label ?? '');
        const valueStr = String(value ?? '');

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
     * items = [{ label, value }, ...]. Misma línea por celda; solo se muestran ítems con valor.
     *
     * @protected
     * @param {{ label: string, value: string }[]} items - Lista de { label, value }
     * @param {number} numCols - Número de columnas (2 o 3)
     * @returns {Promise<void>}
     */
    async _addLabelValueGrid(items, numCols = 2) {
        if (!this._pdfDoc || !this._currentPage || !items.length) return;

        const { width: pageWidth } = this._currentPage.getSize();
        const m = IncosPDFBase.LAYOUT.margins;
        const cfg = IncosPDFBase.LAYOUT;
        const colGap = cfg.gridColGap ?? 16;
        const fontSize = IncosPDFBase.FONTS.normal.size;
        const lineSpacing = IncosPDFBase.LAYOUT.bulletSpacing;

        /* Misma separación entre filas que _addLabelValue (fontSize + lineSpacing) para espaciado uniforme. */
        const rowGap = lineSpacing;

        const totalWidth = pageWidth - m.left - m.right;
        const colWidth = (totalWidth - (numCols - 1) * colGap) / numCols;
        const numRows = Math.ceil(items.length / numCols);
        const baseX = m.left;

        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                const idx = row * numCols + col;
                if (idx >= items.length) break;
                const { label, value } = items[idx];
                const x = baseX + col * (colWidth + colGap);
                const y = this._currentY - row * (fontSize + rowGap);
                await this._drawLabelValueAt(x, y, label, value);
            }
        }

        /* Altura solo de las filas usadas (casillas ocupadas), sin contar columnas vacías.
         * 1 fila: fontSize + lineSpacing. 2+ filas: numRows * fontSize + (numRows-1) * rowGap + lineSpacing. */
        const contentHeight = numRows * fontSize + Math.max(0, numRows - 1) * rowGap;
        const totalHeight = contentHeight + lineSpacing;
        this._currentY -= totalHeight;
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
        const fontSize = IncosPDFBase.FONTS.normal.size;
        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);
        const bulletRgb = this._hexToRgb(IncosPDFBase.COLORS.text); // Círculo negro

        // Indentación y tamaño desde configuración
        const bulletIndent = IncosPDFBase.LAYOUT.bulletIndent;
        const bulletX = IncosPDFBase.LAYOUT.margins.left + bulletIndent;
        const bulletDiameter = IncosPDFBase.LAYOUT.bulletDiameter;
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
        const bulletSpacing = IncosPDFBase.LAYOUT.bulletSpacing;
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
        this._currentY = this._currentY - height;
    }

    /**
     * Dibuja un bloque de firma tipo footer: línea horizontal centrada y líneas de texto debajo.
     * Posición fija al final de la página (footer), no depende de _currentY.
     * No maneja contenidos: quien llama proporciona las cadenas a mostrar.
     *
     * @protected
     * @param {Object} opts - Opciones
     * @param {string[]} opts.lines - Líneas de texto centradas bajo la línea (orden: primera más cerca de la línea)
     * @returns {Promise<void>}
     */
    async _addSignatureBlock(opts = {}) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const lines = Array.isArray(opts.lines) ? opts.lines : [];
        const { width: pageWidth } = this._currentPage.getSize();
        const cfg = IncosPDFBase.LAYOUT;
        const margins = cfg.margins;
        const lineWidth = cfg.signatureLineWidth ?? 150;
        const lineThickness = cfg.signatureLineThickness ?? 1;
        const footerPadding = cfg.signatureFooterPadding ?? 10;
        const templateFooterHeight = cfg.signatureTemplateFooterHeight ?? 0;
        const spaceLineToFirst = cfg.signatureSpacingLineToFirstText ?? 8;
        const spaceBetweenLines = cfg.signatureSpacingBetweenTextLines ?? 4;

        const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
        const font = await this._pdfDoc.embedFont(normalFontName);
        const fontSize = IncosPDFBase.FONTS.normal.size;
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
        // Limpiar el texto: reemplazar saltos de línea y caracteres problemáticos con espacios
        const cleanText = text
            .replace(/\r\n/g, ' ')  // Windows line breaks
            .replace(/\n/g, ' ')    // Unix line breaks
            .replace(/\r/g, ' ')     // Old Mac line breaks
            .replace(/\t/g, ' ')     // Tabs
            .replace(/\s+/g, ' ')   // Múltiples espacios
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
