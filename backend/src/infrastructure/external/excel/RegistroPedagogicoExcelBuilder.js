/**
 * Genera el Registro Pedagógico Bimestral (.xlsx) — hojas CONSOLIDADO y PLANILLA CALIFICACIONES.
 * Fórmulas en español (ENTERO, SUMA, SI, CONTAR.SI) para compatibilidad con Excel/LibreOffice es-BO.
 */

import ExcelJS from 'exceljs';

const FONT = 'Arial';
const COLOR = {
  practicas: 'FFFFFF99',
  teoricas: 'FFC6EFCE',
  finalHeader: 'FF00B050',
  finalCell: 'FFC6EFCE',
  obsHeader: 'FFDDEEFF',
  zebra: 'FFF2F2F2',
  white: 'FFFFFFFF',
};

const THIN = { style: 'thin' };
const MEDIUM = { style: 'medium' };

const allBorders = (style = THIN) => ({
  top: style,
  left: style,
  bottom: style,
  right: style,
});

/** @param {number} col 1-based */
const colLetter = (col) => {
  let n = col;
  let s = '';
  while (n > 0) {
    const mod = (n - 1) % 26;
    s = String.fromCharCode(65 + mod) + s;
    n = Math.floor((n - mod) / 26);
  }
  return s;
};

const styleCell = (cell, opts = {}) => {
  cell.font = {
    name: FONT,
    size: opts.size ?? 9,
    bold: Boolean(opts.bold),
    color: opts.color ? { argb: opts.color } : undefined,
  };
  if (opts.fill) {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: opts.fill } };
  }
  cell.alignment = {
    horizontal: opts.align ?? 'center',
    vertical: 'middle',
    wrapText: Boolean(opts.wrap),
  };
  if (opts.border !== false) {
    cell.border = allBorders(opts.borderMedium ? MEDIUM : THIN);
  }
};

const mergeStyle = (ws, range, value, opts = {}) => {
  ws.mergeCells(range);
  const cell = ws.getCell(range.split(':')[0]);
  cell.value = value;
  styleCell(cell, opts);
};

/**
 * @param {import('exceljs').Worksheet} ws
 * @param {number} row
 * @param {number} colStart
 * @param {number} colEnd
 */
const applyRowRangeBorder = (ws, row, colStart, colEnd, outerMedium = false) => {
  for (let c = colStart; c <= colEnd; c += 1) {
    const cell = ws.getCell(row, c);
    const isLeft = c === colStart;
    const isRight = c === colEnd;
    cell.border = {
      top: outerMedium ? MEDIUM : THIN,
      bottom: outerMedium ? MEDIUM : THIN,
      left: isLeft && outerMedium ? MEDIUM : THIN,
      right: isRight && outerMedium ? MEDIUM : THIN,
    };
  }
};

/**
 * @param {Object} datos — payload del prompt oficial
 * @returns {Promise<Buffer>}
 */
export class RegistroPedagogicoExcelBuilder {
  static async generar(datos) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'INCOS Santa Cruz';
    workbook.created = new Date();

    const practicas = datos.evaluaciones_practicas ?? [];
    const teoricas = datos.evaluaciones_teoricas ?? [];
    const estudiantes = datos.estudiantes ?? [];

    const cols = this._buildColumnMap(practicas.length, teoricas.length);
    const ws1 = workbook.addWorksheet('CONSOLIDADO');
    this._buildConsolidado(ws1, datos, practicas, teoricas, estudiantes, cols);

