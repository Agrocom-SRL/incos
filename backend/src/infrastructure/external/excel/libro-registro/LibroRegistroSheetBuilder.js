/**
 * LibroRegistroSheetBuilder — construye UNA hoja del Libro de registro (un
 * paralelo): los folios del paralelo APILADOS verticalmente en bloques de 34
 * filas (réplica del libro físico "LIBRO LLENADO SISTEMAS 11 dic 2025") y, al
 * final, la página de FIRMAS DE DOCENTES del paralelo (artefacto de impresión:
 * NO es un folio ni incrementa numero_folio).
 *
 * Solo construcción + estilos (ExcelSheetComposer + ExcelTheme, banda
 * FF196B45). Sin lógica de negocio: notas ('NP' incluido), estados y
 * observaciones llegan resueltos desde la capa de aplicación.
 *
 * Estructura (SOLID): la configuración declarativa vive en
 * sheet/libroRegistroSheetConfig, la aritmética de columnas en
 * sheet/libroRegistroSheetLayout (pura) y el formato de notas en
 * sheet/libroRegistroSheetFormatters (puro). Cada sección del bloque es un
 * método privado `_seccion(c, ctx)`.
 */

import { EXCEL_COLOR, EXCEL_FONT_SIZE } from '../shared/index.js';
import { colLetter as L } from '../shared/ExcelSheetComposer.js';
import {
  FILAS_POR_FOLIO,
  COL_WIDTHS,
  ROW_HEIGHTS,
  FILA,
  LOGO_EXT,
  ESTADO_COLOR,
} from './sheet/libroRegistroSheetConfig.js';
import { computeLibroColumnMap } from './sheet/libroRegistroSheetLayout.js';
import { formatNotaFolio, esNotaNP } from './sheet/libroRegistroSheetFormatters.js';

export class LibroRegistroSheetBuilder {
  /**
   * @param {Object} params
   * @param {import('../shared/ExcelSheetComposer.js').ExcelSheetComposer} params.composer
   * @param {{ nombreHoja: string, folios: Array<Object> }} params.hoja
   * @param {Object} params.doc - Metadatos institucionales (LIBRO_REGISTRO_DOC).
   * @param {number|null} [params.logoId] - Id de imagen del logo MINEDU en el
   *        workbook (null si el asset no está disponible; se omite sin fallar).
   */
  static build({ composer: c, hoja, doc, logoId = null }) {
    const folios = Array.isArray(hoja?.folios) ? hoja.folios : [];
    if (folios.length === 0) return;

    // Las columnas son estables dentro del paralelo (mismas materias).
    const layout = computeLibroColumnMap(folios[0].asignaturas ?? []);
    this._anchos(c, layout);

    folios.forEach((folio, idx) => {
      const base = idx * FILAS_POR_FOLIO; // offset de filas del bloque
      const ctx = { base, folio, layout, doc, logoId };
      this._cabeceraFolio(c, ctx);
      this._camposFolio(c, ctx);
      this._cabeceraTabla(c, ctx);
      this._filasEstudiantes(c, ctx);
      this._firmasAutoridades(c, ctx);
      // Cada folio imprime en su propia página del libro.
      c.ws.getRow(base + FILAS_POR_FOLIO).addPageBreak();
    });

    this._firmasDocentes(c, {
      base: folios.length * FILAS_POR_FOLIO,
      folio: folios[0],
      layout,
      doc,
    });
  }

  /** Anchos de columna: identificación + una col por materia + estado/obs. */
  static _anchos(c, layout) {
    const widths = {
      [layout.COL_NRO]: COL_WIDTHS.nro,
      [layout.COL_NOMBRE_START]: COL_WIDTHS.nombreIzq,
      [layout.COL_NOMBRE_END]: COL_WIDTHS.nombreDer,
      [layout.COL_CI]: COL_WIDTHS.ci,
    };
    for (let col = layout.firstAsigCol; col < layout.COL_ESTADO_START; col += 1) {
      widths[col] = COL_WIDTHS.asignatura;
    }
    widths[layout.COL_ESTADO_START] = COL_WIDTHS.estado;
    widths[layout.COL_ESTADO_END] = COL_WIDTHS.estado;
    for (let col = layout.COL_OBS_START; col <= layout.COL_OBS_END; col += 1) {
      widths[col] = COL_WIDTHS.obs;
    }
    c.colWidths(widths);
  }

