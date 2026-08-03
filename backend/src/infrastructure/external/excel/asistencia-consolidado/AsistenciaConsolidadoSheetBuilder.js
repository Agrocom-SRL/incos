/**
 * AsistenciaConsolidadoSheetBuilder — construye UNA hoja del Consolidado % de
 * asistencia (un paralelo; un bimestre o el acumulado anual): cabecera
 * institucional + matriz estudiantes × asignaturas con el % por curso y el
 * PROMEDIO ponderado por sesiones.
 *
 * Solo construcción + estilos (vía ExcelSheetComposer + ExcelTheme, cabecera
 * VERDE primario #196B45). Sin lógica de negocio: los % llegan calculados
 * desde GetConsolidadoAsistenciaUseCase (paridad pantalla ↔ Excel).
 */

import { EXCEL_COLOR, EXCEL_FONT_SIZE } from '../shared/index.js';
import { colLetter as L } from '../shared/ExcelSheetComposer.js';

const fmtPct = (value) => {
  const n = Number(value);
  if (value == null || !Number.isFinite(n)) return '—';
  return `${n.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
};

export class AsistenciaConsolidadoSheetBuilder {
  /**
   * @param {Object} params
   * @param {import('../shared/ExcelSheetComposer.js').ExcelSheetComposer} params.composer
   * @param {Object} params.datos - Ver IAsistenciaConsolidadoExcelGenerator.
   */
  static build({ composer: c, datos }) {
    const { small, body, label } = EXCEL_FONT_SIZE;
    const cab = datos.cabecera ?? {};
    const asignaturas = Array.isArray(datos.asignaturas) ? datos.asignaturas : [];
    const estudiantes = Array.isArray(datos.estudiantes) ? datos.estudiantes : [];

    // ---- Mapa de columnas (1-based; col 1 = margen) ----
    const colNro = 2;
    const colNombre = 3;
    const colCodigo = 4;
    const colAsigStart = 5;
    const colPromedio = colAsigStart + asignaturas.length;
    const lastCol = colPromedio;

    const widths = { 1: 4, [colNro]: 7, [colNombre]: 46, [colCodigo]: 14, [colPromedio]: 15 };
    asignaturas.forEach((_, i) => {
      widths[colAsigStart + i] = 12;
    });
    c.colWidths(widths);

    // ---- Título + cabecera institucional (planilla verde) ----
    c.bandTitle(`B1:${L(lastCol)}1`, datos.titulo ?? 'CONSOLIDADO DE ASISTENCIA (%)');
    c.merge(`B2:${L(lastCol)}2`, 'INSTITUTO TÉCNICO INCOS SANTA CRUZ', {
      bold: true,
      size: body,
      fontColor: EXCEL_COLOR.inkSoft,
      border: false,
    });
    c.infoField('B4:B4', 'CARRERA:', `C4:${L(colCodigo)}4`, cab.carrera);
    c.infoField(`${L(colAsigStart)}4:${L(colAsigStart)}4`, 'GESTIÓN:', `${L(colAsigStart + 1)}4:${L(lastCol)}4`, String(cab.gestionAnio ?? ''));
    c.infoField('B5:B5', 'PERIODO:', `C5:${L(colCodigo)}5`, cab.periodo);
    c.infoField(`${L(colAsigStart)}5:${L(colAsigStart)}5`, 'PARALELO:', `${L(colAsigStart + 1)}5:${L(lastCol)}5`, `${cab.paralelo ?? ''}${cab.turno ? ` (${cab.turno})` : ''}`);
    c.infoField('B6:B6', 'ALCANCE:', `C6:${L(colCodigo)}6`, cab.bimestreLabel ?? '');
    c.merge(`${L(colAsigStart)}6:${L(lastCol)}6`, 'AUSENTE = 1 falta · RETRASO = 0.5 · LICENCIA APROBADA neutraliza', {
      size: small,
      align: 'left',
      fontColor: EXCEL_COLOR.inkSoft,
      border: false,
    });

    // ---- Cabecera de tabla (2 filas: sigla + docente) ----
    const rowSigla = 8;
    const rowDocente = 9;
    const headStyle = {
      bold: true,
      size: small,
      wrap: true,
      fill: EXCEL_COLOR.statHeader,
      fontColor: EXCEL_COLOR.statHeaderText,
      borderMedium: true,
    };
    c.mergeBox(rowSigla, colNro, rowDocente, colNro, 'Nº', headStyle);
    c.mergeBox(rowSigla, colNombre, rowDocente, colNombre, 'NÓMINA DE ESTUDIANTES', headStyle);
    c.mergeBox(rowSigla, colCodigo, rowDocente, colCodigo, 'CÓDIGO', headStyle);
    asignaturas.forEach((asig, i) => {
      const col = colAsigStart + i;
      c.cell(rowSigla, col, asig.sigla ?? '', {
        bold: true,
        size: small,
        wrap: true,
        fill: EXCEL_COLOR.teoricasStrong,
        borderMedium: true,
      });
      c.cell(rowDocente, col, asig.docenteNombre ? `(${asig.docenteNombre})` : '', {
        size: small,
        wrap: true,
        fontColor: EXCEL_COLOR.inkSoft,
        fill: EXCEL_COLOR.teoricas,
      });
    });
    c.mergeBox(rowSigla, colPromedio, rowDocente, colPromedio, 'PROMEDIO %', {
      ...headStyle,
      fill: EXCEL_COLOR.finalHeader,
    });
    c.rowHeight(rowSigla, 28);
    c.rowHeight(rowDocente, 34);

    // ---- Filas de estudiantes (zebra) ----
    const firstDataRow = rowDocente + 1;
    estudiantes.forEach((est, idx) => {
      const row = firstDataRow + idx;
      const zebra = idx % 2 === 1 ? EXCEL_COLOR.zebra : EXCEL_COLOR.white;
      c.cell(row, colNro, est.nro ?? idx + 1, { fill: zebra, size: small });
      c.cell(row, colNombre, String(est.nombreCompleto ?? '').toUpperCase(), {
        fill: zebra,
        align: 'left',
        size: small,
      });
      c.cell(row, colCodigo, est.codigo ?? '', { fill: zebra, size: small });
      asignaturas.forEach((asig, i) => {
        const celda = est.celdas?.[asig.ofertaCursoId] ?? null;
        c.cell(row, colAsigStart + i, fmtPct(celda?.pctAsistencia), {
          fill: zebra,
          size: small,
        });
      });
      c.cell(row, colPromedio, fmtPct(est.promedioPct), {
        fill: EXCEL_COLOR.finalCell,
        bold: true,
        size: small,
      });
    });

    if (estudiantes.length === 0) {
      c.merge(
        `${L(colNro)}${firstDataRow}:${L(lastCol)}${firstDataRow}`,
        'Sin registros de asistencia computables para el paralelo.',
        { size: label, align: 'center', fontColor: EXCEL_COLOR.inkSoft },
      );
    }

    c.freeze(rowDocente, colCodigo);
  }
}

export default AsistenciaConsolidadoSheetBuilder;