    const ws2 = workbook.addWorksheet('PLANILLA CALIFICACIONES');
    this._buildPlanilla(ws2, datos, estudiantes, cols);

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  }

  static _buildColumnMap(numPract, numTeo) {
    const colNro = 2;
    const colNombre = 3;
    const colPractStart = 4;
    const colPractEnd = numPract > 0 ? colPractStart + numPract - 1 : colPractStart - 1;
    const colPromPract = colPractEnd + 1;
    const colTeoStart = colPromPract + 1;
    const colTeoEnd = numTeo > 0 ? colTeoStart + numTeo - 1 : colTeoStart - 1;
    const colPromTeo = colTeoEnd + 1;
    const colFinal = colPromTeo + 1;
    const colObs = colFinal + 1;
    const colNoPract = colObs + 1;
    const colNoTeo = colNoPract + 1;
    const colNoEval = colNoTeo + 1;
    const lastCol = colNoEval;

    const L = (n) => colLetter(n);
    return {
      colNro,
      colNombre,
      colPractStart,
      colPractEnd,
      colPromPract,
      colTeoStart,
      colTeoEnd,
      colPromTeo,
      colFinal,
      colObs,
      colNoPract,
      colNoTeo,
      colNoEval,
      lastCol,
      L,
      practRange: (row) =>
        numPract > 0 ? `${L(colPractStart)}${row}:${L(colPractEnd)}${row}` : `${L(colPractStart)}${row}`,
      teoRange: (row) =>
        numTeo > 0 ? `${L(colTeoStart)}${row}:${L(colTeoEnd)}${row}` : `${L(colTeoStart)}${row}`,
    };
  }

  static _buildConsolidado(ws, datos, practicas, teoricas, estudiantes, cols) {
    const { lastCol, L } = cols;
    const bimestreLabel = String(datos.bimestre ?? '').toUpperCase();
    const firstDataRow = 8;
    const lastDataRow = firstDataRow + Math.max(estudiantes.length, 1) - 1;

    ws.getColumn(1).width = 2;
    ws.getColumn(cols.colNombre).width = 35;
    for (let c = cols.colPractStart; c <= cols.colNoEval; c += 1) {
      if (c === cols.colPromPract || c === cols.colPromTeo) {
        ws.getColumn(c).width = 12;
      } else if (c === cols.colObs) {
        ws.getColumn(c).width = 14;
      } else if (c >= cols.colNoPract) {
        ws.getColumn(c).width = 10;
      } else {
        ws.getColumn(c).width = 8;
      }
    }

    mergeStyle(
      ws,
      `B1:${L(lastCol)}1`,
      `REGISTRO PEDAGOGICO - ${bimestreLabel} BIMESTRE`,
      { size: 14, bold: true, align: 'center' },
    );

    const setLabelValue = (labelCol, label, valCol, value) => {
      const lc = ws.getCell(`${labelCol}2`);
      lc.value = label;
      styleCell(lc, { bold: true, align: 'left' });
      const vc = ws.getCell(`${valCol}2`);
      vc.value = value;
      styleCell(vc, { align: 'left' });
    };

    ws.getCell('B2').value = 'CARRERA:';
    styleCell(ws.getCell('B2'), { bold: true, align: 'left' });
    ws.getCell('D2').value = datos.carrera ?? '';
    styleCell(ws.getCell('D2'), { align: 'left' });

    ws.getCell('B3').value = 'ASIGNATURA:';
    styleCell(ws.getCell('B3'), { bold: true, align: 'left' });
    ws.getCell('D3').value = datos.asignatura ?? '';
    styleCell(ws.getCell('D3'), { align: 'left' });

    ws.getCell('B4').value = 'CÓDIGO:';
    styleCell(ws.getCell('B4'), { bold: true, align: 'left' });
    ws.getCell('D4').value = datos.codigo_asignatura ?? '';
    styleCell(ws.getCell('D4'), { align: 'left' });

    ws.getCell('L2').value = 'DOCENTE:';
    styleCell(ws.getCell('L2'), { bold: true, align: 'left' });
    ws.getCell('N2').value = datos.docente ?? '';
    styleCell(ws.getCell('N2'), { align: 'left' });

    ws.getCell('L3').value = 'CURSO:';
    styleCell(ws.getCell('L3'), { bold: true, align: 'left' });
    ws.getCell('N3').value = `${datos.curso ?? ''}  PARALELO: ${datos.paralelo ?? ''}`;
    styleCell(ws.getCell('N3'), { align: 'left' });

    ws.getCell('L4').value = 'GESTIÓN:';
    styleCell(ws.getCell('L4'), { bold: true, align: 'left' });
    ws.getCell('N4').value = `${datos.gestion ?? ''}  BIMESTRE: ${bimestreLabel}`;
    styleCell(ws.getCell('N4'), { align: 'left' });

    const rowSec = 5;
    ws.getCell(rowSec, cols.colNro).value = 'Nº';
    styleCell(ws.getCell(rowSec, cols.colNro), { bold: true, size: 8, wrap: true });
    ws.getCell(rowSec, cols.colNombre).value = 'APELLIDO PATERNO APELLIDO MATERNO NOMBRES';
    styleCell(ws.getCell(rowSec, cols.colNombre), { bold: true, size: 8, wrap: true, align: 'center' });

    if (practicas.length > 0) {
      mergeStyle(
        ws,
        `${L(cols.colPractStart)}${rowSec}:${L(cols.colPromPract)}${rowSec}`,
        'EVALUACIONES PRACTICAS 70 %',
        { bold: true, size: 8, fill: COLOR.practicas, wrap: true },
      );
    }
    if (teoricas.length > 0) {
      mergeStyle(
        ws,
        `${L(cols.colTeoStart)}${rowSec}:${L(cols.colPromTeo)}${rowSec}`,
        'EVALUACIONES TÉORICAS 30 %',
        { bold: true, size: 8, fill: COLOR.teoricas, wrap: true },
      );
    }

    const finalCell = ws.getCell(rowSec, cols.colFinal);
    finalCell.value = 'CALIFICACION FINAL';
    styleCell(finalCell, { bold: true, size: 8, fill: COLOR.finalHeader, color: 'FFFFFFFF', wrap: true });

    const obsTitles = [
      { col: cols.colObs, text: 'OBSERVACIONES' },
      { col: cols.colNoPract, text: 'PRÁCTICOS O ACTIVIADES NO PRESENTADOS' },
      { col: cols.colNoTeo, text: 'EXAMENES NO PRESENTADAS' },
      { col: cols.colNoEval, text: 'EVALUACIONES NO PRESENTADAS' },
    ];
    obsTitles.forEach(({ col, text }) => {
      const cell = ws.getCell(rowSec, col);
      cell.value = text;
      styleCell(cell, { bold: true, size: 8, fill: COLOR.obsHeader, wrap: true });
    });

    applyRowRangeBorder(ws, rowSec, cols.colNro, lastCol, true);

    const rowNames = 6;
    practicas.forEach((ev, i) => {
      const cell = ws.getCell(rowNames, cols.colPractStart + i);
      cell.value = ev.nombre ?? '';
      styleCell(cell, { bold: true, size: 8, fill: COLOR.practicas, wrap: true });
    });
    const promPractHeader = ws.getCell(rowNames, cols.colPromPract);
    promPractHeader.value = 'PROM. DE EVALUAC. PRACTICAS\n0.7';
    styleCell(promPractHeader, { bold: true, size: 8, fill: COLOR.practicas, wrap: true });

    teoricas.forEach((ev, i) => {
      const cell = ws.getCell(rowNames, cols.colTeoStart + i);
      cell.value = ev.nombre ?? '';
      styleCell(cell, { bold: true, size: 8, fill: COLOR.teoricas, wrap: true });
    });
    const promTeoHeader = ws.getCell(rowNames, cols.colPromTeo);
    promTeoHeader.value = 'PROM. DE EVALUAC. TEORICAS\n0.3';
    styleCell(promTeoHeader, { bold: true, size: 8, fill: COLOR.teoricas, wrap: true });

    applyRowRangeBorder(ws, rowNames, cols.colNro, lastCol, true);

    const rowMax = 7;
    practicas.forEach((ev, i) => {
      const cell = ws.getCell(rowMax, cols.colPractStart + i);
      cell.value = ev.puntaje_maximo ?? 0;
      styleCell(cell, { size: 8, fill: COLOR.practicas });
    });
    ws.getCell(rowMax, cols.colPromPract).value = 0.7;
    styleCell(ws.getCell(rowMax, cols.colPromPract), { size: 8, fill: COLOR.practicas });

    teoricas.forEach((ev, i) => {
      const cell = ws.getCell(rowMax, cols.colTeoStart + i);
      cell.value = ev.puntaje_maximo ?? 0;
      styleCell(cell, { size: 8, fill: COLOR.teoricas });
    });
    ws.getCell(rowMax, cols.colPromTeo).value = 0.3;
    styleCell(ws.getCell(rowMax, cols.colPromTeo), { size: 8, fill: COLOR.teoricas });

    applyRowRangeBorder(ws, rowMax, cols.colNro, lastCol, true);

    estudiantes.forEach((est, idx) => {
      const row = firstDataRow + idx;
      const zebra = idx % 2 === 1 ? COLOR.zebra : COLOR.white;

      ws.getCell(row, cols.colNro).value = est.nro ?? idx + 1;
      styleCell(ws.getCell(row, cols.colNro), { fill: zebra });

      ws.getCell(row, cols.colNombre).value = String(est.nombre ?? '').toUpperCase();
      styleCell(ws.getCell(row, cols.colNombre), { fill: zebra, align: 'left' });

      (est.notas_practicas ?? []).forEach((nota, i) => {
        const cell = ws.getCell(row, cols.colPractStart + i);
        cell.value = nota ?? 0;
        styleCell(cell, { fill: zebra });
      });

      const promPractCell = ws.getCell(row, cols.colPromPract);
      promPractCell.value = {
        formula: `ENTERO(SUMA(${cols.practRange(row)})*0.7)`,
      };
      styleCell(promPractCell, { fill: COLOR.practicas });

      (est.notas_teoricas ?? []).forEach((nota, i) => {
        const cell = ws.getCell(row, cols.colTeoStart + i);
        cell.value = nota ?? 0;
        styleCell(cell, { fill: zebra });
      });

      const promTeoCell = ws.getCell(row, cols.colPromTeo);
      promTeoCell.value = {
        formula: `ENTERO(SUMA(${cols.teoRange(row)})*0.3)`,
      };
      styleCell(promTeoCell, { fill: COLOR.teoricas });

      const finalCellRow = ws.getCell(row, cols.colFinal);
      finalCellRow.value = {
        formula: `${L(cols.colPromPract)}${row}+${L(cols.colPromTeo)}${row}`,
      };
      styleCell(finalCellRow, { fill: COLOR.finalCell, bold: true });

      const obsCell = ws.getCell(row, cols.colObs);
      obsCell.value = {
        formula: `SI(${L(cols.colFinal)}${row}>=51,"APROBADO/A",SI(${L(cols.colFinal)}${row}=0,"NO SE PRESENTO","REPROBADO/A"))`,
      };
      styleCell(obsCell, { fill: COLOR.obsHeader, wrap: true });

      ws.getCell(row, cols.colNoPract).value = {
        formula: `CONTAR.SI(${cols.practRange(row)},0)`,
      };
      styleCell(ws.getCell(row, cols.colNoPract), { fill: zebra });

      ws.getCell(row, cols.colNoTeo).value = {
        formula: `CONTAR.SI(${cols.teoRange(row)},0)`,
      };
      styleCell(ws.getCell(row, cols.colNoTeo), { fill: zebra });

      ws.getCell(row, cols.colNoEval).value = {
        formula: `${L(cols.colNoPract)}${row}+${L(cols.colNoTeo)}${row}`,
      };
      styleCell(ws.getCell(row, cols.colNoEval), { fill: zebra });
    });

    const statsStart = lastDataRow + 3;
    const obsCol = L(cols.colObs);
    const stats = [
      ['APROBADOS:', `CONTAR.SI(${obsCol}${firstDataRow}:${obsCol}${lastDataRow},"APROBADO/A")`],
      ['REPROBADOS:', `CONTAR.SI(${obsCol}${firstDataRow}:${obsCol}${lastDataRow},"REPROBADO/A")`],
      ['NO SE PRESENTO:', `CONTAR.SI(${obsCol}${firstDataRow}:${obsCol}${lastDataRow},"NO SE PRESENTO")`],
    ];
    stats.forEach(([label, formula], i) => {
      const row = statsStart + i;
      ws.getCell(row, cols.colNombre).value = label;
      styleCell(ws.getCell(row, cols.colNombre), { bold: true, align: 'left' });
      ws.getCell(row, cols.colNombre + 1).value = { formula };
      styleCell(ws.getCell(row, cols.colNombre + 1), { align: 'left' });
    });
    const totalRow = statsStart + 3;
    ws.getCell(totalRow, cols.colNombre).value = 'TOTAL:';
    styleCell(ws.getCell(totalRow, cols.colNombre), { bold: true, align: 'left' });
    ws.getCell(totalRow, cols.colNombre + 1).value = {
      formula: `${L(cols.colNombre + 1)}${statsStart}+${L(cols.colNombre + 1)}${statsStart + 1}+${L(cols.colNombre + 1)}${statsStart + 2}`,
    };
    styleCell(ws.getCell(totalRow, cols.colNombre + 1), { align: 'left' });
  }

  static _buildPlanilla(ws, datos, estudiantes, cols) {
    const bimestreLabel = String(datos.bimestre ?? '').toUpperCase();
    const firstDataRow = 11;
    const lastDataRow = firstDataRow + Math.max(estudiantes.length, 1) - 1;
    const { L } = cols;

    ws.getColumn(1).width = 2;
    ws.getColumn(2).width = 5;
    ws.getColumn(3).width = 35;
    ws.getColumn(4).width = 6;
    ws.getColumn(5).width = 12;
    ws.getColumn(6).width = 3;
    ws.getColumn(7).width = 10;
    ws.getColumn(8).width = 10;
    ws.getColumn(9).width = 10;
    ws.getColumn(10).width = 14;

    mergeStyle(
      ws,
      'B1:J1',
      `PLANILLA DE REGISTRO PEDAGOGICO DE CALIFICACIONES - ${bimestreLabel} BIMESTRE`,
      { size: 12, bold: true, align: 'center' },
    );

    const headerRows = [
      ['B2', 'CARRERA:', 'C3', datos.carrera],
      ['B3', 'CURSO:', 'C3', `${datos.curso ?? ''}  PARALELO: ${datos.paralelo ?? ''}`],
      ['B4', 'ASIGNATURA:', 'C4', datos.asignatura],
      ['B5', 'CÓDIGO:', 'C5', `${datos.codigo_asignatura ?? ''}  GESTIÓN: ${datos.gestion ?? ''}`],
      ['B6', 'DOCENTE:', 'C6', datos.docente],
    ];
    headerRows.forEach(([lc, label, vc, value]) => {
      ws.getCell(lc).value = label;
      styleCell(ws.getCell(lc), { bold: true, align: 'left' });
      ws.getCell(vc).value = value;
      styleCell(ws.getCell(vc), { align: 'left' });
    });

    const r9 = 9;
    const r10 = 10;
    ['Nº', 'NOMBRES', 'Sexo', 'C.I.'].forEach((h, i) => {
      const cell = ws.getCell(r9, 2 + i);
      cell.value = h;
      styleCell(cell, { bold: true, size: 8, wrap: true });
      ws.mergeCells(r9, 2 + i, r10, 2 + i);
    });

    mergeStyle(ws, `G${r9}:I${r9}`, 'PARCIAL', { bold: true, size: 8 });
    ws.getCell(r10, 7).value = 'Teoría\n30';
    ws.getCell(r10, 8).value = 'Práctica\n70';
    ws.getCell(r10, 9).value = 'NOTA';
    [7, 8, 9].forEach((c) => styleCell(ws.getCell(r10, c), { bold: true, size: 8, wrap: true }));

    ws.getCell(r9, 10).value = 'Observaciones';
    styleCell(ws.getCell(r9, 10), { bold: true, size: 8, wrap: true });
    ws.mergeCells(r9, 10, r10, 10);

    estudiantes.forEach((est, idx) => {
      const row = firstDataRow + idx;
      ws.getCell(row, 2).value = est.nro ?? idx + 1;
      styleCell(ws.getCell(row, 2));
      ws.getCell(row, 3).value = String(est.nombre ?? '').toUpperCase();
      styleCell(ws.getCell(row, 3), { align: 'left' });
      ws.getCell(row, 4).value = est.sexo ?? '';
      styleCell(ws.getCell(row, 4));
      ws.getCell(row, 5).value = est.ci ?? '';
      styleCell(ws.getCell(row, 5));

      ws.getCell(row, 7).value = {
        formula: `CONSOLIDADO!${L(cols.colPromTeo)}${8 + idx}`,
      };
      styleCell(ws.getCell(row, 7));

      ws.getCell(row, 8).value = {
        formula: `CONSOLIDADO!${L(cols.colPromPract)}${8 + idx}`,
      };
      styleCell(ws.getCell(row, 8));

      ws.getCell(row, 9).value = { formula: `G${row}+H${row}` };
      styleCell(ws.getCell(row, 9), { bold: true });

      ws.getCell(row, 10).value = {
        formula: `SI(I${row}>=51,"APROBADO/A",SI(I${row}=0,"NO SE PRESENTO","REPROBADO/A"))`,
      };
      styleCell(ws.getCell(row, 10), { wrap: true });
    });

    const footerRow = lastDataRow + 3;
    ws.getCell(footerRow, 2).value = `LUGAR Y FECHA: ${datos.fecha_emision ?? ''}`;
    styleCell(ws.getCell(footerRow, 2), { align: 'left' });
    ws.mergeCells(footerRow, 2, footerRow, 6);

    const statRow = footerRow + 2;
    ws.getCell(statRow, 3).value = 'ESTADÍSTICAS:';
    styleCell(ws.getCell(statRow, 3), { bold: true, align: 'left' });

    const statHeader = statRow + 1;
    const labels = ['Inscritos', 'Abandonos', 'Reprobados', 'Aprobados', 'Promedio'];
    labels.forEach((lbl, i) => {
      ws.getCell(statHeader, 3 + i).value = lbl;
      styleCell(ws.getCell(statHeader, 3 + i), { bold: true, size: 8, wrap: true });
    });
    ws.getCell(statHeader + 1, 3).value = 'F';
    ws.getCell(statHeader + 1, 4).value = 'M';
    ws.getCell(statHeader + 2, 3).value = 'F';
    ws.getCell(statHeader + 2, 4).value = 'M';
    ws.getCell(statHeader + 3, 3).value = 'F';
    ws.getCell(statHeader + 3, 4).value = 'M';
    ws.getCell(statHeader + 4, 3).value = 'F';
    ws.getCell(statHeader + 4, 4).value = 'M';

    const sexoCol = 4;
    const notaCol = 9;
    const obsCol = 10;
    const inscF = statHeader + 1;
    const inscM = statHeader + 2;
    ws.getCell(inscF, 5).value = {
      formula: `CONTAR.SI(${L(sexoCol)}${firstDataRow}:${L(sexoCol)}${lastDataRow},"F")`,
    };
    ws.getCell(inscM, 5).value = {
      formula: `CONTAR.SI(${L(sexoCol)}${firstDataRow}:${L(sexoCol)}${lastDataRow},"M")`,
    };

    const obsRange = `${L(obsCol)}${firstDataRow}:${L(obsCol)}${lastDataRow}`;
    ws.getCell(statHeader + 3, 5).value = {
      formula: `CONTAR.SI(${obsRange},"REPROBADO/A")`,
    };
    ws.getCell(statHeader + 4, 5).value = {
      formula: `CONTAR.SI(${obsRange},"APROBADO/A")`,
    };
    ws.getCell(statHeader + 5, 5).value = {
      formula: `PROMEDIO.SI(${obsRange},"APROBADO/A",${L(notaCol)}${firstDataRow}:${L(notaCol)}${lastDataRow})`,
    };

    const firmaRow = statHeader + 7;
    ws.getCell(firmaRow, 3).value = 'DOCENTE (Sello y Firma)';
    styleCell(ws.getCell(firmaRow, 3), { align: 'left' });
    ws.mergeCells(firmaRow, 3, firmaRow, 7);
    ws.getCell(firmaRow + 1, 3).border = { bottom: MEDIUM };
    ws.mergeCells(firmaRow + 1, 3, firmaRow + 1, 7);
  }
}

export default RegistroPedagogicoExcelBuilder;
