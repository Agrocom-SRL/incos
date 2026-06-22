/**
 * BecasReporteExcelBuilder — servicio orquestador de la Planilla de Control de
 * Becas por carrera (.xlsx). Implementa IBecasReporteExcelGenerator y se registra
 * en el container DI; el use case nunca lo importa de forma concreta.
 *
 * Responsabilidad: crear el workbook (UNA sola hoja) y delegar la construcción en
 * BecasReporteSheetBuilder. No contiene lógica de pintado de celdas (eso vive en
 * el sheet builder + el toolkit compartido).
 */

import ExcelJS from 'exceljs';
import { IBecasReporteExcelGenerator } from '../../../../domain/interfaces/services/IBecasReporteExcelGenerator.js';
import { ExcelSheetComposer } from '../shared/index.js';
import { BecasReporteSheetBuilder } from './BecasReporteSheetBuilder.js';

export class BecasReporteExcelBuilder extends IBecasReporteExcelGenerator {
  /**
   * @param {Object} datos - Payload del reporte de becas por carrera.
   * @returns {Promise<Buffer>}
   */
  async generarPlanillaBecasPorCarrera(datos) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'INCOS Santa Cruz';
    workbook.created = new Date();

    BecasReporteSheetBuilder.build({
      composer: new ExcelSheetComposer(workbook.addWorksheet('BECAS POR CARRERA')),
      datos: datos ?? {},
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  }
}

export default BecasReporteExcelBuilder;
