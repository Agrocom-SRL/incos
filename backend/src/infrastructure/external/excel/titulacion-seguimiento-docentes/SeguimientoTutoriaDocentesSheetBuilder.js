/**
 * SeguimientoTutoriaDocentesSheetBuilder — construye la hoja de UN docente
 * del reporte de Seguimiento de tutorías a docentes (módulo TIT ·
 * titulación, extensión 2026-08-10). Réplica digital de "PLANILLA DE
 * SEGUIMIENTO DE TUTORIA 2026.xlsx" ("PLANILLA DE SEGUIMIENTO A DOCENTES EN
 * TUTORIAS"): cabecera institucional (DOCENTE / CARRERA / mes-gestión / Nº
 * TUTORÍAS EJECUTADAS EN EL MES) + tabla de tutoriados + fila de firma del
 * docente al final (una sola vez por docente, NO por tutoriado).
 *
 * Solo construcción + estilos (ExcelSheetComposer + ExcelTheme, banda
 * FF196B45). Sin lógica de negocio: los datos ya llegan resueltos desde
 * GetSeguimientoTutoriaDocentesUseCase.
 */

import { EXCEL_COLOR, EXCEL_FONT_SIZE } from '../shared/index.js';
import { colLetter as L } from '../shared/ExcelSheetComposer.js';
import {
  COL,
  LAST_COL,
  COL_WIDTHS,
  FILA,
  ROW_HEIGHTS,
  MESES_NOMBRE,
} from './sheet/seguimientoTutoriaDocentesSheetConfig.js';

const fmtPct = (value) => {
  const n = Number(value);
  if (value == null || !Number.isFinite(n)) return '—';
  return `${n}%`;
};

export class SeguimientoTutoriaDocentesSheetBuilder {
  /**
   * @param {Object} params
   * @param {import('../shared/ExcelSheetComposer.js').ExcelSheetComposer} params.composer
   * @param {Object} params.datos - { anio, mes, docente } — `docente` es
   *   `null` para la hoja "Sin datos" (sin docentes-tutores con tutoriados
   *   activos para el filtro seleccionado).
   */
  static build({ composer: c, datos }) {
    const { anio, mes, docente } = datos ?? {};
    c.colWidths(COL_WIDTHS);

    if (!docente) {
      c.merge(
        `${L(COL.nro)}1:${L(LAST_COL)}1`,
        'Sin docentes-tutores con tutoriados activos para el filtro seleccionado.',
        { size: EXCEL_FONT_SIZE.label, align: 'center', fontColor: EXCEL_COLOR.inkSoft }
      );
      return;
    }

    const tutoriados = Array.isArray(docente.tutoriados) ? docente.tutoriados : [];
    const carreraTexto = (docente.carreras ?? [])
      .map((carr) => carr.carreraNombre)
      .filter(Boolean)
      .join(' / ');

    this._cabecera(c, { anio, mes, docente, carreraTexto });
    this._cabeceraTabla(c);
    this._filasTutoriados(c, { tutoriados });

    const filaFirma = FILA.dataInicio + Math.max(tutoriados.length, 1) + 1;
    this._firmaDocente(c, { fila: filaFirma });
  }

  /** Banda de título + DOCENTE / CARRERA / gestión-mes / Nº tutorías ejecutadas. */
  static _cabecera(c, { anio, mes, docente, carreraTexto }) {
    c.mergeBox(
      FILA.tituloInicio,
      COL.nro,
      FILA.tituloFin,
      LAST_COL,
      'PLANILLA DE SEGUIMIENTO A DOCENTES EN TUTORÍAS',
      {
        size: EXCEL_FONT_SIZE.subtitle,
        bold: true,
        fontColor: EXCEL_COLOR.bandText,
        fill: EXCEL_COLOR.band,
        borderMedium: true,
      }
    );
    c.rowHeight(FILA.tituloInicio, ROW_HEIGHTS.titulo);
    c.rowHeight(FILA.tituloFin, ROW_HEIGHTS.titulo);

    c.merge(
      `${L(COL.nro)}${FILA.docente}:${L(LAST_COL)}${FILA.docente}`,
      `DOCENTE: ${docente.docenteNombre ?? '—'}`,
      { size: EXCEL_FONT_SIZE.body, bold: true, align: 'left', border: false }
    );
    c.merge(
      `${L(COL.nro)}${FILA.carrera}:${L(LAST_COL)}${FILA.carrera}`,
      `CARRERA: ${carreraTexto || '—'}`,
      { size: EXCEL_FONT_SIZE.small, align: 'left', fontColor: EXCEL_COLOR.inkSoft, border: false }
    );

    const mesNombre = MESES_NOMBRE[mes] ?? mes ?? '';
    const infoTexto = [
      `GESTIÓN: ${anio ?? ''}`,
      `MES: ${mesNombre}`,
      `FECHA DE GENERACIÓN: ${new Date().toLocaleDateString('es-BO')}`,
      `Nº TUTORÍAS EJECUTADAS EN EL MES: ${docente.tutoriasEjecutadasMes ?? 0}`,
    ].join('   ·   ');
    c.merge(`${L(COL.nro)}${FILA.info}:${L(LAST_COL)}${FILA.info}`, infoTexto, {
      size: EXCEL_FONT_SIZE.small,
      bold: true,
      align: 'left',
      fontColor: EXCEL_COLOR.inkSoft,
      border: false,
    });
  }

