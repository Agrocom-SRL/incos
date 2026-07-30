/**
 * DesercionExcelBuilder — servicio orquestador del reporte de Deserción
 * estudiantil (.xlsx). Implementa IDesercionExcelGenerator y se registra en el
 * container DI; el use case nunca lo importa de forma concreta.
 *
 * Responsabilidad: crear el workbook, añadir la ÚNICA hoja (1 hoja/archivo) y
 * delegar el pintado en DesercionSheetBuilder.
 */

import ExcelJS from 'exceljs';
import { IDesercionExcelGenerator } from '../../../../domain/interfaces/services/IDesercionExcelGenerator.js';
import { ExcelSheetComposer } from '../shared/index.js';
import { DesercionSheetBuilder } from './DesercionSheetBuilder.js';

export class DesercionExcelBuilder extends IDesercionExcelGenerator {
  /**
   * @param {Object} datos - Payload de la hoja (ver IDesercionExcelGenerator).
   * @returns {Promise<Buffer>}
   */
  async generarReporteDesercion(datos) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'INCOS Santa Cruz';
    workbook.created = new Date();

    DesercionSheetBuilder.build({
      composer: new ExcelSheetComposer(workbook.addWorksheet('Deserción')),
      datos,
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  }
}

export default DesercionExcelBuilder;
