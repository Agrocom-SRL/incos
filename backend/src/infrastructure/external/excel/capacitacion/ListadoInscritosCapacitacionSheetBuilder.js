/**
 * ListadoInscritosCapacitacionSheetBuilder — construye la ÚNICA hoja del Listado
 * de Inscritos de un curso de capacitación: cabecera institucional + datos del
 * curso (título, costo, aula, horario, fechas), tabla de participantes vigentes
 * (cédula, nombre completo, correo, saldo, fecha de inscripción) y un resumen de
 * totales al pie.
 *
 * Solo construcción + estilos (vía ExcelSheetComposer + ExcelTheme). Cabecera en
 * verde institucional, igual que el resto de reportes .xlsx del sistema.
 */

import { EXCEL_COLOR, EXCEL_FONT_SIZE, colLetter as L } from '../shared/index.js';

const fmtFecha = (value) => {
  if (!value) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(value);
};

const fmtMoneda = (value) =>
  `${(Number(value) || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs`;

export class ListadoInscritosCapacitacionSheetBuilder {
  /**
   * @param {Object} params
   * @param {import('../shared/ExcelSheetComposer.js').ExcelSheetComposer} params.composer
   * @param {Object} params.datos - Payload del listado de inscritos.
   */
  static build({ composer: c, datos }) {
    const { label, body } = EXCEL_FONT_SIZE;
    const curso = datos.curso ?? {};
    const participantes = Array.isArray(datos.participantes) ? datos.participantes : [];

    // ---- Mapa de columnas (1-based; col 1 = margen) ----
    const colCedula = 2;
    const colNombre = 3;
    const colCorreo = 4;
    const colSaldo = 5;
    const colFechaInscripcion = 6;
    const lastCol = colFechaInscripcion;

    c.colWidths({ 1: 3, [colCedula]: 16, [colNombre]: 42, [colCorreo]: 30 });
    c.colWidths({ [colSaldo]: 16, [colFechaInscripcion]: 20 });

    // ---- Banda de título + cabecera institucional + datos del curso ----
    c.bandTitle(
      `B1:${L(lastCol)}1`,
      `LISTADO DE INSCRITOS — ${String(curso.titulo ?? '').toUpperCase() || 'CURSO DE CAPACITACIÓN'}`
    );
    c.merge(`B2:${L(lastCol)}2`, 'INSTITUTO TÉCNICO INCOS SANTA CRUZ', {
      bold: true,
      size: body,
      fontColor: EXCEL_COLOR.inkSoft,
      border: false,
    });
    c.infoField('B3:B3', 'CURSO:', `C3:${L(lastCol)}3`, curso.titulo ?? '—');
    c.infoField('B4:B4', 'COSTO:', 'C4:C4', fmtMoneda(curso.costo));
    c.infoField('D4:D4', 'AULA:', `E4:${L(lastCol)}4`, curso.aulaNombre ?? '—');
    c.infoField('B5:B5', 'HORARIO:', `C5:${L(lastCol)}5`, curso.horariosDetalle || '—');
    const fechasLabel =
      curso.fechaInicio && curso.fechaFin
        ? `${fmtFecha(curso.fechaInicio)} – ${fmtFecha(curso.fechaFin)}`
        : '—';
    c.infoField('B6:B6', 'FECHAS:', 'C6:C6', fechasLabel);
    c.infoField('D6:D6', 'EMISIÓN:', `E6:${L(lastCol)}6`, fmtFecha(datos.fechaEmision));

    // ---- Cabecera de columnas ----
    const headRow = 8;
    const headStyle = {
      bold: true,
      size: label,
      wrap: true,
      fill: EXCEL_COLOR.statHeader,
      fontColor: EXCEL_COLOR.statHeaderText,
      borderMedium: true,
    };
    const headers = [
      [colCedula, 'CÉDULA'],
      [colNombre, 'NOMBRE COMPLETO'],
      [colCorreo, 'CORREO'],
      [colSaldo, 'SALDO (Bs)'],
      [colFechaInscripcion, 'FECHA DE INSCRIPCIÓN'],
    ];
    headers.forEach(([col, text]) => c.cell(headRow, col, text, headStyle));
    c.ws.getRow(headRow).height = 30;
    c.freeze(headRow);

    // ---- Detalle: un participante por fila ----
    let row = headRow + 1;
    let totalSaldo = 0;
    participantes.forEach((p, idx) => {
      const zebra = idx % 2 === 1 ? EXCEL_COLOR.zebra : EXCEL_COLOR.white;
      const saldo = Number(p.saldo) || 0;
      totalSaldo += saldo;
      c.cell(row, colCedula, p.ciCompleto ?? '—', { fill: zebra, size: label });
      c.cell(row, colNombre, String(p.nombreCompleto ?? '').toUpperCase(), {
        fill: zebra,
        align: 'left',
        size: label,
      });
      c.cell(row, colCorreo, p.correo ?? '—', { fill: zebra, align: 'left', size: label });
      const saldoCell = c.cell(row, colSaldo, saldo, { fill: zebra, bold: saldo > 0, size: label });
      saldoCell.numFmt = '#,##0.00';
      c.cell(row, colFechaInscripcion, fmtFecha(p.fechaInscripcion), { fill: zebra, size: label });
      row += 1;
    });

    if (participantes.length === 0) {
      c.merge(`${L(colCedula)}${row}:${L(lastCol)}${row}`, 'Sin participantes inscritos vigentes.', {
        align: 'left',
        size: label,
        fontColor: EXCEL_COLOR.inkSoft,
      });
      row += 1;
    }

    // ---- Resumen ----
    row += 1;
    c.merge(`${L(colCedula)}${row}:${L(colNombre)}${row}`, `TOTAL INSCRITOS: ${participantes.length}`, {
      bold: true,
      align: 'left',
      fill: EXCEL_COLOR.teoricasStrong,
      size: label,
    });
    c.merge(
      `${L(colCorreo)}${row}:${L(lastCol)}${row}`,
      `SALDO PENDIENTE TOTAL: ${totalSaldo.toLocaleString('es-BO', { minimumFractionDigits: 2 })} Bs`,
      {
        bold: true,
        align: 'left',
        fill: EXCEL_COLOR.teoricasStrong,
        size: label,
      }
    );
  }
}

export default ListadoInscritosCapacitacionSheetBuilder;
