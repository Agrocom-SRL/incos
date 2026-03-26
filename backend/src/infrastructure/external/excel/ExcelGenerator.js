/**
 * ExcelGenerator - Generador de reportes Excel para el Instituto INCOS
 *
 * Responsabilidad: Orquestar la generación del Excel usando las clases especializadas
 * Principio: Single Responsibility Principle (SRP) - Solo orquesta, no implementa
 *
 * Uso:
 * const buffer = await ExcelGenerator.generarReporteInscritos(datos, filtros, { soloInscripcion: true });
 */

import ExcelJS from 'exceljs';
import { ExcelStructureBuilder } from './ExcelStructureBuilder.js';
import { ExcelDataProcessor } from './ExcelDataProcessor.js';
import { ExcelContentBuilder } from './ExcelContentBuilder.js';

/** Columna L = fin del bloque INSCRIPCIÓN; M–AS = abandonos, reprobados, aprobados, totales género (índice 1-based Excel). */
const COL_FIN_INSCRIPCION = 12;
const COL_FIN_TABLA_COMPLETA = 45;

class ExcelGenerator {
  /**
   * Oculta columnas M:AS. El libro sigue generando toda la matriz y fórmulas (fase 2 sin tocar código).
   * @param {import('exceljs').Worksheet} worksheet
   */
  static ocultarColumnasPostInscripcion(worksheet) {
    for (let col = COL_FIN_INSCRIPCION + 1; col <= COL_FIN_TABLA_COMPLETA; col++) {
      worksheet.getColumn(col).hidden = true;
    }
  }

  /**
   * Genera el reporte Excel de inscritos con estadísticas
   * @param {Array} datos - Array de objetos con los datos de inscripciones
   * @param {Object} filtros - { gestion_nombre, gestion_anio }
   * @param {{ soloInscripcion?: boolean }} [opciones] - true: solo visible B:L (inscripción); resto oculto
   * @returns {Promise<Buffer>} Buffer del Excel
   */
  static async generarReporteInscritos(datos = [], filtros = {}, opciones = {}) {
    const soloInscripcion = opciones.soloInscripcion === true;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Estadísticas Inscritos');

    ExcelStructureBuilder.configurarColumnas(worksheet);
    ExcelStructureBuilder.agregarTitulo(worksheet, filtros.gestion_anio || '', { soloInscripcion });
    ExcelStructureBuilder.construirEncabezados(worksheet);

    if (datos && datos.length > 0) {
      const datosAgrupados = ExcelDataProcessor.construirMatrizReporte(datos);
      ExcelContentBuilder.poblarDatos(worksheet, datosAgrupados);
    } else {
      ExcelContentBuilder.agregarEstructuraVacia(worksheet);
    }

    if (soloInscripcion) {
      this.ocultarColumnasPostInscripcion(worksheet);
    }

    return workbook.xlsx.writeBuffer();
  }
}

export { ExcelGenerator };
