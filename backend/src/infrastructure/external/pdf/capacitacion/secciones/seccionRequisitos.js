/**
 * Sección III del Formulario de Inscripción de Capacitación: requisitos
 * recepcionados.
 *
 * Checklist del curso con su estado de entrega para ESTA inscripción (lo mismo que
 * muestra la ficha) y, si existe, el compromiso de entrega vigente. Se pagina con
 * la plantilla si la tabla excede la página.
 */

import { IncosPDFBase } from '../../IncosPDFBase.js';
import { FORMULARIO_CAPACITACION_PDF_CONFIG as CFG } from '../capacitacionPdfConfig.js';
import { valorODefecto } from '../capacitacionPdfLayout.js';

const FUENTE_TABLA = 8;
const SI = 'Sí';
const NO = 'No';

/**
 * @param {import('../../IncosPDFLibBase.js').IncosPDFLibBase} pdf - Generador (contexto de dibujo)
 * @param {Object} datos - Payload del formulario
 * @returns {Promise<void>}
 */
export async function dibujarRequisitos(pdf, datos) {
  const { tablaRequisitos, etiquetas } = CFG;
  const requisitos = datos.requisitos ?? [];

  await pdf._addSection(CFG.secciones.requisitos);

  if (requisitos.length === 0) {
    await pdf._addParagraph(etiquetas.sinRequisitos);
  } else {
    const filas = requisitos.map((requisito) => [
      requisito.descripcion,
      requisito.obligatorio ? SI : NO,
      requisito.entregado ? SI : NO,
      valorODefecto(requisito.fechaEntrega, CFG.nullPlaceholder)
    ]);
    await pdf._addTable(
      tablaRequisitos.headers,
      tablaRequisitos.widths,
      filas,
      null,
      tablaRequisitos.alignments,
      null,
      { fontSize: FUENTE_TABLA, headerFontSize: FUENTE_TABLA, paginate: true }
    );
  }

  if (datos.compromiso?.fechaLimite) {
    pdf._addSpace(IncosPDFBase.LAYOUT.spacing.subsection);
    await pdf._addLabelValue(etiquetas.compromiso, datos.compromiso.fechaLimite);
  }
  pdf._addSpace();
}

export default dibujarRequisitos;
