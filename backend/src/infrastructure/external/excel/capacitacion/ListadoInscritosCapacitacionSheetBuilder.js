/**
 * ListadoInscritosCapacitacionSheetBuilder — construye la ÚNICA hoja del Listado
 * de Inscritos de un curso de capacitación: cabecera institucional + datos del
 * curso (título, costo, horario por grupo, fechas), tabla de participantes vigentes
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
   * @param {Array<Object>} [params.participantes] - Participantes de ESTA hoja (por defecto, todos).
   * @param {string|null} [params.grupo] - Nombre del grupo de la hoja (null = sin separar por grupo).
   */
  static build({ composer: c, datos, participantes: lista, grupo = null }) {
    const { label, body, subtitle, title } = EXCEL_FONT_SIZE;
    // Cabecera del curso (filas 1-7): un punto por encima de la tipografía base.
    const infoSize = body + 1;
    const curso = datos.curso ?? {};
    const participantes = Array.isArray(lista)
      ? lista
      : Array.isArray(datos.participantes)
        ? datos.participantes
        : [];

    // ---- Mapa de columnas (1-based; col 1 = margen) ----
    const colCedula = 2;
    const colNombre = 3;
    const colCorreo = 4;
    const colCelular = 5;
    const colGrupo = 6;
    const colMonto = 7;
    const colPagado = 8;
    const colSaldo = 9;
    const colEstadoMatricula = 10;
    const colEstadoCurso = 11;
    const colRequisitos = 12;
    const colFechaInscripcion = 13;
    const lastCol = colFechaInscripcion;

    c.colWidths({ 1: 3, [colCedula]: 22, [colNombre]: 52, [colCorreo]: 46 });
    c.colWidths({ [colCelular]: 18, [colGrupo]: 28, [colMonto]: 20, [colPagado]: 20 });
    c.colWidths({ [colSaldo]: 20, [colEstadoMatricula]: 24, [colEstadoCurso]: 32 });
    c.colWidths({ [colRequisitos]: 20, [colFechaInscripcion]: 24 });

    // ---- Banda de título + cabecera institucional + datos del curso ----
    const tituloCurso = String(curso.titulo ?? '').toUpperCase() || 'CURSO DE CAPACITACIÓN';
    // El nombre del grupo ya suele empezar con «Grupo»: no repetir la palabra.
    const sufijoGrupo =
      grupo === null ? '' : ` — ${/^grupo\b/i.test(grupo) ? '' : 'GRUPO '}${String(grupo).toUpperCase()}`;
    c.bandTitle(`B1:${L(lastCol)}1`, `LISTADO DE INSCRITOS — ${tituloCurso}${sufijoGrupo}`);
    const titleCell = c.ws.getCell('B1');
    titleCell.font = { ...titleCell.font, size: title + 1 };
    c.merge(`B2:${L(lastCol)}2`, 'INSTITUTO TÉCNICO INCOS SANTA CRUZ', {
      bold: true,
      size: infoSize,
      fontColor: EXCEL_COLOR.inkSoft,
      border: false,
    });
    c.infoField('B3:B3', 'CURSO:', `C3:${L(lastCol)}3`, curso.titulo ?? '—', { size: infoSize });
    const externo = Boolean(curso.entidadCertificadora);
    c.infoField(
      'B4:B4',
      'COSTO CURSO:',
      'C4:C4',
      externo ? `Externo (${curso.entidadCertificadora})` : fmtMoneda(curso.costo),
      { size: infoSize }
    );
    // En la hoja de un grupo se muestra la matrícula propia del grupo (snapshot de sus inscritos).
    const matriculas = [...new Set(participantes.map((p) => Number(p.montoMatricula) || 0))];
    const matriculaLabel =
      grupo !== null && matriculas.length === 1
        ? fmtMoneda(matriculas[0])
        : matriculas.length > 1
          ? 'Varía por grupo'
          : fmtMoneda(curso.costoMatricula);
    c.infoField('D4:D4', 'MATRÍCULA:', `E4:${L(lastCol)}4`, matriculaLabel, { size: infoSize });
    c.infoField('B5:B5', 'HORARIO:', `C5:${L(lastCol)}5`, curso.horariosDetalle || '—', { size: infoSize });
    const fechasLabel = curso.fechaFin
      ? `${fmtFecha(curso.fechaInicio)} – ${fmtFecha(curso.fechaFin)}`
      : fmtFecha(curso.fechaInicio);
    c.infoField('B6:B6', 'INICIO / FIN:', 'C6:C6', fechasLabel, { size: infoSize });
    c.infoField('D6:D6', 'MODALIDAD:', `E6:${L(lastCol)}6`, curso.modalidad ?? '—', { size: infoSize });
    c.infoField('B7:B7', 'EMISIÓN:', `C7:${L(lastCol)}7`, fmtFecha(datos.fechaEmision), { size: infoSize });

    c.ws.getRow(1).height = 36;
    for (let r = 2; r <= 7; r += 1) c.ws.getRow(r).height = 26;

    // ---- Cabecera de columnas ----
    const headRow = 9;
    const headStyle = {
      bold: true,
      size: subtitle,
      wrap: true,
      fill: EXCEL_COLOR.statHeader,
      fontColor: EXCEL_COLOR.statHeaderText,
      borderMedium: true,
    };
    const headers = [
      [colCedula, 'CÉDULA'],
      [colNombre, 'NOMBRE COMPLETO'],
      [colCorreo, 'CORREO'],
      [colCelular, 'CELULAR'],
      [colGrupo, 'GRUPO'],
      [colMonto, externo ? 'MATRÍCULA (Bs)' : 'MONTO TOTAL (Bs)'],
      [colPagado, 'PAGADO (Bs)'],
      [colSaldo, 'SALDO (Bs)'],
      [colEstadoMatricula, 'ESTADO MATRÍCULA'],
      [colEstadoCurso, externo ? 'APORTE CURSO (EXTERNO)' : 'ESTADO CURSO'],
      [colRequisitos, 'REQ. PENDIENTES'],
      [colFechaInscripcion, 'FECHA DE INSCRIPCIÓN'],
    ];
    headers.forEach(([col, text]) => c.cell(headRow, col, text, headStyle));
    c.ws.getRow(headRow).height = 56;
    c.freeze(headRow);

    // ---- Detalle: un participante por fila ----
    let row = headRow + 1;
    let totalSaldo = 0;
    let totalPagado = 0;
    participantes.forEach((p, idx) => {
      const zebra = idx % 2 === 1 ? EXCEL_COLOR.zebra : EXCEL_COLOR.white;
      const saldo = Number(p.saldo) || 0;
      totalSaldo += saldo;
      totalPagado += Number(p.totalPagado) || 0;
      c.cell(row, colCedula, p.ciCompleto ?? '—', { fill: zebra, size: label });
      c.cell(row, colNombre, String(p.nombreCompleto ?? '').toUpperCase(), {
        fill: zebra,
        align: 'left',
        size: label,
      });
      c.cell(row, colCorreo, p.correo ?? '—', { fill: zebra, align: 'left', size: label });
      c.cell(row, colCelular, p.celular ?? '—', { fill: zebra, size: label });
      c.cell(row, colGrupo, p.grupo ?? '—', { fill: zebra, align: 'left', size: label });
      const montoCell = c.cell(row, colMonto, Number(p.montoTotal) || 0, { fill: zebra, size: label });
      montoCell.numFmt = '#,##0.00';
      const pagadoCell = c.cell(row, colPagado, Number(p.totalPagado) || 0, { fill: zebra, size: label });
      pagadoCell.numFmt = '#,##0.00';
      const saldoCell = c.cell(row, colSaldo, saldo, { fill: zebra, bold: saldo > 0, size: label });
      saldoCell.numFmt = '#,##0.00';
      c.cell(row, colEstadoMatricula, p.estadoPagoMatricula ?? '—', { fill: zebra, size: label });
      c.cell(row, colEstadoCurso, p.estadoPagoCurso ?? '—', { fill: zebra, size: label });
      c.cell(row, colRequisitos, Number(p.requisitosPendientes) || 0, { fill: zebra, size: label });
      c.cell(row, colFechaInscripcion, fmtFecha(p.fechaInscripcion), { fill: zebra, size: label });
      c.ws.getRow(row).height = 26;
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
      `PAGADO TOTAL: ${totalPagado.toLocaleString('es-BO', { minimumFractionDigits: 2 })} Bs`
        + `   ·   SALDO PENDIENTE TOTAL: ${totalSaldo.toLocaleString('es-BO', { minimumFractionDigits: 2 })} Bs`,
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
