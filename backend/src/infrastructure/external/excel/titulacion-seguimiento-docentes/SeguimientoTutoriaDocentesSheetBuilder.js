/**
 * SeguimientoTutoriaDocentesSheetBuilder — construye la hoja de UNA CARRERA
 * del reporte de Seguimiento de tutorías a docentes (módulo TIT ·
 * titulación, extensión 2026-08-10, rediseño 2026-08-10 a "una hoja por
 * carrera, resumen mensual"). Réplica digital de "PLANILLA DE SEGUIMIENTO DE
 * TUTORIA 2026.xlsx" ("PLANILLA DE SEGUIMIENTO A DOCENTES EN TUTORIAS"):
 * cabecera institucional con logo en el bloque A3:C5 y, a su derecha,
 * CARRERA / GESTIÓN / GENERADO (rótulo/valor separados) + tabla PLANA con
 * TODOS los docentes-tutores de la carrera (columna DOCENTE por fila, sin
 * sub-cabeceras), una fila por tutoriado con el resumen del mes (Nro
 * tutorías en el mes / desarrolladas, actividad y observación = progreso
 * final de ese mes, columna FIRMA DEL DOCENTE por fila) + firma de la
 * Directora Académica al pie, una sola vez por hoja.
 *
 * Solo construcción + estilos (ExcelSheetComposer + ExcelTheme, banda
 * FF196B45). Sin lógica de negocio: los datos ya llegan resueltos desde
 * GetSeguimientoTutoriaDocentesPorCarreraUseCase.
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

/**
 * Aproxima cuántas líneas ocupa un texto envuelto (`wrapText`) en una columna
 * de `colWidth` unidades a fuente `small` (14pt) — ExcelJS no calcula alto de
 * fila automáticamente para texto envuelto, a diferencia del PDF (`_addTable`
 * ya resuelve esto por línea real; aquí es una estimación por longitud, más
 * barata y suficiente para dimensionar la fila).
 */
const CHARS_POR_UNIDAD = 0.8;
const estimateWrappedLines = (text, colWidth) => {
  const str = String(text ?? '').trim();
  if (!str) return 1;
  const capacidad = Math.max(6, Math.floor(colWidth * CHARS_POR_UNIDAD));
  return Math.max(1, Math.ceil(str.length / capacidad));
};

export class SeguimientoTutoriaDocentesSheetBuilder {
  /**
   * @param {Object} params
   * @param {import('../shared/ExcelSheetComposer.js').ExcelSheetComposer} params.composer
   * @param {Object} params.datos - { anio, mes, carrera } — `carrera` es
   *   `null` para la hoja "Sin datos" (sin docentes-tutores con tutoriados
   *   activos para el filtro seleccionado).
   * @param {number|null} [params.logoId] - Id de imagen del logo institucional
   *   en el workbook (`workbook.addImage`), o `null` si no se pudo cargar.
   */
  static build({ composer: c, datos, logoId = null }) {
    const { anio, mes, carrera } = datos ?? {};
    c.colWidths(COL_WIDTHS);
    this._alturasBloqueLogo(c);
    this._logo(c, logoId);

    if (!carrera) {
      c.merge(
        `${L(COL.tutoriasMes)}1:${L(LAST_COL)}1`,
        'Sin docentes-tutores con tutoriados activos para el filtro seleccionado.',
        { size: EXCEL_FONT_SIZE.label, align: 'center', fontColor: EXCEL_COLOR.inkSoft }
      );
      return;
    }

    this._cabecera(c, { anio, mes, carrera });
    this._cabeceraTabla(c);

    const tutoriados = Array.isArray(carrera.tutoriados) ? carrera.tutoriados : [];
    const filaDespuesDatos = this._filasTutoriados(c, { tutoriados });

    this._firmaDirectora(c, { fila: filaDespuesDatos + 3 });
  }

  /** Alto de las 3 filas del bloque logo + CARRERA/GESTIÓN/GENERADO (A3:C5). */
  static _alturasBloqueLogo(c) {
    for (let row = FILA.imagenInicio; row <= FILA.imagenFin; row += 1) {
      c.rowHeight(row, ROW_HEIGHTS.cabecera);
    }
  }

  /**
   * Logo institucional al 100% del bloque A3:C5 (columnas
   * `tutoriasMes`..`docente`, filas `FILA.imagenInicio`..`imagenFin`):
   * ancla a los bordes ENTEROS del bloque (sin fracciones de columna) para
   * que el logo llene el cuadro completo — con offset fraccionario ExcelJS
   * no respeta el ancho `customWidth` de la columna en todos los lectores
   * (Excel/Numbers difieren de LibreOffice en la conversión a EMU), lo que
   * puede recortar o desplazar la imagen; con límites enteros el offset se
   * resuelve por suma de anchos reales de columna, sin ese riesgo.
   */
  static _logo(c, logoId) {
    if (logoId == null) return;

    c.ws.addImage(logoId, {
      tl: { col: COL.tutoriasMes - 1, row: FILA.imagenInicio - 1 },
      br: { col: COL.docente, row: FILA.imagenFin },
    });
  }

