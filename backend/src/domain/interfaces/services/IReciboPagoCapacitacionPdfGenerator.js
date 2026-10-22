/**
 * Interfaz del servicio de generación del Recibo de Pago de Capacitación (.pdf).
 *
 * Contrato que debe cumplir cualquier implementación de infraestructura que arme
 * el recibo de UN pago de una inscripción a un curso de capacitación a partir del
 * payload ya formado por la capa de aplicación (`construirDatosReciboPago`).
 *
 * Clean Architecture:
 * - Domain: IReciboPagoCapacitacionPdfGenerator (este contrato).
 * - Infrastructure: ReciboPagoCapacitacionPdfGenerator lo implementa con pdf-lib
 *   (reutiliza el diseño del recibo normal).
 * - Application: el use case depende de esta interfaz (inyectada por el container).
 */
export class IReciboPagoCapacitacionPdfGenerator {
  /**
   * Genera el PDF del recibo de un pago.
   *
   * @param {Object} datos - Payload del pago.
   * @param {string} datos.codigoRecibo - Prefijo del recibo (CAP-2026).
   * @param {string} datos.numeroRecibo - Número de recibo del pago.
   * @param {string} datos.fechaPago - DD/MM/YYYY.
   * @param {string|number} datos.gestion - Año del pago.
   * @param {string} datos.codigoInscripcion - Código de la inscripción (CAP-00012).
   * @param {{ nombreCompleto:string, ci:string }} datos.participante
   * @param {{ titulo:string, grupo:string, horarios:string,
   *           entidadCertificadora:string }} datos.curso
   * @param {'CURSO'|'MATRICULA'} datos.concepto
   * @param {string} datos.conceptoEtiqueta - Etiqueta legible del concepto.
   * @param {string} datos.metodoPago
   * @param {string} datos.cuenta - Titular y número de cuenta (vacío si no aplica).
   * @param {number} datos.montoPago - Monto de ESTE pago.
   * @param {number} datos.totalConcepto - Total a pagar del concepto del pago.
   * @param {number} datos.pagadoAntes - Pagado del concepto antes de este pago.
   * @param {number} datos.saldoConcepto - Saldo del concepto tras este pago.
   * @param {number} datos.saldoTotal - Saldo total de la inscripción tras este pago.
   * @param {string} datos.observacion
   * @returns {Promise<Buffer>} Buffer del archivo .pdf.
   */
  generarRecibo(_datos) {
    throw new Error('Method generarRecibo must be implemented');
  }
}

export default IReciboPagoCapacitacionPdfGenerator;
