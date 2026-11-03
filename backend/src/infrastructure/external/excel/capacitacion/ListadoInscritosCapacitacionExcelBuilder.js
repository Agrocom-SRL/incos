/**
 * ListadoInscritosCapacitacionExcelBuilder — servicio orquestador del Listado de
 * Inscritos de un curso de capacitación (.xlsx). Implementa
 * IListadoInscritosCapacitacionExcelGenerator y se registra en el container DI;
 * el use case nunca lo importa de forma concreta.
 *
 * Responsabilidad: crear el workbook (una hoja por grupo) y delegar la construcción en
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

    const payload = datos ?? {};
    const participantes = payload.participantes ?? [];

    // Una hoja por grupo (sin hoja general). Los inscritos sin grupo van a «SIN GRUPO».
    // Nombre válido de hoja Excel: ≤31 chars, sin []:*?/\ y único.
    const usados = new Set();
    const nombresGrupo = [...new Set(participantes.map((p) => p.grupo ?? null))];
    if (nombresGrupo.length === 0) nombresGrupo.push(null); // curso sin inscritos: hoja vacía
    nombresGrupo.forEach((grupo) => {
      const base =
        String(grupo ?? 'SIN GRUPO').replace(/[[\]:*?/\\]/g, ' ').trim().slice(0, 31) || 'GRUPO';
      let nombre = base;
      for (let i = 2; usados.has(nombre.toUpperCase()); i += 1) {
        nombre = `${base.slice(0, 28)} ${i}`;
      }
      usados.add(nombre.toUpperCase());
      ListadoInscritosCapacitacionSheetBuilder.build({
        composer: new ExcelSheetComposer(workbook.addWorksheet(nombre)),
        datos: payload,
        participantes: participantes.filter((p) => (p.grupo ?? null) === grupo),
        grupo,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  }
}

export default ListadoInscritosCapacitacionExcelBuilder;
