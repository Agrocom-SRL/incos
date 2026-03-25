/**
 * ExcelContentBuilder - Construye el contenido de datos del Excel
 * Responsabilidad: Agregar filas de datos, totales y estructura vacía
 * Principio: Single Responsibility Principle (SRP)
 */

import { ExcelStyleManager } from './ExcelStyleManager.js';
import { ExcelFormulaBuilder } from './ExcelFormulaBuilder.js';
import { ExcelDataProcessor } from './ExcelDataProcessor.js';

class ExcelContentBuilder {
  /**
   * Agrega estructura vacía (solo etiquetas de carreras y periodos)
   */
  static agregarEstructuraVacia(worksheet) {
    let currentRow = 10;

    const carreras = ExcelDataProcessor.CARRERAS_ORDEN_INSTITUTO.map((nombre) => ({ nombre }));
    const periodosPorCarrera = ExcelDataProcessor.PERIODOS_ETIQUETAS_REPORTE.map((nombre) => ({
      nombre
    }));

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

      const totalRow = currentRow;
      this.agregarTotalCarreraVacia(worksheet, totalRow, carrera.nombre, firstRow, totalRow - 1);

      worksheet.mergeCells(`B${firstRow}:B${totalRow}`);
      ExcelStyleManager.aplicarEstiloCeldaNombreCarrera(worksheet.getCell(`B${firstRow}`));
      ExcelStyleManager.aplicarColorColumnaBCarrera(worksheet, firstRow, totalRow, carrera.nombre);

      currentRow = totalRow + 1;
    });

    this.agregarTotalGeneralVacio(worksheet, currentRow);
  }

  /**
   * Pobla el reporte con datos reales
   */
  static poblarDatos(worksheet, datosAgrupados) {
    let currentRow = 10;
    const filasTotalesPorCarrera = [];

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

      const totalRow = currentRow;
      filasTotalesPorCarrera.push(totalRow);
      this.agregarTotalCarreraConDatos(worksheet, totalRow, carrera, firstRow, totalRow - 1);

      worksheet.mergeCells(`B${firstRow}:B${totalRow}`);
      ExcelStyleManager.aplicarEstiloCeldaNombreCarrera(worksheet.getCell(`B${firstRow}`));
      ExcelStyleManager.aplicarColorColumnaBCarrera(worksheet, firstRow, totalRow, carrera);

      currentRow = totalRow + 1;
    });

    this.agregarTotalGeneralConDatos(worksheet, currentRow, 10, currentRow - 1, filasTotalesPorCarrera);
  }

  /**
   * Agrega fila de total por carrera (versión vacía)
   */
  static agregarTotalCarreraVacia(worksheet, row, carreraNombre, firstRow, lastRow) {
    ExcelFormulaBuilder.agregarTotalCarrera(worksheet, row, firstRow, lastRow);
    ExcelStyleManager.aplicarEtiquetaTotalEnCarrera(
      worksheet,
      row,
      `TOTAL EN ${carreraNombre.toUpperCase()}`
    );
    [...ExcelFormulaBuilder.COLUMNAS_SUMA_VERTICAL_TOTAL_CARRERA, 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS'].forEach(
      col => {
        ExcelStyleManager.aplicarNegrita(worksheet.getCell(`${col}${row}`));
      }
    );
    ExcelStyleManager.aplicarEstiloTotalCarrera(worksheet, row, carreraNombre);
    ExcelStyleManager.aplicarBordesFila(worksheet, row);
    ExcelStyleManager.aplicarAlineacionEtiquetaTotalCarrera(worksheet, row);
  }

  /**
   * Agrega fila de total por carrera (versión con datos)
   */
  static agregarTotalCarreraConDatos(worksheet, row, carrera, firstRow, lastRow) {
    ExcelFormulaBuilder.agregarTotalCarrera(worksheet, row, firstRow, lastRow);
    ExcelStyleManager.aplicarEtiquetaTotalEnCarrera(
      worksheet,
      row,
      `TOTAL EN ${carrera.toUpperCase()}`
    );

    [...ExcelFormulaBuilder.COLUMNAS_SUMA_VERTICAL_TOTAL_CARRERA, 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS'].forEach(
      col => {
        ExcelStyleManager.aplicarNegrita(worksheet.getCell(`${col}${row}`));
      }
    );

    ExcelStyleManager.aplicarEstiloTotalCarrera(worksheet, row, carrera);
    ExcelStyleManager.aplicarBordesFila(worksheet, row);
    ExcelStyleManager.aplicarAlineacionEtiquetaTotalCarrera(worksheet, row);
  }

  /**
   * Agrega fila de total general (versión vacía)
   */
  static agregarTotalGeneralVacio(worksheet, row) {
    worksheet.getCell(`C${row}`).value = 'TOTAL';
    ExcelStyleManager.aplicarNegrita(worksheet.getCell(`C${row}`));
    ExcelStyleManager.aplicarEstiloTotalGeneral(worksheet, row);
    ExcelStyleManager.aplicarBordesFila(worksheet, row);
  }

  /**
   * Agrega fila de total general (versión con datos)
   */
  static agregarTotalGeneralConDatos(worksheet, row, firstRow, lastRow, filasTotalesPorCarrera) {
    worksheet.getCell(`C${row}`).value = 'TOTAL';
    ExcelStyleManager.aplicarNegrita(worksheet.getCell(`C${row}`));
    ExcelFormulaBuilder.agregarTotalGeneral(worksheet, row, firstRow, lastRow, filasTotalesPorCarrera);
    
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
