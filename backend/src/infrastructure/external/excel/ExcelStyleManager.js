/**
 * ExcelStyleManager - Maneja todos los estilos y colores del Excel
 * Responsabilidad: Aplicar estilos, colores y formatos a las celdas
 * Principio: Single Responsibility Principle (SRP)
 */

class ExcelStyleManager {
  /** Columna B (inicio tabla de datos) hasta AS (fin de totales por género). La A queda fuera del color. */
  static COL_TABLA_INICIO = 2;

  static COL_TABLA_FIN = 45;

  /** Tamaño de fuente del cuerpo de la tabla (encabezados de columnas y filas de datos). */
  static FONT_SIZE_TABLA = 14;

  /** Misma altura para filas de periodo y filas TOTAL EN [carrera] (sin filas más altas por wrap). */
  static ALTURA_FILA_CUERPO = 22;

  /**
   * Configuración de colores según el diseño institucional.
   * Nota: Excel no tiene padding interior como CSS; wrapText + anchos/altos definen el aire visual.
   */
  static COLORS = {
    HEADER_BG: { argb: 'FFF3DBDB' }, // Cabecera tabla (filas 7–9), tono rosa suave
    // Filas de periodo (datos): sin fondo por carrera; color solo en totales por carrera y total general
    CONTADURIA_BG: null,
    ADMINISTRACION_BG: null,
    SISTEMAS_BG: null,
    // Colores para totales por carrera (según imagen)
    TOTAL_CONTADURIA_BG: { argb: 'FFE2BEF1' }, // Violeta claro
    TOTAL_ADMINISTRACION_BG: { argb: 'FFB4D8B4' }, // Verde teal más oscuro
    TOTAL_SISTEMAS_BG: { argb: 'FFB4D8E8' }, // Azul teal más oscuro
    TOTAL_GENERAL_BG: { argb: 'FFFFB6C1' }, // Rosado/rojizo claro
    /** Fondo de las celdas de paralelo (A–D) en fila 8 del encabezado */
    PARALELO_FILA8_BG: { argb: 'FFFFFFFF' }
  };

  /**
   * Aplica estilos a las filas de encabezados
   */
  static aplicarEstilosEncabezados(worksheet) {
    [7, 8, 9].forEach((row) => {
      for (let col = this.COL_TABLA_INICIO; col <= this.COL_TABLA_FIN; col++) {
        const cell = worksheet.getCell(row, col);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: this.COLORS.HEADER_BG
        };
        cell.font = { bold: true, size: this.FONT_SIZE_TABLA };
        cell.alignment = this.getAlineacionCabeceraTabla();
        cell.border = this.getBordeDelgado();
      }
    });

