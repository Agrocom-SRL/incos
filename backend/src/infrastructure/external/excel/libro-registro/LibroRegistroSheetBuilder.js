/**
 * LibroRegistroSheetBuilder — construye UNA hoja del Libro de registro (un
 * paralelo): los folios del paralelo APILADOS verticalmente en bloques de 34
 * filas (réplica del libro físico "LIBRO LLENADO SISTEMAS 11 dic 2025") y, al
 * final, la página de FIRMAS DE DOCENTES + ESTADÍSTICAS del paralelo
 * (artefacto de impresión: NO es un folio ni incrementa numero_folio).
 *
 * Formulario OFICIAL del Ministerio de Educación: debe verse EXACTAMENTE igual
 * al papel — Calibri negro puro, bordes finos negros, relleno verde oficial
 * SOLO en las cabeceras de tabla, anchos/altos/tamaños medidos del original
 * (ver sheet/libroRegistroSheetConfig). Sin lógica de negocio: notas ('NP'
 * incluido), estados y observaciones llegan resueltos desde la capa de
 * aplicación.
 *
 * Estructura (SOLID): la configuración declarativa vive en
 * sheet/libroRegistroSheetConfig, la aritmética de columnas en
 * sheet/libroRegistroSheetLayout (pura) y el formato de celdas en
 * sheet/libroRegistroSheetFormatters (puro). Cada sección del bloque es un
 * método privado `_seccion(c, ctx)`.
 */

import {
  FILAS_POR_FOLIO,
  FILAS_POR_FIRMA,
  COLUMNAS_FIRMAS_DOCENTES,
  COL_WIDTHS,
  FONT_SIZE,
  ROW_HEIGHTS,
  OBS_CHARS_POR_LINEA,
  FILA,
  FILA_DOCENTES,
  LOGO_ASPECT_RATIO,
  LOGO_FOLIO,
  LOGO_DOCENTES,
  PX_POR_PUNTO,
  PX_POR_UNIDAD_EXCEL,
  PX_RELLENO_COLUMNA,
  DOC_COLOR,
} from './sheet/libroRegistroSheetConfig.js';
import {
  computeLibroColumnMap,
  computeTresZonasFirmas,
  computeTresZonasDocentes,
  computeColumnasEstadisticas,
} from './sheet/libroRegistroSheetLayout.js';
import {
  formatNotaFolio,
  formatCedulaFolio,
  estimarLineasObservacion,
} from './sheet/libroRegistroSheetFormatters.js';

/** Texto suelto del formulario: Calibri negro, sin sangría ni borde (el físico alinea al borde de la celda). */
const texto = (extra = {}) => ({ fontColor: DOC_COLOR.ink, indent: 0, border: false, ...extra });

/** Celda de tabla: texto negro + borde fino negro en los 4 lados. */
const celda = (extra = {}) => ({
  fontColor: DOC_COLOR.ink,
  indent: 0,
  borderColor: DOC_COLOR.border,
  ...extra,
});

/** Cabecera de tabla: celda + relleno verde oficial + negrita + ajuste de texto. */
const cabecera = (extra = {}) =>
  celda({ bold: true, fill: DOC_COLOR.header, wrap: true, ...extra });

/** Solo un lado del contorno (helper de legibilidad para `composer.outline`). */
const SOLO = {
  top: { top: true, bottom: false, left: false, right: false },
  bottom: { top: false, bottom: true, left: false, right: false },
  right: { top: false, bottom: false, left: false, right: true },
};

const mayusculas = (valor) => String(valor ?? '').toUpperCase();

