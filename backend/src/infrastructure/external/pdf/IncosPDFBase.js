/**
 * IncosPDFBase - Clase base para generación de PDFs del Instituto INCOS
 * 
 * Esta clase proporciona:
 * - Layouts consistentes con el estilo institucional
 * - Componentes reutilizables (encabezados, tablas, firmas, etc.)
 * - Manejo automático de márgenes y espaciado
 * - Sistema de colores institucionales
 * - Utilidades para posicionamiento y formato
 * 
 * @example
 * class MyDocument extends IncosPDFBase {
 *   generate() {
 *     this.addHeader('MI DOCUMENTO');
 *     this.addSection('Sección 1', () => {
 *       this.addField('Campo', 'Valor');
 *     });
 *     this.save();
 *   }
 * }
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export class IncosPDFBase {
  // ============================================
  // CONFIGURACIÓN INSTITUCIONAL
  // ============================================
  
  static INSTITUTE = {
    name: 'INSTITUTO COMERCIAL DE LA NACION INCOS SANTA CRUZ',
    motto: 'PIONEROS EN EDUCACION SUPERIOR',
    address: 'Calle Ñuflo de Chavez Nº 62, entre René Moreno y Calle Chuquisaca',
    city: 'Santa Cruz de la Sierra',
    phone: '(+591) 3-3334567',
    website: 'www.incos.edu.bo',
  };

  // Colores institucionales (usando los colores del sistema)
  static COLORS = {
    primary: '#196b45',      // Verde primario institucional
    secondary: '#8b5cf6',    // Púrpura accent
    text: '#000000',         // Negro texto principal
    textLight: '#666666',    // Gris texto secundario
    border: '#cccccc',       // Gris bordes
    background: '#f5f5f5',   // Fondo claro
  };

  // Fuentes y tamaños
  static FONTS = {
    title: { size: 16, font: 'Helvetica-Bold' },
    subtitle: { size: 14, font: 'Helvetica-Bold' },
    heading: { size: 12, font: 'Helvetica-Bold' },
    normal: { size: 10, font: 'Helvetica' },
    small: { size: 8, font: 'Helvetica' },
    bold: { size: 10, font: 'Helvetica-Bold' },
  };

  // Márgenes y espaciado
  static LAYOUT = {
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    spacing: {
      section: 20,      // Entre secciones
      subsection: 15,   // Entre subsecciones
      paragraph: 10,    // Entre párrafos
      line: 5,          // Entre líneas
    },
    pageSize: 'LETTER',
    lineHeight: 15,
  };

  // ============================================
  // CONSTRUCTOR Y CONFIGURACIÓN
  // ============================================

  constructor(outputPath, options = {}) {
    this.outputPath = outputPath;
    this.options = {
      pageSize: IncosPDFBase.LAYOUT.pageSize,
      margins: IncosPDFBase.LAYOUT.margins,
      ...options,
    };

    // Crear directorio si no existe
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Inicializar documento
    this.doc = new PDFDocument({
      size: this.options.pageSize,
      margins: this.options.margins,
      bufferPages: true, // Para numeración de páginas
    });

    // Stream de salida
    this.stream = fs.createWriteStream(outputPath);
    this.doc.pipe(this.stream);

    // Estado del documento
    this.currentY = this.options.margins.top;
    this.pageWidth = this.doc.page.width - this.options.margins.left - this.options.margins.right;
    this.pageHeight = this.doc.page.height - this.options.margins.top - this.options.margins.bottom;
  }

  // ============================================
  // COMPONENTES DE ENCABEZADO
  // ============================================

  /**
   * Agrega el encabezado institucional estándar
   * @param {string} documentTitle - Título del documento
   * @param {Object} options - Opciones de personalización
   */
  addInstitutionalHeader(documentTitle, options = {}) {
    const opts = {
      showLogo: true,
      showMotto: true,
      showDate: true,
      gestion: null,
      ...options,
    };

    this.currentY = this.options.margins.top;

    // Logo (si existe y está habilitado)
    if (opts.showLogo && this.options.logoPath) {
      try {
        this.doc.image(this.options.logoPath, this.options.margins.left, this.currentY, {
          width: 60,
          height: 60,
        });
      } catch (err) {
        console.warn('No se pudo cargar el logo:', err.message);
      }
    }

    // Nombre del instituto (centrado)
    this.doc
      .font(IncosPDFBase.FONTS.heading.font)
      .fontSize(IncosPDFBase.FONTS.heading.size)
      .fillColor(IncosPDFBase.COLORS.primary)
      .text(
        IncosPDFBase.INSTITUTE.name,
        this.options.margins.left,
        this.currentY + (opts.showLogo ? 10 : 0),
        {
          align: 'center',
          width: this.pageWidth,
        }
      );

    this.currentY += IncosPDFBase.FONTS.heading.size + 5;

    // Lema institucional (si está habilitado)
    if (opts.showMotto) {
      this.doc
        .font(IncosPDFBase.FONTS.normal.font)
        .fontSize(IncosPDFBase.FONTS.normal.size)
        .fillColor(IncosPDFBase.COLORS.text)
        .text(
          IncosPDFBase.INSTITUTE.motto,
          this.options.margins.left,
          this.currentY,
          {
            align: 'center',
            width: this.pageWidth,
          }
        );

      this.currentY += IncosPDFBase.FONTS.normal.size + 10;
    }

    // Línea separadora decorativa
    this.addLine(IncosPDFBase.COLORS.secondary, 2);
    this.currentY += 5;

    // Título del documento (centrado, más grande)
    this.doc
      .font(IncosPDFBase.FONTS.title.font)
      .fontSize(IncosPDFBase.FONTS.title.size)
      .fillColor(IncosPDFBase.COLORS.primary)
      .text(
        documentTitle.toUpperCase(),
        this.options.margins.left,
        this.currentY,
        {
          align: 'center',
          width: this.pageWidth,
        }
      );

    this.currentY += IncosPDFBase.FONTS.title.size + 5;

    // Gestión (si se proporciona)
    if (opts.gestion) {
      this.doc
        .font(IncosPDFBase.FONTS.subtitle.font)
        .fontSize(IncosPDFBase.FONTS.subtitle.size)
        .fillColor(IncosPDFBase.COLORS.text)
        .text(
          `GESTIÓN ${opts.gestion}`,
          this.options.margins.left,
          this.currentY,
          {
            align: 'center',
            width: this.pageWidth,
          }
        );

      this.currentY += IncosPDFBase.FONTS.subtitle.size + 10;
    }

    // Fecha actual (si está habilitada)
    if (opts.showDate) {
      const fecha = this.formatDate(new Date());
      this.doc
        .font(IncosPDFBase.FONTS.small.font)
        .fontSize(IncosPDFBase.FONTS.small.size)
        .fillColor(IncosPDFBase.COLORS.textLight)
        .text(
          `Fecha de emisión: ${fecha}`,
          this.options.margins.left,
          this.currentY,
          {
            align: 'center',
            width: this.pageWidth,
          }
        );

      this.currentY += IncosPDFBase.FONTS.small.size + 15;
    }

    // Línea separadora final
    this.addLine(IncosPDFBase.COLORS.border, 1);
    this.currentY += IncosPDFBase.LAYOUT.spacing.section;

    return this;
  }

  // ============================================
  // COMPONENTES DE SECCIÓN
  // ============================================

  /**
   * Agrega una sección con título
   * @param {string} title - Título de la sección (ej: "I. DATOS PERSONALES")
   * @param {Function} content - Función que genera el contenido de la sección
   * @param {Object} options - Opciones de formato
   */
  addSection(title, content, options = {}) {
    const opts = {
      numbered: false,
      backgroundColor: null,
      ...options,
    };

    this.checkPageBreak(50); // Asegurar espacio mínimo

    // Fondo de sección (opcional)
    if (opts.backgroundColor) {
      this.doc
        .rect(
          this.options.margins.left - 5,
          this.currentY - 5,
          this.pageWidth + 10,
          20
        )
        .fill(opts.backgroundColor);
    }

    // Título de sección
    this.doc
      .font(IncosPDFBase.FONTS.heading.font)
      .fontSize(IncosPDFBase.FONTS.heading.size)
      .fillColor(IncosPDFBase.COLORS.primary)
      .text(
        title.toUpperCase(),
        this.options.margins.left,
        this.currentY,
        {
          width: this.pageWidth,
        }
      );

    this.currentY += IncosPDFBase.FONTS.heading.size + IncosPDFBase.LAYOUT.spacing.subsection;

    // Contenido de la sección
    if (typeof content === 'function') {
      content.call(this);
    }

    this.currentY += IncosPDFBase.LAYOUT.spacing.section;

    return this;
  }

  /**
   * Agrega un subsección con título
   * @param {string} title - Título de la subsección
   * @param {Function} content - Función que genera el contenido
   */
  addSubsection(title, content) {
    this.checkPageBreak(40);

    this.doc
      .font(IncosPDFBase.FONTS.bold.font)
      .fontSize(IncosPDFBase.FONTS.bold.size)
      .fillColor(IncosPDFBase.COLORS.text)
      .text(
        title,
        this.options.margins.left,
        this.currentY,
        {
          width: this.pageWidth,
        }
      );

    this.currentY += IncosPDFBase.FONTS.bold.size + IncosPDFBase.LAYOUT.spacing.line;

    if (typeof content === 'function') {
      content.call(this);
    }

    this.currentY += IncosPDFBase.LAYOUT.spacing.subsection;

    return this;
  }

  // ============================================
  // COMPONENTES DE CAMPO Y DATOS
  // ============================================

  /**
   * Agrega un campo de formulario (etiqueta: valor)
   * @param {string} label - Etiqueta del campo
   * @param {string} value - Valor del campo
   * @param {Object} options - Opciones de formato
   */
  addField(label, value, options = {}) {
    const opts = {
      indent: 0,
      labelWidth: 150,
      underline: false,
      bold: false,
      inline: true, // true = en la misma línea, false = líneas separadas
      ...options,
    };

    this.checkPageBreak(20);

    const x = this.options.margins.left + opts.indent;
    const y = this.currentY;

    if (opts.inline) {
      // Etiqueta y valor en la misma línea
      this.doc
        .font(opts.bold ? IncosPDFBase.FONTS.bold.font : IncosPDFBase.FONTS.normal.font)
        .fontSize(IncosPDFBase.FONTS.normal.size)
        .fillColor(IncosPDFBase.COLORS.text)
        .text(`${label}:`, x, y, {
          width: opts.labelWidth,
          continued: true,
        })
        .font(IncosPDFBase.FONTS.normal.font)
        .text(` ${value || ''}`);
    } else {
      // Etiqueta y valor en líneas separadas
      this.doc
        .font(opts.bold ? IncosPDFBase.FONTS.bold.font : IncosPDFBase.FONTS.normal.font)
        .fontSize(IncosPDFBase.FONTS.normal.size)
        .fillColor(IncosPDFBase.COLORS.text)
        .text(`${label}:`, x, y);

      this.currentY += IncosPDFBase.FONTS.normal.size + 3;

      this.doc
        .font(IncosPDFBase.FONTS.normal.font)
        .text(value || '', x + 10, this.currentY);
    }

    // Subrayado (opcional)
    if (opts.underline) {
      const textWidth = this.doc.widthOfString(value || '');
      this.doc
        .moveTo(x + opts.labelWidth + 5, this.currentY + 2)
        .lineTo(x + opts.labelWidth + textWidth + 10, this.currentY + 2)
        .stroke(IncosPDFBase.COLORS.border);
    }

    this.currentY += IncosPDFBase.LAYOUT.lineHeight;

    return this;
  }

  /**
   * Agrega un grupo de campos en dos columnas
   * @param {Array} fields - Array de objetos {label, value}
   */
  addFieldsInColumns(fields) {
    const columnWidth = this.pageWidth / 2 - 10;
    const leftX = this.options.margins.left;
    const rightX = this.options.margins.left + columnWidth + 20;

    for (let i = 0; i < fields.length; i += 2) {
      this.checkPageBreak(20);
      const startY = this.currentY;

      // Columna izquierda
      if (fields[i]) {
        this.doc
          .font(IncosPDFBase.FONTS.normal.font)
          .fontSize(IncosPDFBase.FONTS.normal.size)
          .fillColor(IncosPDFBase.COLORS.text)
          .text(`${fields[i].label}:`, leftX, startY, {
            width: columnWidth,
            continued: true,
          })
          .text(` ${fields[i].value || ''}`);
      }

      // Columna derecha
      if (fields[i + 1]) {
        this.doc
          .font(IncosPDFBase.FONTS.normal.font)
          .fontSize(IncosPDFBase.FONTS.normal.size)
          .fillColor(IncosPDFBase.COLORS.text)
          .text(`${fields[i + 1].label}:`, rightX, startY, {
            width: columnWidth,
            continued: true,
          })
          .text(` ${fields[i + 1].value || ''}`);
      }

      this.currentY += IncosPDFBase.LAYOUT.lineHeight;
    }

    return this;
  }

  // ============================================
  // COMPONENTES DE CHECKBOX Y OPCIONES
  // ============================================

  /**
   * Agrega un checkbox circular (radio button)
   * @param {string} label - Etiqueta del checkbox
   * @param {boolean} checked - Si está marcado
   * @param {Object} options - Opciones de formato
   */
  addCheckbox(label, checked, options = {}) {
    const opts = {
      x: this.options.margins.left,
      y: this.currentY,
      size: 8,
      inline: false,
      ...options,
    };

    this.checkPageBreak(20);

    const circleX = opts.x + opts.size / 2;
    const circleY = opts.y + opts.size / 2;

    // Círculo exterior
    this.doc
      .circle(circleX, circleY, opts.size / 2)
      .stroke(IncosPDFBase.COLORS.text);

    // Círculo interior (si está marcado)
    if (checked) {
      this.doc
        .circle(circleX, circleY, opts.size / 2 - 2)
        .fill(IncosPDFBase.COLORS.text);
    }

    // Etiqueta
    this.doc
      .font(IncosPDFBase.FONTS.normal.font)
      .fontSize(IncosPDFBase.FONTS.normal.size)
      .fillColor(IncosPDFBase.COLORS.text)
      .text(label, opts.x + opts.size + 10, opts.y);

    if (!opts.inline) {
      this.currentY += IncosPDFBase.LAYOUT.lineHeight;
    }

    return this;
  }

  /**
   * Agrega una lista de checkboxes en línea horizontal
   * @param {Array} options - Array de objetos {label, checked}
   * @param {Object} config - Configuración
   */
  addCheckboxGroup(options, config = {}) {
    const cfg = {
      label: '',
      spacing: 100,
      startX: this.options.margins.left,
      ...config,
    };

    this.checkPageBreak(20);

    // Etiqueta del grupo
    if (cfg.label) {
      this.doc
        .font(IncosPDFBase.FONTS.normal.font)
        .fontSize(IncosPDFBase.FONTS.normal.size)
        .fillColor(IncosPDFBase.COLORS.text)
        .text(`${cfg.label}:`, cfg.startX, this.currentY);
    }

    const startY = this.currentY;
    let currentX = cfg.startX + (cfg.label ? this.doc.widthOfString(`${cfg.label}: `) : 0);

    options.forEach((option, index) => {
      this.addCheckbox(option.label, option.checked, {
        x: currentX,
        y: startY,
        inline: true,
      });

      currentX += cfg.spacing;
    });

    this.currentY += IncosPDFBase.LAYOUT.lineHeight;

    return this;
  }

  /**
   * Agrega una lista de checkboxes cuadrados (para documentos)
   * @param {Array} items - Array de objetos {label, checked}
   */
  addChecklist(items) {
    items.forEach((item) => {
      this.checkPageBreak(20);

      const x = this.options.margins.left;
      const y = this.currentY;

      // Cuadrado
      this.doc
        .rect(x, y, 12, 12)
        .stroke(IncosPDFBase.COLORS.text);

      // X si está marcado
      if (item.checked) {
        this.doc
          .font(IncosPDFBase.FONTS.bold.font)
          .fontSize(12)
          .fillColor(IncosPDFBase.COLORS.text)
          .text('X', x + 2, y, {
            width: 12,
            align: 'center',
          });
      }

      // Etiqueta
      this.doc
        .font(IncosPDFBase.FONTS.normal.font)
        .fontSize(IncosPDFBase.FONTS.normal.size)
        .fillColor(IncosPDFBase.COLORS.text)
        .text(item.label, x + 20, y + 1, {
          width: this.pageWidth - 30,
        });

      this.currentY += IncosPDFBase.LAYOUT.lineHeight;
    });

    return this;
  }

  // ============================================
  // COMPONENTES DE TABLA
  // ============================================

  /**
   * Agrega una tabla
   * @param {Array} headers - Array de encabezados
   * @param {Array} rows - Array de filas (cada fila es un array de valores)
   * @param {Object} options - Opciones de formato
   */
  addTable(headers, rows, options = {}) {
    const opts = {
      columnWidths: null, // Auto-calcular si es null
      headerBackground: IncosPDFBase.COLORS.primary,
      headerText: '#ffffff',
      alternateRows: true,
      alternateColor: IncosPDFBase.COLORS.background,
      borderColor: IncosPDFBase.COLORS.border,
      cellPadding: 5,
      ...options,
    };

    // Calcular anchos de columna
    const columnWidths = opts.columnWidths || 
      Array(headers.length).fill(this.pageWidth / headers.length);

    const tableWidth = columnWidths.reduce((sum, w) => sum + w, 0);
    const tableX = this.options.margins.left;

    // Verificar espacio suficiente
    this.checkPageBreak(60);

    // Encabezados
    let currentX = tableX;
    const headerY = this.currentY;

    // Fondo del encabezado
    this.doc
      .rect(tableX, headerY, tableWidth, 20)
      .fill(opts.headerBackground);

    // Texto de encabezados
    headers.forEach((header, i) => {
      this.doc
        .font(IncosPDFBase.FONTS.bold.font)
        .fontSize(IncosPDFBase.FONTS.normal.size)
        .fillColor(opts.headerText)
        .text(
          header,
          currentX + opts.cellPadding,
          headerY + opts.cellPadding,
          {
            width: columnWidths[i] - opts.cellPadding * 2,
            align: 'center',
          }
        );

      currentX += columnWidths[i];
    });

    this.currentY += 20;

    // Filas
    rows.forEach((row, rowIndex) => {
      this.checkPageBreak(25);

      const rowY = this.currentY;
      const rowHeight = 20;

      // Fondo alternado
      if (opts.alternateRows && rowIndex % 2 === 1) {
        this.doc
          .rect(tableX, rowY, tableWidth, rowHeight)
          .fill(opts.alternateColor);
      }

      // Celdas
      currentX = tableX;
      row.forEach((cell, cellIndex) => {
        // Borde
        this.doc
          .rect(currentX, rowY, columnWidths[cellIndex], rowHeight)
          .stroke(opts.borderColor);

        // Texto
        this.doc
          .font(IncosPDFBase.FONTS.normal.font)
          .fontSize(IncosPDFBase.FONTS.normal.size)
          .fillColor(IncosPDFBase.COLORS.text)
          .text(
            String(cell || ''),
            currentX + opts.cellPadding,
            rowY + opts.cellPadding,
            {
              width: columnWidths[cellIndex] - opts.cellPadding * 2,
              align: 'left',
            }
          );

        currentX += columnWidths[cellIndex];
      });

      this.currentY += rowHeight;
    });

    this.currentY += IncosPDFBase.LAYOUT.spacing.subsection;

    return this;
  }

  // ============================================
  // COMPONENTES DE FIRMA
  // ============================================

  /**
   * Agrega un área de firma
   * @param {Object} options - Opciones de firma
   */
  addSignature(options = {}) {
    const opts = {
      label: 'Firma',
      name: '',
      ci: '',
      cargo: '',
      width: 200,
      x: this.options.margins.left,
      ...options,
    };

    this.checkPageBreak(80);

    const x = opts.x;
    const y = this.currentY;

    // Línea de firma
    this.doc
      .moveTo(x, y + 50)
      .lineTo(x + opts.width, y + 50)
      .stroke(IncosPDFBase.COLORS.text);

    // Etiqueta "Firma"
    this.doc
      .font(IncosPDFBase.FONTS.normal.font)
      .fontSize(IncosPDFBase.FONTS.normal.size)
      .fillColor(IncosPDFBase.COLORS.text)
      .text(opts.label, x, y + 55, {
        width: opts.width,
        align: 'center',
      });

    // Nombre (si se proporciona)
    if (opts.name) {
      this.doc.text(opts.name, x, y + 70, {
        width: opts.width,
        align: 'center',
      });
    }

    // C.I. (si se proporciona)
    if (opts.ci) {
      this.doc.text(`C.I.: ${opts.ci}`, x, y + 85, {
        width: opts.width,
        align: 'center',
      });
    }

    // Cargo (si se proporciona)
    if (opts.cargo) {
      this.doc
        .font(IncosPDFBase.FONTS.small.font)
        .fontSize(IncosPDFBase.FONTS.small.size)
        .text(opts.cargo, x, y + 100, {
          width: opts.width,
          align: 'center',
        });
    }

    return this;
  }

  /**
   * Agrega múltiples firmas en línea horizontal
   * @param {Array} signatures - Array de objetos con opciones de firma
   */
  addMultipleSignatures(signatures) {
    this.checkPageBreak(120);

    const startY = this.currentY;
    const spacing = this.pageWidth / signatures.length;

    signatures.forEach((sig, index) => {
      const x = this.options.margins.left + (index * spacing);
      
      this.currentY = startY; // Reset para cada firma
      this.addSignature({
        x,
        width: spacing - 20,
        ...sig,
      });
    });

    this.currentY = startY + 120;

    return this;
  }

  // ============================================
  // UTILIDADES DE FORMATO
  // ============================================

  /**
   * Agrega una línea horizontal
   * @param {string} color - Color de la línea
   * @param {number} width - Grosor de la línea
   */
  addLine(color = IncosPDFBase.COLORS.border, width = 1) {
    this.doc
      .moveTo(this.options.margins.left, this.currentY)
      .lineTo(this.options.margins.left + this.pageWidth, this.currentY)
      .lineWidth(width)
      .stroke(color);

    this.currentY += width + 2;

    return this;
  }

  /**
   * Agrega un espacio en blanco
   * @param {number} height - Altura del espacio
   */
  addSpace(height = IncosPDFBase.LAYOUT.spacing.line) {
    this.currentY += height;
    return this;
  }

  /**
   * Agrega texto plano con formato
   * @param {string} text - Texto a agregar
   * @param {Object} options - Opciones de formato
   */
  addText(text, options = {}) {
    const opts = {
      align: 'left',
      indent: 0,
      bold: false,
      color: IncosPDFBase.COLORS.text,
      fontSize: IncosPDFBase.FONTS.normal.size,
      ...options,
    };

    this.checkPageBreak(30);

    this.doc
      .font(opts.bold ? IncosPDFBase.FONTS.bold.font : IncosPDFBase.FONTS.normal.font)
      .fontSize(opts.fontSize)
      .fillColor(opts.color)
      .text(
        text,
        this.options.margins.left + opts.indent,
        this.currentY,
        {
          width: this.pageWidth - opts.indent,
          align: opts.align,
        }
      );

    this.currentY = this.doc.y + IncosPDFBase.LAYOUT.spacing.line;

    return this;
  }

  /**
   * Agrega un cuadro de texto (con borde)
   * @param {string} text - Texto del cuadro
   * @param {Object} options - Opciones de formato
   */
  addTextBox(text, options = {}) {
    const opts = {
      height: 60,
      padding: 5,
      backgroundColor: '#ffffff',
      borderColor: IncosPDFBase.COLORS.border,
      ...options,
    };

    this.checkPageBreak(opts.height + 10);

    const x = this.options.margins.left;
    const y = this.currentY;

    // Fondo
    this.doc
      .rect(x, y, this.pageWidth, opts.height)
      .fill(opts.backgroundColor);

    // Borde
    this.doc
      .rect(x, y, this.pageWidth, opts.height)
      .stroke(opts.borderColor);

    // Texto
    this.doc
      .font(IncosPDFBase.FONTS.normal.font)
      .fontSize(IncosPDFBase.FONTS.normal.size)
      .fillColor(IncosPDFBase.COLORS.text)
      .text(
        text,
        x + opts.padding,
        y + opts.padding,
        {
          width: this.pageWidth - opts.padding * 2,
          height: opts.height - opts.padding * 2,
          align: 'left',
        }
      );

    this.currentY += opts.height + IncosPDFBase.LAYOUT.spacing.subsection;

    return this;
  }

  // ============================================
  // UTILIDADES DE PÁGINA
  // ============================================

  /**
   * Verifica si hay suficiente espacio en la página
   * Si no hay espacio, agrega una nueva página
   * @param {number} requiredSpace - Espacio requerido en puntos
   */
  checkPageBreak(requiredSpace = 50) {
    const maxY = this.doc.page.height - this.options.margins.bottom;
    
    if (this.currentY + requiredSpace > maxY) {
      this.doc.addPage();
      this.currentY = this.options.margins.top;
    }
  }

  /**
   * Agrega un salto de página manual
   */
  addPageBreak() {
    this.doc.addPage();
    this.currentY = this.options.margins.top;
    return this;
  }

  /**
   * Agrega numeración de páginas en el pie
   */
  addPageNumbers() {
    const range = this.doc.bufferedPageRange();
    
    for (let i = 0; i < range.count; i++) {
      this.doc.switchToPage(i);
      
      this.doc
        .font(IncosPDFBase.FONTS.small.font)
        .fontSize(IncosPDFBase.FONTS.small.size)
        .fillColor(IncosPDFBase.COLORS.textLight)
        .text(
          `Página ${i + 1} de ${range.count}`,
          this.options.margins.left,
          this.doc.page.height - this.options.margins.bottom + 10,
          {
            width: this.pageWidth,
            align: 'center',
          }
        );
    }

    return this;
  }

  /**
   * Agrega un pie de página personalizado
   * @param {string} text - Texto del pie
   * @param {Object} options - Opciones de formato
   */
  addFooter(text, options = {}) {
    const opts = {
      align: 'center',
      fontSize: IncosPDFBase.FONTS.small.size,
      ...options,
    };

    const range = this.doc.bufferedPageRange();
    
    for (let i = 0; i < range.count; i++) {
      this.doc.switchToPage(i);
      
      this.doc
        .font(IncosPDFBase.FONTS.small.font)
        .fontSize(opts.fontSize)
        .fillColor(IncosPDFBase.COLORS.textLight)
        .text(
          text,
          this.options.margins.left,
          this.doc.page.height - this.options.margins.bottom + 20,
          {
            width: this.pageWidth,
            align: opts.align,
          }
        );
    }

    return this;
  }

  // ============================================
  // UTILIDADES DE FORMATO DE DATOS
  // ============================================

  /**
   * Formatea una fecha en español
   * @param {Date} date - Fecha a formatear
   * @returns {string} Fecha formateada
   */
  formatDate(date) {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];

    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const anio = date.getFullYear();

    return `${dia} de ${mes} de ${anio}`;
  }

  /**
   * Formatea una fecha completa con ciudad
   * @param {Date} date - Fecha
   * @param {string} ciudad - Ciudad
   * @returns {string} Fecha formateada completa
   */
  formatFullDate(date, ciudad = IncosPDFBase.INSTITUTE.city) {
    return `En la ciudad de ${ciudad}, ${this.formatDate(date)}`;
  }

  // ============================================
  // FINALIZACIÓN
  // ============================================

  /**
   * Finaliza el documento y lo guarda
   * @returns {Promise<string>} Ruta del archivo guardado
   */
  save() {
    return new Promise((resolve, reject) => {
      this.doc.end();

      this.stream.on('finish', () => {
        resolve(this.outputPath);
      });

      this.stream.on('error', (error) => {
        reject(error);
      });
    });
  }
}
