/**
 * CentralizadorSheetBuilder — construye UNA hoja del Centralizador de Calificaciones
 * (un paralelo, un bimestre): cabecera institucional + matriz estudiantes × asignaturas
 * con la nota del bimestre elegido, ESTADO y OBSERVACIONES.
 *
 * Solo construcción + estilos (vía ExcelSheetComposer + ExcelTheme). Sin lógica de
 * negocio: la nota, el flag `aprobado`, el estado y la observación llegan ya
 * calculados desde la capa de aplicación (paridad pantalla ↔ Excel).
 *
 * Estructura (SOLID/Clean): `build` solo orquesta. La configuración declarativa
 * (anchos, alturas, filas, colores de estado) vive en `sheet/centralizadorSheetConfig`,
 * la aritmética de columnas en `sheet/centralizadorSheetLayout` (pura) y el formato
 * de notas en `sheet/centralizadorSheetFormatters` (puro). Cada sección de la hoja
 * es un método privado `_seccion(c, datos, layout, cfg)` que mantiene EXACTAMENTE
 * los mismos rangos, merges, fills, tamaños, alturas y textos.
 *
 * Diseño reutilizable (Fase 2): `build({ composer, datos })` es autocontenido por
 * hoja, de modo que un libro por carrera pueda iterar este mismo builder con un
 * composer por paralelo sin tocar nada aquí.
 *
 * Anchos / merges: cada asignatura ocupa un bloque de 2 columnas (cabecera y nota
 * van fusionadas en el bloque) para que los nombres largos de materia respiren sin
 * forzar a ensanchar la NÓMINA ni el resto de columnas.
 */

import { EXCEL_COLOR, EXCEL_FONT_SIZE } from '../shared/index.js';
import { colLetter as L } from '../shared/ExcelSheetComposer.js';
import {
  COLS_POR_ASIGNATURA,
  COL_WIDTHS,
  ROW_HEIGHTS,
  HEADER_ROWS,
  ESTADO_COLOR
} from './sheet/centralizadorSheetConfig.js';
import { computeColumnMap } from './sheet/centralizadorSheetLayout.js';
import { formatNota, esNotaReprobada } from './sheet/centralizadorSheetFormatters.js';

export class CentralizadorSheetBuilder {
  /**
   * @param {Object} params
   * @param {import('../shared/ExcelSheetComposer.js').ExcelSheetComposer} params.composer
   * @param {Object} params.datos - Ver ICentralizadorExcelGenerator.
   */
  static build({ composer: c, datos }) {
    // Modelo normalizado (única fuente de verdad para las secciones).
    const model = {
      ...datos,
      cabecera: datos.cabecera ?? {},
      asignaturas: Array.isArray(datos.asignaturas) ? datos.asignaturas : [],
      estudiantes: Array.isArray(datos.estudiantes) ? datos.estudiantes : []
    };

    const cfg = {
      fonts: EXCEL_FONT_SIZE,
      widths: COL_WIDTHS,
      heights: ROW_HEIGHTS,
      rows: HEADER_ROWS,
      colsPorAsignatura: COLS_POR_ASIGNATURA,
      estadoColor: ESTADO_COLOR
    };

    const layout = computeColumnMap(model.asignaturas);

    this._anchos(c, model, layout, cfg);
    this._titulo(c, model, layout, cfg);
    this._campos(c, model, layout, cfg);
    this._cabeceraTabla(c, model, layout, cfg);
    this._notaMinima(c, model, layout, cfg);
    this._filasEstudiantes(c, model, layout, cfg);

    // Congela cabecera (hasta nota mínima) y las columnas de identificación.
    c.freeze(cfg.rows.rowMin, layout.COL_CI);
  }

