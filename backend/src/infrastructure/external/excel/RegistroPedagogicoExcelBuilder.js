/**
 * RegistroPedagogicoExcelBuilder — servicio orquestador del Registro Pedagógico
 * Bimestral (.xlsx). Implementa IRegistroPedagogicoExcelGenerator y se registra en
 * el container DI; el use case nunca lo importa de forma concreta.
 *
 * Responsabilidad: crear el workbook, derivar la ponderación del payload y delegar
 * la construcción de cada hoja en su builder dedicado. No contiene lógica de pintado
 * de celdas (eso vive en los *SheetBuilder + el toolkit compartido).
 *
 *   CONSOLIDADO          → ConsolidadoSheetBuilder
 *   PLANILLA CALIFICAC.  → PlanillaCalificacionesSheetBuilder
 */

import ExcelJS from 'exceljs';
import { IRegistroPedagogicoExcelGenerator } from '../../../domain/interfaces/services/IRegistroPedagogicoExcelGenerator.js';
import { ExcelSheetComposer } from './shared/index.js';
import { buildColumnMap } from './registro-pedagogico/registroPedagogicoColumnMap.js';
import { ConsolidadoSheetBuilder } from './registro-pedagogico/ConsolidadoSheetBuilder.js';
import { PlanillaCalificacionesSheetBuilder } from './registro-pedagogico/PlanillaCalificacionesSheetBuilder.js';

/** Deriva cuotas y nota de aprobación desde el payload (con respaldo institucional). */
const resolverPonderacion = (datos) => ({
  cuotaPractico: Number(datos.cuota_practico ?? 70),
  cuotaTeorico: Number(datos.cuota_teorico ?? 30),
  notaAprobacion: Number(datos.nota_aprobacion ?? 61)
});

export class RegistroPedagogicoExcelBuilder extends IRegistroPedagogicoExcelGenerator {
  /**
   * @param {Object} datos - payload normalizado (ver registroPedagogicoExcelMapper).
   * @returns {Promise<Buffer>}
   */
  async generarRegistroPedagogicoBimestre(datos) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'INCOS Santa Cruz';
    workbook.created = new Date();

    const practicas = datos.evaluaciones_practicas ?? [];
    const teoricas = datos.evaluaciones_teoricas ?? [];
    const estudiantes = datos.estudiantes ?? [];
    const cols = buildColumnMap(practicas.length, teoricas.length);
    const ponderacion = resolverPonderacion(datos);
    const hayEvaluaciones = practicas.length + teoricas.length > 0;

    ConsolidadoSheetBuilder.build({
      composer: new ExcelSheetComposer(workbook.addWorksheet('CONSOLIDADO')),
      datos,
      practicas,
      teoricas,
      estudiantes,
      cols,
      ponderacion
    });

    PlanillaCalificacionesSheetBuilder.build({
      composer: new ExcelSheetComposer(workbook.addWorksheet('PLANILLA CALIFICACIONES')),
      datos,
      estudiantes,
      cols,
      ponderacion,
      hayEvaluaciones
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  }
}

export default RegistroPedagogicoExcelBuilder;
