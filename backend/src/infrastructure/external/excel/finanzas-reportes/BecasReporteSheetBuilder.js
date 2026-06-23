/**
 * BecasReporteSheetBuilder — construye la ÚNICA hoja de la Planilla de Control de
 * Becas por carrera: tabla por carrera (matriculados, tramos de beca, total con
 * beca, % con beca, % cobertura), fila de TOTALES GENERALES y, debajo, bloques de
 * estadística (RESUMEN POR TIPO DE BECA + RESUMEN GENERAL).
 *
 * Solo construcción + estilos (vía ExcelSheetComposer + ExcelTheme). Las columnas
 * de tramo se derivan de `porcentajes` (no se hardcodean). Cabecera institucional
 * en VERDE primario (#196B45 = EXCEL_COLOR.statHeader/band).
 */

import { EXCEL_COLOR, EXCEL_FONT_SIZE, colLetter as L } from '../shared/index.js';

const fmtPct = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return `${safe.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
};

export class BecasReporteSheetBuilder {
  /**
   * @param {Object} params
   * @param {import('../shared/ExcelSheetComposer.js').ExcelSheetComposer} params.composer
   * @param {Object} params.datos - Payload del reporte de becas.
   */
  static build({ composer: c, datos }) {
    const { label, body } = EXCEL_FONT_SIZE;
    const porcentajes = Array.isArray(datos.porcentajes) ? datos.porcentajes : [];
    const filas = Array.isArray(datos.filas) ? datos.filas : [];
    const totales = datos.totales ?? {};
    const distribucion = Array.isArray(datos.distribucion) ? datos.distribucion : [];
    const resumen = datos.resumen ?? {};

    // ---- Mapa de columnas (1-based; col 1 = margen) ----
    const colNro = 2;
    const colCarrera = 3;
    const colModalidad = 4;
    const colMatric = 5;
    const colTramoStart = 6;
    const colTramoEnd = colTramoStart + Math.max(porcentajes.length - 1, 0);
    const hayTramos = porcentajes.length > 0;
    const colTotalBeca = (hayTramos ? colTramoEnd : colMatric) + 1;
    const colPctBeca = colTotalBeca + 1;
    const colPctCobertura = colPctBeca + 1;
    const colObs = colPctCobertura + 1;
    const lastCol = colObs;

    // ---- Anchos ----
    c.colWidths({ 1: 3, [colNro]: 8, [colCarrera]: 44, [colModalidad]: 20, [colMatric]: 18 });
    for (let col = colTramoStart; col <= colTramoEnd; col += 1) c.colWidths({ [col]: 17 });
    c.colWidths({ [colTotalBeca]: 19, [colPctBeca]: 18, [colPctCobertura]: 20, [colObs]: 34 });

    // ---- Banda de título + cabecera institucional ----
    c.bandTitle(`B1:${L(lastCol)}1`, 'PLANILLA DE CONTROL DE BECAS POR CARRERA (ANUALIZADAS)');
    c.merge(`B2:${L(lastCol)}2`, 'INSTITUTO TÉCNICO INCOS SANTA CRUZ', {
      bold: true,
      size: body,
      fontColor: EXCEL_COLOR.inkSoft,
      border: false,
    });
    const gestionLabel = datos.gestion?.nombre ?? datos.gestion?.anio ?? '';
    c.infoField('B3:C3', 'GESTIÓN:', `D3:${L(colMatric)}3`, String(gestionLabel || '—'));
    c.infoField(
      `${L(colTotalBeca)}3:${L(colTotalBeca)}3`,
      'FECHA EMISIÓN:',
      `${L(colPctBeca)}3:${L(colObs)}3`,
      datos.fechaEmision ?? ''
    );

    // ---- Cabecera de tabla (filas 5-6) ----
    const rowTop = 5;
    const rowSub = 6;
    const headStyle = {
      bold: true,
      size: label,
      wrap: true,
      fill: EXCEL_COLOR.statHeader,
      fontColor: EXCEL_COLOR.statHeaderText,
      borderMedium: true,
    };
    const headBox = (col, text) => {
      c.ws.mergeCells(rowTop, col, rowSub, col);
      c.cell(rowTop, col, text, headStyle);
    };
    headBox(colNro, 'Nº');
    headBox(colCarrera, 'CARRERA');
    headBox(colModalidad, 'MODALIDAD');
    headBox(colMatric, 'Nº MATRICULADOS');
    if (hayTramos) {
      c.merge(`${L(colTramoStart)}${rowTop}:${L(colTramoEnd)}${rowTop}`, 'ESTUDIANTES CON BECA POR TIPO', headStyle);
      porcentajes.forEach((p, i) => c.cell(rowSub, colTramoStart + i, `BECA ${p}%`, headStyle));
    }
    headBox(colTotalBeca, 'TOTAL CON BECA');
    headBox(colPctBeca, '% CON BECA');
    headBox(colPctCobertura, '% COBERTURA');
    headBox(colObs, 'OBSERVACIONES');
    c.ws.getRow(rowTop).height = 20;
    c.ws.getRow(rowSub).height = 34;

    // ---- Filas por carrera ----
    const firstDataRow = rowSub + 1;
    filas.forEach((fila, idx) => {
      const row = firstDataRow + idx;
      const zebra = idx % 2 === 1 ? EXCEL_COLOR.zebra : EXCEL_COLOR.white;
      c.cell(row, colNro, idx + 1, { fill: zebra, size: label });
      c.cell(row, colCarrera, String(fila.carreraNombre ?? '').toUpperCase(), {
        fill: zebra,
        align: 'left',
        size: label,
      });
      c.cell(row, colModalidad, fila.modalidad ?? 'ANUALIZADA', { fill: zebra, size: label });
      c.cell(row, colMatric, Number(fila.totalMatriculados) || 0, { fill: zebra, size: label });
      porcentajes.forEach((p, i) => {
        const val = Number(fila.becasPorPorcentaje?.[String(p)]) || 0;
        c.cell(row, colTramoStart + i, val, { fill: zebra, size: label });
      });
      c.cell(row, colTotalBeca, Number(fila.totalConBeca) || 0, {
        fill: zebra,
        bold: true,
        size: label,
      });
      c.cell(row, colPctBeca, fmtPct(fila.porcentajeConBeca), { fill: zebra, size: label });
      c.cell(row, colPctCobertura, fmtPct(fila.porcentajeCobertura), { fill: zebra, size: label });
      c.cell(row, colObs, '', { fill: zebra, size: label });
      c.ws.getRow(row).height = 24;
    });

    // ---- Fila de TOTALES GENERALES ----
    const totalRow = firstDataRow + Math.max(filas.length, 0);
    const totalFill = EXCEL_COLOR.teoricasStrong;
    c.merge(`${L(colNro)}${totalRow}:${L(colModalidad)}${totalRow}`, 'TOTALES GENERALES', {
      bold: true,
      align: 'right',
      fill: totalFill,
      size: label,
    });
    const tStyle = { bold: true, fill: totalFill, size: label };
    c.cell(totalRow, colMatric, Number(totales.totalMatriculados) || 0, tStyle);
    porcentajes.forEach((p, i) => {
      const val = Number(totales.becasPorPorcentaje?.[String(p)]) || 0;
      c.cell(totalRow, colTramoStart + i, val, tStyle);
    });
    c.cell(totalRow, colTotalBeca, Number(totales.totalConBeca) || 0, tStyle);
    c.cell(totalRow, colPctBeca, fmtPct(totales.porcentajeConBeca), tStyle);
    c.cell(totalRow, colPctCobertura, fmtPct(totales.porcentajeConBeca), tStyle);
    c.cell(totalRow, colObs, '', tStyle);

    // ---- Bloques de estadística ----
    this._resumenPorTipo(c, {
      startRow: totalRow + 3,
      distribucion,
      totalConBeca: Number(totales.totalConBeca) || 0,
    });
    this._resumenGeneral(c, {
      startRow: totalRow + 3,
      col: colTotalBeca,
      resumen,
    });

    // Congela solo la cabecera (scroll vertical); las columnas NO quedan fijas al
    // desplazar en horizontal (xSplit = 0).
    c.freeze(rowSub);
  }

  /** RESUMEN GENERAL POR TIPO DE BECA (tipo / beneficiados / % del total con beca). */
  static _resumenPorTipo(c, { startRow, distribucion, totalConBeca }) {
    const { label } = EXCEL_FONT_SIZE;
    const c0 = 2;
    c.merge(`${L(c0)}${startRow}:${L(c0 + 2)}${startRow}`, 'RESUMEN GENERAL POR TIPO DE BECA', {
      bold: true,
      fill: EXCEL_COLOR.statHeader,
      fontColor: EXCEL_COLOR.statHeaderText,
      size: label,
      borderMedium: true,
    });
    const headRow = startRow + 1;
    ['TIPO DE BECA', 'BENEFICIADOS', '% DEL TOTAL'].forEach((t, i) =>
      c.cell(headRow, c0 + i, t, {
        bold: true,
        size: label,
        wrap: true,
        fill: EXCEL_COLOR.teoricasStrong,
      })
    );
    distribucion.forEach((tramo, idx) => {
      const row = headRow + 1 + idx;
      const zebra = idx % 2 === 1 ? EXCEL_COLOR.zebra : EXCEL_COLOR.white;
      c.cell(row, c0, tramo.etiqueta ?? `Beca ${tramo.porcentaje}%`, { align: 'left', fill: zebra, size: label });
      c.cell(row, c0 + 1, Number(tramo.beneficiados) || 0, { fill: zebra, size: label });
      c.cell(row, c0 + 2, fmtPct(tramo.porcentajeDelTotalConBeca), { fill: zebra, size: label });
    });
    const totalRow = headRow + 1 + distribucion.length;
    const tStyle = { bold: true, fill: EXCEL_COLOR.teoricasStrong, size: label };
    c.cell(totalRow, c0, 'TOTAL GENERAL', { ...tStyle, align: 'left' });
    c.cell(totalRow, c0 + 1, totalConBeca, tStyle);
    c.cell(totalRow, c0 + 2, fmtPct(100), tStyle);
  }

  /** RESUMEN GENERAL (matriculados / con beca / % con beca / % sin beca). */
  static _resumenGeneral(c, { startRow, col, resumen }) {
    const { label } = EXCEL_FONT_SIZE;
    c.merge(`${L(col)}${startRow}:${L(col + 1)}${startRow}`, 'RESUMEN GENERAL', {
      bold: true,
      fill: EXCEL_COLOR.statHeader,
      fontColor: EXCEL_COLOR.statHeaderText,
      size: label,
      borderMedium: true,
    });
    const filas = [
      ['Total de estudiantes matriculados', Number(resumen.totalMatriculados) || 0],
      ['Total de estudiantes con beca', Number(resumen.totalConBeca) || 0],
      ['% general de estudiantes con beca', fmtPct(resumen.porcentajeConBeca)],
      ['% de estudiantes sin beca', fmtPct(resumen.porcentajeSinBeca)],
    ];
    filas.forEach(([rotulo, value], idx) => {
      const row = startRow + 1 + idx;
      const zebra = idx % 2 === 1 ? EXCEL_COLOR.zebra : EXCEL_COLOR.white;
      c.cell(row, col, rotulo, { align: 'left', fill: zebra, size: label });
      c.cell(row, col + 1, value, { bold: true, fill: zebra, size: label });
    });
  }
}

export default BecasReporteSheetBuilder;