  /** Anchos de columna: identificación fija + bloque por asignatura + estado/obs. */
  static _anchos(c, datos, layout, cfg) {
    const {
      COL_NRO,
      COL_NOMBRE_START,
      COL_NOMBRE_END,
      COL_CI,
      COL_ESTADO,
      COL_OBS_START,
      COL_OBS_END,
      subjectBlock
    } = layout;
    const { widths, colsPorAsignatura } = cfg;

    const nombreWidths = {};
    for (let col = COL_NOMBRE_START; col <= COL_NOMBRE_END; col += 1) {
      nombreWidths[col] = widths.nombreCol;
    }
    c.colWidths({
      1: widths.margin,
      [COL_NRO]: widths.nro,
      ...nombreWidths,
      [COL_CI]: widths.ci
    });
    for (let i = 0; i < datos.asignaturas.length; i += 1) {
      const start = subjectBlock(i);
      for (let k = 0; k < colsPorAsignatura; k += 1) {
        c.colWidths({ [start + k]: widths.asignatura });
      }
    }
    c.colWidths({
      [COL_ESTADO]: widths.estado,
      [COL_OBS_START]: widths.obs,
      [COL_OBS_END]: widths.obs
    });
  }

  /** Banda de título y subtítulo institucional (filas 1-2). */
  static _titulo(c, datos, layout, cfg) {
    const { lastCol } = layout;
    const { fonts, heights } = cfg;

    c.bandTitle(`B1:${L(lastCol)}1`, datos.titulo ?? 'CENTRALIZADOR DE CALIFICACIONES');
    c.merge(`B2:${L(lastCol)}2`, datos.institucion ?? 'INSTITUTO TÉCNICO INCOS SANTA CRUZ', {
      size: fonts.subtitle,
      bold: true,
      fontColor: EXCEL_COLOR.bandText,
      fill: EXCEL_COLOR.subtitleBand,
      borderMedium: true
    });
    c.rowHeight(1, heights.band);
    c.rowHeight(2, heights.subtitle);
  }

  /**
   * Bloque de campos (filas 4-6) en pares etiqueta/valor alineados al grid, más
   * la caja N° BIMESTRE destacada a la derecha. Pares: 1.º etiqueta B:C / valor
   * D:E, 2.º etiqueta H:I / valor desde J. La caja de BIMESTRE ocupa las últimas
   * columnas (mín. desde la col 11) para no solaparse con el valor del 2.º par.
   */
  static _campos(c, datos, layout, cfg) {
    const { lastCol } = layout;
    const { fonts } = cfg;
    const cab = datos.cabecera;

    // Caja de BIMESTRE a la derecha; arranca como muy pronto en la col 11 (K)
    // para dejar libre el valor del 2.º par (etiqueta H:I, valor desde J).
    const bimStartCol = Math.max(11, lastCol - 2);
    const valEnd = L(bimStartCol - 1); // fin de los valores que se extienden a la derecha.

    // Fila 4: CARRERA (valor ancho hasta antes de la caja de bimestre).
    c.infoField('B4:C4', 'CARRERA:', `D4:${valEnd}4`, cab.carrera);

    // Fila 5: PERIODO (1.º par B:C/D:E) + PARALELO (2.º par G:H/I…).
    c.infoField('B5:C5', 'PERIODO:', 'D5:E5', cab.periodo);
    c.infoField('G5:H5', 'PARALELO:', `I5:${valEnd}5`, cab.paralelo);

    // Fila 6: TURNO (1.º par B:C/D:E) + GESTIÓN (2.º par G:H/I…).
    c.infoField('B6:C6', 'TURNO:', 'D6:E6', cab.turno);
    c.infoField(
      'G6:H6',
      'GESTIÓN:',
      `I6:${valEnd}6`,
      `${cab.gestionAnio ?? ''}${cab.gestionNombre ? `  ${cab.gestionNombre}` : ''}`.trim()
    );

    // N° BIMESTRE destacado: bloque verde sobre las últimas columnas (filas 4-6).
    // Con pocas asignaturas lastCol < bimStartCol y el rango quedaba invertido
    // (celdas ya combinadas). El bloque de bimestre nunca termina antes de empezar.
    const bimEndCol = Math.max(bimStartCol, lastCol);
    c.merge(`${L(bimStartCol)}4:${L(bimEndCol)}6`, cab.bimestreLabel ?? `BIMESTRE ${cab.bimestre ?? ''}`, {
      size: fonts.title,
      bold: true,
      fontColor: EXCEL_COLOR.bandText,
      fill: EXCEL_COLOR.band,
      borderMedium: true,
      wrap: true
    });
  }

