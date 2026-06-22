/**
 * CuentasPorCobrarSheetBuilder — construye la ÚNICA hoja de la Planilla de Control
 * de Cuentas por Cobrar a estudiantes: agrupada por CARRERA → PARALELO → ESTUDIANTES
 * DEUDORES (saldo > 0), con alertas de estado por color, RESUMEN TOTAL POR CARRERA,
 * MONTO TOTAL PENDIENTE POR COBRAR (destacado) y leyenda de alertas.
 *
 * Solo construcción + estilos (vía ExcelSheetComposer + ExcelTheme). Cabecera en
 * VERDE primario (#196B45). Las alertas (al día / próxima / vencida) usan tonos
 * semánticos definidos localmente porque no existen en el theme base.
 */

import { EXCEL_COLOR, EXCEL_FONT_SIZE, colLetter as L } from '../shared/index.js';

/** Tonos semánticos de alerta (ARGB). Verde/ámbar del theme + rojo local. */
const ALERTA = {
  AL_DIA: { fill: EXCEL_COLOR.teoricas, font: EXCEL_COLOR.ink, label: 'Al día' },
  PROXIMA: { fill: EXCEL_COLOR.practicas, font: EXCEL_COLOR.ink, label: 'Próxima' },
  VENCIDA: { fill: 'FFF8D7DA', font: 'FF9B1C2E', label: 'Vencida' },
  SIN_COMPROMISO: { fill: 'FFECECEC', font: EXCEL_COLOR.inkSoft, label: 'Sin compromiso' },
};

