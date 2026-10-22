/**
 * Sección IV del Formulario de Inscripción de Capacitación: pagos y saldo.
 *
 * Historial de pagos de la inscripción (fecha, recibo, concepto, método, monto) y
 * el resumen de costo del curso, matrícula, total pagado y saldo pendiente. Los
 * montos ya vienen calculados por la ficha (no se recalculan aquí).
 */

import { IncosPDFBase } from '../../IncosPDFBase.js';
import { FORMULARIO_CAPACITACION_PDF_CONFIG as CFG } from '../capacitacionPdfConfig.js';
import { formatearMonto, valorODefecto } from '../capacitacionPdfLayout.js';

const FUENTE_TABLA = 8;
const ANCHO_ETIQUETA_RESUMEN = 90;
const PORCENTAJE_COLUMNA_IZQUIERDA = 50;

/**
 * @param {import('../../IncosPDFLibBase.js').IncosPDFLibBase} pdf - Generador (contexto de dibujo)
 * @param {Object} datos - Payload del formulario
 * @returns {Promise<void>}
 */
export async function dibujarPagos(pdf, datos) {
  const { tablaPagos, etiquetas } = CFG;
  const pagos = datos.pagos ?? [];

  await pdf._addSection(CFG.secciones.pagos);

  if (pagos.length === 0) {
    await pdf._addParagraph(etiquetas.sinPagos);
  } else {
    const filas = pagos.map((pago) => [
      valorODefecto(pago.fechaPago, CFG.nullPlaceholder),
      valorODefecto(pago.numeroRecibo, CFG.nullPlaceholder),
      pago.concepto,
      valorODefecto(pago.metodoPago, CFG.nullPlaceholder),
      formatearMonto(pago.monto, '')
    ]);
    await pdf._addTable(
      tablaPagos.headers,
      tablaPagos.widths,
      filas,
      null,
      tablaPagos.alignments,
      null,
      { fontSize: FUENTE_TABLA, headerFontSize: FUENTE_TABLA, paginate: true }
    );
  }

  pdf._addSpace(IncosPDFBase.LAYOUT.spacing.subsection);
  // Costo del curso externo (entidad certificadora): leyenda en lugar de un importe/saldo
  const costoExterno = datos.resumenPagos?.costoCursoExterno;
  if (costoExterno) {
    await pdf._addBoxedField(etiquetas.costoCurso, costoExterno, true);
  }
  const items = CFG.resumenPagos
    .filter(({ key }) => !(costoExterno && key === 'costoCurso'))
    .map(({ label, key }) => ({
      label: `${label}:`,
      value: formatearMonto(datos.resumenPagos?.[key])
    }));
  const mitad = Math.ceil(items.length / 2);
  await pdf._addBoxedFieldGrid(
    items.slice(0, mitad),
    items.slice(mitad),
    PORCENTAJE_COLUMNA_IZQUIERDA,
    ANCHO_ETIQUETA_RESUMEN,
    ANCHO_ETIQUETA_RESUMEN
  );
}

export default dibujarPagos;
