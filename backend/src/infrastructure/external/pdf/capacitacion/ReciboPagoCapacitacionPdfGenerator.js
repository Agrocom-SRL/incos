/**
 * ReciboPagoCapacitacionPdfGenerator
 *
 * Servicio de infraestructura que genera el RECIBO DE PAGO de UN pago de una
 * inscripción a un curso de capacitación, en PDF (carta, vertical).
 *
 * REUTILIZA el diseño del recibo normal heredando de `ReciboPagoPdfGenerator`:
 * cabecera con logo, código y recuadro del número de recibo, fila de fecha, banners
 * verdes de sección y filas label/valor (`_addFila`, propia y simétrica;
 * `_formatMonto`). Solo se sustituye el CONTENIDO propio de CAP:
 * - `_buildDatosPersonales` → datos del participante y detalle del pago (concepto
 *   MATRICULA/CURSO, método y cuenta, monto pagado en letras y saldo pendiente tras ese pago);
 * - `_buildDeclaracionJurada` → constancia y firmas (el recibo normal cierra con la
 *   declaración jurada del aporte voluntario, que no aplica a un curso).
 * El monto en letras usa `../numberToWords.js` (con centenas irregulares correctas).
 *
 * Implementa IReciboPagoCapacitacionPdfGenerator.
 *
 * Principios SOLID:
 * - Open/Closed: el recibo normal se extiende, no se modifica su flujo `generate`.
 * - Liskov: sigue siendo un `ReciboPagoPdfGenerator`.
 *
 * @module ReciboPagoCapacitacionPdfGenerator
 */

import { ReciboPagoPdfGenerator } from '../ReciboPagoPdfGenerator.js';
import { IncosPDFBase } from '../IncosPDFBase.js';
import { numberToWords } from '../numberToWords.js';
import { RECIBO_CAPACITACION_PDF_CONFIG as CFG } from './capacitacionPdfConfig.js';
import { formatearMonto, valorODefecto } from './capacitacionPdfLayout.js';
import { dibujarFirmas } from './secciones/seccionFirmas.js';

const SIN_DATO = '—';
const FILA_ALTO_MIN = 22;

export class ReciboPagoCapacitacionPdfGenerator extends ReciboPagoPdfGenerator {
  /**
   * @param {Object} params
   * @param {ILogger} [params.logger]
   */
  constructor({ logger } = {}) {
    super({ logger });
  }

  /**
   * Genera el PDF del recibo de un pago de capacitación.
   * @param {Object} datos - Payload formado por `construirDatosReciboPago`.
   * @returns {Promise<Buffer>}
   */
  async generarRecibo(datos) {
    // El flujo `generate` del recibo normal lee estas claves en su cabecera.
    return this.generate({ ...datos, subtitulo: CFG.subtitulo });
  }

  /**
   * Datos del participante + detalle del pago (reemplaza el bloque del estudiante).
   * @override
   * @private
   */
  async _buildDatosPersonales(datos) {
    const { participante, curso } = datos;
    const esCurso = datos.concepto === 'CURSO';

    await this._addBannerSection(CFG.secciones.participante);
    await this._addFila('PARTICIPANTE', valorODefecto(participante.nombreCompleto, SIN_DATO));
    await this._addFila('CÉDULA DE IDENTIDAD', valorODefecto(participante.ci, SIN_DATO));
    await this._addFila('CURSO', valorODefecto(curso.titulo, SIN_DATO));
    const grupo = [curso.grupo, curso.horarios].filter(Boolean).join(' — ');
    if (grupo) await this._addFila('GRUPO Y HORARIO', grupo);
    await this._addFila('INSCRIPCIÓN', valorODefecto(datos.codigoInscripcion, SIN_DATO));

    await this._addBannerSection(CFG.secciones.pago);
    await this._addFila('CONCEPTO', valorODefecto(datos.conceptoEtiqueta, SIN_DATO));
    if (esCurso && curso.entidadCertificadora) {
      await this._addFila('ENTIDAD CERTIFICADORA', curso.entidadCertificadora);
    }
    if (datos.costoCursoExterno) {
      await this._addFila('COSTO DEL CURSO', datos.costoCursoExterno);
    }
    await this._addFila('MÉTODO DE PAGO', valorODefecto(datos.metodoPago, SIN_DATO));
    if (datos.cuenta) await this._addFila('CUENTA', datos.cuenta);
    await this._addFila('TOTAL A PAGAR', formatearMonto(datos.totalConcepto, CFG.moneda), true);
    if (datos.pagadoAntes > 0) {
      await this._addFila('MONTO YA PAGADO', formatearMonto(datos.pagadoAntes, CFG.moneda));
    }
    await this._addFila(
      'MONTO PAGADO',
      `${formatearMonto(datos.montoPago, CFG.moneda)}  ${this._montoEnLetras(datos.montoPago)}`,
      true
    );
    await this._addFila('SALDO PENDIENTE', formatearMonto(datos.saldoConcepto, CFG.moneda), true);
    await this._addFila('OBSERVACIÓN', valorODefecto(datos.observacion, SIN_DATO));
  }

