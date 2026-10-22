/**
 * Sección: encabezado del Formulario de Inscripción de Capacitación.
 *
 * Recuadro "No. Registro" con el código de la inscripción, cabecera institucional,
 * nombre del instituto, título del documento y subtítulo con la gestión.
 * Una sola responsabilidad: abrir el documento; no conoce los datos del participante.
 */

import { IncosPDFBase } from '../../IncosPDFBase.js';
import { FORMULARIO_CAPACITACION_PDF_CONFIG as CFG } from '../capacitacionPdfConfig.js';

/**
 * @param {import('../../IncosPDFLibBase.js').IncosPDFLibBase} pdf - Generador (contexto de dibujo)
 * @param {Object} datos - Payload del formulario
 * @returns {Promise<void>}
 */
export async function dibujarEncabezado(pdf, datos) {
  await pdf._drawRegistrationBox(CFG.registroLabel, datos.codigoInscripcion);
  await pdf._addInstitutionalHeader(IncosPDFBase.INSTITUTIONAL_HEADER_LINES);
  await pdf._addDocumentTitle(IncosPDFBase.INSTITUTE.name, false);
  await pdf._addDocumentTitle(CFG.titulo);
  await pdf._addSubtitle(`${CFG.subtituloPrefijo} ${datos.gestion}`);
}

export default dibujarEncabezado;
