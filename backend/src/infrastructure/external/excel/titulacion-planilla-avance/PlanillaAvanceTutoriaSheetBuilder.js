/**
 * PlanillaAvanceTutoriaSheetBuilder — construye la ÚNICA hoja de la Planilla
 * de avance de tutorías "10 en 10" (módulo TIT · titulación, Requisito 3):
 * los folios de 10 estudiantes APILADOS verticalmente (réplica del patrón del
 * Libro de registro — folios + hoja de firmas final que NO incrementa folio,
 * ver `libro-registro/LibroRegistroSheetBuilder.js`, SOLO como patrón, sin
 * importar nada de ese módulo) y, al final, FIRMAS DE DOCENTES + cuadro de %.
 *
 * Solo construcción + estilos (ExcelSheetComposer + ExcelTheme, banda
 * FF196B45). Sin lógica de negocio: folios, tutores y tally llegan resueltos
 * desde GetPlanillaAvanceTercerAnioUseCase.
 */

import { EXCEL_COLOR, EXCEL_FONT_SIZE } from '../shared/index.js';
import { colLetter as L } from '../shared/ExcelSheetComposer.js';
import { FILAS_POR_FOLIO, COL, LAST_COL, COL_WIDTHS, FILA, ROW_HEIGHTS, RESULTADO_COLOR } from './sheet/planillaAvanceTutoriaSheetConfig.js';

const fmtPct = (value) => {
  const n = Number(value);
  if (value == null || !Number.isFinite(n)) return '—';
  return `${n}%`;
};

export class PlanillaAvanceTutoriaSheetBuilder {
  /**
   * @param {Object} params
   * @param {import('../shared/ExcelSheetComposer.js').ExcelSheetComposer} params.composer
   * @param {Object} params.datos - Ver IPlanillaAvanceTutoriaExcelGenerator.
   */
  static build({ composer: c, datos }) {
    const cabecera = datos?.cabecera ?? {};
    const folios = Array.isArray(datos?.folios) ? datos.folios : [];
    const resumenTutores = Array.isArray(datos?.resumenTutores) ? datos.resumenTutores : [];
    const tally = datos?.tally ?? {};

    c.colWidths(COL_WIDTHS);

    if (folios.length === 0) {
      c.merge(`${L(COL.nro)}1:${L(LAST_COL)}1`, 'Sin estudiantes de 3er año con proyecto vigente para el filtro seleccionado.', {
        size: EXCEL_FONT_SIZE.label,
        align: 'center',
        fontColor: EXCEL_COLOR.inkSoft,
      });
      return;
    }

    folios.forEach((estudiantes, idx) => {
      const base = idx * FILAS_POR_FOLIO;
      this._cabeceraFolio(c, { base, folioNumero: idx + 1, totalFolios: folios.length, cabecera });
      this._cabeceraTabla(c, { base });
      this._filasEstudiantes(c, { base, estudiantes });
      c.ws.getRow(base + FILA.spacer).addPageBreak();
    });

    const baseFirmas = folios.length * FILAS_POR_FOLIO;
    this._firmasDocentes(c, { base: baseFirmas, resumenTutores, cabecera });
    this._cuadroPorcentajes(c, { base: baseFirmas, resumenTutores, tally });
  }

