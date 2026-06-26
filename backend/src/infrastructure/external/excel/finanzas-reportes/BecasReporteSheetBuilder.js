/**
 * BecasReporteSheetBuilder — construye la ÚNICA hoja de la Planilla de Control de
 * Becas por carrera. El reporte llega como ÁRBOL (carrera → periodo → paralelo);
 * aquí se APLANA en preorden a una sola tabla plana donde cada fila es un
 * PARALELO (la hoja del árbol) con columnas explícitas de grano
 * (CARRERA · PERIODO · PARALELO), seguida de la fila TOTALES GENERALES y, debajo,
 * los bloques de estadística (RESUMEN POR TIPO DE BECA + RESUMEN GENERAL).
 *
 * Se muestra TODO desplegado (sin agrupar/colapsar): el árbol expandible es solo
 * para la UI web. Para que la lectura sea limpia, el texto de CARRERA y PERIODO
 * se fusiona verticalmente (rowSpan visual) sobre sus paralelos.
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

/**
 * Aplana el árbol de carreras a filas de paralelo (preorden), conservando la
 * identidad de carrera/periodo en cada fila para pintar la tabla plana.
 * @param {Array<Object>} filas - raíces (carreras) del árbol del reporte.
 * @returns {Array<{ carrera: Object, periodo: Object, paralelo: Object }>}
 */
const flattenParalelos = (filas) => {
  const out = [];
  for (const carrera of Array.isArray(filas) ? filas : []) {
    const periodos = Array.isArray(carrera.children) ? carrera.children : [];
    if (periodos.length === 0) {
      out.push({ carrera, periodo: null, paralelo: null });
    } else {
      for (const periodo of periodos) {
        const paralelos = Array.isArray(periodo.children) ? periodo.children : [];
        if (paralelos.length === 0) {
          out.push({ carrera, periodo, paralelo: null });
        } else {
          for (const paralelo of paralelos) {
            out.push({ carrera, periodo, paralelo });
          }
        }
      }
    }
  }
  return out;
};

/** Texto del periodo para la columna PERIODO (usa nombre o `Periodo {n}`). */
const periodoLabel = (periodo) => {
  if (!periodo) return '—';
  if (periodo.periodoNombre) return String(periodo.periodoNombre).toUpperCase();
  if (periodo.periodoNumero != null) return `PERIODO ${periodo.periodoNumero}`;
  return '—';
};