  /** Código de registro, escudo/logo, banda de título y LIBRO/FOLIO N°. */
  static _cabeceraFolio(c, { base, folio, layout, doc, logoId }) {
    const cab = folio.cabecera ?? {};
    const { lastCol, tituloStartCol, tituloEndCol, libroLabelStart, libroLabelEnd, libroValueCol } =
      layout;

    // Fila 1 del bloque: Código de Registro (esquina superior derecha).
    c.merge(
      `${L(libroLabelStart - 1)}${base + FILA.codigoRegistro}:${L(lastCol)}${base + FILA.codigoRegistro}`,
      `Código de Registro: ${cab.codigoRegistro ?? ''}`,
      { size: EXCEL_FONT_SIZE.small, bold: true, align: 'right', border: false },
    );

    // Caja del escudo (A2:C6 del bloque) + logo del Ministerio si está cargado.
    c.mergeBox(base + FILA.logoInicio, layout.COL_NRO, base + FILA.logoFin, layout.COL_NOMBRE_END, '', {
      border: true,
    });
    if (logoId != null) {
      c.ws.addImage(logoId, {
        tl: { col: 0.35, row: base + FILA.logoInicio - 0.8 },
        ext: LOGO_EXT,
        editAs: 'oneCell',
      });
    }

    // Banda de título (D4:N5 del bloque).
    c.mergeBox(
      base + FILA.tituloInicio,
      tituloStartCol,
      base + FILA.tituloFin,
      tituloEndCol,
      doc.titulo,
      {
        size: EXCEL_FONT_SIZE.subtitle,
        bold: true,
        fontColor: EXCEL_COLOR.bandText,
        fill: EXCEL_COLOR.band,
        borderMedium: true,
      },
    );
    c.rowHeight(base + FILA.tituloInicio, ROW_HEIGHTS.titulo);
    c.rowHeight(base + FILA.tituloFin, ROW_HEIGHTS.titulo);

    // LIBRO N° / FOLIO N° (esquina derecha de la banda).
    const libroFolio = (fila, etiqueta, valor) => {
      c.mergeBox(base + fila, libroLabelStart, base + fila, libroLabelEnd, etiqueta, {
        bold: true,
        size: EXCEL_FONT_SIZE.small,
        align: 'left',
        fill: EXCEL_COLOR.infoLabel,
      });
      c.cell(base + fila, libroValueCol, valor ?? '', {
        bold: true,
        size: EXCEL_FONT_SIZE.label,
        fontColor: EXCEL_COLOR.finalHeader,
      });
    };
    libroFolio(FILA.libroNro, 'LIBRO N°', cab.numeroLibro);
    libroFolio(FILA.folioNro, 'FOLIO N°', cab.numeroFolio);
  }