  /**
   * Banda de título + bloque A3:C5 (logo, ver `_logo`) con CARRERA / GESTIÓN
   * / GENERADO a la derecha del logo: rótulo SOLO en la columna
   * `participante` (D) y valor fusionado en `actividad`..`firma` (E:H), una
   * fila por dato.
   */
  static _cabecera(c, { anio, mes, carrera }) {
    c.mergeBox(
      FILA.tituloInicio,
      COL.tutoriasMes,
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

    const campo = (fila, etiqueta, valor, { fontColor } = {}) => {
      c.cell(fila, COL.participante, etiqueta, {
        size: EXCEL_FONT_SIZE.label,
        bold: true,
        align: 'left',
        border: false,
        fontColor,
      });
      c.merge(`${L(COL.actividad)}${fila}:${L(LAST_COL)}${fila}`, valor, {
        size: EXCEL_FONT_SIZE.label,
        align: 'left',
        border: false,
        fontColor,
      });
    };

    campo(FILA.carrera, 'CARRERA:', carrera.carreraNombre ?? '—');

    const mesNombre = MESES_NOMBRE[mes] ?? mes ?? '';
    campo(FILA.gestion, 'GESTIÓN:', `${anio ?? ''}   ·   MES: ${mesNombre}`, {
      fontColor: EXCEL_COLOR.inkSoft,
    });
    campo(FILA.generado, 'GENERADO:', new Date().toLocaleDateString('es-BO'), {
      fontColor: EXCEL_COLOR.inkSoft,
    });
  }

  /** Cabecera de la tabla: Nro tutorías (mes/desarrolladas), docente, tutoriados, actividad, avance, obs, firma. */
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
    c.cell(row, COL.tutoriasMes, 'Nro TUTORIAS EN EL MES', headStyle);
    c.cell(row, COL.tutoriasDesarrolladas, 'Nro. TUTORÍAS DESARROLLADAS EN EL MES', headStyle);
    c.cell(row, COL.docente, 'DOCENTE', { ...headStyle, align: 'left' });
    c.cell(row, COL.participante, 'NOMBRE Y APELLIDO DE LOS TUTORIADOS', { ...headStyle, align: 'left' });
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

  /**
   * Filas de tutoriados: tabla plana con TODOS los docentes-tutores de la
   * carrera (ya vienen ordenados por docente y luego por tutoriado desde el
   * use case), una fila por tutoriado con el resumen del mes.
   * @returns {number} Última fila usada (para ubicar la firma de Directora).
   */
  static _filasTutoriados(c, { tutoriados }) {
    const { small } = EXCEL_FONT_SIZE;

    if (tutoriados.length === 0) {
      const row = FILA.dataInicio;
      c.rowHeight(row, ROW_HEIGHTS.dataRow);
      c.merge(`${L(COL.tutoriasMes)}${row}:${L(LAST_COL)}${row}`, 'Sin tutoriados activos.', {
        size: small,
        align: 'center',
        fontColor: EXCEL_COLOR.inkSoft,
      });
      return row;
    }

    let row = FILA.dataInicio;
    tutoriados.forEach((tut) => {
      const participante = String(tut.nombreCompleto ?? '').toUpperCase();
      // Alto dinámico: ExcelJS no auto-ajusta la fila a texto envuelto, así
      // que se estima por la columna que más líneas necesite (evita el
      // recorte visto con observaciones/actividades largas a alto fijo).
      const lineas = Math.max(
        estimateWrappedLines(tut.docenteNombre, COL_WIDTHS[COL.docente]),
        estimateWrappedLines(participante, COL_WIDTHS[COL.participante]),
        estimateWrappedLines(tut.ultimaActividad, COL_WIDTHS[COL.actividad]),
        estimateWrappedLines(tut.ultimaObservacion, COL_WIDTHS[COL.obs]),
      );
      c.rowHeight(row, Math.max(ROW_HEIGHTS.dataRow, lineas * 18 + 8));
      c.cell(row, COL.tutoriasMes, tut.totalTutoriasMes ?? 0, { size: small });
      c.cell(row, COL.tutoriasDesarrolladas, tut.tutoriasEjecutadasMes ?? 0, { size: small, bold: true });
      c.cell(row, COL.docente, tut.docenteNombre ?? '—', { size: small, align: 'left', wrap: true });
      c.cell(row, COL.participante, participante, { size: small, align: 'left', wrap: true });
      c.cell(row, COL.actividad, tut.ultimaActividad ?? '', { size: small, align: 'left', wrap: true });
      c.cell(row, COL.avance, fmtPct(tut.porcentajeAvance), { size: small, bold: true });
      c.cell(row, COL.obs, tut.ultimaObservacion ?? '', { size: small, align: 'left', wrap: true });
      // Columna FIRMA DEL DOCENTE: en blanco a propósito (espacio de impresión).
      c.cell(row, COL.firma, '', { size: small });
      row += 1;
    });

    return row - 1;
  }

  /**
   * Firma de la Directora Académica, al final de la hoja (una sola vez por
   * carrera — la firma por docente ya la cubre la columna FIRMA DEL DOCENTE
   * de cada fila): línea (borde superior) angosta, columnas
   * `docente`..`participante` (C:D), centrada, mismo criterio que
   * `LibroRegistroSheetBuilder._firmasAutoridades`.
   */
  static _firmaDirectora(c, { fila }) {
    c.rowHeight(fila, ROW_HEIGHTS.firma);
    c.mergeBox(fila, COL.docente, fila, COL.participante, 'DIRECTORA ACADÉMICA', {
      size: EXCEL_FONT_SIZE.small,
      bold: true,
      align: 'center',
      border: false,
    });
    for (let col = COL.docente; col <= COL.participante; col += 1) {
      c.ws.getCell(fila, col).border = {
        top: { style: 'thin', color: { argb: EXCEL_COLOR.ink } },
      };
    }
  }
}

export default SeguimientoTutoriaDocentesSheetBuilder;
