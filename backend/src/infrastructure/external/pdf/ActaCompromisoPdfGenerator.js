/**
 * ActaCompromisoPdfGenerator
 *
 * Servicio de infraestructura que genera el ACTA DE COMPROMISO PARA LA ENTREGA DE DOCUMENTOS
 * a partir de una plantilla PDF (Plantilla.pdf).
 * 
 * Tecnología: Usa pdf-lib para cargar y editar la plantilla PDF existente.
 * 
 * Se registra en el contenedor DI (services.container) y se inyecta en GenerateActaCompromisoUseCase.
 * 
 * NOTA: Este es el único método para generar actas de compromiso. Ya no se usa Word.
 * El flujo anterior (Word → DOCX → PDF) fue reemplazado por este método directo.
 *
 * Arquitectura modular:
 * - La construcción del documento se realiza mediante métodos específicos para cada componente:
 *   - _addDocumentTitle(): Título principal del documento
 *   - _addSubtitle(): Subtítulos de secciones
 *   - _addParagraph(): Párrafos de texto
 *   - _addField(): Campos de formulario (etiqueta: valor)
 *   - _addCheckbox(): Checkboxes con etiqueta
 *   - _addLine(): Líneas horizontales
 *   - _addSpace(): Espacios en blanco
 * 
 * Todos los métodos usan las constantes de IncosPDFBase para mantener consistencia
 * en formato, fuentes, colores y espaciado con otros documentos del instituto.
 *
 * @module ActaCompromisoPdfGenerator
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { IncosPDFBase } from './IncosPDFBase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Ruta a la plantilla base (Plantilla.pdf) */
const TEMPLATE_PATH = path.join(__dirname, '../templates/Plantilla.pdf');

/** Ruta al directorio de fuentes */
const FONTS_DIR = path.join(__dirname, '../templates/fonts');

