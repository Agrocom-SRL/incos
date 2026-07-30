/**
 * AsistenciaConsolidadoExcelBuilder — servicio orquestador del Consolidado %
 * de asistencia (.xlsx). Implementa IAsistenciaConsolidadoExcelGenerator y se
 * registra en el container DI; el use case nunca lo importa de forma concreta.
 *
 * Responsabilidad: crear el workbook, añadir la ÚNICA hoja (1 hoja/archivo) y
 * delegar el pintado en AsistenciaConsolidadoSheetBuilder. Sin lógica de
 * pintado de celdas aquí.
 */

import ExcelJS from 'exceljs';
import { IAsistenciaConsolidadoExcelGenerator } from '../../../../domain/interfaces/services/IAsistenciaConsolidadoExcelGenerator.js';
import { ExcelSheetComposer } from '../shared/index.js';
import { AsistenciaConsolidadoSheetBuilder } from './AsistenciaConsolidadoSheetBuilder.js';

/** Sanea el nombre de hoja: Excel prohíbe : \ / ? * [ ] y limita a 31 chars. */
const sanitizarNombreHoja = (nombre) => {
  const limpio = String(nombre ?? 'Consolidado')
    .replace(/[\\/?*[\]:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return (limpio || 'Consolidado').slice(0, 31);
};

export class AsistenciaConsolidadoExcelBuilder extends IAsistenciaConsolidadoExcelGenerator {
  /**
   * @param {Object} datos - Payload de la hoja (ver IAsistenciaConsolidadoExcelGenerator).
   * @returns {Promise<Buffer>}
   */
  async generarConsolidadoAsistencia(datos) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'INCOS Santa Cruz';
    workbook.created = new Date();

    const cab = datos?.cabecera ?? {};
    const nombreHoja = sanitizarNombreHoja(cab.paralelo || 'Consolidado');

    AsistenciaConsolidadoSheetBuilder.build({
      composer: new ExcelSheetComposer(workbook.addWorksheet(nombreHoja)),
      datos,
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  }
}

export default AsistenciaConsolidadoExcelBuilder;
