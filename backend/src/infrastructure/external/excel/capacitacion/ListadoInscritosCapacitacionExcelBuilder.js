/**
 * ListadoInscritosCapacitacionExcelBuilder — servicio orquestador del Listado de
 * Inscritos de un curso de capacitación (.xlsx). Implementa
 * IListadoInscritosCapacitacionExcelGenerator y se registra en el container DI;
 * el use case nunca lo importa de forma concreta.
 *
 * Responsabilidad: crear el workbook (UNA sola hoja) y delegar la construcción en
 * ListadoInscritosCapacitacionSheetBuilder. No contiene lógica de pintado de celdas.
 */

import ExcelJS from 'exceljs';
import { IListadoInscritosCapacitacionExcelGenerator } from '../../../../domain/interfaces/services/IListadoInscritosCapacitacionExcelGenerator.js';
import { ExcelSheetComposer } from '../shared/index.js';
import { ListadoInscritosCapacitacionSheetBuilder } from './ListadoInscritosCapacitacionSheetBuilder.js';

export class ListadoInscritosCapacitacionExcelBuilder extends (
  IListadoInscritosCapacitacionExcelGenerator
) {
  /**
   * @param {Object} datos - Payload del listado de inscritos.
   * @returns {Promise<Buffer>}
   */
  async generarListadoInscritos(datos) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'INCOS Santa Cruz';
    workbook.created = new Date();

    ListadoInscritosCapacitacionSheetBuilder.build({
      composer: new ExcelSheetComposer(workbook.addWorksheet('INSCRITOS')),
      datos: datos ?? {},
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  }
}

export default ListadoInscritosCapacitacionExcelBuilder;
