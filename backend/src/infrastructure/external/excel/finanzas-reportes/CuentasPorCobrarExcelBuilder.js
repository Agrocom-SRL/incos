/**
 * CuentasPorCobrarExcelBuilder — servicio orquestador de la Planilla de Control de
 * Cuentas por Cobrar a estudiantes (.xlsx). Implementa
 * ICuentasPorCobrarReporteExcelGenerator y se registra en el container DI; el use
 * case nunca lo importa de forma concreta.
 *
 * Responsabilidad: crear el workbook (UNA sola hoja) y delegar la construcción en
 * CuentasPorCobrarSheetBuilder. No contiene lógica de pintado de celdas.
 */

import ExcelJS from 'exceljs';
import { ICuentasPorCobrarReporteExcelGenerator } from '../../../../domain/interfaces/services/ICuentasPorCobrarReporteExcelGenerator.js';
import { ExcelSheetComposer } from '../shared/index.js';
import { CuentasPorCobrarSheetBuilder } from './CuentasPorCobrarSheetBuilder.js';

export class CuentasPorCobrarExcelBuilder extends ICuentasPorCobrarReporteExcelGenerator {
  /**
   * @param {Object} datos - Payload del reporte de cuentas por cobrar.
   * @returns {Promise<Buffer>}
   */
  async generarPlanillaCuentasPorCobrar(datos) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'INCOS Santa Cruz';
    workbook.created = new Date();

    CuentasPorCobrarSheetBuilder.build({
      composer: new ExcelSheetComposer(workbook.addWorksheet('CUENTAS POR COBRAR')),
      datos: datos ?? {},
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  }
}

export default CuentasPorCobrarExcelBuilder;
