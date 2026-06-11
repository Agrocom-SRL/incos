/**
 * Módulo Excel - Generador de reportes Excel
 *
 * Exporta todas las clases necesarias para generar reportes Excel
 * siguiendo principios SOLID
 */

export { ExcelGenerator } from './ExcelGenerator.js';
export { ExcelStyleManager } from './ExcelStyleManager.js';
export { ExcelStructureBuilder } from './ExcelStructureBuilder.js';
export { ExcelDataProcessor } from './ExcelDataProcessor.js';
export { ExcelFormulaBuilder } from './ExcelFormulaBuilder.js';
export { ExcelContentBuilder } from './ExcelContentBuilder.js';
export { RegistroPedagogicoExcelBuilder } from './RegistroPedagogicoExcelBuilder.js';
export { ConsolidadoSheetBuilder } from './registro-pedagogico/ConsolidadoSheetBuilder.js';
export { PlanillaCalificacionesSheetBuilder } from './registro-pedagogico/PlanillaCalificacionesSheetBuilder.js';

// Toolkit compartido y estandarizado (theme + composer)
export * from './shared/index.js';
