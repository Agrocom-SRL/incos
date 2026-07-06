/**
 * BecasReporteSheetBuilder — construye la ÚNICA hoja de la Planilla de Control de
 * Becas por carrera, agrupada por CARRERA → PARALELO → ESTUDIANTES BECADOS (mismo
 * concepto que `CuentasPorCobrarSheetBuilder`: banda de carrera (merge) → banda de
 * paralelo (merge) → filas de estudiante becado), seguida de RESUMEN TOTAL POR
 * CARRERA, RESUMEN GENERAL POR TIPO DE BECA y RESUMEN GENERAL.
 *
 * El árbol llega como carrera → periodo → paralelo; el nivel PERIODO no se pinta
 * como banda propia (el nombre del paralelo ya distingue el año, p. ej.
 * "PRIMERO A"), igual que la pantalla (`BecasCarreraSection`). Solo se listan
 * paralelos/carreras con al menos un estudiante BECADO — el use case ya entrega
 * `estudiantes[]` filtrado a becados por paralelo.
 *
 * Solo construcción + estilos (vía ExcelSheetComposer + ExcelTheme). Cabecera
 * institucional en VERDE primario (#196B45 = EXCEL_COLOR.statHeader/band).
 */

import { EXCEL_COLOR, EXCEL_FONT_SIZE, colLetter as L } from '../shared/index.js';

