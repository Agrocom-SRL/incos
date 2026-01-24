/**
 * ExcelGenerator - Generador de reportes Excel para el Instituto INCOS
 * 
 * Responsabilidad: Orquestar la generación del Excel usando las clases especializadas
 * Principio: Single Responsibility Principle (SRP) - Solo orquesta, no implementa
 * 
 * Uso:
 * const buffer = await ExcelGenerator.generarReporteInscritos(datos, filtros);
 */

const ExcelJS = require('exceljs');
const { ExcelStructureBuilder } = require('./ExcelStructureBuilder');
const { ExcelDataProcessor } = require('./ExcelDataProcessor');
const { ExcelContentBuilder } = require('./ExcelContentBuilder');

class ExcelGenerator {
  /**
   * Genera el reporte Excel de inscritos con estadísticas
   * @param {Array} datos - Array de objetos con los datos de inscripciones
   * @param {Object} filtros - { gestion_nombre, gestion_anio }
   * @returns {Promise<Buffer>} Buffer del Excel
   */
  static async generarReporteInscritos(datos = [], filtros = {}) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Estadísticas Inscritos');

    // Configurar estructura base
    ExcelStructureBuilder.configurarColumnas(worksheet);
    ExcelStructureBuilder.agregarTitulo(worksheet, filtros.gestion_anio || '');
    ExcelStructureBuilder.construirEncabezados(worksheet);

    // Agregar contenido
    if (datos && datos.length > 0) {
      const datosAgrupados = ExcelDataProcessor.agruparDatos(datos);
      ExcelContentBuilder.poblarDatos(worksheet, datosAgrupados);
    } else {
      ExcelContentBuilder.agregarEstructuraVacia(worksheet);
    }

    return await workbook.xlsx.writeBuffer();
  }
}

module.exports = { ExcelGenerator };