  /** Banda de título + datos de cabecera (carrera / gestión / bimestre / folio N°). */
  static _cabeceraFolio(c, { base, folioNumero, totalFolios, cabecera }) {
    c.mergeBox(base + FILA.tituloInicio, COL.nro, base + FILA.tituloFin, LAST_COL, 'PLANILLA DE AVANCE DE TUTORÍA · 3ER AÑO', {
      size: EXCEL_FONT_SIZE.subtitle,
      bold: true,
      fontColor: EXCEL_COLOR.bandText,
      fill: EXCEL_COLOR.band,
      borderMedium: true,
    });
    c.rowHeight(base + FILA.tituloInicio, ROW_HEIGHTS.titulo);
    c.rowHeight(base + FILA.tituloFin, ROW_HEIGHTS.titulo);

    const infoTexto = [
      cabecera.carreraNombre ? `CARRERA: ${cabecera.carreraNombre}` : null,
      cabecera.gestionAnio ? `GESTIÓN: ${cabecera.gestionAnio}` : null,
      cabecera.bimestre ? `BIMESTRE: ${cabecera.bimestre}` : null,
      `FOLIO N° ${folioNumero} / ${totalFolios}`,
    ]
      .filter(Boolean)
      .join('   ·   ');
    c.merge(`${L(COL.nro)}${base + FILA.info}:${L(LAST_COL)}${base + FILA.info}`, infoTexto, {
      size: EXCEL_FONT_SIZE.small,
      bold: true,
      align: 'left',
      fontColor: EXCEL_COLOR.inkSoft,
      border: false,
    });
  }

  /** Cabecera de la tabla de estudiantes. */
  static _cabeceraTabla(c, { base }) {
    const row = base + FILA.header;
    const headStyle = {
      bold: true,
      size: EXCEL_FONT_SIZE.small,
      wrap: true,
      fill: EXCEL_COLOR.statHeader,
      fontColor: EXCEL_COLOR.statHeaderText,
      borderMedium: true,
    };
    c.cell(row, COL.nro, 'N°', headStyle);
    c.cell(row, COL.nombre, 'NÓMINA DE ESTUDIANTES', { ...headStyle, align: 'left' });
    c.cell(row, COL.ci, 'C.I.', headStyle);
    c.cell(row, COL.tutor, 'TUTOR', { ...headStyle, align: 'left' });
    c.cell(row, COL.tutorias, 'Nº TUTORÍAS DEL BIMESTRE', headStyle);
    c.cell(row, COL.avance, '% AVANCE', headStyle);
    c.cell(row, COL.obs, 'OBSERVACIONES', headStyle);
    c.rowHeight(row, ROW_HEIGHTS.header);
  }

  /** Filas de estudiantes (hasta 10; filas vacías hasta completar el folio). */
  static _filasEstudiantes(c, { base, estudiantes }) {
    const totalFilas = FILA.dataFin - FILA.dataInicio + 1;
    const { small } = EXCEL_FONT_SIZE;

    for (let i = 0; i < totalFilas; i += 1) {
      const row = base + FILA.dataInicio + i;
      const est = estudiantes[i] ?? null;
      c.rowHeight(row, ROW_HEIGHTS.dataRow);

      c.cell(row, COL.nro, est?.numeroOrden ?? '', { size: small });
      c.cell(row, COL.nombre, est ? String(est.nombreCompleto ?? '').toUpperCase() : '', {
        size: small,
        align: 'left',
      });
      const ciTexto = est ? `${est.ci ?? ''}${est.expedicion ? ` ${est.expedicion}` : ''}`.trim() : '';
      c.cell(row, COL.ci, ciTexto, { size: small });
      c.cell(row, COL.tutor, est?.tutorNombre ?? '', { size: small, align: 'left' });
      c.cell(row, COL.tutorias, est ? String(est.totalTutoriasBimestre ?? 0) : '', { size: small });
      c.cell(row, COL.avance, est ? fmtPct(est.porcentajeAvance) : '', {
        size: small,
        bold: true,
        fontColor: RESULTADO_COLOR[est?.resultadoTutoria] ?? EXCEL_COLOR.ink,
      });
      c.cell(row, COL.obs, est?.ultimaObservacion ?? '', { size: small, align: 'left', wrap: true });
    }
  }