const fmtPct = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return `${safe.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
};

/** Nombre completo del estudiante (apellidos + nombres), en mayúsculas. */
const nombreCompleto = (est) => {
  const apellidos = [est.apellidoPaterno, est.apellidoMaterno].filter(Boolean).join(' ');
  const partes = [apellidos, est.nombres].filter(Boolean).join(' ');
  return partes ? partes.toUpperCase() : 'SIN NOMBRE';
};

/**
 * Aplana periodos → paralelos de una carrera (se omite el nivel periodo como
 * banda propia). Conserva solo paralelos con al menos un becado.
 * @param {Object} carrera
 * @returns {Array<Object>} paralelos con `estudiantes` (becados) no vacío.
 */
const paralelosBecados = (carrera) => {
  const periodos = Array.isArray(carrera.children) ? carrera.children : [];
  const out = [];
  periodos.forEach((periodo) => {
    const paralelos = Array.isArray(periodo.children) ? periodo.children : [];
    paralelos.forEach((paralelo) => {
      if (Array.isArray(paralelo.estudiantes) && paralelo.estudiantes.length > 0) {
        out.push(paralelo);
      }
    });
  });
  return out;
};

export class BecasReporteSheetBuilder {
  /**
   * @param {Object} params
   * @param {import('../shared/ExcelSheetComposer.js').ExcelSheetComposer} params.composer
   * @param {Object} params.datos - Payload del reporte de becas.
   */
  static build({ composer: c, datos }) {
    const { label, body } = EXCEL_FONT_SIZE;
    const distribucion = Array.isArray(datos.distribucion) ? datos.distribucion : [];
    const resumen = datos.resumen ?? {};

    // Solo carreras con al menos un paralelo con becados.
    const carreras = (Array.isArray(datos.filas) ? datos.filas : [])
      .map((carrera) => ({ carrera, paralelos: paralelosBecados(carrera) }))
      .filter((item) => item.paralelos.length > 0);

    // ---- Mapa de columnas (1-based; col 1 = margen) ----
    const colNro = 2;
    const colEstudiante = 3;
    const colCi = 4;
    const colBeca = 5;
    const colPctBeca = 6;
    const colDescuento = 7;
    const colMontoBase = 8;
    const lastCol = colMontoBase;

    c.colWidths({
      1: 4,
      [colNro]: 8,
      [colEstudiante]: 48,
      [colCi]: 16,
      [colBeca]: 40,
      [colPctBeca]: 14,
      [colDescuento]: 20,
      [colMontoBase]: 20,
    });

    // ---- Banda de título + cabecera institucional ----
    c.bandTitle(`B1:${L(lastCol)}1`, 'PLANILLA DE CONTROL DE BECAS POR CARRERA (ANUALIZADAS)');
    c.merge(`B2:${L(lastCol)}2`, 'INSTITUTO TÉCNICO INCOS SANTA CRUZ', {
      bold: true,
      size: body,
      fontColor: EXCEL_COLOR.inkSoft,
      border: false,
    });
    const gestionLabel = datos.gestion?.nombre ?? datos.gestion?.anio ?? '';
    c.infoField('B3:C3', 'GESTIÓN:', `D3:${L(colBeca)}3`, String(gestionLabel || '—'));
    c.infoField(
      `${L(colPctBeca)}3:${L(colPctBeca)}3`,
      'FECHA EMISIÓN:',
      `${L(colDescuento)}3:${L(colMontoBase)}3`,
      datos.fechaEmision ?? ''
    );

    // ---- Cabecera de columnas ----
    const headRow = 5;
    const headStyle = {
      bold: true,
      size: label,
      wrap: true,
      fill: EXCEL_COLOR.statHeader,
      fontColor: EXCEL_COLOR.statHeaderText,
      borderMedium: true,
    };
    const headers = [
      [colNro, 'Nº'],
      [colEstudiante, 'ESTUDIANTE'],
      [colCi, 'CI'],
      [colBeca, 'TIPO DE BECA'],
      [colPctBeca, '% BECA'],
      [colDescuento, 'DESCUENTO (Bs)'],
      [colMontoBase, 'MONTO BASE (Bs)'],
    ];
    headers.forEach(([col, text]) => c.cell(headRow, col, text, headStyle));
    c.ws.getRow(headRow).height = 30;
    // Congela solo la cabecera (scroll vertical); las columnas NO quedan fijas al
    // desplazar en horizontal (xSplit = 0).
    c.freeze(headRow);

    const money = (row, col, value, style) => {
      const cell = c.cell(row, col, Number(value) || 0, style);
      cell.numFmt = '#,##0.00';
      return cell;
    };

    // ---- Detalle: carrera → paralelo → estudiantes becados ----
    let row = headRow + 1;
    let zebraIdx = 0;
    carreras.forEach(({ carrera, paralelos }) => {
      c.merge(
        `${L(colNro)}${row}:${L(lastCol)}${row}`,
        `${String(carrera.carreraNombre ?? '').toUpperCase()}   ·   ${Number(carrera.totalConBeca) || 0} con beca   ·   Cobertura ${fmtPct(carrera.porcentajeCobertura)}`,
        { bold: true, align: 'left', fill: EXCEL_COLOR.statHeader, fontColor: EXCEL_COLOR.statHeaderText, size: label }
      );
      row += 1;

      paralelos.forEach((paralelo) => {
        const turno = paralelo.paraleloTurno ? ` · ${paralelo.paraleloTurno}` : '';
        c.merge(
          `${L(colNro)}${row}:${L(lastCol)}${row}`,
          `Paralelo ${paralelo.paraleloNombre ?? '—'}${turno}   ·   Nº matriculados: ${Number(paralelo.totalMatriculados) || 0}   ·   Con beca: ${Number(paralelo.totalConBeca) || 0}   ·   Cobertura: ${fmtPct(paralelo.porcentajeCobertura)}`,
          { bold: true, align: 'left', fill: EXCEL_COLOR.teoricasStrong, size: label }
        );
        row += 1;

        (paralelo.estudiantes || []).forEach((est, idx) => {
          const zebra = zebraIdx % 2 === 1 ? EXCEL_COLOR.zebra : EXCEL_COLOR.white;
          zebraIdx += 1;
          c.cell(row, colNro, idx + 1, { fill: zebra, size: label });
          c.cell(row, colEstudiante, nombreCompleto(est), { fill: zebra, align: 'left', size: label });
          c.cell(row, colCi, est.ci ?? '—', { fill: zebra, size: label });
          c.cell(row, colBeca, est.becaNombre ?? 'Con beca', { fill: zebra, align: 'left', size: label });
          c.cell(row, colPctBeca, fmtPct(est.becaPorcentaje), { fill: zebra, size: label });
          money(row, colDescuento, est.montoDescuento, { fill: zebra, size: label });
          money(row, colMontoBase, est.montoBase, { fill: zebra, size: label });
          c.ws.getRow(row).height = 22;
          row += 1;
        });
      });
    });

    // ---- Resúmenes ----
    row += 1;
    row = this._resumenPorCarrera(c, {
      startRow: row,
      carreras: carreras.map((item) => item.carrera),
    });
    row += 1;
    this._resumenPorTipo(c, {
      startRow: row,
      distribucion,
      totalConBeca: Number(resumen.totalConBeca) || 0,
    });
    this._resumenGeneral(c, {
      startRow: row,
      col: colBeca,
      resumen,
    });
  }

  /** RESUMEN TOTAL POR CARRERA (matriculados / con beca / % con beca / % cobertura). @returns {number} fila siguiente libre. */
  static _resumenPorCarrera(c, { startRow, carreras }) {
    const { label } = EXCEL_FONT_SIZE;
    const c0 = 2;
    c.merge(`${L(c0)}${startRow}:${L(c0 + 3)}${startRow}`, 'RESUMEN TOTAL POR CARRERA', {
      bold: true,
      fill: EXCEL_COLOR.statHeader,
      fontColor: EXCEL_COLOR.statHeaderText,
      size: label,
      borderMedium: true,
    });
    const headRow = startRow + 1;
    const cols = [
      [c0, 'CARRERA', 'left'],
      [c0 + 1, 'Nº MATRICULADOS', 'center'],
      [c0 + 2, 'TOTAL CON BECA', 'center'],
      [c0 + 3, '% COBERTURA', 'center'],
    ];
    cols.forEach(([col, text]) =>
      c.cell(headRow, col, text, {
        bold: true,
        size: label,
        wrap: true,
        fill: EXCEL_COLOR.teoricasStrong,
      })
    );
    let totMatric = 0;
    let totConBeca = 0;
    carreras.forEach((carrera, idx) => {
      const row = headRow + 1 + idx;
      const zebra = idx % 2 === 1 ? EXCEL_COLOR.zebra : EXCEL_COLOR.white;
      c.cell(row, c0, String(carrera.carreraNombre ?? '').toUpperCase(), { align: 'left', fill: zebra, size: label });
      c.cell(row, c0 + 1, Number(carrera.totalMatriculados) || 0, { fill: zebra, size: label });
      c.cell(row, c0 + 2, Number(carrera.totalConBeca) || 0, {
        fill: zebra,
        bold: true,
        size: label,
      });
      c.cell(row, c0 + 3, fmtPct(carrera.porcentajeCobertura), { fill: zebra, size: label });
      totMatric += Number(carrera.totalMatriculados) || 0;
      totConBeca += Number(carrera.totalConBeca) || 0;
    });
    const totalRow = headRow + 1 + carreras.length;
    const tFill = EXCEL_COLOR.teoricasStrong;
    c.cell(totalRow, c0, 'TOTALES GENERALES', { bold: true, align: 'left', fill: tFill, size: label });
    c.cell(totalRow, c0 + 1, totMatric, { bold: true, fill: tFill, size: label });
    c.cell(totalRow, c0 + 2, totConBeca, { bold: true, fill: tFill, size: label });
    c.cell(totalRow, c0 + 3, fmtPct(totMatric > 0 ? (totConBeca / totMatric) * 100 : 0), {
      bold: true,
      fill: tFill,
      size: label,
    });
    return totalRow + 1;
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
