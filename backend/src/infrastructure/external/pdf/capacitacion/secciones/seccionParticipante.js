/**
 * Sección I del Formulario de Inscripción de Capacitación: datos del participante.
 *
 * El participante de capacitación guarda solo datos mínimos (nombre, CI y
 * expedición, celular y correo opcional); no hay fecha de nacimiento, domicilio ni
 * contacto de emergencia, por eso no se dibujan.
 */

import { IncosPDFBase } from '../../IncosPDFBase.js';
import { FORMULARIO_CAPACITACION_PDF_CONFIG as CFG } from '../capacitacionPdfConfig.js';
import { valorODefecto } from '../capacitacionPdfLayout.js';

/**
 * @param {import('../../IncosPDFLibBase.js').IncosPDFLibBase} pdf - Generador (contexto de dibujo)
 * @param {Object} datos - Payload del formulario
 * @returns {Promise<void>}
 */
export async function dibujarParticipante(pdf, datos) {
  const { participante } = datos;
  const { etiquetas } = CFG;
  const vacio = CFG.nullPlaceholder;

  await pdf._addSection(CFG.secciones.participante);
  await pdf._addBoxedField(
    etiquetas.nombres,
    valorODefecto(participante.nombreCompleto, vacio),
    true,
    IncosPDFBase.FONTS.title.size
  );
  await pdf._addBoxedFieldGrid(
    [
      { label: etiquetas.ci, value: valorODefecto(participante.ci, vacio) },
      { label: etiquetas.celular, value: valorODefecto(participante.celular, vacio) }
    ],
    [{ label: etiquetas.email, value: valorODefecto(participante.email, vacio) }],
    35
  );
  pdf._addSpace();
}

export default dibujarParticipante;
