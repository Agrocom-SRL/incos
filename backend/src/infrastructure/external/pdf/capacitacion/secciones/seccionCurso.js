/**
 * Sección II del Formulario de Inscripción de Capacitación: datos del curso.
 *
 * Datos del curso (título, modalidad, entidad que certifica, inicio), estado y
 * fecha de la inscripción. El grupo elegido y los horarios de todos los grupos
 * van en la sección IV (`seccionGrupos`).
 */

import { IncosPDFBase } from '../../IncosPDFBase.js';
import { FORMULARIO_CAPACITACION_PDF_CONFIG as CFG } from '../capacitacionPdfConfig.js';
import { valorODefecto } from '../capacitacionPdfLayout.js';

/**
 * @param {import('../../IncosPDFLibBase.js').IncosPDFLibBase} pdf - Generador (contexto de dibujo)
 * @param {Object} datos - Payload del formulario
 * @returns {Promise<void>}
 */
export async function dibujarCurso(pdf, datos) {
  const { curso } = datos;
  const { etiquetas } = CFG;
  const vacio = CFG.nullPlaceholder;

  await pdf._addSection(CFG.secciones.curso);
  await pdf._addBoxedField(
    etiquetas.curso,
    valorODefecto(curso.titulo, vacio),
    true,
    IncosPDFBase.FONTS.title.size
  );
  await pdf._addBoxedFieldGrid(
    [
      { label: etiquetas.modalidad, value: valorODefecto(curso.modalidad, vacio) },
      { label: etiquetas.inicio, value: valorODefecto(curso.fechaInicio, vacio) },
      { label: etiquetas.fechaInscripcion, value: valorODefecto(datos.fechaInscripcion, vacio) }
    ],
    [
      { label: etiquetas.certificadoPor, value: valorODefecto(curso.entidadCertificadora, vacio) },
      { label: etiquetas.estado, value: valorODefecto(datos.estado, vacio) }
    ],
    35
  );

  pdf._addSpace();
}

export default dibujarCurso;
