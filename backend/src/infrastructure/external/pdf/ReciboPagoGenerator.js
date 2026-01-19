/**
 * ReciboPagoGenerator
 * 
 * Genera recibos de pago profesionales para el Instituto INCOS
 * Basado en el sistema de componentes reutilizables de IncosPDFBase
 */

import { IncosPDFBase } from './IncosPDFBase.js';

export class ReciboPagoGenerator extends IncosPDFBase {
  /**
   * Genera el recibo de pago
   * @param {Object} data - Datos del pago
   * @param {string} outputPath - Ruta de salida del PDF
   * @returns {Promise<string>} Ruta del archivo generado
   */
  static async generate(data, outputPath) {
    const generator = new ReciboPagoGenerator(outputPath);
    return await generator.build(data);
  }

  /**
   * Construye el documento completo
   * @param {Object} data - Datos del recibo
   */
  async build(data) {
    // Encabezado institucional
    this.addInstitutionalHeader('RECIBO DE PAGO - APORTE VOLUNTARIO', {
      showDate: false,
      showMotto: true,
    });

    // Información del recibo
    this.addReciboInfo(data);

    // Línea separadora
    this.addLine(IncosPDFBase.COLORS.secondary, 2);
    this.addSpace(10);

    // Sección: Datos del Estudiante
    this.addSection('DATOS DEL ESTUDIANTE', () => {
      this.addDatosEstudiante(data);
    });

    // Línea separadora
    this.addLine(IncosPDFBase.COLORS.border, 1);
    this.addSpace(10);

    // Sección: Detalle del Pago
    this.addSection('DETALLE DEL PAGO', () => {
      this.addDetallePago(data);
    });

    // Estado del pago (destacado)
    this.addEstadoPago(data);

    // Línea separadora
    this.addLine(IncosPDFBase.COLORS.border, 1);
    this.addSpace(20);

    // Firmas
    this.addMultipleSignatures([
      {
        label: 'Firma del Estudiante',
        name: '',
        ci: '',
      },
      {
        label: 'Firma del Cajero',
        name: '',
        ci: '',
      },
    ]);

    // Footer con información legal
    this.addFooter(
      'Este recibo es válido únicamente con el sello y firma del cajero autorizado. ' +
      'Conserve este documento como comprobante de pago.',
      { fontSize: 8 }
    );

    // Guardar documento
    return await this.save();
  }

  /**
   * Agrega la información del recibo (número y fecha)
   * @param {Object} data - Datos del recibo
   */
  addReciboInfo(data) {
    // Número de recibo (destacado)
    this.doc
      .font(IncosPDFBase.FONTS.bold.font)
      .fontSize(11)
      .fillColor(IncosPDFBase.COLORS.primary)
      .text(
        `Recibo Nº: ${data.numeroRecibo || 'N/A'}`,
        this.options.margins.left,
        this.currentY,
        { align: 'left' }
      );

    this.currentY += IncosPDFBase.LAYOUT.lineHeight;

    // Fecha de pago
    const fechaPago = data.fechaPago || new Date().toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    this.doc
      .font(IncosPDFBase.FONTS.normal.font)
      .fontSize(IncosPDFBase.FONTS.normal.size)
      .fillColor(IncosPDFBase.COLORS.text)
      .text(
        `Fecha: ${fechaPago}`,
        this.options.margins.left,
        this.currentY,
        { align: 'left' }
      );

    this.currentY += IncosPDFBase.LAYOUT.spacing.subsection;
  }

  /**
   * Agrega los datos del estudiante
   * @param {Object} data - Datos del recibo
   */
  addDatosEstudiante(data) {
    // Nombre completo
    this.addField('Nombre', data.nombreCompleto || 'N/A', {
      indent: 20,
      bold: false,
    });

    // C.I.
    this.addField('C.I.', data.ci || 'N/A', {
      indent: 20,
      bold: false,
    });

    // Carrera (si existe)
    if (data.carrera) {
      this.addField('Carrera', data.carrera, {
        indent: 20,
        bold: false,
      });
    }

    // Gestión (si existe)
    if (data.gestion) {
      this.addField('Gestión', data.gestion, {
        indent: 20,
        bold: false,
      });
    }
  }