  /** Ciudad/turno, institución/R.M./carácter y campos GESTIÓN..CURSO. */
  static _camposFolio(c, { base, folio, layout, doc }) {
    const cab = folio.cabecera ?? {};
    const { lastCol } = layout;
    const { small } = EXCEL_FONT_SIZE;

    // Fila 7: ciudad (izquierda) + TURNO (derecha).
    const filaCiudad = base + FILA.ciudad;
    c.mergeBox(filaCiudad, layout.COL_NRO, filaCiudad, layout.COL_NOMBRE_END, doc.ciudad, {
      size: small,
      align: 'left',
      border: false,
      fontColor: EXCEL_COLOR.inkSoft,
    });
    c.mergeBox(base + FILA.ciudad, lastCol - 3, base + FILA.ciudad, lastCol - 2, 'TURNO:', {
      bold: true,
      size: small,
      align: 'left',
      fill: EXCEL_COLOR.infoLabel,
    });
    c.mergeBox(base + FILA.ciudad, lastCol - 1, base + FILA.ciudad, lastCol, cab.turno ?? '', {
      size: small,
      align: 'left',
    });

    // Fila 8: INSTITUCIÓN + R.M. + CARÁCTER.
    c.mergeBox(base + FILA.institucion, layout.COL_NRO, base + FILA.institucion, layout.COL_NOMBRE_START, 'INSTITUCIÓN:', {
      bold: true,
      size: small,
      align: 'left',
      fill: EXCEL_COLOR.infoLabel,
    });
    c.mergeBox(
      base + FILA.institucion,
      layout.COL_NOMBRE_END,
      base + FILA.institucion,
      lastCol - 6,
      doc.institucion,
      { size: small, align: 'left' },
    );
    c.cell(base + FILA.institucion, lastCol - 5, 'R.M.', {
      bold: true,
      size: small,
      fill: EXCEL_COLOR.infoLabel,
    });
    c.cell(base + FILA.institucion, lastCol - 4, doc.resolucionMinisterial, {
      size: small,
    });
    c.mergeBox(base + FILA.institucion, lastCol - 3, base + FILA.institucion, lastCol - 2, 'CARÁCTER:', {
      bold: true,
      size: small,
      align: 'left',
      fill: EXCEL_COLOR.infoLabel,
    });
    const filaInst = base + FILA.institucion;
    c.mergeBox(filaInst, lastCol - 1, filaInst, lastCol, doc.caracter, {
      size: small,
      align: 'left',
    });
    c.rowHeight(base + FILA.institucion, ROW_HEIGHTS.cabecera);

    // Filas 9-13: pares etiqueta (A:B) / valor (C) del bloque izquierdo.
    const campo = (fila, etiqueta, valor) => {
      c.mergeBox(base + fila, layout.COL_NRO, base + fila, layout.COL_NOMBRE_START, etiqueta, {
        bold: true,
        size: small,
        align: 'left',
        fill: EXCEL_COLOR.infoLabel,
      });
      c.cell(base + fila, layout.COL_NOMBRE_END, valor ?? '', { size: small, align: 'left' });
      c.rowHeight(base + fila, ROW_HEIGHTS.cabecera);
    };
    campo(FILA.gestion, 'GESTIÓN:', cab.gestionAnio);
    campo(FILA.nivel, 'NIVEL:', doc.nivel);
    campo(FILA.carrera, 'CARRERA:', cab.carrera);
    campo(FILA.regimen, 'RÉGIMEN:', doc.regimen);
    campo(FILA.curso, 'CURSO:', cab.curso);
  }