const fmtPct = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return `${safe.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
};

const fmtFecha = (value) => {
  if (!value) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(value);
};

export class CuentasPorCobrarSheetBuilder {
  /**
   * @param {Object} params
   * @param {import('../shared/ExcelSheetComposer.js').ExcelSheetComposer} params.composer
   * @param {Object} params.datos - Payload del reporte de cuentas por cobrar.
   */
  static build({ composer: c, datos }) {
    const { small, body } = EXCEL_FONT_SIZE;
    const carreras = this._soloDeudores(Array.isArray(datos.carreras) ? datos.carreras : []);
    const resumen = datos.resumen ?? {};
    const montoMaximo = Number(datos.montoMaximoPorEstudiante) || 0;

    // ---- Mapa de columnas (1-based; col 1 = margen) ----
    const colCarnet = 2;
    const colNombre = 3;
    const colMontoTotal = 4;
    const colPagos = 5;
    const colSaldo = 6;
    const colPctPend = 7;
    const colFechaComp = 8;
    const colDias = 9;
    const colEstado = 10;
    const colObs = 11;
    const lastCol = colObs;

    c.colWidths({ 1: 2, [colCarnet]: 12, [colNombre]: 38, [colMontoTotal]: 13, [colPagos]: 14 });
    c.colWidths({ [colSaldo]: 14, [colPctPend]: 12, [colFechaComp]: 15, [colDias]: 11 });
    c.colWidths({ [colEstado]: 14, [colObs]: 24 });

    const money = (row, col, value, style) => {
      const cell = c.cell(row, col, Number(value) || 0, style);
      cell.numFmt = '#,##0.00';
      return cell;
    };

    // ---- Banda de título + cabecera institucional ----
    c.bandTitle(
      `B1:${L(lastCol)}1`,
      'PLANILLA DE CONTROL – CUENTAS POR COBRAR A ESTUDIANTES (POR CARRERA Y PARALELO)'
    );
    c.merge(`B2:${L(lastCol)}2`, 'INSTITUTO TÉCNICO INCOS SANTA CRUZ', {
      bold: true,
      size: body,
      fontColor: EXCEL_COLOR.inkSoft,
      border: false,
    });
    const gestionLabel = datos.gestion?.nombre ?? datos.gestion?.anio ?? '';
    c.infoField('B3:C3', 'GESTIÓN:', `D3:${L(colSaldo)}3`, String(gestionLabel || '—'));
    c.infoField(`${L(colPctPend)}3:${L(colPctPend)}3`, 'MODALIDAD:', `${L(colFechaComp)}3:${L(colObs)}3`, 'ANUALIZADA');
    c.infoField('B4:C4', 'MONTO MÁX. POR ESTUDIANTE:', `D4:${L(colSaldo)}4`, `${montoMaximo.toLocaleString('es-BO', { minimumFractionDigits: 2 })} Bs`);
    c.infoField(`${L(colPctPend)}4:${L(colPctPend)}4`, 'FECHA EMISIÓN:', `${L(colFechaComp)}4:${L(colObs)}4`, fmtFecha(datos.fechaEmision));

    // ---- Cabecera de columnas ----
    const headRow = 6;
    const headStyle = {
      bold: true,
      size: small,
      wrap: true,
      fill: EXCEL_COLOR.statHeader,
      fontColor: EXCEL_COLOR.statHeaderText,
      borderMedium: true,
    };
    const headers = [
      [colCarnet, 'Nº CARNET'],
      [colNombre, 'NOMBRE COMPLETO'],
      [colMontoTotal, 'MONTO TOTAL (Bs)'],
      [colPagos, 'PAGOS REALIZADOS (Bs)'],
      [colSaldo, 'SALDO PENDIENTE (Bs)'],
      [colPctPend, '% PENDIENTE'],
      [colFechaComp, 'FECHA COMPROMISO'],
      [colDias, 'DÍAS ATRASO'],
      [colEstado, 'ESTADO'],
      [colObs, 'OBSERVACIONES'],
    ];
    headers.forEach(([col, text]) => c.cell(headRow, col, text, headStyle));
    c.ws.getRow(headRow).height = 30;
    c.freeze(headRow, colNombre);

    // ---- Detalle: carrera → paralelo → estudiantes deudores ----
    let row = headRow + 1;
    let zebraIdx = 0;
    carreras.forEach((carrera) => {
      const deudores = carrera.paralelos.reduce((acc, p) => acc + p.estudiantes.length, 0);
      c.merge(
        `${L(colCarnet)}${row}:${L(lastCol)}${row}`,
        `${String(carrera.carreraNombre ?? '').toUpperCase()}   ·   ${deudores} con saldo   ·   Pendiente ${Number(carrera.totalPendiente).toLocaleString('es-BO', { minimumFractionDigits: 2 })} Bs`,
        { bold: true, align: 'left', fill: EXCEL_COLOR.statHeader, fontColor: EXCEL_COLOR.statHeaderText, size: small }
      );
      row += 1;

      carrera.paralelos.forEach((paralelo) => {
        const turno = paralelo.turno ? ` · ${paralelo.turno}` : '';
        c.merge(`${L(colCarnet)}${row}:${L(lastCol)}${row}`, `Paralelo ${paralelo.paralelo ?? '—'}${turno}`, {
          bold: true,
          align: 'left',
          fill: EXCEL_COLOR.teoricasStrong,
          size: small,
        });
        row += 1;

        paralelo.estudiantes.forEach((est) => {
          const zebra = zebraIdx % 2 === 1 ? EXCEL_COLOR.zebra : EXCEL_COLOR.white;
          zebraIdx += 1;
          const alerta = ALERTA[est.estado] ?? ALERTA.SIN_COMPROMISO;
          c.cell(row, colCarnet, est.carnet ?? '—', { fill: zebra, size: small });
          c.cell(row, colNombre, String(est.nombreCompleto ?? '').toUpperCase(), { fill: zebra, align: 'left', size: small });
          money(row, colMontoTotal, est.montoTotal, { fill: zebra, size: small });
          money(row, colPagos, est.totalPagado, { fill: zebra, size: small });
          money(row, colSaldo, est.saldoPendiente, { fill: zebra, bold: true, size: small });
          c.cell(row, colPctPend, fmtPct(est.porcentajeSaldo), { fill: zebra, size: small });
          c.cell(row, colFechaComp, fmtFecha(est.fechaCompromiso), { fill: zebra, size: small });
          c.cell(row, colDias, est.diasAtraso != null && est.diasAtraso > 0 ? est.diasAtraso : '—', { fill: zebra, size: small });
          c.cell(row, colEstado, alerta.label, {
            fill: alerta.fill,
            fontColor: alerta.font,
            bold: true,
            size: small,
          });
          c.cell(row, colObs, est.observacion ?? '', { fill: zebra, align: 'left', size: small });
          row += 1;
        });
      });
    });

    // ---- Resúmenes ----
    row += 1;
    row = this._resumenPorCarrera(c, { startRow: row, carreras });
    row += 1;
    this._montoTotalPendiente(c, { startRow: row, colDesde: colSaldo, colHasta: lastCol, resumen });
    this._leyenda(c, { startRow: row, colDesde: colCarnet, colHasta: colSaldo - 1 });
  }

  /** Conserva solo deudores (saldo > 0), descarta paralelos/carreras vacíos. */
  static _soloDeudores(carreras) {
    return carreras
      .map((carrera) => ({
        ...carrera,
        paralelos: (carrera.paralelos || [])
          .map((p) => ({
            ...p,
            estudiantes: (p.estudiantes || []).filter((e) => Number(e.saldoPendiente) > 0),
          }))
          .filter((p) => p.estudiantes.length > 0),
      }))
      .filter((carrera) => carrera.paralelos.length > 0);
  }

  /** RESUMEN TOTAL POR CARRERA. @returns {number} fila siguiente libre. */
  static _resumenPorCarrera(c, { startRow, carreras }) {
    const { small } = EXCEL_FONT_SIZE;
    const c0 = 2;
    c.merge(`${L(c0)}${startRow}:${L(c0 + 5)}${startRow}`, 'RESUMEN TOTAL POR CARRERA', {
      bold: true,
      fill: EXCEL_COLOR.statHeader,
      fontColor: EXCEL_COLOR.statHeaderText,
      size: small,
      borderMedium: true,
    });
    const headRow = startRow + 1;
    const cols = [
      [c0, 'CARRERA', 'left'],
      [c0 + 1, 'Nº MATRICULADOS', 'center'],
      [c0 + 2, 'MONTO MÁX. (Bs)', 'center'],
      [c0 + 3, 'CANCELADO (Bs)', 'center'],
      [c0 + 4, 'PENDIENTE (Bs)', 'center'],
      [c0 + 5, '% PENDIENTE', 'center'],
    ];
    cols.forEach(([col, text]) =>
      c.cell(headRow, col, text, {
        bold: true,
        size: small,
        wrap: true,
        fill: EXCEL_COLOR.teoricasStrong,
      })
    );
    const money = (row, col, value, style) => {
      const cell = c.cell(row, col, Number(value) || 0, style);
      cell.numFmt = '#,##0.00';
      return cell;
    };
    let totMatric = 0;
    let totMax = 0;
    let totCancel = 0;
    let totPend = 0;
    carreras.forEach((carrera, idx) => {
      const row = headRow + 1 + idx;
      const zebra = idx % 2 === 1 ? EXCEL_COLOR.zebra : EXCEL_COLOR.white;
      c.cell(row, c0, String(carrera.carreraNombre ?? '').toUpperCase(), { align: 'left', fill: zebra, size: small });
      c.cell(row, c0 + 1, Number(carrera.totalMatriculados) || 0, { fill: zebra, size: small });
      money(row, c0 + 2, carrera.montoMaximoTotal, { fill: zebra, size: small });
      money(row, c0 + 3, carrera.totalCancelado, { fill: zebra, size: small });
      money(row, c0 + 4, carrera.totalPendiente, { fill: zebra, bold: true, size: small });
      c.cell(row, c0 + 5, fmtPct(carrera.porcentajePendiente), { fill: zebra, size: small });
      totMatric += Number(carrera.totalMatriculados) || 0;
      totMax += Number(carrera.montoMaximoTotal) || 0;
      totCancel += Number(carrera.totalCancelado) || 0;
      totPend += Number(carrera.totalPendiente) || 0;
    });
    const totalRow = headRow + 1 + carreras.length;
    const tFill = EXCEL_COLOR.teoricasStrong;
    c.cell(totalRow, c0, 'TOTALES GENERALES', { bold: true, align: 'left', fill: tFill, size: small });
    c.cell(totalRow, c0 + 1, totMatric, { bold: true, fill: tFill, size: small });
    c.cell(totalRow, c0 + 2, totMax, { bold: true, fill: tFill, size: small }).numFmt = '#,##0.00';
    c.cell(totalRow, c0 + 3, totCancel, { bold: true, fill: tFill, size: small }).numFmt = '#,##0.00';
    c.cell(totalRow, c0 + 4, totPend, { bold: true, fill: tFill, size: small }).numFmt = '#,##0.00';
    c.cell(totalRow, c0 + 5, fmtPct(totMax > 0 ? (totPend / totMax) * 100 : 0), {
      bold: true,
      fill: tFill,
      size: small,
    });
    return totalRow + 1;
  }

  /** Recuadro destacado: MONTO TOTAL PENDIENTE POR COBRAR (todas las carreras). */
  static _montoTotalPendiente(c, { startRow, colDesde, colHasta, resumen }) {
    const { subtitle, title } = EXCEL_FONT_SIZE;
    c.merge(`${L(colDesde)}${startRow}:${L(colHasta)}${startRow}`, 'MONTO TOTAL PENDIENTE POR COBRAR (Bs)', {
      bold: true,
      size: subtitle,
      fill: EXCEL_COLOR.statHeader,
      fontColor: EXCEL_COLOR.statHeaderText,
      borderMedium: true,
    });
    const valueCell = c.merge(
      `${L(colDesde)}${startRow + 1}:${L(colHasta)}${startRow + 1}`,
      Number(resumen.totalPendientePorCobrar) || 0,
      {
        bold: true,
        size: title,
        fill: EXCEL_COLOR.finalCell,
        fontColor: EXCEL_COLOR.finalHeader,
        borderMedium: true,
      }
    );
    valueCell.numFmt = '#,##0.00';
    c.ws.getRow(startRow + 1).height = 30;
  }

  /** Leyenda de alertas (al día / próxima / vencida / sin compromiso). */
  static _leyenda(c, { startRow, colDesde, colHasta }) {
    const { small } = EXCEL_FONT_SIZE;
    c.merge(`${L(colDesde)}${startRow}:${L(colHasta)}${startRow}`, 'LEYENDA DE ALERTAS', {
      bold: true,
      fill: EXCEL_COLOR.statHeader,
      fontColor: EXCEL_COLOR.statHeaderText,
      size: small,
      borderMedium: true,
    });
    const items = [
      ['AL_DIA', 'Estudiante al día / compromiso a más de 3 días.'],
      ['PROXIMA', 'Compromiso próximo a vencer (3 días o menos).'],
      ['VENCIDA', 'Fecha de compromiso vencida.'],
      ['SIN_COMPROMISO', 'Con saldo y sin compromiso registrado.'],
    ];
    items.forEach(([estado, desc], idx) => {
      const row = startRow + 1 + idx;
      const alerta = ALERTA[estado];
      c.cell(row, colDesde, alerta.label, {
        bold: true,
        fill: alerta.fill,
        fontColor: alerta.font,
        size: small,
      });
      c.merge(`${L(colDesde + 1)}${row}:${L(colHasta)}${row}`, desc, { align: 'left', size: small });
    });
  }
}

export default CuentasPorCobrarSheetBuilder;
