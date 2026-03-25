/**
 * ExcelContentBuilder - Construye el contenido de datos del Excel
 * Responsabilidad: Agregar filas de datos, totales y estructura vacía
 * Principio: Single Responsibility Principle (SRP)
 */

import { ExcelStyleManager } from './ExcelStyleManager.js';
import { ExcelFormulaBuilder } from './ExcelFormulaBuilder.js';

class ExcelContentBuilder {
  /**
   * Agrega estructura vacía (solo etiquetas de carreras y periodos)
   */
  static agregarEstructuraVacia(worksheet) {
    let currentRow = 10;

    const carreras = [
      { id: 1, nombre: 'Sistemas Informáticos' },
      { id: 2, nombre: 'Administración de Empresas' },
      { id: 3, nombre: 'Contaduría General' }
    ];

    const periodosPorCarrera = [
      { numero: 1, nombre: '1ER AÑO' },
      { numero: 2, nombre: '2DO AÑO' },
      { numero: 3, nombre: '3ER AÑO' }
    ];

    carreras.forEach((carrera) => {
      const firstRow = currentRow;

      periodosPorCarrera.forEach((periodo, periodoIdx) => {
        if (periodoIdx === 0) {
          worksheet.getCell(`B${currentRow}`).value = carrera.nombre;
          ExcelStyleManager.aplicarNegrita(worksheet.getCell(`B${currentRow}`));
        }

        worksheet.getCell(`C${currentRow}`).value = periodo.nombre;
        ExcelStyleManager.aplicarColorCarrera(worksheet, currentRow, carrera.nombre);
        ExcelStyleManager.aplicarBordesFila(worksheet, currentRow);
        currentRow++;
      });

      this.agregarTotalCarreraVacia(worksheet, currentRow, carrera.nombre);
      
      if (periodosPorCarrera.length > 1) {
        worksheet.mergeCells(`B${firstRow}:B${currentRow - 1}`);
        worksheet.getCell(`B${firstRow}`).alignment = {
          vertical: 'middle',
          horizontal: 'center'
        };
      }

      currentRow += 2;
    });

    this.agregarTotalGeneralVacio(worksheet, currentRow);
  }

  /**
   * Pobla el reporte con datos reales
   */
  static poblarDatos(worksheet, datosAgrupados) {
    let currentRow = 10;

    Object.keys(datosAgrupados).forEach(carrera => {
      const regimenes = datosAgrupados[carrera];
      const firstRow = currentRow;

      Object.keys(regimenes).forEach((regimen, idx) => {
        const datosRegimen = regimenes[regimen];

        if (idx === 0) {
          worksheet.getCell(`B${currentRow}`).value = carrera;
          ExcelStyleManager.aplicarNegrita(worksheet.getCell(`B${currentRow}`));
        }

        worksheet.getCell(`C${currentRow}`).value = regimen;
        ExcelStyleManager.aplicarColorCarrera(worksheet, currentRow, carrera);
        ExcelFormulaBuilder.llenarFila(worksheet, currentRow, datosRegimen.paralelos);
        ExcelStyleManager.aplicarBordesFila(worksheet, currentRow);
        currentRow++;
      });

      this.agregarTotalCarreraConDatos(worksheet, currentRow, carrera, firstRow, currentRow - 1);

      const numRegimenes = Object.keys(regimenes).length;
      if (numRegimenes > 1) {
        worksheet.mergeCells(`B${firstRow}:B${currentRow - 1}`);
        worksheet.getCell(`B${firstRow}`).alignment = {
          vertical: 'middle',
          horizontal: 'center'
        };
      }

      currentRow += 2;
    });

    this.agregarTotalGeneralConDatos(worksheet, currentRow, 10, currentRow - 1);
  }

  /**
   * Agrega fila de total por carrera (versión vacía)
   */
  static agregarTotalCarreraVacia(worksheet, row, carreraNombre) {
    worksheet.mergeCells(`C${row}:L${row}`);
    worksheet.getCell(`C${row}`).value = `TOTAL EN ${carreraNombre.toUpperCase()}`;
    ExcelStyleManager.aplicarNegrita(worksheet.getCell(`C${row}`));
    ExcelStyleManager.aplicarEstiloTotalCarrera(worksheet, row, carreraNombre);
    ExcelStyleManager.aplicarBordesFila(worksheet, row);
  }

  /**
   * Agrega fila de total por carrera (versión con datos)
   */
  static agregarTotalCarreraConDatos(worksheet, row, carrera, firstRow, lastRow) {
    worksheet.mergeCells(`C${row}:L${row}`);
    worksheet.getCell(`C${row}`).value = `TOTAL EN ${carrera.toUpperCase()}`;
    ExcelStyleManager.aplicarNegrita(worksheet.getCell(`C${row}`));
    ExcelFormulaBuilder.agregarTotalCarrera(worksheet, row, firstRow, lastRow);
    
    const totalesGenero = ['AN', 'AO', 'AP', 'AQ', 'AR', 'AS'];
    totalesGenero.forEach(col => {
      ExcelStyleManager.aplicarNegrita(worksheet.getCell(`${col}${row}`));
    });
    
    ExcelStyleManager.aplicarEstiloTotalCarrera(worksheet, row, carrera);
    ExcelStyleManager.aplicarBordesFila(worksheet, row);
  }

  /**
   * Agrega fila de total general (versión vacía)
   */
  static agregarTotalGeneralVacio(worksheet, row) {
    worksheet.mergeCells(`B${row}:C${row}`);
    worksheet.getCell(`B${row}`).value = 'TOTAL';
    ExcelStyleManager.aplicarNegrita(worksheet.getCell(`B${row}`));
    ExcelStyleManager.aplicarEstiloTotalGeneral(worksheet, row);
    ExcelStyleManager.aplicarBordesFila(worksheet, row);
  }

  /**
   * Agrega fila de total general (versión con datos)
   */
  static agregarTotalGeneralConDatos(worksheet, row, firstRow, lastRow) {
    worksheet.mergeCells(`B${row}:C${row}`);
    worksheet.getCell(`B${row}`).value = 'TOTAL';
    ExcelStyleManager.aplicarNegrita(worksheet.getCell(`B${row}`));
    ExcelFormulaBuilder.agregarTotalGeneral(worksheet, row, firstRow, lastRow);
    
    const columnas = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
      'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
      'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD',
      'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM',
      'AN', 'AO', 'AP', 'AQ', 'AR', 'AS'];
    
    columnas.forEach(col => {
      ExcelStyleManager.aplicarNegrita(worksheet.getCell(`${col}${row}`));
    });
    
    ExcelStyleManager.aplicarEstiloTotalGeneral(worksheet, row);
    ExcelStyleManager.aplicarBordesFila(worksheet, row);
  }
}

export { ExcelContentBuilder };
