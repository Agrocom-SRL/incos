/**
 * ReciboPagoCapacitacionPdfGenerator
 *
 * Servicio de infraestructura que genera el RECIBO DE PAGO de UN pago de una
 * inscripción a un curso de capacitación, en PDF (carta, vertical).
 *
 * REUTILIZA el diseño del recibo normal heredando de `ReciboPagoPdfGenerator`:
 * cabecera con logo, código y recuadro del número de recibo, fila de fecha, banners
 * verdes de sección y filas label/valor (`_addTableRow`, `_addTableRowObservacion`,
 * `_formatMonto`). Solo se sustituye el CONTENIDO propio de CAP:
 * - `_buildDatosPersonales` → datos del participante y detalle del pago (concepto
 *   MATRICULA/CURSO, método y cuenta, monto en letras y saldo tras ese pago);
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
    await this._addTableRowObservacion('PARTICIPANTE', valorODefecto(participante.nombreCompleto, SIN_DATO));
    await this._addTableRow('CÉDULA DE IDENTIDAD', valorODefecto(participante.ci, SIN_DATO));
    await this._addTableRowObservacion('CURSO', valorODefecto(curso.titulo, SIN_DATO));
    const grupo = [curso.grupo, curso.horarios].filter(Boolean).join(' — ');
    if (grupo) await this._addTableRowObservacion('GRUPO Y HORARIO', grupo);
    await this._addTableRow('INSCRIPCIÓN', valorODefecto(datos.codigoInscripcion, SIN_DATO));

    await this._addBannerSection(CFG.secciones.pago);
    await this._addTableRow('CONCEPTO', valorODefecto(datos.conceptoEtiqueta, SIN_DATO));
    if (esCurso && curso.entidadCertificadora) {
      await this._addTableRowObservacion('ENTIDAD CERTIFICADORA', curso.entidadCertificadora);
    }
    if (datos.costoCursoExterno) {
      await this._addTableRowObservacion('COSTO DEL CURSO', datos.costoCursoExterno);
    }
    await this._addTableRow('MÉTODO DE PAGO', valorODefecto(datos.metodoPago, SIN_DATO));
    if (datos.cuenta) await this._addTableRowObservacion('CUENTA', datos.cuenta);
    await this._addTableRow('TOTAL A PAGAR', formatearMonto(datos.totalConcepto, CFG.moneda), true);
    if (datos.pagadoAntes > 0) {
      await this._addTableRow('MONTO YA PAGADO', formatearMonto(datos.pagadoAntes, CFG.moneda));
    }
    await this._addTableRow('MONTO PAGADO', formatearMonto(datos.montoPago, CFG.moneda), true);
    await this._addTableRowObservacion('MONTO EN LETRAS', this._montoEnLetras(datos.montoPago));
    await this._addTableRow('SALDO PENDIENTE', formatearMonto(datos.saldoConcepto, CFG.moneda), true);
    await this._addTableRow(
      'SALDO TOTAL INSCRIPCIÓN',
      formatearMonto(datos.saldoTotal, CFG.moneda)
    );
    await this._addTableRowObservacion('OBSERVACIÓN', valorODefecto(datos.observacion, SIN_DATO));
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
