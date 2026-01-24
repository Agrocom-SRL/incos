/**
 * Módulo Excel - Generador de reportes Excel
 * 
 * Exporta todas las clases necesarias para generar reportes Excel
 * siguiendo principios SOLID
 */

const { ExcelGenerator } = require('./ExcelGenerator');
const { ExcelStyleManager } = require('./ExcelStyleManager');
const { ExcelStructureBuilder } = require('./ExcelStructureBuilder');
const { ExcelDataProcessor } = require('./ExcelDataProcessor');
const { ExcelFormulaBuilder } = require('./ExcelFormulaBuilder');
const { ExcelContentBuilder } = require('./ExcelContentBuilder');

module.exports = {
  ExcelGenerator,
  ExcelStyleManager,
  ExcelStructureBuilder,
  ExcelDataProcessor,
  ExcelFormulaBuilder,
  ExcelContentBuilder
};
