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
  FILAS_POR_FIRMA,
  COL_WIDTHS,
  ROW_HEIGHTS,
  FILA,
  LOGO_ASPECT_RATIO,
  ESTADO_COLOR,
} from './sheet/libroRegistroSheetConfig.js';
import { computeLibroColumnMap, colFractionAtWidth } from './sheet/libroRegistroSheetLayout.js';
import { formatNotaFolio, esNotaNP } from './sheet/libroRegistroSheetFormatters.js';

/** Columnas de la grilla de FIRMAS DE DOCENTES (3 firmas por fila, como el papel real). */
const COLUMNAS_FIRMAS_DOCENTES = 3;

export class LibroRegistroSheetBuilder {
  /**
   * @param {Object} params
   * @param {import('../shared/ExcelSheetComposer.js').ExcelSheetComposer} params.composer
   * @param {{ nombreHoja: string, folios: Array<Object>, estadisticas?: Object|null }} params.hoja
   * @param {Object} params.doc - Metadatos institucionales (LIBRO_REGISTRO_DOC).
   * @param {number|null} [params.logoId] - Id de imagen del logo MINEDU en el
   *        workbook (null si el asset no está disponible; se omite sin fallar).
   * @param {boolean} [params.incluirFirmas] - false → BORRADOR: se omiten las
   *        firmas de autoridades (por folio) y la página de firmas de
   *        docentes (por paralelo). Ver `ExportLibroExcelUseCase`.
   */
  static build({ composer: c, hoja, doc, logoId = null, incluirFirmas = false }) {
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
      this._leyendaNotas(c, ctx);
      if (incluirFirmas) {
        this._firmasAutoridades(c, ctx);
      } else {
        this._notaBorrador(c, ctx);
      }
      // Cada folio imprime en su propia página del libro.
      c.ws.getRow(base + FILAS_POR_FOLIO).addPageBreak();
    });

    const baseFirmas = folios.length * FILAS_POR_FOLIO;
    const filasFirmasDocentes = incluirFirmas
      ? this._firmasDocentes(c, { base: baseFirmas, folio: folios[0], layout, doc })
      : 0;

    // Bloque de ESTADÍSTICAS solo con el libro CERRADO (mismo gate que las
    // firmas): en BORRADOR las notas todavía pueden cambiar y el conteo
    // aprobados/reprobados/abandono no es definitivo.
    if (incluirFirmas) {
      this._estadisticasParalelo(c, {
        base: baseFirmas + filasFirmasDocentes + 2,
        layout,
        doc,
        estadisticas: hoja.estadisticas ?? null,
      });
    }
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
    const {
      lastCol,
      tituloStartCol,
      tituloEndCol,
      libroLabelStart,
      libroLabelEnd,
      libroValueCol,
      COL_OBS_START,
      COL_OBS_END,
    } = layout;

    // Fila 3 del bloque: Código de Registro, sobre la columna de OBSERVACIONES (P:S).
    c.merge(
      `${L(COL_OBS_START)}${base + FILA.codigoRegistro}:${L(COL_OBS_END)}${base + FILA.codigoRegistro}`,
      `Código de Registro: ${cab.codigoRegistro ?? ''}`,
      { size: EXCEL_FONT_SIZE.small, bold: true, align: 'right', border: false },
    );

    // Caja del escudo (A2:C6 del bloque) + logo del Ministerio si está cargado,
    // al 100% del alto de la caja (sin recorte vertical) y con el ancho
    // DERIVADO de su relación de aspecto real (no se fuerza un ancho
    // independiente: el logo es más ancho que alto y forzarlo lo deformaba).
    c.mergeBox(base + FILA.logoInicio, layout.COL_NRO, base + FILA.logoFin, layout.COL_NOMBRE_END, '', {
      border: true,
    });
    if (logoId != null) {
      const cajaRowInicio = base + FILA.logoInicio - 1;
      const cajaRowFin = base + FILA.logoFin;

      // Conversión aproximada punto->px / unidad de ancho Excel->px, solo
      // para estimar cuánto ancho ocupa el logo al 100% del alto y poder
      // centrarlo — no afecta el alto real, que usa bordes de fila exactos.
      const PX_POR_PUNTO = 96 / 72;
      const PX_POR_UNIDAD_EXCEL = 7;
      const altoCajaPx = (cajaRowFin - cajaRowInicio) * ROW_HEIGHTS.cabecera * PX_POR_PUNTO;
      const anchoLogoUnidades = (altoCajaPx * LOGO_ASPECT_RATIO) / PX_POR_UNIDAD_EXCEL;

      const anchoColumnas = [COL_WIDTHS.nro, COL_WIDTHS.nombreIzq, COL_WIDTHS.nombreDer];
      const anchoTotal = anchoColumnas.reduce((sum, w) => sum + w, 0);
      const margenAncho = Math.max(0, (anchoTotal - anchoLogoUnidades) / 2);
      const cajaColInicio = layout.COL_NRO - 1;

      c.ws.addImage(logoId, {
        tl: { col: colFractionAtWidth(cajaColInicio, anchoColumnas, margenAncho), row: cajaRowInicio },
        br: {
          col: colFractionAtWidth(cajaColInicio, anchoColumnas, anchoTotal - margenAncho),
          row: cajaRowFin,
        },
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

  /** Leyenda de abreviaturas del centralizador, debajo de la nómina del folio. */
  static _leyendaNotas(c, { base, layout, doc }) {
    const row = base + FILA.leyenda;
    c.mergeBox(row, layout.COL_NRO, row, layout.COL_CI, doc.leyendaNotas ?? '', {
      size: EXCEL_FONT_SIZE.small,
      align: 'left',
      border: false,
      fontColor: EXCEL_COLOR.inkSoft,
    });
  }

  /**
   * Nota "DOCUMENTO BORRADOR" al pie del folio, en el mismo renglón que
   * ocuparían las firmas de autoridades — reemplaza ese bloque mientras el
   * libro está ABIERTO (la numeración todavía puede reajustarse).
   */
  static _notaBorrador(c, { base, layout }) {
    const row = base + FILA.firmasAutoridades;
    c.mergeBox(
      row,
      2,
      row,
      layout.lastCol,
      'DOCUMENTO BORRADOR — sin firmas; el libro aún está ABIERTO y la numeración puede reajustarse',
      {
        size: EXCEL_FONT_SIZE.small,
        bold: true,
        align: 'center',
        border: false,
        fontColor: EXCEL_COLOR.danger,
      },
    );
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
   * incrementa numero_folio. Grilla de 3 columnas (nombre del docente + su
   * materia debajo, espacio en blanco ARRIBA para la firma física con línea
   * de firma explícita sobre el nombre — mismo criterio que
   * `_firmasAutoridades`), réplica del libro real (fuente: asignaciones
   * vigentes del paralelo vía vista 135).
   *
   * @returns {number} Total de filas usadas por esta sección (relativas a
   *          `base`), para que el llamador ubique la sección siguiente.
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

    // Grilla de 3 columnas equiespaciadas (con aire entre ellas, igual criterio
    // que _firmasAutoridades) — sin cabecera de tabla, cada celda es autoexplicativa.
    const zona = Math.floor((lastCol - 1) / COLUMNAS_FIRMAS_DOCENTES);
    const anchors = Array.from({ length: COLUMNAS_FIRMAS_DOCENTES }, (_, i) => {
      const start = 2 + i * zona;
      return [start, Math.max(start, start + zona - 2)];
    });

    const grillaInicio = base + 6;
    asignaturas.forEach((asig, i) => {
      const fila = Math.floor(i / COLUMNAS_FIRMAS_DOCENTES);
      const colIdx = i % COLUMNAS_FIRMAS_DOCENTES;
      const [start, end] = anchors[colIdx];
      const rowEspacioInicio = grillaInicio + fila * FILAS_POR_FIRMA;
      const rowNombre = rowEspacioInicio + FILAS_POR_FIRMA - 2;
      const rowMateria = rowEspacioInicio + FILAS_POR_FIRMA - 1;

      // Espacio en blanco para la firma física (sin línea de firma explícita).
      for (let row = rowEspacioInicio; row < rowNombre; row += 1) {
        c.rowHeight(row, ROW_HEIGHTS.firmaEspacio);
      }
      c.mergeBox(rowEspacioInicio, start, rowNombre - 1, end, '', { border: false });

      c.rowHeight(rowNombre, ROW_HEIGHTS.dataRow);
      c.mergeBox(rowNombre, start, rowNombre, end, (asig.docenteNombre ?? '').toUpperCase(), {
        size: small,
        bold: true,
        align: 'center',
        border: false,
      });
      // Línea de firma (borde superior del rótulo) — mismo criterio que
      // _firmasAutoridades: el docente firma sobre esta línea, encima de su nombre.
      for (let col = start; col <= end; col += 1) {
        c.ws.getCell(rowNombre, col).border = {
          top: { style: 'thin', color: { argb: EXCEL_COLOR.ink } },
        };
      }

      c.rowHeight(rowMateria, ROW_HEIGHTS.dataRow);
      c.mergeBox(rowMateria, start, rowMateria, end, asig.nombre ?? '', {
        size: small,
        align: 'center',
        border: false,
        fontColor: EXCEL_COLOR.inkSoft,
      });
    });

    const filasGrilla = Math.ceil(asignaturas.length / COLUMNAS_FIRMAS_DOCENTES);
    return 6 + filasGrilla * FILAS_POR_FIRMA;
  }

  /**
   * Bloque "ESTADÍSTICAS" del paralelo (DETALLE|CANTIDAD|%), debajo de las
   * firmas de docentes — inscritos/aprobados/reprobados/abandono, cabecera con
   * la banda de color institucional (mismo verde que el resto del documento).
   * Sin `estadisticas` (paralelo aún sin folios/estudiantes) no pinta nada.
   */
  static _estadisticasParalelo(c, { base, layout, doc, estadisticas }) {
    if (!estadisticas) return;
    const cfg = doc.estadisticas ?? {};
    const filasCfg = cfg.filas ?? [];
    const { small } = EXCEL_FONT_SIZE;

    // Tabla angosta, alineada a la izquierda (independiente del número de
    // materias): DETALLE (6 columnas) + CANTIDAD (1) + % (1).
    const colDetalleStart = layout.COL_NRO;
    const colDetalleEnd = layout.COL_CI + 2;
    const colCantidad = colDetalleEnd + 1;
    const colPorcentaje = colCantidad + 1;

    c.mergeBox(base, colDetalleStart, base, colDetalleEnd, cfg.titulo ?? 'ESTADÍSTICAS', {
      size: EXCEL_FONT_SIZE.label,
      bold: true,
      fontColor: EXCEL_COLOR.band,
      border: false,
      align: 'left',
    });

    const headRow = base + 1;
    const headStyle = {
      bold: true,
      size: small,
      fill: EXCEL_COLOR.statHeader,
      fontColor: EXCEL_COLOR.statHeaderText,
      borderMedium: true,
    };
    c.mergeBox(headRow, colDetalleStart, headRow, colDetalleEnd, cfg.columnas?.[0] ?? 'DETALLE', headStyle);
    c.cell(headRow, colCantidad, cfg.columnas?.[1] ?? 'CANTIDAD', headStyle);
    c.cell(headRow, colPorcentaje, cfg.columnas?.[2] ?? '%', headStyle);

    filasCfg.forEach((filaCfg, i) => {
      const row = headRow + 1 + i;
      c.mergeBox(row, colDetalleStart, row, colDetalleEnd, filaCfg.etiqueta, {
        size: small,
        bold: true,
        align: 'left',
        fill: EXCEL_COLOR.teoricas,
      });
      c.cell(row, colCantidad, Number(estadisticas[filaCfg.campo] ?? 0), { size: small });
      c.cell(row, colPorcentaje, `${Number(estadisticas[filaCfg.pctCampo] ?? 0)}%`, {
        size: small,
      });
    });
  }
}

export default LibroRegistroSheetBuilder;