export class ActaCompromisoPdfGenerator {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ logger } = {}) {
    this.logger = logger;
  }

  /**
   * Genera un PDF a partir de la plantilla (Plantilla.pdf).
   * Retorna el contenido como Buffer. No escribe en disco; el guardado lo hace
   * UploadsStorage u otro componente externo.
   *
   * @returns {Promise<Buffer>} Contenido del PDF con título agregado
   */
  async generateEmpty() {
    try {
      if (!fs.existsSync(TEMPLATE_PATH)) {
        throw new Error(
          `No se encontró la plantilla en: ${TEMPLATE_PATH}. ` +
            'Coloca Plantilla.pdf en backend/src/infrastructure/external/templates/.'
        );
      }

      // Cargar la plantilla PDF
      const templateBytes = fs.readFileSync(TEMPLATE_PATH);
      const pdfDoc = await PDFDocument.load(templateBytes);
      
      // Registrar fontkit para poder usar fuentes personalizadas TTF/OTF
      pdfDoc.registerFontkit(fontkit);

      // Obtener la primera página
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      // Construir el documento agregando componentes
      // El título se posiciona debajo del encabezado de la plantilla
      // Obtener año actual para la gestión
      const currentYear = new Date().getFullYear();
      let currentY = await this._addDocumentTitle(pdfDoc, firstPage, {
        headerHeight: 100,
        gestion: currentYear.toString(),
      });
      
      // Aquí se pueden agregar más componentes usando currentY:
      // currentY = await this._addSubtitle(pdfDoc, firstPage, 'I. DATOS PERSONALES', currentY);
      // currentY = await this._addParagraph(pdfDoc, firstPage, 'Texto del párrafo...', currentY);

      // Serializar el PDF a bytes
      const pdfBytes = await pdfDoc.save();

      if (this.logger) {
        this.logger.info('[ActaCompromisoPdfGenerator] Plantilla PDF generada (buffer)', {
          size: pdfBytes.length,
        });
      }

      return Buffer.from(pdfBytes);
    } catch (error) {
      if (this.logger) {
        this.logger.error('[ActaCompromisoPdfGenerator] Error al generar plantilla PDF', {
          error: error.message,
          stack: error.stack,
        });
      }
      throw error;
    }
  }

  // ============================================
  // MÉTODOS DE CONSTRUCCIÓN DE COMPONENTES
  // ============================================

  /**
   * Carga una fuente personalizada desde archivo TTF/OTF
   * Busca múltiples nombres de fuente y extensiones (.ttf, .otf)
   * @private
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
        const testPath = path.join(FONTS_DIR, `${baseName}${ext}`);
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
        this.logger.warn(`[ActaCompromisoPdfGenerator] Fuente no encontrada, usando Helvetica-Bold como fallback`, {
          searchedNames: namesToTry,
          searchedExtensions: extensions,
          searchedPath: FONTS_DIR,
        });
      }
      return await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    }

    try {
      const fontBytes = fs.readFileSync(fontPath);
      
      if (this.logger) {
        this.logger.debug(`[ActaCompromisoPdfGenerator] Archivo de fuente leído: ${fontPath} (${fontBytes.length} bytes)`);
      }
      
      const font = await pdfDoc.embedFont(new Uint8Array(fontBytes));
      
      if (this.logger) {
        this.logger.info(`[ActaCompromisoPdfGenerator] Fuente cargada exitosamente: ${foundName}${foundExtension}`);
      }
      
      return font;
    } catch (error) {
      if (this.logger) {
        this.logger.error(`[ActaCompromisoPdfGenerator] Error al cargar fuente ${foundName}${foundExtension}`, {
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

  /**
   * Agrega el título principal del documento y su subtítulo (GESTIÓN)
   * @private
   * @param {PDFDocument} pdfDoc - Documento PDF
   * @param {PDFPage} page - Página donde agregar el título
   * @param {Object} options - Opciones de posicionamiento
   * @param {string} [options.gestion] - Año de gestión (ej: '2026')
   * @returns {Promise<number>} Posición Y después del título y subtítulo (para continuar con contenido)
   */
  async _addDocumentTitle(pdfDoc, page, options = {}) {
    const opts = {
      headerHeight: 100, // Altura del encabezado desde arriba (ajustable según plantilla)
      spacingAfterHeader: 15, // Espacio después del encabezado antes del título
      gestion: null, // Año de gestión (ej: '2026')
      ...options,
    };

    const titleText = IncosPDFBase.DOCUMENT_TITLES.ACTA_COMPROMISO;
    const { width: pageWidth, height: pageHeight } = page.getSize();

    // Cargar fuente personalizada Britannic
    // Busca: britannic-bold-regular.ttf o britannic-bold-regular.otf
    // Fallback a Helvetica-Bold si no encuentra la fuente
    const titleFont = await this._loadCustomFont(pdfDoc, 'britannic-bold-regular');
    const titleRgb = this._hexToRgb(IncosPDFBase.COLORS.primary);

    // Calcular posición (pdf-lib usa coordenadas desde abajo)
    const titleFontSize = 18; // Tamaño de fuente Britannic 18
    const spacingBetweenTitleAndGestion = 8; // Espacio entre título y gestión
    
    // Calcular Y desde abajo: pageHeight - headerHeight - spacingAfterHeader
    const titleY = pageHeight - opts.headerHeight - opts.spacingAfterHeader;

    // Centrar el título
    const titleWidth = titleFont.widthOfTextAtSize(titleText, titleFontSize);
    const centeredX = (pageWidth - titleWidth) / 2;

    // Dibujar el título principal
    page.drawText(titleText, {
      x: centeredX,
      y: titleY,
      size: titleFontSize,
      font: titleFont,
      color: titleRgb,
    });

    // Agregar subtítulo "GESTIÓN XXXX" si se proporciona
    let currentY = titleY - titleFontSize - spacingBetweenTitleAndGestion;
    
    if (opts.gestion) {
      const gestionText = `GESTIÓN ${opts.gestion}`;
      const gestionWidth = titleFont.widthOfTextAtSize(gestionText, titleFontSize);
      const gestionCenteredX = (pageWidth - gestionWidth) / 2;

      page.drawText(gestionText, {
        x: gestionCenteredX,
        y: currentY,
        size: titleFontSize,
        font: titleFont,
        color: titleRgb,
      });

      currentY -= titleFontSize;
    }

    // Retornar posición Y después del título y subtítulo (para continuar con contenido)
    return currentY - IncosPDFBase.LAYOUT.spacing.section;
  }

  /**
   * Agrega un subtítulo (sección) al documento
   * @private
   * @param {PDFDocument} pdfDoc - Documento PDF
   * @param {PDFPage} page - Página donde agregar el subtítulo
   * @param {string} text - Texto del subtítulo
   * @param {number} y - Posición Y (desde abajo)
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<number>} Nueva posición Y después del subtítulo
   */
  async _addSubtitle(pdfDoc, page, text, y, options = {}) {
    const opts = {
      align: 'left', // 'left', 'center', 'right'
      indent: 0,
      ...options,
    };

    const { width: pageWidth } = page.getSize();
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const subtitleFontSize = IncosPDFBase.FONTS.subtitle.size;
    const subtitleRgb = this._hexToRgb(IncosPDFBase.COLORS.primary);

    let x;
    if (opts.align === 'center') {
      const textWidth = helveticaBoldFont.widthOfTextAtSize(text, subtitleFontSize);
      x = (pageWidth - textWidth) / 2;
    } else {
      x = IncosPDFBase.LAYOUT.margins.left + opts.indent;
    }

    page.drawText(text.toUpperCase(), {
      x,
      y,
      size: subtitleFontSize,
      font: helveticaBoldFont,
      color: subtitleRgb,
    });

    // Retornar nueva posición Y (después del subtítulo + espaciado)
    return y - subtitleFontSize - IncosPDFBase.LAYOUT.spacing.subsection;
  }

  /**
   * Agrega un párrafo de texto normal
   * @private
   * @param {PDFDocument} pdfDoc - Documento PDF
   * @param {PDFPage} page - Página donde agregar el párrafo
   * @param {string} text - Texto del párrafo
   * @param {number} y - Posición Y (desde abajo)
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<number>} Nueva posición Y después del párrafo
   */
  async _addParagraph(pdfDoc, page, text, y, options = {}) {
    const opts = {
      align: 'left', // 'left', 'center', 'right', 'justify'
      indent: 0,
      bold: false,
      fontSize: IncosPDFBase.FONTS.normal.size,
      ...options,
    };

    const { width: pageWidth } = page.getSize();
    const fontName = opts.bold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica;
    const font = await pdfDoc.embedFont(fontName);
    const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);

    const maxWidth = pageWidth - IncosPDFBase.LAYOUT.margins.left - IncosPDFBase.LAYOUT.margins.right - opts.indent;
    const x = IncosPDFBase.LAYOUT.margins.left + opts.indent;

    // Dividir texto en líneas si es necesario
    const lines = this._wrapText(text, font, opts.fontSize, maxWidth);

    let currentY = y;
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

      page.drawText(line, {
        x: lineX,
        y: currentY,
        size: opts.fontSize,
        font,
        color: textRgb,
      });

      currentY -= opts.fontSize + IncosPDFBase.LAYOUT.spacing.line;
    }

    // Retornar nueva posición Y (después del párrafo + espaciado)
    return currentY - IncosPDFBase.LAYOUT.spacing.paragraph;
  }

  /**
   * Agrega un campo de formulario (etiqueta: valor)
   * @private
   * @param {PDFDocument} pdfDoc - Documento PDF
   * @param {PDFPage} page - Página donde agregar el campo
   * @param {string} label - Etiqueta del campo
   * @param {string} value - Valor del campo
   * @param {number} y - Posición Y (desde abajo)
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<number>} Nueva posición Y después del campo
   */
  async _addField(pdfDoc, page, label, value, y, options = {}) {
    const opts = {
      labelWidth: 150,
      indent: 0,
      bold: false,
      ...options,
    };

    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
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
   * @private
   * @param {PDFDocument} pdfDoc - Documento PDF
   * @param {PDFPage} page - Página donde agregar el checkbox
   * @param {string} label - Etiqueta del checkbox
   * @param {boolean} checked - Si está marcado
   * @param {number} x - Posición X
   * @param {number} y - Posición Y (desde abajo)
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<number>} Nueva posición Y después del checkbox
   */
  async _addCheckbox(pdfDoc, page, label, checked, x, y, options = {}) {
    const opts = {
      size: 12,
      ...options,
    };

    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = IncosPDFBase.FONTS.normal.size;
    const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);
    const borderRgb = this._hexToRgb(IncosPDFBase.COLORS.border);

    // Dibujar cuadrado
    page.drawRectangle({
      x,
      y: y - opts.size,
      width: opts.size,
      height: opts.size,
      borderColor: borderRgb,
      borderWidth: 1,
    });

    // Dibujar X si está marcado
    if (checked) {
      const xText = 'X';
      const xWidth = helveticaBoldFont.widthOfTextAtSize(xText, opts.size - 4);
      const xX = x + (opts.size - xWidth) / 2;
      const xY = y - opts.size + 2;

      page.drawText(xText, {
        x: xX,
        y: xY,
        size: opts.size - 4,
        font: helveticaBoldFont,
        color: textRgb,
      });
    }

    // Dibujar etiqueta
    const labelX = x + opts.size + 10;
    page.drawText(label, {
      x: labelX,
      y,
      size: fontSize,
      font: helveticaFont,
      color: textRgb,
    });

    // Retornar nueva posición Y
    return y - IncosPDFBase.LAYOUT.lineHeight;
  }

  /**
   * Agrega una línea horizontal
   * @private
   * @param {PDFPage} page - Página donde agregar la línea
   * @param {number} y - Posición Y (desde abajo)
   * @param {Object} options - Opciones adicionales
   * @returns {number} Nueva posición Y después de la línea
   */
  _addLine(page, y, options = {}) {
    const opts = {
      width: 1,
      color: IncosPDFBase.COLORS.border,
      fullWidth: true,
      indent: 0,
      ...options,
    };

    const { width: pageWidth } = page.getSize();
    const lineRgb = this._hexToRgb(opts.color);

    const startX = opts.fullWidth
      ? IncosPDFBase.LAYOUT.margins.left
      : IncosPDFBase.LAYOUT.margins.left + opts.indent;
    const endX = opts.fullWidth
      ? pageWidth - IncosPDFBase.LAYOUT.margins.right
      : pageWidth - IncosPDFBase.LAYOUT.margins.right - opts.indent;

    page.drawLine({
      start: { x: startX, y },
      end: { x: endX, y },
      thickness: opts.width,
      color: lineRgb,
    });

    // Retornar nueva posición Y
    return y - opts.width - IncosPDFBase.LAYOUT.spacing.line;
  }

  /**
   * Agrega un espacio en blanco
   * @private
   * @param {number} y - Posición Y actual
   * @param {number} height - Altura del espacio
   * @returns {number} Nueva posición Y después del espacio
   */
  _addSpace(y, height = IncosPDFBase.LAYOUT.spacing.paragraph) {
    return y - height;
  }

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Convierte un color hexadecimal a RGB para pdf-lib
   * @private
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
   * @private
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

  /* -----------------------------------------------------------------------
   * Métodos de construcción de contenido (comentados hasta uso por partes).
   * Se usarán cuando se construya el documento con datos del estudiante.
   * -----------------------------------------------------------------------

  async generateWithData(data) {
    // Cargar plantilla
    const templateBytes = fs.readFileSync(TEMPLATE_PATH);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Agregar datos del estudiante en posiciones específicas
    // Ejemplo:
    // firstPage.drawText(data.nombreCompleto, {
    //   x: 100,
    //   y: 700,
    //   size: 12,
    // });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  */
}