  /** Cabecera de la tabla: C.I./siglas/nombres de materia/ESTADO/OBSERVACIONES. */
  static _cabeceraTabla(c, { base, folio, layout }) {
    const asignaturas = folio.asignaturas ?? [];
    const { small } = EXCEL_FONT_SIZE;
    const headStyle = {
      bold: true,
      size: small,
      wrap: true,
      fill: EXCEL_COLOR.statHeader,
      fontColor: EXCEL_COLOR.statHeaderText,
      borderMedium: true,
    };

    // C.I. fusionada verticalmente (filas gestión..nómina del bloque).
    c.mergeBox(base + FILA.gestion, layout.COL_CI, base + FILA.nomina, layout.COL_CI, 'CÉDULA DE IDENTIDAD', headStyle);

    // Por materia: sigla (fila 9) + nombre (fusión vertical 10-14).
    asignaturas.forEach((asig, i) => {
      const col = layout.asigCol(i);
      c.cell(base + FILA.gestion, col, asig.sigla ?? '', {
        bold: true,
        size: small,
        fill: EXCEL_COLOR.teoricasStrong,
        wrap: true,
        borderMedium: true,
      });
      c.mergeBox(base + FILA.nivel, col, base + FILA.nomina, col, asig.nombre ?? '', {
        size: small,
        fill: EXCEL_COLOR.teoricas,
        wrap: true,
      });
    });
    c.rowHeight(base + FILA.gestion, ROW_HEIGHTS.siglas);
    c.rowHeight(base + FILA.nivel, ROW_HEIGHTS.nombresMateria);

    // ESTADO y OBSERVACIONES fusionadas verticalmente.
    c.mergeBox(
      base + FILA.gestion,
      layout.COL_ESTADO_START,
      base + FILA.nomina,
      layout.COL_ESTADO_END,
      'ESTADO',
      { ...headStyle, fill: EXCEL_COLOR.finalHeader },
    );
    c.mergeBox(
      base + FILA.gestion,
      layout.COL_OBS_START,
      base + FILA.nomina,
      layout.COL_OBS_END,
      'OBSERVACIONES',
      { ...headStyle, fill: EXCEL_COLOR.obsHeader, fontColor: EXCEL_COLOR.ink },
    );

    // Fila 14: N° + NÓMINA DE ESTUDIANTES.
    c.cell(base + FILA.nomina, layout.COL_NRO, 'N°', headStyle);
    c.mergeBox(
      base + FILA.nomina,
      layout.COL_NOMBRE_START,
      base + FILA.nomina,
      layout.COL_NOMBRE_END,
      'NÓMINA DE ESTUDIANTES',
      headStyle,
    );
  }

  /** Filas de estudiantes (hasta 10 por folio; filas vacías hasta completar la página). */
  static _filasEstudiantes(c, { base, folio, layout }) {
    const asignaturas = folio.asignaturas ?? [];
    const estudiantes = folio.estudiantes ?? [];
    const { small } = EXCEL_FONT_SIZE;
    const totalFilas = FILA.dataFin - FILA.dataInicio + 1;

    for (let i = 0; i < totalFilas; i += 1) {
      const row = base + FILA.dataInicio + i;
      const est = estudiantes[i] ?? null;
      c.rowHeight(row, ROW_HEIGHTS.dataRow);

      c.cell(row, layout.COL_NRO, est?.numeroOrden ?? '', { size: small });
      c.mergeBox(
        row,
        layout.COL_NOMBRE_START,
        row,
        layout.COL_NOMBRE_END,
        est ? String(est.nombreCompleto ?? '').toUpperCase() : '',
        { size: small, align: 'left' },
      );
      const ciTexto = est
        ? `${est.ci ?? ''}${est.expedicion ? ` ${est.expedicion}` : ''}`.trim()
        : '';
      c.cell(row, layout.COL_CI, ciTexto, { size: small });

      asignaturas.forEach((asig, j) => {
        const nota = est?.celdas?.[asig.ofertaCursoId] ?? null;
        c.cell(row, layout.asigCol(j), est ? formatNotaFolio(nota) : '', {
          size: small,
          fontColor: esNotaNP(nota) ? EXCEL_COLOR.inkSoft : EXCEL_COLOR.ink,
        });
      });

      const colorEstado = ESTADO_COLOR[est?.estadoAcademico] ?? EXCEL_COLOR.inkSoft;
      c.mergeBox(
        row,
        layout.COL_ESTADO_START,
        row,
        layout.COL_ESTADO_END,
        est?.estadoAcademico ?? '',
        { size: small, bold: true, fontColor: colorEstado },
      );
      c.mergeBox(row, layout.COL_OBS_START, row, layout.COL_OBS_END, est?.observaciones ?? '', {
        size: small,
        align: 'left',
        wrap: true,
        fontColor: EXCEL_COLOR.inkSoft,
      });
    }
  }