  /** Cabecera de la tabla de tutoriados. */
  static _cabeceraTabla(c) {
    const row = FILA.header;
    const headStyle = {
      bold: true,
      size: EXCEL_FONT_SIZE.small,
      wrap: true,
      fill: EXCEL_COLOR.statHeader,
      fontColor: EXCEL_COLOR.statHeaderText,
      borderMedium: true,
    };
    c.cell(row, COL.nro, 'N°', headStyle);
    c.cell(row, COL.nombre, 'NOMBRE Y APELLIDO DE LOS TUTORIADOS', { ...headStyle, align: 'left' });
    c.cell(
      row,
      COL.actividad,
      'ACTIVIDAD (DETALLAR EL AVANCE DEL PROYECTO EN RELACIÓN AL CRONOGRAMA DE TUTORÍA)',
      { ...headStyle, align: 'left' }
    );
    c.cell(row, COL.avance, 'PORCENTAJE DE AVANCE', headStyle);
    c.cell(row, COL.obs, 'OBSERVACIONES', { ...headStyle, align: 'left' });
    c.cell(row, COL.firma, 'FIRMA DEL DOCENTE', headStyle);
    c.rowHeight(row, ROW_HEIGHTS.header);
  }

  /** Filas de tutoriados (una por tutoriado; sin paginación en folios). */
  static _filasTutoriados(c, { tutoriados }) {
    const { small } = EXCEL_FONT_SIZE;

    if (tutoriados.length === 0) {
      const row = FILA.dataInicio;
      c.rowHeight(row, ROW_HEIGHTS.dataRow);
      c.merge(`${L(COL.nro)}${row}:${L(LAST_COL)}${row}`, 'Sin tutoriados activos.', {
        size: small,
        align: 'center',
        fontColor: EXCEL_COLOR.inkSoft,
      });
      return;
    }

    tutoriados.forEach((tut, idx) => {
      const row = FILA.dataInicio + idx;
      c.rowHeight(row, ROW_HEIGHTS.dataRow);
      c.cell(row, COL.nro, idx + 1, { size: small });
      c.cell(row, COL.nombre, String(tut.nombreCompleto ?? '').toUpperCase(), {
        size: small,
        align: 'left',
        wrap: true,
      });
      c.cell(row, COL.actividad, tut.ultimaActividad ?? '', { size: small, align: 'left', wrap: true });
      c.cell(row, COL.avance, fmtPct(tut.porcentajeAvance), { size: small, bold: true });
      c.cell(row, COL.obs, tut.ultimaObservacion ?? '', { size: small, align: 'left', wrap: true });
      // Columna FIRMA DEL DOCENTE: en blanco a propósito (espacio de impresión).
      c.cell(row, COL.firma, '', { size: small });
    });
  }

  /**
   * Fila única de firma del docente, al final del bloque (NO por
   * tutoriado): un docente firma una sola vez por su planilla mensual.
   */
  static _firmaDocente(c, { fila }) {
    c.rowHeight(fila, ROW_HEIGHTS.firma);
    c.mergeBox(fila, COL.nro, fila, COL.actividad, 'FIRMA DEL DOCENTE TUTOR:', {
      size: EXCEL_FONT_SIZE.small,
      bold: true,
      align: 'left',
      border: false,
    });
    c.mergeBox(fila, COL.avance, fila, LAST_COL, '', { border: true, borderMedium: true });
  }
}

export default SeguimientoTutoriaDocentesSheetBuilder;