  /**
   * Página de FIRMAS DE DOCENTES (al final, tras el último folio). Artefacto
   * de impresión: NO es un folio y NO incrementa numeración (mismo criterio
   * que la hoja de firmas del Libro de registro).
   */
  static _firmasDocentes(c, { base, resumenTutores, cabecera }) {
    const { small } = EXCEL_FONT_SIZE;
    c.mergeBox(base + 2, COL.nro, base + 3, LAST_COL, 'FIRMAS DE DOCENTES TUTORES', {
      size: EXCEL_FONT_SIZE.subtitle,
      bold: true,
      fontColor: EXCEL_COLOR.bandText,
      fill: EXCEL_COLOR.band,
      borderMedium: true,
    });
    c.merge(
      `${L(COL.nro)}${base + 4}:${L(LAST_COL)}${base + 4}`,
      `INSTITUTO TÉCNICO INCOS SANTA CRUZ · ${cabecera.carreraNombre ?? ''} · GESTIÓN ${cabecera.gestionAnio ?? ''} · BIMESTRE ${cabecera.bimestre ?? ''}`,
      { size: small, fontColor: EXCEL_COLOR.inkSoft, border: false }
    );

    const headRow = base + 6;
    const headStyle = {
      bold: true,
      size: small,
      fill: EXCEL_COLOR.statHeader,
      fontColor: EXCEL_COLOR.statHeaderText,
      borderMedium: true,
    };
    c.cell(headRow, COL.nro, 'N°', headStyle);
    c.mergeBox(headRow, COL.nombre, headRow, COL.tutor, 'DOCENTE TUTOR', { ...headStyle, align: 'left' });
    c.mergeBox(headRow, COL.tutorias, headRow, LAST_COL, 'FIRMA', headStyle);

    const tutores = resumenTutores.length > 0 ? resumenTutores : ['—'];
    tutores.forEach((tutorNombre, i) => {
      const row = headRow + 1 + i * 2; // fila de datos + fila de aire para firmar
      c.rowHeight(row, ROW_HEIGHTS.dataRow + 10);
      c.cell(row, COL.nro, i + 1, { size: small });
      c.mergeBox(row, COL.nombre, row, COL.tutor, tutorNombre, { size: small, align: 'left' });
      c.mergeBox(row, COL.tutorias, row, LAST_COL, '', { size: small });
    });
  }

  /** Cuadro de % (aprobados/reprobados/abandonos) sobre el total del roster. */
  static _cuadroPorcentajes(c, { base, resumenTutores, tally }) {
    const startRow = base + 8 + Math.max(1, resumenTutores.length || 1) * 2;
    const { small, body } = EXCEL_FONT_SIZE;
    const total = Number(tally.total ?? 0) || 1;
    const pct = (n) => `${Math.round(((Number(n) || 0) / total) * 100)}%`;

    c.mergeBox(startRow, COL.nro, startRow, LAST_COL, 'RESULTADOS DEL BIMESTRE (SOBRE EL TOTAL DEL ROSTER)', {
      size: body,
      bold: true,
      fontColor: EXCEL_COLOR.bandText,
      fill: EXCEL_COLOR.finalHeader,
      borderMedium: true,
    });

    const filaCuadro = startRow + 2;
    const headers = ['Aprobados', 'Reprobados', 'Abandonos', 'En proceso'];
    const valores = [tally.aprobados, tally.reprobados, tally.abandonos, tally.enProceso];
    const colWidth = Math.floor((LAST_COL - COL.nro + 1) / headers.length);

    headers.forEach((label, i) => {
      const colStart = COL.nro + i * colWidth;
      const colEnd = i === headers.length - 1 ? LAST_COL : colStart + colWidth - 1;
      c.mergeBox(filaCuadro, colStart, filaCuadro, colEnd, label, {
        bold: true,
        size: small,
        fill: EXCEL_COLOR.infoLabel,
        borderMedium: true,
      });
      c.mergeBox(filaCuadro + 1, colStart, filaCuadro + 1, colEnd, `${valores[i] ?? 0} (${pct(valores[i])})`, {
        size: body,
        bold: true,
      });
    });
  }
}

export default PlanillaAvanceTutoriaSheetBuilder;