  /** Firmas de autoridades al pie del folio (JEFE DE CARRERA / DIRECTOR / RECTOR). */
  static _firmasAutoridades(c, { base, layout, doc }) {
    const row = base + FILA.firmasAutoridades;
    const firmas = doc.firmas ?? [];
    // Tres zonas equiespaciadas (cols 2..lastCol) con un col de aire entre
    // ellas — sin solapes de merge con cualquier número de materias.
    const zona = Math.floor((layout.lastCol - 1) / 3);
    const anchors = firmas.map((_, i) => {
      const start = 2 + i * zona;
      return [start, Math.max(start, start + zona - 2)];
    });
    firmas.forEach((firma, i) => {
      const [start, end] = anchors[i];
      c.mergeBox(row, start, row, end, firma, {
        size: EXCEL_FONT_SIZE.small,
        bold: true,
        align: 'center',
        border: false,
      });
      // Línea de firma (borde superior del rótulo).
      for (let col = start; col <= end; col += 1) {
        c.ws.getCell(row, col).border = {
          top: { style: 'thin', color: { argb: EXCEL_COLOR.ink } },
        };
      }
    });
  }

  /**
   * Página de FIRMAS DE DOCENTES del paralelo (al final de la hoja, tras el
   * último folio). Artefacto de impresión: NO es un folio del libro y NO
   * incrementa numero_folio. Una fila de firma por materia+docente (fuente:
   * asignaciones vigentes del paralelo vía vista 135).
   */
  static _firmasDocentes(c, { base, folio, layout, doc }) {
    const cab = folio.cabecera ?? {};
    const asignaturas = folio.asignaturas ?? [];
    const { small } = EXCEL_FONT_SIZE;
    const { lastCol } = layout;

    c.mergeBox(base + 2, layout.COL_NRO, base + 3, lastCol, 'FIRMAS DE DOCENTES', {
      size: EXCEL_FONT_SIZE.subtitle,
      bold: true,
      fontColor: EXCEL_COLOR.bandText,
      fill: EXCEL_COLOR.band,
      borderMedium: true,
    });
    c.mergeBox(
      base + 4,
      layout.COL_NRO,
      base + 4,
      lastCol,
      `${doc.institucion} · ${cab.curso ?? ''} · GESTIÓN ${cab.gestionAnio ?? ''}`,
      { size: small, fontColor: EXCEL_COLOR.inkSoft, border: false },
    );

    // Cabecera de la tabla de firmas.
    const headRow = base + 6;
    const colFirmaStart = lastCol - 5;
    const headStyle = {
      bold: true,
      size: small,
      fill: EXCEL_COLOR.statHeader,
      fontColor: EXCEL_COLOR.statHeaderText,
      borderMedium: true,
    };
    c.cell(headRow, layout.COL_NRO, 'N°', headStyle);
    c.mergeBox(headRow, layout.COL_NOMBRE_START, headRow, layout.COL_CI, 'ASIGNATURA', headStyle);
    c.mergeBox(headRow, layout.firstAsigCol, headRow, colFirmaStart - 1, 'DOCENTE', headStyle);
    c.mergeBox(headRow, colFirmaStart, headRow, lastCol, 'FIRMA', headStyle);

    asignaturas.forEach((asig, i) => {
      const row = headRow + 1 + i * 2; // fila de datos + fila de aire para firmar
      c.rowHeight(row, ROW_HEIGHTS.dataRow + 10);
      c.cell(row, layout.COL_NRO, i + 1, { size: small });
      c.mergeBox(
        row,
        layout.COL_NOMBRE_START,
        row,
        layout.COL_CI,
        `${asig.sigla ? `${asig.sigla} · ` : ''}${asig.nombre ?? ''}`,
        { size: small, align: 'left', wrap: true },
      );
      c.mergeBox(row, layout.firstAsigCol, row, colFirmaStart - 1, asig.docenteNombre ?? '', {
        size: small,
        align: 'left',
      });
      c.mergeBox(row, colFirmaStart, row, lastCol, '', { size: small });
    });
  }
}

export default LibroRegistroSheetBuilder;