/** Texto del paralelo para la columna PARALELO (nombre + turno entre paréntesis). */
const paraleloLabel = (paralelo) => {
  if (!paralelo) return '—';
  const nombre = paralelo.paraleloNombre ? String(paralelo.paraleloNombre).toUpperCase() : '';
  const turno = paralelo.paraleloTurno ? ` (${String(paralelo.paraleloTurno).toUpperCase()})` : '';
  return `${nombre}${turno}`.trim() || '—';
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

    // Aplanar el árbol a filas de paralelo (preorden): una fila por hoja.
    const planas = flattenParalelos(filas);

    // ---- Mapa de columnas (1-based; col 1 = margen) ----
    const colNro = 2;
    const colCarrera = 3;
    const colPeriodo = 4;
    const colParalelo = 5;
    const colMatric = 6;
    const colTramoStart = 7;
    const colTramoEnd = colTramoStart + Math.max(porcentajes.length - 1, 0);
    const hayTramos = porcentajes.length > 0;
    const colTotalBeca = (hayTramos ? colTramoEnd : colMatric) + 1;
    const colPctBeca = colTotalBeca + 1;
    const colPctCobertura = colPctBeca + 1;
    const colObs = colPctCobertura + 1;
    const lastCol = colObs;

    // ---- Anchos (holgados: dimensiones de texto largo + columnas numéricas con aire) ----
    c.colWidths({
      1: 4,
      [colNro]: 9,
      [colCarrera]: 48,
      [colPeriodo]: 28,
      [colParalelo]: 32,
      [colMatric]: 21,
    });
    for (let col = colTramoStart; col <= colTramoEnd; col += 1) c.colWidths({ [col]: 19 });
    c.colWidths({ [colTotalBeca]: 22, [colPctBeca]: 20, [colPctCobertura]: 22, [colObs]: 40 });

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
    headBox(colPeriodo, 'PERIODO');
    headBox(colParalelo, 'PARALELO');
    headBox(colMatric, 'Nº MATRICULADOS');
    if (hayTramos) {
      c.merge(`${L(colTramoStart)}${rowTop}:${L(colTramoEnd)}${rowTop}`, 'ESTUDIANTES CON BECA POR TIPO', headStyle);
      porcentajes.forEach((p, i) => c.cell(rowSub, colTramoStart + i, `BECA ${p}%`, headStyle));
    }
    headBox(colTotalBeca, 'TOTAL CON BECA');
    headBox(colPctBeca, '% CON BECA');
    headBox(colPctCobertura, '% COBERTURA');
    headBox(colObs, 'OBSERVACIONES');
    // Cabecera con más aire: filas altas + alineación vertical centrada (vía composer)
    // y wrap activo para que los encabezados respiren y resalten.
    c.ws.getRow(rowTop).height = 28;
    c.ws.getRow(rowSub).height = 46;

    // ---- Filas planas (una por paralelo) ----
    const firstDataRow = rowSub + 1;
    planas.forEach((item, idx) => {
      const row = firstDataRow + idx;
      const zebra = idx % 2 === 1 ? EXCEL_COLOR.zebra : EXCEL_COLOR.white;
      // Métricas del grano más fino disponible (paralelo; periodo/carrera si falta).
      const m = item.paralelo ?? item.periodo ?? item.carrera ?? {};
      c.cell(row, colNro, idx + 1, { fill: zebra, size: label });
      c.cell(row, colCarrera, String(item.carrera?.carreraNombre ?? '').toUpperCase(), {
        fill: zebra,
        align: 'left',
        size: label,
      });
      c.cell(row, colPeriodo, periodoLabel(item.periodo), { fill: zebra, align: 'left', size: label });
      c.cell(row, colParalelo, paraleloLabel(item.paralelo), {
        fill: zebra,
        align: 'left',
        size: label,
      });
      c.cell(row, colMatric, Number(m.totalMatriculados) || 0, { fill: zebra, size: label });
      porcentajes.forEach((p, i) => {
        const val = Number(m.becasPorPorcentaje?.[String(p)]) || 0;
        c.cell(row, colTramoStart + i, val, { fill: zebra, size: label });
      });
      c.cell(row, colTotalBeca, Number(m.totalConBeca) || 0, {
        fill: zebra,
        bold: true,
        size: label,
      });
      c.cell(row, colPctBeca, fmtPct(m.porcentajeConBeca), { fill: zebra, size: label });
      c.cell(row, colPctCobertura, fmtPct(m.porcentajeCobertura), { fill: zebra, size: label });
      c.cell(row, colObs, '', { fill: zebra, size: label });
      c.ws.getRow(row).height = 24;
    });

    // ---- Fusión vertical de CARRERA y PERIODO (rowSpan visual) ----
    this._mergeRuns(c, planas, firstDataRow, colCarrera, (item) => item.carrera?.id ?? '∅');
    this._mergeRuns(
      c,
      planas,
      firstDataRow,
      colPeriodo,
      (item) => `${item.carrera?.id ?? '∅'}|${item.periodo?.id ?? '∅'}`
    );

    // ---- Fila de TOTALES GENERALES ----
    const totalRow = firstDataRow + Math.max(planas.length, 0);
    const totalFill = EXCEL_COLOR.teoricasStrong;
    const tStyle = { bold: true, fill: totalFill, size: label };
    // Celda Nº del total (sin rótulo) para mantener la banda continua.
    c.cell(totalRow, colNro, '', tStyle);
    // El rótulo arranca en la columna CARRERA (ancha) y se extiende hasta justo
    // antes de Nº MATRICULADOS, aprovechando ese ancho con alineación a la izquierda.
    c.merge(`${L(colCarrera)}${totalRow}:${L(colParalelo)}${totalRow}`, 'TOTALES GENERALES', {
      bold: true,
      align: 'left',
      fill: totalFill,
      size: label,
    });
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

  /**
   * Fusiona verticalmente las celdas consecutivas de una columna cuya clave
   * (carrera, o carrera+periodo) coincide, para que la dimensión se lea una sola
   * vez por bloque (rowSpan visual) sin ocultar ninguna fila de paralelo.
   * @param {import('../shared/ExcelSheetComposer.js').ExcelSheetComposer} c
   * @param {Array<Object>} planas
   * @param {number} firstDataRow
   * @param {number} col
   * @param {(item:Object)=>string} keyOf
   */
  static _mergeRuns(c, planas, firstDataRow, col, keyOf) {
    let i = 0;
    while (i < planas.length) {
      const key = keyOf(planas[i]);
      let j = i;
      while (j + 1 < planas.length && keyOf(planas[j + 1]) === key) j += 1;
      if (j > i) {
        const top = firstDataRow + i;
        const bottom = firstDataRow + j;
        c.ws.mergeCells(top, col, bottom, col);
        // El valor ya está en la celda ancla; solo re-anclar alineación superior.
        const cell = c.ws.getCell(top, col);
        cell.alignment = { ...cell.alignment, vertical: 'top' };
      }
      i = j + 1;
    }
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