  /**
   * Agrega el detalle del pago con tabla formateada
   * @param {Object} data - Datos del pago
   */
  addDetallePago(data) {
    const indent = 20;
    const labelWidth = 180;
    const valueX = this.options.margins.left + indent + labelWidth;

    // Concepto
    this.addDetailRow('Concepto:', data.concepto || 'Aporte Voluntario Anual', {
      indent,
      labelWidth,
      valueX,
    });

    this.addSpace(5);

    // Monto Total
    this.addDetailRow('Monto Total:', `Bs. ${(data.montoTotal || 0).toFixed(2)}`, {
      indent,
      labelWidth,
      valueX,
    });

    // Descuento por Beca (si existe)
    if (data.descuentoBeca && data.descuentoBeca > 0) {
      this.addDetailRow('Descuento por Beca:', `Bs. ${data.descuentoBeca.toFixed(2)}`, {
        indent,
        labelWidth,
        valueX,
        valueColor: IncosPDFBase.COLORS.primary,
      });
    }

    this.addSpace(5);

    // Monto a Pagar (destacado)
    const montoAPagar = (data.montoTotal || 0) - (data.descuentoBeca || 0);
    
    this.checkPageBreak(25);
    
    this.doc
      .font(IncosPDFBase.FONTS.bold.font)
      .fontSize(12)
      .fillColor(IncosPDFBase.COLORS.primary)
      .text(
        'MONTO A PAGAR:',
        this.options.margins.left + indent,
        this.currentY,
        { width: labelWidth }
      );

    this.doc
      .font(IncosPDFBase.FONTS.bold.font)
      .fontSize(12)
      .fillColor(IncosPDFBase.COLORS.primary)
      .text(
        `Bs. ${montoAPagar.toFixed(2)}`,
        valueX,
        this.currentY
      );

    this.currentY += 20;

    // Línea separadora
    this.addLine(IncosPDFBase.COLORS.border, 1);
    this.addSpace(10);

    // Método de Pago
    this.addDetailRow('Método de Pago:', data.metodoPago || 'N/A', {
      indent,
      labelWidth,
      valueX,
    });

    // Número de Transacción (si existe)
    if (data.numeroTransaccion) {
      this.addDetailRow('Número de Transacción:', data.numeroTransaccion, {
        indent,
        labelWidth,
        valueX,
      });
    }

    // Banco (si existe)
    if (data.banco) {
      this.addDetailRow('Banco:', data.banco, {
        indent,
        labelWidth,
        valueX,
      });
    }
  }

  /**
   * Agrega una fila de detalle (etiqueta: valor)
   * @param {string} label - Etiqueta
   * @param {string} value - Valor
   * @param {Object} options - Opciones de formato
   */
  addDetailRow(label, value, options = {}) {
    const opts = {
      indent: 20,
      labelWidth: 180,
      valueX: this.options.margins.left + 200,
      labelColor: IncosPDFBase.COLORS.text,
      valueColor: IncosPDFBase.COLORS.text,
      ...options,
    };

    this.checkPageBreak(20);

    const x = this.options.margins.left + opts.indent;
    const y = this.currentY;

    // Etiqueta (en negrita)
    this.doc
      .font(IncosPDFBase.FONTS.bold.font)
      .fontSize(IncosPDFBase.FONTS.normal.size)
      .fillColor(opts.labelColor)
      .text(label, x, y, { width: opts.labelWidth });

    // Valor
    this.doc
      .font(IncosPDFBase.FONTS.normal.font)
      .fontSize(IncosPDFBase.FONTS.normal.size)
      .fillColor(opts.valueColor)
      .text(value, opts.valueX, y);

    this.currentY += IncosPDFBase.LAYOUT.lineHeight;
  }

  /**
   * Agrega el estado del pago destacado
   * @param {Object} data - Datos del recibo
   */
  addEstadoPago(data) {
    this.addSpace(15);

    const estado = data.estado || 'PENDIENTE';
    
    // Determinar color según estado
    let estadoColor = IncosPDFBase.COLORS.text;
    if (estado === 'APROBADO' || estado === 'PAGADO') {
      estadoColor = '#2ecc71'; // Verde
    } else if (estado === 'RECHAZADO' || estado === 'ANULADO') {
      estadoColor = '#e74c3c'; // Rojo
    } else if (estado === 'PENDIENTE') {
      estadoColor = '#f39c12'; // Naranja
    }

    // Cuadro con el estado
    const boxX = this.options.margins.left;
    const boxY = this.currentY;
    const boxWidth = 200;
    const boxHeight = 30;

    // Fondo del cuadro
    this.doc
      .rect(boxX, boxY, boxWidth, boxHeight)
      .fill(estadoColor);

    // Texto del estado
    this.doc
      .font(IncosPDFBase.FONTS.bold.font)
      .fontSize(12)
      .fillColor('#ffffff')
      .text(
        `ESTADO: ${estado}`,
        boxX + 10,
        boxY + 8,
        {
          width: boxWidth - 20,
          align: 'center',
        }
      );

    this.currentY += boxHeight + 15;
  }
}
