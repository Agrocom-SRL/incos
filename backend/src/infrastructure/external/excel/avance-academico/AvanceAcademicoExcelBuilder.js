/**
 * AvanceAcademicoExcelBuilder — servicio orquestador del reporte de Avance
 * académico (.xlsx). Implementa IAvanceAcademicoExcelGenerator y se registra
 * en el container DI; el use case nunca lo importa de forma concreta.
 *
 * Responsabilidad: crear el workbook, añadir la ÚNICA hoja (1 hoja/archivo) y
 * delegar el pintado en AvanceAcademicoSheetBuilder.
 */

import ExcelJS from 'exceljs';
import { IAvanceAcademicoExcelGenerator } from '../../../../domain/interfaces/services/IAvanceAcademicoExcelGenerator.js';
import { ExcelSheetComposer } from '../shared/index.js';
import { AvanceAcademicoSheetBuilder } from './AvanceAcademicoSheetBuilder.js';

export class AvanceAcademicoExcelBuilder extends IAvanceAcademicoExcelGenerator {
  /**
   * @param {Object} datos - Payload de la hoja (ver IAvanceAcademicoExcelGenerator).
   * @returns {Promise<Buffer>}
   */
  async generarAvanceAcademico(datos) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'INCOS Santa Cruz';
    workbook.created = new Date();

    AvanceAcademicoSheetBuilder.build({
      composer: new ExcelSheetComposer(workbook.addWorksheet('Avance académico')),
      datos,
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  }
}

export default AvanceAcademicoExcelBuilder;
