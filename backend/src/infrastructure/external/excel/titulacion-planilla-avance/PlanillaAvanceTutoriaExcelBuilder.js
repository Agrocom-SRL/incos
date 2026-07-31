/**
 * PlanillaAvanceTutoriaExcelBuilder — servicio orquestador de la Planilla de
 * avance de tutorías "10 en 10" (.xlsx, módulo TIT · titulación, Requisito
 * 3). Implementa IPlanillaAvanceTutoriaExcelGenerator y se registra en el
 * container DI; el use case nunca lo importa de forma concreta.
 *
 * Responsabilidad: crear el workbook, añadir la ÚNICA hoja (una carrera + un
 * bimestre por exportación) y delegar el pintado en
 * PlanillaAvanceTutoriaSheetBuilder. Sin lógica de pintado de celdas aquí.
 */

import ExcelJS from 'exceljs';
import { IPlanillaAvanceTutoriaExcelGenerator } from '../../../../domain/interfaces/services/IPlanillaAvanceTutoriaExcelGenerator.js';
import { ExcelSheetComposer } from '../shared/index.js';
import { PlanillaAvanceTutoriaSheetBuilder } from './PlanillaAvanceTutoriaSheetBuilder.js';

/** Sanea el nombre de hoja: Excel prohíbe : \ / ? * [ ] y limita a 31 chars. */
const sanitizarNombreHoja = (nombre) => {
  const limpio = String(nombre ?? 'Planilla')
    .replace(/[\\/?*[\]:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return (limpio || 'Planilla').slice(0, 31);
};

export class PlanillaAvanceTutoriaExcelBuilder extends IPlanillaAvanceTutoriaExcelGenerator {
  /**
   * @param {Object} datos - Ver IPlanillaAvanceTutoriaExcelGenerator.
   * @returns {Promise<Buffer>}
   */
  async generarPlanillaAvanceTutoria(datos) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'INCOS Santa Cruz';
    workbook.created = new Date();

    const cab = datos?.cabecera ?? {};
    const nombreHoja = sanitizarNombreHoja(
      `${cab.carreraNombre ?? 'Planilla'}${cab.bimestre ? ` B${cab.bimestre}` : ''}`
    );

    PlanillaAvanceTutoriaSheetBuilder.build({
      composer: new ExcelSheetComposer(workbook.addWorksheet(nombreHoja)),
      datos,
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  }
}

export default PlanillaAvanceTutoriaExcelBuilder;
