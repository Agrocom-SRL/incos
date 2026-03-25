/**
 * ExcelFormulaBuilder - Construye fórmulas Excel
 * Responsabilidad: Crear todas las fórmulas del Excel
 * Principio: Single Responsibility Principle (SRP)
 */

export class ExcelFormulaBuilder {
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
        getValor: (par, idx) => idx % 2 === 0 ? par.m_inscripcion : par.v_inscripcion
      },
      {
        nombre: 'ABANDONOS',
        cols: ['M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'],
        totalCol: 'U',
        getValor: (par, idx) => idx % 2 === 0 ? par.m_abandono : par.v_abandono
      },
      {
        nombre: 'REPROBADOS',
        cols: ['V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC'],
        totalCol: 'AD',
        getValor: (par, idx) => idx % 2 === 0 ? par.m_reprobado : par.v_reprobado
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
    const formulas = [
      { col: 'AN', formula: `M${row}+O${row}+Q${row}+S${row}` }, // MUJERES ABANDONO
      { col: 'AO', formula: `N${row}+P${row}+R${row}+T${row}` }, // VARONES ABANDONO
      { col: 'AP', formula: `V${row}+X${row}+Z${row}+AB${row}` }, // MUJERES REPROBADOS
      { col: 'AQ', formula: `W${row}+Y${row}+AA${row}+AC${row}` }, // VARONES REPROBADOS
      { col: 'AR', formula: `AE${row}+AG${row}+AI${row}+AK${row}` }, // MUJERES APROBADOS
      { col: 'AS', formula: `AF${row}+AH${row}+AJ${row}+AL${row}` } // VARONES APROBADOS
    ];

    formulas.forEach(({ col, formula }) => {
      worksheet.getCell(`${col}${row}`).value = { formula };
    });
  }

  /**
   * Agrega fórmulas de total por carrera
   */
  static agregarTotalCarrera(worksheet, row, firstRow, lastRow) {
    const totalesGenero = ['AN', 'AO', 'AP', 'AQ', 'AR', 'AS'];
    
    totalesGenero.forEach(col => {
      worksheet.getCell(`${col}${row}`).value = {
        formula: `SUM(${col}${firstRow}:${col}${lastRow})`
      };
    });
  }

  /**
   * Agrega fórmulas de total general
   */
  static agregarTotalGeneral(worksheet, row, firstRow, lastRow) {
    const columnas = [
      'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
      'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
      'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD',
      'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM',
      'AN', 'AO', 'AP', 'AQ', 'AR', 'AS'
    ];

    columnas.forEach(col => {
      worksheet.getCell(`${col}${row}`).value = {
        formula: `SUM(${col}${firstRow}:${col}${lastRow})`
      };
    });
  }
}
