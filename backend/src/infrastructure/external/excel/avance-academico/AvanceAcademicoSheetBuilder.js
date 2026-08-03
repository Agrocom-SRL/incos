/**
 * AvanceAcademicoSheetBuilder — construye la ÚNICA hoja del reporte de Avance
 * académico: cabecera institucional + tabla estudiante × plan con materias
 * aprobadas/convalidadas, total del plan y % de avance.
 *
 * Solo construcción + estilos (vía ExcelSheetComposer + ExcelTheme, cabecera
 * VERDE primario #196B45). Sin lógica de negocio: los % llegan calculados
 * desde GetAvanceAcademicoUseCase (paridad pantalla ↔ Excel).
 */

import { EXCEL_COLOR, EXCEL_FONT_SIZE } from '../shared/index.js';
import { colLetter as L } from '../shared/ExcelSheetComposer.js';

const fmtPct = (value) => {
  const n = Number(value);
  if (value == null || !Number.isFinite(n)) return '—';
  return `${n.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
};

export class AvanceAcademicoSheetBuilder {
  /**
   * @param {Object} params
   * @param {import('../shared/ExcelSheetComposer.js').ExcelSheetComposer} params.composer
   * @param {Object} params.datos - Ver IAvanceAcademicoExcelGenerator.
   */
  static build({ composer: c, datos }) {
    const { small, body, label } = EXCEL_FONT_SIZE;
    const filas = Array.isArray(datos.filas) ? datos.filas : [];

    // ---- Mapa de columnas (1-based; col 1 = margen) ----
    const colNro = 2;
    const colNombre = 3;
    const colCodigo = 4;
    const colCarrera = 5;
    const colPlan = 6;
    const colAprobadas = 7;
    const colConvalidadas = 8;
    const colTotalPlan = 9;
    const colPct = 10;
    const colPromedio = 11;
    const colUltimaGestion = 12;
    const lastCol = colUltimaGestion;

    c.colWidths({
      1: 4,
      [colNro]: 7,
      [colNombre]: 46,
      [colCodigo]: 14,
      [colCarrera]: 30,
      [colPlan]: 26,
      [colAprobadas]: 14,
      [colConvalidadas]: 16,
      [colTotalPlan]: 14,
      [colPct]: 14,
      [colPromedio]: 13,
      [colUltimaGestion]: 14,
    });

    // ---- Título + cabecera institucional (planilla verde) ----
    c.bandTitle(`B1:${L(lastCol)}1`, 'AVANCE ACADÉMICO POR ESTUDIANTE');
    c.merge(`B2:${L(lastCol)}2`, 'INSTITUTO TÉCNICO INCOS SANTA CRUZ', {
      bold: true,
      size: body,
      fontColor: EXCEL_COLOR.inkSoft,
      border: false,
    });
    c.infoField('B3:B3', 'CARRERA:', `C3:${L(colPlan)}3`, datos.carreraFiltro ?? 'TODAS');
    c.infoField(
      `${L(colAprobadas)}3:${L(colConvalidadas)}3`,
      'FECHA EMISIÓN:',
      `${L(colTotalPlan)}3:${L(lastCol)}3`,
      datos.fechaEmision ?? '',
    );

    // ---- Cabecera de tabla ----
    const headRow = 5;
    const headStyle = {
      bold: true,
      size: small,
      wrap: true,
      fill: EXCEL_COLOR.statHeader,
      fontColor: EXCEL_COLOR.statHeaderText,
      borderMedium: true,
    };
    c.cell(headRow, colNro, 'Nº', headStyle);
    c.cell(headRow, colNombre, 'NÓMINA DE ESTUDIANTES', headStyle);
    c.cell(headRow, colCodigo, 'CÓDIGO', headStyle);
    c.cell(headRow, colCarrera, 'CARRERA', headStyle);
    c.cell(headRow, colPlan, 'PLAN DE ESTUDIOS', headStyle);
    c.cell(headRow, colAprobadas, 'APROBADAS', headStyle);
    c.cell(headRow, colConvalidadas, 'CONVALIDADAS', headStyle);
    c.cell(headRow, colTotalPlan, 'TOTAL PLAN', headStyle);
    c.cell(headRow, colPct, '% AVANCE', { ...headStyle, fill: EXCEL_COLOR.finalHeader });
    c.cell(headRow, colPromedio, 'PROMEDIO', headStyle);
    c.cell(headRow, colUltimaGestion, 'ÚLT. GESTIÓN', headStyle);
    c.rowHeight(headRow, 32);

    // ---- Filas (zebra) ----
    const firstDataRow = headRow + 1;
    filas.forEach((fila, idx) => {
      const row = firstDataRow + idx;
      const zebra = idx % 2 === 1 ? EXCEL_COLOR.zebra : EXCEL_COLOR.white;
      c.cell(row, colNro, idx + 1, { fill: zebra, size: small });
      c.cell(row, colNombre, String(fila.nombreCompleto ?? '').toUpperCase(), {
        fill: zebra,
        align: 'left',
        size: small,
      });
      c.cell(row, colCodigo, fila.codigo ?? '', { fill: zebra, size: small });
      c.cell(row, colCarrera, fila.carreraNombre ?? '', {
        fill: zebra,
        align: 'left',
        size: small,
        wrap: true,
      });
      c.cell(row, colPlan, fila.planNombre ?? '', {
        fill: zebra,
        align: 'left',
        size: small,
        wrap: true,
      });
      c.cell(row, colAprobadas, fila.materiasAprobadas ?? 0, { fill: zebra, size: small });
      c.cell(row, colConvalidadas, fila.materiasConvalidadas ?? 0, { fill: zebra, size: small });
      c.cell(row, colTotalPlan, fila.totalAsignaturasPlan ?? 0, { fill: zebra, size: small });
      c.cell(row, colPct, fmtPct(fila.pctAvance), {
        fill: EXCEL_COLOR.finalCell,
        bold: true,
        size: small,
      });
      c.cell(row, colPromedio, fila.promedioHistorial ?? '—', { fill: zebra, size: small });
      c.cell(row, colUltimaGestion, fila.ultimaGestionAnio ?? '—', { fill: zebra, size: small });
    });

    if (filas.length === 0) {
      c.merge(
        `${L(colNro)}${firstDataRow}:${L(lastCol)}${firstDataRow}`,
        'Sin registros académicos para calcular el avance.',
        { size: label, align: 'center', fontColor: EXCEL_COLOR.inkSoft },
      );
    }

    c.freeze(headRow, colCodigo);
  }
}

export default AvanceAcademicoSheetBuilder;
