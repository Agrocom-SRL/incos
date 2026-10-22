/**
 * Interfaz del servicio de generación del Formulario de Inscripción de
 * Capacitación (.pdf).
 *
 * Contrato que debe cumplir cualquier implementación de infraestructura que arme
 * el formulario de UNA inscripción a un curso de capacitación a partir del payload
 * ya formado por la capa de aplicación (`construirDatosFormularioInscripcion`).
 *
 * Clean Architecture:
 * - Domain: IFormularioInscripcionCapacitacionPdfGenerator (este contrato).
 * - Infrastructure: FormularioInscripcionCapacitacionPdfGenerator lo implementa con pdf-lib.
 * - Application: el use case depende de esta interfaz (inyectada por el container).
 */
export class IFormularioInscripcionCapacitacionPdfGenerator {
  /**
   * Genera el PDF del formulario de inscripción.
   *
   * @param {Object} datos - Payload de la inscripción.
   * @param {string} datos.codigoInscripcion - Código mostrado en "No. Registro" (CAP-00012).
   * @param {string} datos.gestion - Año de la inscripción.
   * @param {string} datos.fechaInscripcion - DD/MM/YYYY.
   * @param {string} datos.fechaEmision - DD/MM/YYYY.
   * @param {string} datos.estado - Estado de la inscripción (etiqueta legible).
   * @param {{ nombreCompleto:string, ci:string, celular:string, email:string }} datos.participante
   * @param {{ titulo:string, modalidad:string, entidadCertificadora:string,
   *           fechaInicio:string, fechaFin:string, grupo:string, horarios:string }} datos.curso
   * @param {Array<{ nombre:string, horarios:string, seleccionado:boolean }>} datos.grupos - Grupos del curso (el elegido con casilla marcada).
   * @param {Array<{ descripcion:string, obligatorio:boolean, entregado:boolean,
   *                 fechaEntrega:string }>} datos.requisitos
   * @param {{ fechaLimite:string }|null} datos.compromiso - Compromiso de entrega vigente.
   * @param {Array<{ fechaPago:string, numeroRecibo:string, concepto:string,
   *                 metodoPago:string, monto:number }>} datos.pagos
   * @param {{ costoCurso:number, costoMatricula:number, totalPagado:number,
   *           saldo:number }} datos.resumenPagos
   * @returns {Promise<Buffer>} Buffer del archivo .pdf.
   */
  generarFormularioInscripcion(_datos) {
    throw new Error('Method generarFormularioInscripcion must be implemented');
  }
}

export default IFormularioInscripcionCapacitacionPdfGenerator;
