/**
 * SeguimientoTutoriaDocentesExcelBuilder — servicio orquestador del reporte
 * ADMINISTRATIVO de seguimiento de tutorías a docentes (.xlsx, módulo TIT ·
 * titulación, extensión 2026-08-10). Réplica digital de "PLANILLA DE
 * SEGUIMIENTO DE TUTORIA 2026.xlsx" ("PLANILLA DE SEGUIMIENTO A DOCENTES EN
 * TUTORIAS"): reporte de Dirección Académica sobre el CUMPLIMIENTO de cada
 * docente-tutor (no un reporte al estudiante). Reemplaza la planilla de
 * avance "10 en 10" de 3er año (dependía de Matrícula/`periodo_numero = 3`,
 * sin datos en desarrollo y sin documento físico real).
 *
 * Implementa ISeguimientoTutoriaDocentesExcelGenerator y se registra en el
 * container DI; el use case nunca lo importa de forma concreta.
 *
 * Responsabilidad: crear el workbook, UNA hoja POR DOCENTE (mismo criterio
 * 1-hoja-por-docente del documento físico real) y delegar el pintado en
 * SeguimientoTutoriaDocentesSheetBuilder. Sin lógica de pintado de celdas
 * aquí.
 */

import ExcelJS from 'exceljs';
import { ISeguimientoTutoriaDocentesExcelGenerator } from '../../../../domain/interfaces/services/ISeguimientoTutoriaDocentesExcelGenerator.js';
import { ExcelSheetComposer } from '../shared/index.js';
import { SeguimientoTutoriaDocentesSheetBuilder } from './SeguimientoTutoriaDocentesSheetBuilder.js';

/** Sanea el nombre de hoja: Excel prohíbe : \ / ? * [ ] y limita a 31 chars. */
const sanitizarNombreHoja = (nombre) => {
  const limpio = String(nombre ?? 'Docente')
    .replace(/[\\/?*[\]:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return (limpio || 'Docente').slice(0, 31);
};

export class SeguimientoTutoriaDocentesExcelBuilder extends (
  ISeguimientoTutoriaDocentesExcelGenerator
) {
  /**
   * @param {Object} datos - { anio, mes, docentes } — ver
   *   ISeguimientoTutoriaDocentesExcelGenerator.
   * @returns {Promise<Buffer>}
   */
  async generarSeguimientoTutoriaDocentes(datos) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'INCOS Santa Cruz';
    workbook.created = new Date();

    const { anio, mes } = datos ?? {};
    const docentes = Array.isArray(datos?.docentes) ? datos.docentes : [];

    if (docentes.length === 0) {
      const composer = new ExcelSheetComposer(workbook.addWorksheet('Sin datos'));
      SeguimientoTutoriaDocentesSheetBuilder.build({
        composer,
        datos: { anio, mes, docente: null },
      });
    } else {
      const nombresUsados = new Set();
      docentes.forEach((docente) => {
        let nombreHoja = sanitizarNombreHoja(docente.docenteNombre);
        let sufijo = 1;
        while (nombresUsados.has(nombreHoja)) {
          sufijo += 1;
          nombreHoja = sanitizarNombreHoja(`${docente.docenteNombre} (${sufijo})`);
        }
        nombresUsados.add(nombreHoja);

        SeguimientoTutoriaDocentesSheetBuilder.build({
          composer: new ExcelSheetComposer(workbook.addWorksheet(nombreHoja)),
          datos: { anio, mes, docente },
        });
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  }
}

export default SeguimientoTutoriaDocentesExcelBuilder;