  /**
   * Cierre del recibo: constancia y firmas (reemplaza la declaración jurada).
   * @override
   * @private
   */
  async _buildDeclaracionJurada(datos) {
    await this._addBannerSection(CFG.secciones.constancia);
    this._addSpace(IncosPDFBase.LAYOUT.spacing.paragraph);
    await this._addParagraph(this._textoConstancia(datos), {
      fontSize: IncosPDFBase.FONTS.section.size
    });
    await dibujarFirmas(this, { firmas: CFG.firmas });
  }

  /**
   * Fila `etiqueta | valor` con la misma geometría en TODAS las filas del recibo: mismo
   * relleno horizontal, misma fuente y texto centrado verticalmente en ambas celdas
   * (las filas base del recibo normal mezclan márgenes y alineaciones distintas).
   * El valor hace wrap si es largo; `destacado` lo pone en negrita.
   * @private
   */
  async _addFila(label, value, destacado = false) {
    const { margins } = IncosPDFBase.LAYOUT;
    const page = this._currentPage;
    const { width: pageWidth } = page.getSize();
    const totalWidth = pageWidth - margins.left - margins.right;
    const labelWidth = totalWidth * 0.3;
    const padding = 6;
    const fontSize = IncosPDFBase.FONTS.normal.size;
    const lineHeight = fontSize + 3;
    const bold = await this._pdfDoc.embedFont(
      this._mapFontNameToStandardFont(IncosPDFBase.FONTS.bold.font)
    );
    const normal = await this._pdfDoc.embedFont(
      this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font)
    );
    const valueFont = destacado ? bold : normal;
    const text = this._hexToRgb(IncosPDFBase.COLORS.text);
    const border = this._hexToRgb(IncosPDFBase.COLORS.border);

    const lines = this._wrapText(
      String(value || SIN_DATO),
      valueFont,
      fontSize,
      totalWidth - labelWidth - padding * 2
    );
    const rowHeight = Math.max(FILA_ALTO_MIN, lines.length * lineHeight + padding * 2 - 3);
    const rowY = this._currentY - rowHeight;

    page.drawRectangle({
      x: margins.left,
      y: rowY,
      width: labelWidth,
      height: rowHeight,
      borderColor: border,
      borderWidth: 1
    });
    page.drawRectangle({
      x: margins.left + labelWidth,
      y: rowY,
      width: totalWidth - labelWidth,
      height: rowHeight,
      borderColor: border,
      borderWidth: 1
    });

    // Línea base de cada texto: centrado óptico del bloque dentro de la fila
    const baseline = (index, total) =>
      rowY + rowHeight / 2 + ((total - 1) * lineHeight) / 2 - index * lineHeight - fontSize * 0.35;
    page.drawText(label, { x: margins.left + padding, y: baseline(0, 1), size: fontSize, font: bold, color: text });
    lines.forEach((line, i) =>
      page.drawText(line, {
        x: margins.left + labelWidth + padding,
        y: baseline(i, lines.length),
        size: fontSize,
        font: valueFont,
        color: text
      })
    );

    this._currentY -= rowHeight;
  }

  /** Texto de la constancia con los datos del pago. @private */
  _textoConstancia(datos) {
    return CFG.constanciaTexto
      .replace('{PARTICIPANTE}', valorODefecto(datos.participante.nombreCompleto, SIN_DATO))
      .replace('{MONTO}', formatearMonto(datos.montoPago, CFG.moneda))
      .replace('{CONCEPTO}', String(datos.conceptoEtiqueta ?? '').toLowerCase())
      .replace('{CURSO}', valorODefecto(datos.curso.titulo, SIN_DATO));
  }

  /**
   * Monto en letras al estilo boliviano: "Quinientos con 50/100 bolivianos".
   * @private
   * @param {number} monto
   * @returns {string}
   */
  _montoEnLetras(monto) {
    const centavosTotales = Math.round((Number(monto) || 0) * 100);
    const bolivianos = Math.floor(centavosTotales / 100);
    const centavos = String(centavosTotales % 100).padStart(2, '0');
    const letras = numberToWords(bolivianos);
    return `${letras.charAt(0).toUpperCase()}${letras.slice(1)} con ${centavos}/100 bolivianos`;
  }
}

export default ReciboPagoCapacitacionPdfGenerator;