  /**
   * Cabecera de la tabla (filas 8-10): columnas fijas (Nº/NÓMINA/CI/ESTADO/
   * OBSERVACIONES) más, por asignatura, sigla (8), nombre (9) y docente (10),
   * cada una fusionada en su bloque de 2 columnas.
   */
  static _cabeceraTabla(c, datos, layout, cfg) {
    const {
      COL_NRO,
      COL_NOMBRE_START,
      COL_NOMBRE_END,
      COL_CI,
      COL_ESTADO,
      COL_OBS_START,
      COL_OBS_END,
      subjectBlock
    } = layout;
    const { fonts, rows, heights, colsPorAsignatura } = cfg;
    const { small } = fonts;
    const { rowSigla, rowNombre, rowDocente } = rows;

    const headBoxVertical = (col, text, opts = {}) => {
      c.mergeBox(rowSigla, col, rowDocente, col, text, {
        bold: true,
        size: small,
        wrap: true,
        fill: EXCEL_COLOR.statHeader,
        fontColor: EXCEL_COLOR.statHeaderText,
        borderMedium: true,
        ...opts
      });
    };
    headBoxVertical(COL_NRO, 'Nº');
    // NÓMINA DE ESTUDIANTES: cabecera fusionada en las 3 columnas C:E.
    c.mergeBox(rowSigla, COL_NOMBRE_START, rowDocente, COL_NOMBRE_END, 'NÓMINA DE ESTUDIANTES', {
      bold: true,
      size: small,
      wrap: true,
      align: 'center',
      fill: EXCEL_COLOR.statHeader,
      fontColor: EXCEL_COLOR.statHeaderText,
      borderMedium: true
    });
    headBoxVertical(COL_CI, 'CÉDULA DE IDENTIDAD');
    headBoxVertical(COL_ESTADO, 'ESTADO', { fill: EXCEL_COLOR.finalHeader });
    // OBSERVACIONES abarca 2 columnas en las 3 filas de cabecera.
    c.mergeBox(rowSigla, COL_OBS_START, rowDocente, COL_OBS_END, 'OBSERVACIONES', {
      bold: true,
      size: small,
      wrap: true,
      fill: EXCEL_COLOR.obsHeader,
      borderMedium: true
    });

    // Cabecera por asignatura: sigla (fila 8), nombre (fila 9), docente (fila 10),
    // cada una fusionada en el bloque de 2 columnas.
    datos.asignaturas.forEach((asig, i) => {
      const start = subjectBlock(i);
      const end = start + (colsPorAsignatura - 1);
      const range = (row) => `${L(start)}${row}:${L(end)}${row}`;
      c.merge(range(rowSigla), asig.sigla ?? '', {
        bold: true,
        size: small,
        fill: EXCEL_COLOR.teoricasStrong,
        wrap: true,
        borderMedium: true
      });
      c.merge(range(rowNombre), asig.nombre ?? '', {
        size: small,
        fill: EXCEL_COLOR.teoricas,
        wrap: true
      });
      c.merge(range(rowDocente), asig.docenteNombre ? `(${asig.docenteNombre})` : '', {
        size: small,
        fontColor: EXCEL_COLOR.inkSoft,
        fill: EXCEL_COLOR.teoricas,
        wrap: true
      });
    });

    c.rowHeight(rowSigla, heights.sigla);
    c.rowHeight(rowNombre, heights.nombre);
    c.rowHeight(rowDocente, heights.docente);
  }

