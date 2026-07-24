/**
 * BecasReporteSheetBuilder — construye la ÚNICA hoja de la Planilla de Control de
 * Becas por carrera, agrupada por CARRERA → PARALELO → ESTUDIANTES BECADOS (mismo
 * concepto que `CuentasPorCobrarSheetBuilder`: banda de carrera (merge) → banda de
 * paralelo (merge) → filas de estudiante becado → fila de TOTAL de la carrera),
 * seguida de RESUMEN TOTAL POR CARRERA, RESUMEN GENERAL POR TIPO DE BECA y
 * RESUMEN GENERAL.
 *
 * El árbol llega como carrera → periodo → paralelo; el nivel PERIODO no se pinta
 * como banda propia (el nombre del paralelo ya distingue el año, p. ej.
 * "PRIMERO A"), igual que la pantalla (`BecasCarreraSection`). Solo se listan
 * paralelos/carreras con al menos un estudiante BECADO — el use case ya entrega
 * `estudiantes[]` filtrado a becados por paralelo.
 *
 * En vez de una columna "% BECA" + "DESCUENTO (Bs)", se abre UNA columna POR
 * TRAMO (25%/50%/75%/100%, derivados del CATÁLOGO completo `datos.catalogo`,
 * sin hardcodear — así una columna no desaparece si nadie la tiene asignada
 * en la gestión): la celda del tramo que corresponde al estudiante muestra su
 * descuento en Bs, las demás quedan con un guion. "APORTE BASE (Bs)" muestra
 * el NETO (base − descuento de la beca), no el monto base bruto, para que se
 * vea de un vistazo cuánto le queda al estudiante por aportar. La fila de
 * TOTAL de cada carrera suma, por columna de tramo, el descuento en Bs de esa
 * carrera (y el aporte base neto total); "RESUMEN TOTAL POR CARRERA" además
 * agrega la CANTIDAD de becados por tramo (p. ej. "4" bajo la columna 25%,
 * "9" bajo 100%).
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
    // Columnas de tramo = CATÁLOGO COMPLETO (25/50/75/100, usados o no), no
    // `datos.porcentajes` (solo los tramos con becados en esta gestión) — así
    // una columna no "desaparece" si nadie la tiene asignada.
    const porcentajes = Array.isArray(datos.catalogo)
      ? [...new Set(datos.catalogo.map((item) => Number(item.porcentaje)))].sort((a, b) => a - b)
      : [];

    // Solo carreras con al menos un paralelo con becados.
    const carreras = (Array.isArray(datos.filas) ? datos.filas : [])
      .map((carrera) => ({ carrera, paralelos: paralelosBecados(carrera) }))
      .filter((item) => item.paralelos.length > 0);

    // ---- Mapa de columnas (1-based; col 1 = margen) ----
    const colNro = 2;
    const colEstudiante = 3;
    const colCi = 4;
    const colBeca = 5;
    const colTramoStart = 6;
    const colsTramo = porcentajes.map((porcentaje, idx) => ({
      porcentaje,
      col: colTramoStart + idx,
    }));
    const colAporteBase = colTramoStart + porcentajes.length;
    const lastCol = colAporteBase;
    // Columnas de identificación (se fusionan en bandas de carrera/paralelo/total).
    const colLabelEnd = colBeca;

    const widths = {
      1: 4,
      [colNro]: 8,
      [colEstudiante]: 48,
      [colCi]: 16,
      [colBeca]: 40,
      [colAporteBase]: 20,
    };
    colsTramo.forEach(({ col }) => {
      widths[col] = 16;
    });
    c.colWidths(widths);

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
    if (lastCol > colTramoStart) {
      c.infoField(
        `${L(colTramoStart)}3:${L(colTramoStart)}3`,
        'FECHA EMISIÓN:',
        `${L(colTramoStart + 1)}3:${L(lastCol)}3`,
        datos.fechaEmision ?? ''
      );
    } else {
      c.merge(`${L(colTramoStart)}3:${L(lastCol)}3`, `FECHA EMISIÓN: ${datos.fechaEmision ?? ''}`, {
        bold: true,
        align: 'left',
        fontColor: EXCEL_COLOR.inkSoft,
      });
    }

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
      ...colsTramo.map(({ col, porcentaje }) => [col, `${porcentaje}%`]),
      [colAporteBase, 'APORTE BASE (Bs)'],
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

      // Sumatoria en Bs por tramo (y aporte base total) de TODOS los becados
      // de esta carrera, para la fila de TOTAL que cierra su bloque.
      const totalesTramo = {};
      colsTramo.forEach(({ porcentaje }) => {
        totalesTramo[porcentaje] = 0;
      });
      let totalAporteBase = 0;

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
          const estPorcentaje = Number(est.becaPorcentaje);
          colsTramo.forEach(({ col, porcentaje }) => {
            if (porcentaje === estPorcentaje) {
              money(row, col, est.montoDescuento, { fill: zebra, size: label });
              totalesTramo[porcentaje] += Number(est.montoDescuento) || 0;
            } else {
              c.cell(row, col, '—', { fill: zebra, size: label });
            }
          });
          const aporteNeto = (Number(est.montoBase) || 0) - (Number(est.montoDescuento) || 0);
          money(row, colAporteBase, aporteNeto, { fill: zebra, size: label });
          totalAporteBase += aporteNeto;
          c.ws.getRow(row).height = 22;
          row += 1;
        });
      });

      // ---- Fila de TOTAL de la carrera: identificación fusionada + sumatoria
      // en Bs por columna de tramo/aporte base (no se fusionan). ----
      const tFill = EXCEL_COLOR.teoricasStrong;
      c.merge(
        `${L(colNro)}${row}:${L(colLabelEnd)}${row}`,
        `TOTAL — ${String(carrera.carreraNombre ?? '').toUpperCase()}   ·   Con beca: ${Number(carrera.totalConBeca) || 0}   ·   % cobertura: ${fmtPct(carrera.porcentajeCobertura)}`,
        { bold: true, align: 'left', fill: tFill, size: label }
      );
      colsTramo.forEach(({ col, porcentaje }) => {
        money(row, col, totalesTramo[porcentaje], { fill: tFill, bold: true, size: label });
      });
      money(row, colAporteBase, totalAporteBase, { fill: tFill, bold: true, size: label });
      row += 1;
    });

    // ---- Resúmenes ----
    row += 1;
    row = this._resumenPorCarrera(c, {
      startRow: row,
      carreras: carreras.map((item) => item.carrera),
      porcentajes,
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

  /**
   * RESUMEN TOTAL POR CARRERA (matriculados / con beca / cantidad de becados
   * por tramo / % cobertura). @returns {number} fila siguiente libre.
   */
  static _resumenPorCarrera(c, { startRow, carreras, porcentajes }) {
    const { label } = EXCEL_FONT_SIZE;
    const c0 = 2;
    const colsTramo = porcentajes.map((porcentaje, idx) => ({ porcentaje, col: c0 + 3 + idx }));
    const colCobertura = c0 + 3 + porcentajes.length;
    const lastCol = colCobertura;
    c.merge(`${L(c0)}${startRow}:${L(lastCol)}${startRow}`, 'RESUMEN TOTAL POR CARRERA', {
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
      ...colsTramo.map(({ col, porcentaje }) => [col, `BECADOS ${porcentaje}%`, 'center']),
      [colCobertura, '% COBERTURA', 'center'],
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
    const totalesPorTramo = {};
    porcentajes.forEach((porcentaje) => {
      totalesPorTramo[porcentaje] = 0;
    });
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
      colsTramo.forEach(({ col, porcentaje }) => {
        const cantidad = Number(carrera.becasPorPorcentaje?.[String(porcentaje)]) || 0;
        c.cell(row, col, cantidad, { fill: zebra, size: label });
        totalesPorTramo[porcentaje] += cantidad;
      });
      c.cell(row, colCobertura, fmtPct(carrera.porcentajeCobertura), { fill: zebra, size: label });
      totMatric += Number(carrera.totalMatriculados) || 0;
      totConBeca += Number(carrera.totalConBeca) || 0;
    });
    const totalRow = headRow + 1 + carreras.length;
    const tFill = EXCEL_COLOR.teoricasStrong;
    c.cell(totalRow, c0, 'TOTALES GENERALES', { bold: true, align: 'left', fill: tFill, size: label });
    c.cell(totalRow, c0 + 1, totMatric, { bold: true, fill: tFill, size: label });
    c.cell(totalRow, c0 + 2, totConBeca, { bold: true, fill: tFill, size: label });
    colsTramo.forEach(({ col, porcentaje }) => {
      c.cell(totalRow, col, totalesPorTramo[porcentaje], { bold: true, fill: tFill, size: label });
    });
    c.cell(totalRow, colCobertura, fmtPct(totMatric > 0 ? (totConBeca / totMatric) * 100 : 0), {
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