    worksheet.getRow(7).height = 34;
    worksheet.getRow(8).height = 28;
    worksheet.getRow(9).height = 28;
  }

  /**
   * Relleno blanco en las celdas de la fila 8 donde van las letras A, B, C, D por bloque
   * (inscripción, abandono, reprobados, aprobados). Ejecutar después de aplicarEstilosEncabezados.
   */
  static aplicarRellenoBlancoParalelosFila8(worksheet) {
    const pares = [
      ['D', 'E'], ['F', 'G'], ['H', 'I'], ['J', 'K'],
      ['M', 'N'], ['O', 'P'], ['Q', 'R'], ['S', 'T'],
      ['V', 'W'], ['X', 'Y'], ['Z', 'AA'], ['AB', 'AC'],
      ['AE', 'AF'], ['AG', 'AH'], ['AI', 'AJ'], ['AK', 'AL']
    ];
    const fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: this.COLORS.PARALELO_FILA8_BG
    };
    pares.forEach(([c0, c1]) => {
      [c0, c1].forEach((c) => {
        worksheet.getCell(`${c}8`).fill = fill;
      });
    });
  }

  /**
   * Aplica color de fondo según la carrera
   */
  static aplicarColorCarrera(worksheet, row, carreraNombre) {
    const color = this.obtenerColorCarrera(carreraNombre);
    this.aplicarRellenoRangoTabla(worksheet, row, color);
  }

  /**
   * Relleno solo en columnas B:AS (no en A).
   * @param {{ argb: string }|null|undefined} fgColor - null/undefined = sin relleno (fondo por defecto)
   */
  static aplicarRellenoRangoTabla(worksheet, row, fgColor) {
    for (let col = this.COL_TABLA_INICIO; col <= this.COL_TABLA_FIN; col++) {
      const cell = worksheet.getCell(row, col);
      if (fgColor) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor };
      } else {
        cell.fill = undefined;
      }
    }
  }

  /**
   * Fondo en filas de régimen (1ER/2DO/3ER): ninguno; el color distintivo va solo en TOTAL EN [carrera].
   */
  static obtenerColorCarrera(_carreraNombre) {
    return null;
  }

  /**
   * Aplica estilo a la fila de total por carrera según la carrera
   */
  static aplicarEstiloTotalCarrera(worksheet, row, carreraNombre) {
    const color = this.obtenerColorTotalCarrera(carreraNombre);
    this.aplicarRellenoRangoTabla(worksheet, row, color);
  }

  /**
   * Obtiene el color de fondo para el total de una carrera
   */
  static obtenerColorTotalCarrera(carreraNombre) {
    const nombre = carreraNombre?.toUpperCase() || '';

    if (nombre.includes('CONTADURÍA') || nombre.includes('CONTADURIA')) {
      return this.COLORS.TOTAL_CONTADURIA_BG;
    }
    if (nombre.includes('ADMINISTRACIÓN') || nombre.includes('ADMINISTRACION')) {
      return this.COLORS.TOTAL_ADMINISTRACION_BG;
    }
    if (nombre.includes('SISTEMAS')) {
      return this.COLORS.TOTAL_SISTEMAS_BG;
    }
    // Default: violeta claro
    return this.COLORS.TOTAL_CONTADURIA_BG;
  }

  /**
   * Columna B (nombre de carrera, 4 filas) con el mismo color que la fila TOTAL EN [carrera] (C:L).
   */
  static aplicarColorColumnaBCarrera(worksheet, firstRow, lastRow, carreraNombre) {
    const color = this.obtenerColorTotalCarrera(carreraNombre);
    for (let r = firstRow; r <= lastRow; r++) {
      const cell = worksheet.getCell(r, this.COL_TABLA_INICIO);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: color };
    }
  }

  /**
   * Aplica estilo a la fila de total general
   */
  static aplicarEstiloTotalGeneral(worksheet, row) {
    this.aplicarRellenoRangoTabla(worksheet, row, this.COLORS.TOTAL_GENERAL_BG);
  }

  /**
   * Alineación estándar del cuerpo de la tabla: centrado y texto multilínea cuando no cabe.
   */
  static getAlineacionCuerpoTabla() {
    return {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
  }

  /**
   * Cabeceras: centrado + ajuste de línea (títulos largos en AN–AS).
   */
  static getAlineacionCabeceraTabla() {
    return this.getAlineacionCuerpoTabla();
  }

  /**
   * Celda fusionada del nombre de carrera (columna B): usa todo el bloque y parte palabras en varias líneas.
   */
  static aplicarEstiloCeldaNombreCarrera(cell) {
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
      shrinkToFit: false
    };
  }

  /**
   * Etiqueta "TOTAL EN [CARRERA]" en C:L (10 columnas), una sola línea de texto.
   * Las fórmulas de total por carrera solo usan AN–AS; D–L en esa fila quedan libres.
   */
  static aplicarEtiquetaTotalEnCarrera(worksheet, row, texto) {
    worksheet.mergeCells(`C${row}:L${row}`);
    const cell = worksheet.getCell(`C${row}`);
    cell.value = texto;
    this.aplicarNegrita(cell);
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: false
    };
  }

  /**
   * Tras bordes genéricos, mantiene la etiqueta TOTAL EN sin wrap (C:L fusionadas).
   */
  static aplicarAlineacionEtiquetaTotalCarrera(worksheet, row) {
    const cell = worksheet.getCell(`C${row}`);
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: false
    };
  }

  /**
   * Bordes, fuente y alineación en B:AS (tabla del reporte)
   */
  static aplicarBordesFila(worksheet, row) {
    const alineacion = this.getAlineacionCuerpoTabla();
    for (let col = this.COL_TABLA_INICIO; col <= this.COL_TABLA_FIN; col++) {
      const cell = worksheet.getCell(row, col);
      cell.border = this.getBordeDelgado();
      const prev = cell.font || {};
      cell.font = { ...prev, size: prev.size ?? this.FONT_SIZE_TABLA };
      cell.alignment = alineacion;
    }
    worksheet.getRow(row).height = this.ALTURA_FILA_CUERPO;
  }

  /**
   * Retorna configuración de borde delgado
   */
  static getBordeDelgado() {
    return {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  }

  /**
   * Aplica estilo de texto en negrita
   */
  static aplicarNegrita(cell) {
    const prev = cell.font || {};
    cell.font = { ...prev, bold: true, size: prev.size ?? this.FONT_SIZE_TABLA };
  }
}

export { ExcelStyleManager };