export class LibroRegistroSheetBuilder {
  /**
   * @param {Object} params
   * @param {import('../shared/ExcelSheetComposer.js').ExcelSheetComposer} params.composer
   * @param {{ nombreHoja: string, folios: Array<Object>, estadisticas?: Object|null }} params.hoja
   * @param {Object} params.doc - Metadatos institucionales (LIBRO_REGISTRO_DOC).
   * @param {number|null} [params.logoId] - Id de imagen del logo MINEDU en el
   *        workbook (null si el asset no está disponible; se omite sin fallar).
   * @param {boolean} [params.incluirFirmas] - false → BORRADOR (libro ABIERTO):
   *        en lugar del bloque de firmas de autoridades va la nota "DOCUMENTO
   *        BORRADOR", y se omiten la página de firmas de docentes y las
   *        estadísticas (no definitivas). Ver `ExportLibroExcelUseCase`.
   */
  static build({ composer: c, hoja, doc, logoId = null, incluirFirmas = false }) {
    const folios = Array.isArray(hoja?.folios) ? hoja.folios : [];
    if (folios.length === 0) return;

    // Las columnas son estables dentro del paralelo (mismas materias).
    const layout = computeLibroColumnMap(folios[0].asignaturas ?? []);
    const widths = this._anchos(c, layout);

    folios.forEach((folio, idx) => {
      const base = idx * FILAS_POR_FOLIO; // offset de filas del bloque
      const ctx = { base, folio, layout, doc, logoId, widths };
      this._altosFolio(c, ctx);
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

    // Página de firmas de docentes + ESTADÍSTICAS solo con el libro CERRADO:
    // en BORRADOR las notas todavía pueden cambiar y el conteo
    // aprobados/reprobados/abandono no es definitivo.
    if (incluirFirmas) {
      const baseDocentes = folios.length * FILAS_POR_FOLIO;
      const ultimaFilaMateria = this._firmasDocentes(c, {
        base: baseDocentes,
        folio: folios[0],
        layout,
        doc,
        logoId,
        widths,
      });
      this._estadisticasParalelo(c, {
        base: ultimaFilaMateria + FILA_DOCENTES.espacioAntesEstadisticas,
        doc,
        estadisticas: hoja.estadisticas ?? null,
      });
    }
  }

  /**
   * Anchos de columna: identificación + una col por materia + estado/obs.
   * @returns {Object<number, number>} ancho (unidades Excel) por índice de columna.
   */
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
    COL_WIDTHS.estado.forEach((w, i) => {
      widths[layout.COL_ESTADO_START + i] = w;
    });
    COL_WIDTHS.obs.forEach((w, i) => {
      widths[layout.COL_OBS_START + i] = w;
    });
    c.colWidths(widths);
    return widths;
  }

  /** Altos de todas las filas del bloque de folio (base + las 3 excepciones del físico). */
  static _altosFolio(c, { base }) {
    for (let fila = 1; fila <= FILAS_POR_FOLIO; fila += 1) {
      c.rowHeight(base + fila, ROW_HEIGHTS.base);
    }
    c.rowHeight(base + FILA.codigoRegistro, ROW_HEIGHTS.superior);
    c.rowHeight(base + FILA.carrera, ROW_HEIGHTS.carrera);
    c.rowHeight(base + FILA.nomina, ROW_HEIGHTS.nomina);
  }

  /**
   * Logo del Ministerio anclado por esquina superior izquierda + tamaño en
   * píxeles (`oneCell`): nunca se deforma, sea cual sea el ancho de columna.
   * La fracción de columna/fila de ExcelJS es relativa al ancho/alto de ESA
   * columna/fila (ver `exceljs/lib/doc/anchor.js`).
   */
  static _logo(c, { logoId, base, widths, placement }) {
    if (logoId == null) return;
    const { startCol, leftPx, topRow, topOffsetPx, heightPx } = placement;
    const colPx = (widths[startCol] ?? COL_WIDTHS.nro) * PX_POR_UNIDAD_EXCEL + PX_RELLENO_COLUMNA;
    const rowPx = ROW_HEIGHTS.base * PX_POR_PUNTO;
    c.ws.addImage(logoId, {
      tl: { col: startCol - 1 + leftPx / colPx, row: base + topRow - 1 + topOffsetPx / rowPx },
      ext: { width: Math.round(heightPx * LOGO_ASPECT_RATIO), height: heightPx },
      editAs: 'oneCell',
    });
  }

  /** Código de registro, escudo/logo, título y cuadro LIBRO/FOLIO N°. */
  static _cabeceraFolio(c, { base, folio, layout, doc, logoId, widths }) {
    const cab = folio.cabecera ?? {};
    const {
      tituloStartCol,
      tituloEndCol,
      libroLabelStart,
      libroLabelEnd,
      libroValueCol,
      COL_OBS_START,
      COL_OBS_END,
    } = layout;

    // Fila 1 (alta): Código de Registro arriba a la derecha, pegado al pie de
    // la fila, sobre el cuadro LIBRO/FOLIO.
    c.mergeBox(
      base + FILA.codigoRegistro,
      COL_OBS_START,
      base + FILA.codigoRegistro,
      COL_OBS_END,
      `Código de Registro: ${cab.codigoRegistro ?? ''}`,
      texto({ size: FONT_SIZE.codigoRegistro, bold: true, align: 'right', valign: 'bottom' }),
    );

    // Caja del escudo (A2:C6 del bloque) + logo del Ministerio si está cargado.
    c.mergeBox(base + FILA.logoInicio, layout.COL_NRO, base + FILA.logoFin, layout.COL_NOMBRE_END, '', {
      border: false,
    });
    this._logo(c, { logoId, base, widths, placement: LOGO_FOLIO });

    // Título (D4:N5 del bloque): negro sobre blanco, centrado en el ancho de la tabla.
    c.mergeBox(
      base + FILA.tituloInicio,
      tituloStartCol,
      base + FILA.tituloFin,
      tituloEndCol,
      doc.titulo,
      texto({ size: FONT_SIZE.titulo, bold: true }),
    );

    // Cuadro LIBRO N° / FOLIO N° (O3:Q6 del bloque): una fila de aire arriba y
    // abajo, contorno y divisor rótulo/valor finos y negros, sin relleno.
    const libroFolio = (fila, etiqueta, valor) => {
      c.mergeBox(
        base + fila,
        libroLabelStart,
        base + fila,
        libroLabelEnd,
        etiqueta,
        texto({ size: FONT_SIZE.libroFolio, bold: true }),
      );
      c.cell(base + fila, libroValueCol, valor ?? '', texto({ size: FONT_SIZE.libroFolio, bold: true }));
    };
    libroFolio(FILA.libroNro, 'LIBRO N°', cab.numeroLibro);
    libroFolio(FILA.folioNro, 'FOLIO N°', cab.numeroFolio);
    c.outline(base + FILA.libroBoxInicio, libroLabelStart, base + FILA.libroBoxFin, libroLabelEnd, {
      style: 'thin',
      color: DOC_COLOR.border,
      sides: SOLO.right,
    });
    c.outline(base + FILA.libroBoxInicio, libroLabelStart, base + FILA.libroBoxFin, libroValueCol, {
      style: 'thin',
      color: DOC_COLOR.border,
    });
  }

  /** Ciudad/turno, institución/R.M./carácter y campos GESTIÓN..CURSO. */
  static _camposFolio(c, { base, folio, layout, doc }) {
    const cab = folio.cabecera ?? {};
    const size = FONT_SIZE.campo;
    const etiqueta = (align) => texto({ size, bold: true, align });
    const valor = texto({ size, bold: true, align: 'left' });

    // Fila 7: ciudad centrada bajo el logo + TURNO a la derecha.
    const filaCiudad = base + FILA.ciudad;
    c.mergeBox(
      filaCiudad,
      layout.COL_NRO,
      filaCiudad,
      layout.COL_NOMBRE_END,
      doc.ciudad,
      texto({ size: FONT_SIZE.ciudad, bold: true }),
    );
    const { turnoLabel, turnoValue, institucionValue, rmValue } = layout;
    const enFila = (row, [start, end], contenido, estilo) =>
      c.mergeBox(row, start, row, end, contenido, estilo);
    enFila(filaCiudad, turnoLabel, 'TURNO:', etiqueta('right'));
    enFila(filaCiudad, turnoValue, mayusculas(cab.turno), valor);

    // Fila 8: INSTITUCIÓN + R.M. (misma línea) + CARÁCTER a la derecha.
    const filaInst = base + FILA.institucion;
    enFila(filaInst, [layout.COL_NRO, layout.COL_NOMBRE_START], 'INSTITUCIÓN:', etiqueta('left'));
    enFila(filaInst, institucionValue, doc.institucion, valor);
    c.cell(filaInst, layout.rmLabelCol, 'R.M.', etiqueta('right'));
    enFila(filaInst, rmValue, doc.resolucionMinisterial, valor);
    enFila(filaInst, turnoLabel, 'CARÁCTER:', etiqueta('right'));
    enFila(filaInst, turnoValue, doc.caracter, valor);
    // Línea fina bajo INSTITUCIÓN…R.M. (A:K en el físico).
    c.outline(filaInst, layout.COL_NRO, filaInst, layout.institucionLineaEnd, {
      color: DOC_COLOR.border,
      sides: SOLO.bottom,
    });

    // Filas 9-13: pares etiqueta (A:B) / valor (C), cada fila enmarcada por
    // líneas finas (sin divisor vertical entre etiqueta y valor), valores en
    // MAYÚSCULAS y negrita, sin relleno.
    const campo = (fila, rotulo, contenido, extra = {}) => {
      const row = base + fila;
      c.mergeBox(row, layout.COL_NRO, row, layout.COL_NOMBRE_START, rotulo, etiqueta('left'));
      c.cell(row, layout.COL_NOMBRE_END, contenido ?? '', { ...valor, ...extra });
      c.outline(row, layout.COL_NRO, row, layout.COL_NOMBRE_END, { color: DOC_COLOR.border });
    };
    campo(FILA.gestion, 'GESTIÓN:', cab.gestionAnio);
    campo(FILA.nivel, 'NIVEL:', mayusculas(doc.nivel));
    campo(FILA.carrera, 'CARRERA:', mayusculas(cab.carrera), { wrap: true });
    campo(FILA.regimen, 'RÉGIMEN:', mayusculas(doc.regimen));
    campo(FILA.curso, 'CURSO:', mayusculas(cab.curso));
  }

  /** Cabecera de la tabla: C.I./siglas/nombres de materia/ESTADO/OBSERVACIONES/N°/NÓMINA. */
  static _cabeceraTabla(c, { base, folio, layout }) {
    const asignaturas = folio.asignaturas ?? [];
    const vertical = cabecera({ size: FONT_SIZE.cabeceraTabla, rotation: 90 });
    const horizontal = cabecera({ size: FONT_SIZE.campo, wrap: false });
    // La fila de siglas lleva el verde oliva en su tono base (más oscuro), como el físico.
    const sigla = cabecera({ size: FONT_SIZE.campo, wrap: false, fill: DOC_COLOR.sigla });

    // C.I. fusionada verticalmente (filas gestión..nómina del bloque), texto horizontal envuelto.
    c.mergeBox(
      base + FILA.gestion,
      layout.COL_CI,
      base + FILA.nomina,
      layout.COL_CI,
      'CÉDULA DE IDENTIDAD',
      cabecera({ size: FONT_SIZE.cabeceraTabla }),
    );

    // Por materia: sigla (fila 9, horizontal) + nombre (fusión vertical 10-14, rotado 90°).
    asignaturas.forEach((asig, i) => {
      const col = layout.asigCol(i);
      c.cell(base + FILA.gestion, col, asig.sigla ?? '', sigla);
      c.mergeBox(base + FILA.nivel, col, base + FILA.nomina, col, asig.nombre ?? '', vertical);
    });

    // ESTADO y OBSERVACIONES fusionadas verticalmente, rotadas 90°.
    c.mergeBox(base + FILA.gestion, layout.COL_ESTADO_START, base + FILA.nomina, layout.COL_ESTADO_END, 'ESTADO', vertical);
    c.mergeBox(base + FILA.gestion, layout.COL_OBS_START, base + FILA.nomina, layout.COL_OBS_END, 'OBSERVACIONES', vertical);

    // Fila 14: N° + NÓMINA DE ESTUDIANTES.
    c.cell(base + FILA.nomina, layout.COL_NRO, 'N°', horizontal);
    c.mergeBox(base + FILA.nomina, layout.COL_NOMBRE_START, base + FILA.nomina, layout.COL_NOMBRE_END, 'NÓMINA DE ESTUDIANTES', horizontal);
  }

  /** Filas de estudiantes (hasta 10 por folio; filas vacías con cuadrícula hasta completar la página). */
  static _filasEstudiantes(c, { base, folio, layout }) {
    const asignaturas = folio.asignaturas ?? [];
    const estudiantes = folio.estudiantes ?? [];
    const totalFilas = FILA.dataFin - FILA.dataInicio + 1;

    for (let i = 0; i < totalFilas; i += 1) {
      const row = base + FILA.dataInicio + i;
      const est = estudiantes[i] ?? null;
      const observacion = est?.observaciones ?? '';
      const dosLineas = estimarLineasObservacion(observacion, OBS_CHARS_POR_LINEA) > 1;
      c.rowHeight(row, dosLineas ? ROW_HEIGHTS.dataRowDosLineas : ROW_HEIGHTS.dataRow);

      c.cell(row, layout.COL_NRO, est?.numeroOrden ?? '', celda({ size: FONT_SIZE.numeroOrden, bold: true }));
      c.mergeBox(
        row,
        layout.COL_NOMBRE_START,
        row,
        layout.COL_NOMBRE_END,
        est ? mayusculas(est.nombreCompleto) : '',
        celda({ size: FONT_SIZE.dato, align: 'left' }),
      );
      c.cell(
        row,
        layout.COL_CI,
        est ? formatCedulaFolio(est.ci, est.expedicion) : '',
        celda({ size: FONT_SIZE.dato, align: 'left' }),
      );

      asignaturas.forEach((asig, j) => {
        const nota = est?.celdas?.[asig.ofertaCursoId] ?? null;
        c.cell(row, layout.asigCol(j), est ? formatNotaFolio(nota) : '', celda({ size: FONT_SIZE.dato }));
      });

      c.mergeBox(
        row,
        layout.COL_ESTADO_START,
        row,
        layout.COL_ESTADO_END,
        est?.estadoAcademico ?? '',
        celda({ size: FONT_SIZE.dato }),
      );
      c.mergeBox(
        row,
        layout.COL_OBS_START,
        row,
        layout.COL_OBS_END,
        observacion,
        celda({ size: FONT_SIZE.observacion, wrap: true }),
      );
    }
  }

  /** Leyenda de abreviaturas (NP / AP / PRE), SIEMPRE las tres líneas, bajo la nómina. */
  static _leyendaNotas(c, { base, layout, doc }) {
    const lineas = Array.isArray(doc.leyendaNotas) ? doc.leyendaNotas : [doc.leyendaNotas ?? ''];
    lineas.forEach((linea, i) => {
      const row = base + FILA.leyendaInicio + i;
      c.rowHeight(row, ROW_HEIGHTS.leyenda);
      c.mergeBox(
        row,
        layout.COL_NOMBRE_START,
        row,
        layout.COL_NOMBRE_END,
        linea,
        texto({ size: FONT_SIZE.leyenda, bold: true, align: 'left' }),
      );
    });
  }

  /**
   * Nota "DOCUMENTO BORRADOR" en el renglón de las firmas de autoridades,
   * reemplazándolas mientras el libro está ABIERTO (la numeración todavía
   * puede reajustarse; nadie debe firmar sobre este folio).
   */
  static _notaBorrador(c, { base, layout }) {
    const row = base + FILA.firmasAutoridades;
    c.mergeBox(
      row,
      layout.COL_NOMBRE_START,
      row,
      layout.lastCol,
      'DOCUMENTO BORRADOR — sin firmas; el libro aún está ABIERTO y la numeración puede reajustarse',
      texto({ size: FONT_SIZE.notaBorrador, bold: true, fontColor: DOC_COLOR.borrador }),
    );
  }

  /**
   * Firmas de autoridades al pie del folio (JEFE DE CARRERA / DIRECTOR /
   * RECTOR): línea punteada con el rótulo debajo, 3 zonas a lo ancho.
   */
  static _firmasAutoridades(c, { base, layout, doc }) {
    const row = base + FILA.firmasAutoridades;
    const firmas = doc.firmas ?? [];
    const zonas = computeTresZonasFirmas(layout);
    firmas.forEach((firma, i) => {
      const [start, end] = zonas[i] ?? zonas[zonas.length - 1];
      c.mergeBox(row, start, row, end, firma, texto({ size: FONT_SIZE.firma, wrap: true }));
      c.outline(row, start, row, end, { style: 'dotted', color: DOC_COLOR.border, sides: SOLO.top });
    });
  }

  /**
   * Página de FIRMAS DE DOCENTES del paralelo (al final de la hoja, tras el
   * último folio). Artefacto de impresión: NO es un folio del libro y NO
   * incrementa numero_folio. Logo + título (sin LIBRO/FOLIO) y una grilla de
   * 3 columnas con el nombre del docente y su materia debajo, dejando 9 filas
   * en blanco sobre cada nombre para la firma física (sin línea, como el
   * papel real; fuente: asignaciones vigentes del paralelo vía vista 135).
   *
   * @returns {number} Fila absoluta de la última materia pintada (para ubicar
   *          la sección siguiente).
   */
  static _firmasDocentes(c, { base, folio, layout, doc, logoId, widths }) {
    const asignaturas = folio.asignaturas ?? [];
    const { lastCol, firstAsigCol } = layout;

    this._logo(c, { logoId, base, widths, placement: LOGO_DOCENTES });
    c.mergeBox(
      base + FILA_DOCENTES.tituloInicio,
      Math.min(firstAsigCol + 2, lastCol),
      base + FILA_DOCENTES.tituloFin,
      lastCol,
      doc.titulo,
      texto({ size: FONT_SIZE.tituloDocentes, bold: true }),
    );

    const zonas = computeTresZonasDocentes(layout);
    let ultimaFila = base + FILA_DOCENTES.primerNombre;
    asignaturas.forEach((asig, i) => {
      const grupo = Math.floor(i / COLUMNAS_FIRMAS_DOCENTES);
      const [start, end] = zonas[i % COLUMNAS_FIRMAS_DOCENTES];
      const rowNombre = base + FILA_DOCENTES.primerNombre + grupo * FILAS_POR_FIRMA;
      const rowMateria = rowNombre + 1;
      const docente = texto({ size: FONT_SIZE.docente });
      c.mergeBox(rowNombre, start, rowNombre, end, mayusculas(asig.docenteNombre), docente);
      c.mergeBox(rowMateria, start, rowMateria, end, asig.nombre ?? '', { ...docente, wrap: true });
      ultimaFila = rowMateria;
    });

    for (let row = base + 1; row <= ultimaFila; row += 1) {
      c.rowHeight(row, ROW_HEIGHTS.base);
    }
    return ultimaFila;
  }

  /**
   * Bloque "ESTADÍSTICAS" del paralelo (DETALLE|CANTIDAD|%), debajo de las
   * firmas de docentes — inscritos/aprobados/reprobados/abandono, cabecera con
   * el mismo verde oficial de la tabla del folio y bordes finos negros.
   * Sin `estadisticas` (paralelo aún sin folios/estudiantes) no pinta nada.
   */
  static _estadisticasParalelo(c, { base, doc, estadisticas }) {
    if (!estadisticas) return;
    const cfg = doc.estadisticas ?? {};
    const filasCfg = cfg.filas ?? [];
    const cols = computeColumnasEstadisticas();
    const [detalleStart, detalleEnd] = cols.detalle;

    c.rowHeight(base, ROW_HEIGHTS.base);
    c.mergeBox(
      base,
      detalleStart,
      base,
      cols.porcentaje,
      cfg.titulo ?? 'ESTADÍSTICAS',
      texto({ size: FONT_SIZE.estadisticasTitulo, bold: true }),
    );

    const headRow = base + 2;
    const headStyle = cabecera({ size: FONT_SIZE.estadisticasCabecera, wrap: false });
    c.rowHeight(base + 1, ROW_HEIGHTS.base);
    c.rowHeight(headRow, ROW_HEIGHTS.base);
    c.mergeBox(headRow, detalleStart, headRow, detalleEnd, cfg.columnas?.[0] ?? 'DETALLE', headStyle);
    c.cell(headRow, cols.cantidad, cfg.columnas?.[1] ?? 'CANTIDAD', headStyle);
    c.cell(headRow, cols.porcentaje, cfg.columnas?.[2] ?? '%', headStyle);

    filasCfg.forEach((filaCfg, i) => {
      const row = headRow + 1 + i;
      c.rowHeight(row, ROW_HEIGHTS.estadisticasFila);
      c.mergeBox(
        row,
        detalleStart,
        row,
        detalleEnd,
        filaCfg.etiqueta,
        celda({ size: FONT_SIZE.estadisticasEtiqueta, bold: true, align: 'left', wrap: true }),
      );
      const valorEstilo = celda({ size: FONT_SIZE.estadisticasValor, bold: true });
      c.cell(row, cols.cantidad, Number(estadisticas[filaCfg.campo] ?? 0), valorEstilo);
      const pct = c.cell(
        row,
        cols.porcentaje,
        Number(estadisticas[filaCfg.pctCampo] ?? 0) / 100,
        valorEstilo,
      );
      pct.numFmt = '0%';
    });
  }
}

export default LibroRegistroSheetBuilder;