  /** Fila de nota mínima de aprobación (fila 11). */
  static _notaMinima(c, datos, layout, cfg) {
    const { COL_NRO, COL_CI, COL_ESTADO, COL_OBS_END, subjectBlock } = layout;
    const { fonts, rows, colsPorAsignatura } = cfg;
    const { small } = fonts;
    const { rowMin } = rows;

    c.merge(`${L(COL_NRO)}${rowMin}:${L(COL_CI)}${rowMin}`, 'NOTA MÍNIMA DE APROBACIÓN', {
      bold: true,
      size: small,
      align: 'right',
      fill: EXCEL_COLOR.infoLabel
    });
    datos.asignaturas.forEach((_, i) => {
      const start = subjectBlock(i);
      const end = start + (colsPorAsignatura - 1);
      c.merge(`${L(start)}${rowMin}:${L(end)}${rowMin}`, datos.notaMinimaAprobacion ?? '', {
        bold: true,
        size: small,
        fill: EXCEL_COLOR.infoLabel
      });
    });
    c.merge(`${L(COL_ESTADO)}${rowMin}:${L(COL_OBS_END)}${rowMin}`, '', {
      fill: EXCEL_COLOR.infoLabel,
      border: true
    });
  }

  /** Filas de estudiantes (zebra) o, si no hay, una fila informativa. */
  static _filasEstudiantes(c, datos, layout, cfg) {
    const {
      COL_NRO,
      COL_NOMBRE_START,
      COL_NOMBRE_END,
      COL_CI,
      COL_ESTADO,
      COL_OBS_START,
      COL_OBS_END,
      lastCol,
      subjectBlock
    } = layout;
    const { fonts, rows, heights, colsPorAsignatura, estadoColor } = cfg;
    const { small, body } = fonts;
    const { firstDataRow } = rows;

    const notaMin = Number(datos.notaMinimaAprobacion);
    datos.estudiantes.forEach((est, idx) => {
      const row = firstDataRow + idx;
      const zebra = idx % 2 === 1 ? EXCEL_COLOR.zebra : EXCEL_COLOR.white;
      c.rowHeight(row, heights.dataRow);

      c.cell(row, COL_NRO, est.nro ?? idx + 1, { fill: zebra, size: small });
      c.mergeBox(
        row,
        COL_NOMBRE_START,
        row,
        COL_NOMBRE_END,
        String(est.nombreCompleto ?? '').toUpperCase(),
        { fill: zebra, align: 'left', size: small }
      );
      c.cell(row, COL_CI, est.ci ?? '', { fill: zebra, size: small });

      datos.asignaturas.forEach((asig, i) => {
        const start = subjectBlock(i);
        const end = start + (colsPorAsignatura - 1);
        const celda = est.celdas?.[asig.ofertaCursoId] ?? {};
        const nota = celda.nota ?? null;
        const reprobada = esNotaReprobada(nota, notaMin);
        c.merge(`${L(start)}${row}:${L(end)}${row}`, formatNota(nota), {
          fill: zebra,
          bold: reprobada,
          size: small,
          fontColor: reprobada ? EXCEL_COLOR.danger : EXCEL_COLOR.ink
        });
      });

      const colorEstado = estadoColor[est.estado] ?? EXCEL_COLOR.inkSoft;
      c.cell(row, COL_ESTADO, est.estado ?? '', {
        fill: zebra,
        size: small,
        bold: true,
        fontColor: colorEstado
      });
      c.merge(`${L(COL_OBS_START)}${row}:${L(COL_OBS_END)}${row}`, est.observacion ?? '', {
        fill: zebra,
        size: small,
        align: 'left',
        wrap: true,
        fontColor: EXCEL_COLOR.inkSoft
      });
    });

    // Caso sin estudiantes: deja una fila informativa.
    if (datos.estudiantes.length === 0) {
      c.merge(
        `${L(COL_NRO)}${firstDataRow}:${L(lastCol)}${firstDataRow}`,
        'Sin estudiantes matriculados en el paralelo.',
        { size: body, align: 'center', fontColor: EXCEL_COLOR.inkSoft }
      );
    }
  }
}

export default CentralizadorSheetBuilder;
