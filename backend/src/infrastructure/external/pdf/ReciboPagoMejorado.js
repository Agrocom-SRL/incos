/**
 * ReciboPagoMejorado
 * 
 * Genera recibos de pago con el diseño institucional estándar
 * Basado en el formato oficial del instituto con:
 * - Encabezado con título
 * - Tabla de datos personales
 * - Declaración jurada
 * - Área de firma
 */

import { IncosPDFBase } from './IncosPDFBase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ReciboPagoMejorado extends IncosPDFBase {
  /**
   * Genera el recibo de pago
   * @param {Object} data - Datos del pago
   * @param {string} outputPath - Ruta de salida del PDF
   * @returns {Promise<string>} Ruta del archivo generado
   */
  static async generate(data, outputPath) {
    try {
      // Validar parámetros
      if (!data) {
        throw new Error('Los datos del recibo son requeridos');
      }
      if (!outputPath) {
        throw new Error('La ruta de salida es requerida');
      }

      // Usar orientación landscape (horizontal) - PDFKit acepta pageSize como array [width, height]
      // Landscape LETTER: 11" x 8.5" = 792 x 612 puntos (1 pulgada = 72 puntos)
      const generator = new ReciboPagoMejorado(outputPath, {
        pageSize: [792, 612], // [ancho, alto] en puntos para landscape - PDFKit acepta array
      });
      return await generator.build(data);
    } catch (error) {
      console.error('[ReciboPagoMejorado] Error en generate:', error.message);
      console.error('[ReciboPagoMejorado] Stack:', error.stack);
      throw error;
    }
  }

  /**
   * Constructor personalizado para manejar landscape
   * Sobrescribe el constructor base para permitir size como array
   */
  constructor(outputPath, options = {}) {
    // Preparar opciones para el constructor base
    // Si se especifica size como array, pasarlo como pageSize (PDFKit acepta array [width, height])
    const opts = {
      ...options,
      pageSize: options.size || options.pageSize || IncosPDFBase.LAYOUT.pageSize,
    };

    // Llamar al constructor base
    super(outputPath, opts);

    // El constructor base ya calcula pageWidth y pageHeight basándose en doc.page.width/height
    // que PDFKit ajusta automáticamente según el size especificado
  }

  /**
   * Construye el documento completo
   * @param {Object} data - Datos del recibo
   */
  async build(data) {
    try {
      // Validar datos requeridos
      if (!data) {
        throw new Error('Los datos del recibo son requeridos');
      }

      // Configuración del documento
      const instituteData = this.getInstituteData(data);

      // Encabezado institucional personalizado
      this.addCustomHeader(instituteData, data);

      // Tabla de datos personales
      this.addDatosPersonalesTable(data);

      // Declaración jurada
      this.addDeclaracionJurada(data);

      // Área de firma
      this.addFirmaArea();

      // Guardar documento
      return await this.save();
    } catch (error) {
      console.error('[ReciboPagoMejorado] Error en build:', error.message);
      console.error('[ReciboPagoMejorado] Stack:', error.stack);
      console.error('[ReciboPagoMejorado] Data recibida:', JSON.stringify(data, null, 2));
      throw error;
    }
  }

  /**
   * Obtiene los datos del instituto desde IncosPDFBase
   * Usa los datos institucionales estándar del sistema
   */
  getInstituteData(data) {
    // Usar datos del instituto desde IncosPDFBase
    // Si se proporciona información personalizada, usarla, pero con valores por defecto del sistema
    if (data.institutoInfo) {
      return {
        nombre: data.institutoInfo.nombre || IncosPDFBase.INSTITUTE.name,
        titulo: data.institutoInfo.titulo || 'BOLETA DE RECIBO',
        subtitulo: data.institutoInfo.subtitulo || 'RECIBO DE PAGO',
      };
    }

    // Valores por defecto usando datos del sistema (IncosPDFBase)
    return {
      nombre: IncosPDFBase.INSTITUTE.name, // 'INSTITUTO COMERCIAL DE LA NACION INCOS SANTA CRUZ'
      titulo: 'BOLETA DE RECIBO',
      subtitulo: 'RECIBO DE PAGO', // Cambiado de 'FORMULARIO DE APORTE VOLUNTARIO'
    };
  }

  /**
 * Agrega el encabezado personalizado con formato institucional mejorado
 */
  addCustomHeader(instituteData, data) {
    try {
      const startY = this.currentY;
      const pageWidth = this.pageWidth;
      const leftMargin = this.options.margins.left;

      // =========================
      // LOGO (esquina superior izquierda, horizontal)
      // =========================
      const logoPath = path.resolve(__dirname, '../templates/logo.png');

      // Medidas del logo - altura fija 64, ancho automático
      const logoH = 64; // Altura fija
      // Calcular ancho disponible para el logo (dejar espacio para FAV a la derecha)
      const logoMaxWidth = 120; // Espacio total menos área FAV

      // Dibujar el logo si existe y es válido
      let logoLoaded = false;
      let logoY = startY; // Posición Y inicial del logo
      let actualLogoWidth = 0;

      if (fs.existsSync(logoPath)) {
        try {
          // Logo en esquina superior izquierda
          // Usar fit para que el ancho se calcule automáticamente manteniendo la proporción
          // fit: [maxWidth, maxHeight] - se ajusta al espacio disponible
          this.doc.image(logoPath, leftMargin, logoY, {
            fit: [logoMaxWidth, logoH], // Ancho máximo disponible, altura máxima 64
            align: 'left',
          });
          logoLoaded = true;
          // El ancho real se calculará automáticamente, estimamos que usará el máximo disponible
          actualLogoWidth = logoMaxWidth;
        } catch (imageError) {
          // Si hay error al cargar la imagen (formato no compatible, archivo corrupto, etc.)
          console.warn('[ReciboPagoMejorado] No se pudo cargar el logo:', imageError.message);
          console.warn('[ReciboPagoMejorado] Ruta del logo:', logoPath);
          logoLoaded = false;
        }
      } else {
        console.warn('[ReciboPagoMejorado] Logo no encontrado en:', logoPath);
      }

      // =========================
      // Área de texto central (al lado del logo o debajo si no hay logo)
      // =========================
      // Calcular espacio para FAV (ancho del cuadro + margen derecho)
      const favBoxWidth = 75;
      const rightMargin = 10;
      const favAreaWidth = favBoxWidth + rightMargin;
      
      // Si hay logo, el texto va al lado derecho del logo; si no, desde el inicio
      const textStartX = logoLoaded ? leftMargin + actualLogoWidth + 10 : leftMargin;
      const textStartY = logoLoaded ? logoY : startY + 5;
      const textWidth = logoLoaded 
        ? pageWidth - favAreaWidth - actualLogoWidth - 10 
        : pageWidth - favAreaWidth; // espacio para FAV y logo

      // Nombre del instituto (más grande y con color primario)
      this.doc
        .font(IncosPDFBase.FONTS.title.font)
        .fontSize(14)
        .fillColor(IncosPDFBase.COLORS.primary)
        .text(
          instituteData.nombre,
          textStartX,
          textStartY,
          {
            width: textWidth,
            align: 'center',
          }
        );

      // Subtítulo (RECIBO DE PAGO) - eliminado "BOLETA DE RECIBO"
      this.doc
        .font(IncosPDFBase.FONTS.title.font)
        .fontSize(10)
        .fillColor(IncosPDFBase.COLORS.textLight)
        .text(
          instituteData.subtitulo,
          textStartX,
          textStartY + 20,
          {
            width: textWidth,
            align: 'center',
          }
        );

      // =========================
      // Información de fecha y FAV (esquina superior derecha)
      // =========================
      // Ajustar posición X para acercar más al borde derecho (usando favBoxWidth y rightMargin ya definidos)
      const favBoxHeight = 30;
      const rightInfoX = leftMargin + pageWidth - favBoxWidth - rightMargin;
      
      // Ajustar posición Y según si hay logo o no (alinear con el logo)
      const rightInfoY = logoLoaded ? logoY : startY;

      // Fecha - alineada a la derecha del cuadro FAV
      const fechaWidth = favBoxWidth;
      this.doc
        .font(IncosPDFBase.FONTS.small.font)
        .fontSize(8)
        .fillColor(IncosPDFBase.COLORS.textLight)
        .text('FECHA:', rightInfoX, rightInfoY, {
          width: fechaWidth,
          align: 'right',
        });

      const fechaFormateada = this.formatFecha(data?.fechaPago || data?.fecha_pago || new Date());
      this.doc
        .font(IncosPDFBase.FONTS.normal.font)
        .fontSize(9)
        .fillColor(IncosPDFBase.COLORS.text)
        .text(
          fechaFormateada,
          rightInfoX,
          rightInfoY + 10,
          {
            width: fechaWidth,
            align: 'right',
          }
        );

      // Cuadro FAV
      const favBoxY = rightInfoY + 25;

      // Fondo del cuadro FAV
      this.doc
        .rect(rightInfoX, favBoxY, favBoxWidth, favBoxHeight)
        .fill(IncosPDFBase.COLORS.primary);

      // Borde del cuadro FAV
      this.doc
        .rect(rightInfoX, favBoxY, favBoxWidth, favBoxHeight)
        .lineWidth(1.5)
        .stroke(IncosPDFBase.COLORS.border);

      // Texto FAV:
      this.doc
        .font(IncosPDFBase.FONTS.bold.font)
        .fontSize(8)
        .fillColor('#ffffff')
        .text('FAV:', rightInfoX + 5, favBoxY + 3, {
          width: favBoxWidth - 10,
          align: 'center',
        });

      // Número de FAV (recibo)
      const numeroRecibo = data?.numeroRecibo || data?.numero_recibo || data?.receiptNumber || '001';
      this.doc
        .font(IncosPDFBase.FONTS.bold.font)
        .fontSize(16)
        .fillColor('#ffffff')
        .text(
          String(numeroRecibo),
          rightInfoX + 5,
          favBoxY + 12,
          {
            width: favBoxWidth - 10,
            align: 'center',
          }
        );

      // Línea decorativa - ajustar según si hay logo o no
      // La línea debe estar debajo del logo o del texto, el que sea más bajo
      // Ajustado después de eliminar "BOLETA DE RECIBO" - ahora solo hay nombre y subtítulo
      const maxElementHeight = logoLoaded ? Math.max(logoY + logoH, textStartY + 35) : textStartY + 35;
      const lineY = maxElementHeight + 5;
      this.currentY = lineY;
      this.addLine(IncosPDFBase.COLORS.primary, 2);
      this.currentY += 5;
    } catch (error) {
      console.error('[ReciboPagoMejorado] Error en addCustomHeader:', error.message);
      throw error;
    }
  }

  /**
   * Agrega la tabla de datos personales del estudiante
   */
  addDatosPersonalesTable(data) {
    const leftMargin = this.options.margins.left;
    const pageWidth = this.pageWidth;
    const tableY = this.currentY;

    // Título de la sección - Usar color primario del sistema (#196b45)
    const sectionHeight = 20;
    this.doc
      .rect(leftMargin, tableY, pageWidth, sectionHeight)
      .fill(IncosPDFBase.COLORS.primary); // Usar color primario del sistema

    this.doc
      .font(IncosPDFBase.FONTS.bold.font)
      .fontSize(10)
      .fillColor('#ffffff')
      .text(
        'DATOS PERSONALES DEL ESTUDIANTE',
        leftMargin + 5,
        tableY + 6,
        {
          width: pageWidth - 10,
          align: 'left',
        }
      );

    this.currentY = tableY + sectionHeight;

    // Fila 1: APELLIDOS Y NOMBRES (siempre mostrar)
    if (data.nombreCompleto) {
      this.addTableRow(
        'APELLIDOS Y NOMBRES',
        data.nombreCompleto,
        true
      );
    }

    // Fila 2: N° C.I. (siempre mostrar si existe)
    if (data.ci) {
      this.addTableRow(
        'N° C.I.',
        data.ci,
        false
      );
    }

    // Fila 3: CARRERA | CURSO Y PARALELO | Año (solo si hay datos válidos)
    const hasCarrera = data.carrera && String(data.carrera).trim() !== '' && data.carrera !== 'N/A';
    const hasCursoParalelo = data.cursoParalelo && String(data.cursoParalelo).trim() !== '' && data.cursoParalelo !== 'N/A';
    const hasAnio = data.anio && String(data.anio).trim() !== '' && data.anio !== 'N/A' && data.anio !== '1° A';

    // Solo mostrar la fila si hay al menos un dato válido
    if (hasCarrera || hasCursoParalelo || hasAnio) {
      const columns = [];

      if (hasCarrera) {
        columns.push({
          label: 'CARRERA',
          value: String(data.carrera).trim(),
          width: (hasCursoParalelo || hasAnio) ? 0.5 : 1.0
        });
      }

      if (hasCursoParalelo) {
        columns.push({
          label: 'CURSO Y PARALELO',
          value: String(data.cursoParalelo).trim(),
          width: (hasCarrera && hasAnio) ? 0.25 : ((hasCarrera || hasAnio) ? 0.5 : 1.0)
        });
      }

      if (hasAnio) {
        columns.push({
          label: '',
          value: String(data.anio).trim(),
          width: (hasCarrera && hasCursoParalelo) ? 0.25 : ((hasCarrera || hasCursoParalelo) ? 0.5 : 1.0)
        });
      }

      if (columns.length > 0) {
        // Normalizar anchos para que sumen 1.0
        const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
        if (totalWidth > 0) {
          columns.forEach(col => {
            col.width = col.width / totalWidth;
          });
        }

        this.addTableRowMultipleColumns(columns);
      }
    }

    // Fila 4: MONTO TOTAL (siempre mostrar si hay descuento)
    // Usar nullish coalescing (??) en lugar de || para manejar correctamente cuando el valor es 0
    const montoTotal = Number(data.montoTotal) ?? 400.00;
    const descuentoBeca = Number(data.descuentoBeca) ?? 0;
    // Si montoPagado no está definido o es null, calcularlo (montoTotal - descuentoBeca)
    const montoPagado = (montoTotal - descuentoBeca);

    // Mostrar desglose si hay descuento: MONTO TOTAL → DESCUENTO → APORTE FINAL
    if (descuentoBeca > 0) {
      // Si hay descuento, mostrar desglose completo
      this.addTableRow(
        'MONTO TOTAL',
        this.formatMonto(montoTotal),
        false
      );

      // Fila 5: DESCUENTO POR BECA (solo si hay descuento)
      this.addTableRow(
        'DESCUENTO POR BECA',
        `- ${this.formatMonto(descuentoBeca)}`,
        false
      );
    }

    // Fila 4 (sin descuento) o 5 (con descuento): APORTE (monto final a pagar)
    // Usar isHeader=true para resaltar el monto final
    // Asegurar que montoPagado sea el valor correcto (puede ser 0)
    const dataWithCorrectMonto = {
      ...data,
      montoPagado: montoPagado, // Puede ser 0, no usar || que lo convierte a otro valor
    };

    this.addTableRow(
      'APORTE',
      this.formatAporte(dataWithCorrectMonto),
      true // Resaltar el monto final (bold)
    );

    this.currentY += 5; // Espacio después de la tabla
  }

  /**
   * Formatea un monto en formato monetario simple
   * @param {number} monto - Monto a formatear
   * @returns {string} Monto formateado (ej: "400.00 Bs")
   */
  formatMonto(monto) {
    if (monto === null || monto === undefined) return '0.00 Bs';
    return `${Number(monto).toFixed(2)} Bs`;
  }

  /**
   * Agrega una fila de tabla simple (label | value)
   */
  addTableRow(label, value, isHeader = false) {
    const leftMargin = this.options.margins.left;
    const pageWidth = this.pageWidth;
    const rowHeight = 18;
    const labelWidth = pageWidth * 0.35;

    const rowY = this.currentY;

    // Borde de la celda de label
    this.doc
      .rect(leftMargin, rowY, labelWidth, rowHeight)
      .stroke(IncosPDFBase.COLORS.border);

    // Borde de la celda de value
    this.doc
      .rect(leftMargin + labelWidth, rowY, pageWidth - labelWidth, rowHeight)
      .stroke(IncosPDFBase.COLORS.border);

    // Texto del label
    this.doc
      .font(IncosPDFBase.FONTS.bold.font)
      .fontSize(9)
      .fillColor(IncosPDFBase.COLORS.text)
      .text(
        label,
        leftMargin + 3,
        rowY + 5,
        {
          width: labelWidth - 6,
          align: 'left',
        }
      );

    // Texto del value
    this.doc
      .font(isHeader ? IncosPDFBase.FONTS.bold.font : IncosPDFBase.FONTS.normal.font)
      .fontSize(9)
      .fillColor(IncosPDFBase.COLORS.text)
      .text(
        value,
        leftMargin + labelWidth + 3,
        rowY + 5,
        {
          width: pageWidth - labelWidth - 6,
          align: 'left',
        }
      );

    this.currentY += rowHeight;
  }

  /**
   * Agrega una fila de tabla con múltiples columnas
   * Solo muestra columnas que tengan valor
   */
  addTableRowMultipleColumns(columns) {
    const leftMargin = this.options.margins.left;
    const pageWidth = this.pageWidth;
    const rowHeight = 18;
    const rowY = this.currentY;

    // Filtrar solo columnas con valor
    const columnsConValor = columns.filter(col => {
      const tieneValor = col.value && col.value.trim() !== '' && col.value !== 'N/A';
      return tieneValor;
    });

    // Si no hay columnas con valor, no mostrar la fila
    if (columnsConValor.length === 0) {
      return;
    }

    // Recalcular ancho de columnas si hay menos columnas con valor
    const totalWidthOriginal = columns.reduce((sum, col) => sum + col.width, 0);
    const totalWidthConValor = columnsConValor.reduce((sum, col) => sum + col.width, 0);

    // Normalizar anchos si es necesario
    const normalizedColumns = columnsConValor.map(col => ({
      ...col,
      width: totalWidthConValor > 0 ? col.width / totalWidthConValor : col.width
    }));

    let currentX = leftMargin;

    normalizedColumns.forEach((col, index) => {
      const colWidth = pageWidth * col.width;

      // Borde de la celda
      this.doc
        .rect(currentX, rowY, colWidth, rowHeight)
        .stroke(IncosPDFBase.COLORS.border);

      // Label (si existe)
      if (col.label && col.label.trim() !== '') {
        this.doc
          .font(IncosPDFBase.FONTS.bold.font)
          .fontSize(9)
          .fillColor(IncosPDFBase.COLORS.text)
          .text(
            col.label,
            currentX + 3,
            rowY + 3,
            {
              width: colWidth - 6,
              align: 'left',
            }
          );
      }

      // Value (solo si tiene valor)
      if (col.value && col.value.trim() !== '') {
        this.doc
          .font(IncosPDFBase.FONTS.normal.font)
          .fontSize(9)
          .fillColor(IncosPDFBase.COLORS.text)
          .text(
            col.value,
            currentX + 3,
            rowY + (col.label && col.label.trim() !== '' ? 11 : 5),
            {
              width: colWidth - 6,
              align: 'left',
            }
          );
      }

      currentX += colWidth;
    });

    this.currentY += rowHeight;
  }

  /**
   * Agrega la declaración jurada
   */
  addDeclaracionJurada(data) {
    const leftMargin = this.options.margins.left;
    const pageWidth = this.pageWidth;

    this.currentY += 5; // Espacio antes

    // Título de la sección - Usar color primario del sistema (#196b45)
    const sectionHeight = 20;
    this.doc
      .rect(leftMargin, this.currentY, pageWidth, sectionHeight)
      .fill(IncosPDFBase.COLORS.primary); // Usar color primario del sistema

    this.doc
      .font(IncosPDFBase.FONTS.bold.font)
      .fontSize(10)
      .fillColor('#ffffff')
      .text(
        'DECLARACIÓN JURADA',
        leftMargin + 5,
        this.currentY + 6,
        {
          width: pageWidth - 10,
          align: 'left',
        }
      );

    this.currentY += sectionHeight;

    // Contenido de la declaración
    const declaracionTexto = this.getDeclaracionTexto(data);
    const boxHeight = 200; // Altura fija para la declaración

    // Borde del cuadro
    this.doc
      .rect(leftMargin, this.currentY, pageWidth, boxHeight)
      .stroke(IncosPDFBase.COLORS.border);

    // Texto de la declaración (justificado)
    this.doc
      .font(IncosPDFBase.FONTS.normal.font)
      .fontSize(9)
      .fillColor(IncosPDFBase.COLORS.text)
      .text(
        declaracionTexto,
        leftMargin + 8,
        this.currentY + 8,
        {
          width: pageWidth - 16,
          align: 'justify',
          lineGap: 3,
        }
      );

    // Área de firma dentro del cuadro (al final)
    const firmaY = this.currentY + boxHeight - 35;

    this.doc
      .font(IncosPDFBase.FONTS.normal.font)
      .fontSize(9)
      .fillColor(IncosPDFBase.COLORS.text)
      .text(
        'Firma del estudiante: .......................................',
        leftMargin + 8,
        firmaY,
        {
          width: pageWidth - 16,
          align: 'right',
        }
      );

    this.currentY += boxHeight + 5;
  }

  /**
   * Obtiene el texto de la declaración jurada
   */
  getDeclaracionTexto(data) {
    return `Yo, el estudiante arriba descrito, declaro de manera voluntaria y consciente que realizo el presente aporte económico, sin que exista ningún tipo de obligación, presión o condicionamiento académico.

Manifiesto que tengo pleno conocimiento de que este aporte será destinado exclusivamente a cubrir gastos de equipamiento, mantenimiento, materiales, suministros y actividades necesarias, los cuales serán ejecutados de manera gradual durante la gestión, en función a la planificación del POA institucional, con el objetivo de fortalecer mi formación y desarrollo profesional.

Asimismo, dejo constancia de que estoy de acuerdo con el monto aportado y con el destino del mismo, entendiendo que se trata de un aporte voluntario, aceptado libremente y sin derecho a reclamo posterior.

En conformidad, firmo la presente para los fines que correspondan.`;
  }

  /**
   * Agrega el área de firma (opcional adicional al final)
   */
  addFirmaArea() {
    // Ya está incluida dentro de la declaración jurada
    // Este método se mantiene por compatibilidad pero no es necesario
  }

  /**
   * Formatea la fecha en formato DD/MM/YYYY
   */
  formatFecha(fecha) {
    try {
      if (!fecha) {
        const hoy = new Date();
        return `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`;
      }

      // Si es string en formato YYYY-MM-DD
      if (typeof fecha === 'string' && fecha.includes('-')) {
        const partes = fecha.split('-');
        if (partes.length === 3) {
          return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
      }

      // Si es string en formato DD/MM/YYYY, devolverlo tal cual
      if (typeof fecha === 'string' && fecha.includes('/')) {
        return fecha;
      }

      // Si es Date object
      if (fecha instanceof Date) {
        // Verificar que sea una fecha válida
        if (isNaN(fecha.getTime())) {
          const hoy = new Date();
          return `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`;
        }
        return `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`;
      }

      // Si no se puede formatear, usar fecha actual
      const hoy = new Date();
      return `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`;
    } catch (error) {
      console.error('[ReciboPagoMejorado] Error en formatFecha:', error.message);
      const hoy = new Date();
      return `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`;
    }
  }

  /**
   * Formatea la información del aporte
   */
  formatAporte(data) {
    try {
      // Usar nullish coalescing (??) en lugar de || para manejar correctamente cuando el valor es 0
      // Validar que data sea un objeto
      if (!data || typeof data !== 'object') {
        return '0.00 Bs';
      }

      const monto = Number(data.montoPagado ?? data.montoTotal ?? data.monto_pagado ?? data.monto_total ?? 0);

      // Si el monto es 0 o menor, mostrar como "GRATIS"
      if (monto === 0 || monto < 0 || isNaN(monto)) {
        return 'GRATIS';
      }

      const bolivianos = Math.floor(monto);
      const centavos = Math.round((monto - bolivianos) * 100);

      // Convertir número a letras (versión simplificada)
      const montoEnLetras = this.numberToWords(bolivianos);

      let texto = `${bolivianos} Bs (${montoEnLetras} con ${String(centavos).padStart(2, '0')}/100 bolivianos)`;

      return texto;
    } catch (error) {
      console.error('[ReciboPagoMejorado] Error en formatAporte:', error.message);
      return '0.00 Bs';
    }
  }

  /**
   * Convierte un número a palabras en español (versión simplificada)
   */
  numberToWords(num) {
    if (num === 0) return 'cero';

    const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];

    if (num < 10) return unidades[num];
    if (num < 20) return especiales[num - 10];
    if (num < 100) {
      const decena = Math.floor(num / 10);
      const unidad = num % 10;
      if (unidad === 0) return decenas[decena];
      return `${decenas[decena]} y ${unidades[unidad]}`;
    }
    if (num < 1000) {
      const centena = Math.floor(num / 100);
      const resto = num % 100;
      let resultado = centena === 1 ? 'ciento' : `${unidades[centena]}cientos`;
      if (resto > 0) resultado += ` ${this.numberToWords(resto)}`;
      return resultado;
    }

    // Para números mayores, devolver formato simple
    return `${num} bolivianos`;
  }

  /**
   * Verifica si un archivo existe
   * @deprecated Usar fs.existsSync directamente
   */
  fileExists(filePath) {
    try {
      const absolutePath = path.isAbsolute(filePath)
        ? filePath
        : path.resolve(__dirname, filePath);
      return fs.existsSync(absolutePath);
    } catch {
      return false;
    }
  }
}