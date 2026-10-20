/**
 * ExcelFormulaBuilder - Construye fórmulas Excel
 * Responsabilidad: Crear todas las fórmulas del Excel
 * Principio: Single Responsibility Principle (SRP)
 */

export class ExcelFormulaBuilder {
  /**
   * Columnas M–AM: abandonos, reprobados, aprobados y sus subtotales (U, AD, AM).
   * En la fila TOTAL EN [carrera] se suman verticalmente las filas del bloque (1ER–3ER).
   */
  static COLUMNAS_SUMA_VERTICAL_TOTAL_CARRERA = [
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
    'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD',
    'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM'
  ];

  /** Columnas donde el total global debe sumar solo filas TOTAL EN [carrera] (evita doble conteo). */
  static COLUMNAS_TOTAL_GLOBAL_SOLO_SUBTOTALES_CARRERA = [
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
    'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD',
    'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM',
    'AN', 'AO', 'AP', 'AQ', 'AR', 'AS'
  ];

  /**
   * Llena una fila con los datos de los paralelos y sus fórmulas
   */
  static llenarFila(worksheet, row, paralelos) {
    const p = {
      A: paralelos.A || {},
      B: paralelos.B || {},
      C: paralelos.C || {},
      D: paralelos.D || {}
    };

    // Configuración de columnas por categoría
    const configuraciones = [
      {
        nombre: 'INSCRIPCIÓN',
        cols: ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
        totalCol: 'L',
        // Par de columnas: primero masculino (v_), luego femenino (m_)
        getValor: (par, idx) => idx % 2 === 0 ? par.v_inscripcion : par.m_inscripcion
      },
      {
        nombre: 'ABANDONOS',
        cols: ['M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'],
        totalCol: 'U',
        getValor: (par, idx) => idx % 2 === 0 ? par.v_abandono : par.m_abandono
      },
      {
        nombre: 'REPROBADOS',
        cols: ['V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC'],
        totalCol: 'AD',
        getValor: (par, idx) => idx % 2 === 0 ? par.v_reprobado : par.m_reprobado
      }
    ];

    // Llenar datos y totales para cada categoría
    configuraciones.forEach(({ cols, totalCol, getValor }) => {
      ['A', 'B', 'C', 'D'].forEach((par, i) => {
        const colIdx = i * 2;
        worksheet.getCell(`${cols[colIdx]}${row}`).value = getValor(p[par], colIdx) || 0;
        worksheet.getCell(`${cols[colIdx + 1]}${row}`).value = getValor(p[par], colIdx + 1) || 0;
      });

      worksheet.getCell(`${totalCol}${row}`).value = {
        formula: `SUM(${cols[0]}${row}:${cols[cols.length - 1]}${row})`
      };
    });

    // APROBADOS (calculado con fórmula)
    this.agregarAprobados(worksheet, row);

    // Totales por género
    this.agregarTotalesGenero(worksheet, row);
  }

  /**
   * Agrega la sección de aprobados con fórmulas
   */
  static agregarAprobados(worksheet, row) {
    // Aprobados = Inscripción - Abandonos - Reprobados
    const colsInscripcion = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
    const colsReprobados = ['V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC'];
    const colsAbandonos = ['M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
    const colsAprobados = ['AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL'];

    colsAprobados.forEach((col, i) => {
      const colInscripcion = colsInscripcion[i];
      const colReprobado = colsReprobados[i];
      const colAbandono = colsAbandonos[i];

      worksheet.getCell(`${col}${row}`).value = {
        formula: `${colInscripcion}${row}-${colReprobado}${row}-${colAbandono}${row}`
      };
    });

    worksheet.getCell(`AM${row}`).value = {
      formula: `SUM(AE${row}:AL${row})`
    };
  }

  /**
   * Agrega totales por género
   */
  static agregarTotalesGenero(worksheet, row) {
    // Por bloque abandono / reprobado / aprobado: columna M luego F (AN/AO, AP/AQ, AR/AS)
    const formulas = [
      { col: 'AN', formula: `M${row}+O${row}+Q${row}+S${row}` },
      { col: 'AO', formula: `N${row}+P${row}+R${row}+T${row}` },
      { col: 'AP', formula: `V${row}+X${row}+Z${row}+AB${row}` },
      { col: 'AQ', formula: `W${row}+Y${row}+AA${row}+AC${row}` },
      { col: 'AR', formula: `AE${row}+AG${row}+AI${row}+AK${row}` },
      { col: 'AS', formula: `AF${row}+AH${row}+AJ${row}+AL${row}` }
    ];

    formulas.forEach(({ col, formula }) => {
      worksheet.getCell(`${col}${row}`).value = { formula };
    });
  }

  /**
   * Agrega fórmulas de total por carrera: suma vertical del bloque (M–AM y AN–AS),
   * igual criterio que agregarTotalGeneral pero solo entre firstRow y lastRow del grupo.
   */
  static agregarTotalCarrera(worksheet, row, firstRow, lastRow) {
    this.COLUMNAS_SUMA_VERTICAL_TOTAL_CARRERA.forEach(col => {
      worksheet.getCell(`${col}${row}`).value = {
        formula: `SUM(${col}${firstRow}:${col}${lastRow})`
      };
    });

    const totalesGenero = ['AN', 'AO', 'AP', 'AQ', 'AR', 'AS'];
    totalesGenero.forEach(col => {
      worksheet.getCell(`${col}${row}`).value = {
        formula: `SUM(${col}${firstRow}:${col}${lastRow})`
      };
    });
  }

  /**
   * Total general: D–L suman todo el cuerpo (filas de periodo; celdas fusionadas en totales por carrera no duplican).
   * M–AS suman solo las filas TOTAL EN [carrera] (filasTotalesCarrera) para no sumar periodos + subtotales dos veces.
   *
   * @param {number[]} filasTotalesCarrera - Números de fila de cada "TOTAL EN …" (ej. [13, 17, 21])
   */
  static agregarTotalGeneral(worksheet, row, firstRow, lastRow, filasTotalesCarrera) {
    const columnas = [
      'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
      'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
      'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD',
      'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM',
      'AN', 'AO', 'AP', 'AQ', 'AR', 'AS'
    ];

    const soloSubtotales = new Set(this.COLUMNAS_TOTAL_GLOBAL_SOLO_SUBTOTALES_CARRERA);

    columnas.forEach(col => {
      if (soloSubtotales.has(col) && filasTotalesCarrera?.length) {
        const refs = filasTotalesCarrera.map(fr => `${col}${fr}`).join(',');
        worksheet.getCell(`${col}${row}`).value = {
          formula: `SUM(${refs})`
        };
      } else {
        worksheet.getCell(`${col}${row}`).value = {
          formula: `SUM(${col}${firstRow}:${col}${lastRow})`
        };
      }
    });
  }
}
