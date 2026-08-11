/**
 * SeguimientoTutoriaDocentesExcelBuilder — servicio orquestador del reporte
 * ADMINISTRATIVO de seguimiento de tutorías a docentes (.xlsx, módulo TIT ·
 * titulación, extensión 2026-08-10, rediseño 2026-08-10 a "una hoja por
 * carrera, resumen mensual"). Réplica digital de "PLANILLA DE SEGUIMIENTO DE
 * TUTORIA 2026.xlsx" ("PLANILLA DE SEGUIMIENTO A DOCENTES EN TUTORIAS"):
 * reporte de Dirección Académica sobre el CUMPLIMIENTO de cada docente-tutor
 * (no un reporte al estudiante). Reemplaza la planilla de avance "10 en 10"
 * de 3er año (dependía de Matrícula/`periodo_numero = 3`, sin datos en
 * desarrollo y sin documento físico real).
 *
 * Implementa ISeguimientoTutoriaDocentesExcelGenerator y se registra en el
 * container DI; el use case nunca lo importa de forma concreta.
 *
 * Responsabilidad: crear el workbook, cargar el logo institucional (asset
 * compartido `external/templates/logo.png`; si falta, se omite sin fallar —
 * mismo criterio que `LibroRegistroExcelBuilder._tryAddMinisterioLogo`), UNA
 * hoja POR CARRERA (tabla plana con sus docentes-tutores — un docente que
 * tutora en más de una carrera aparece en cada hoja de esas carreras, solo
 * con los tutoriados de esa carrera) y delegar el pintado en
 * SeguimientoTutoriaDocentesSheetBuilder. Sin lógica de pintado de celdas
 * aquí.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import ExcelJS from 'exceljs';
import { ISeguimientoTutoriaDocentesExcelGenerator } from '../../../../domain/interfaces/services/ISeguimientoTutoriaDocentesExcelGenerator.js';
import { ExcelSheetComposer } from '../shared/index.js';
import { SeguimientoTutoriaDocentesSheetBuilder } from './SeguimientoTutoriaDocentesSheetBuilder.js';
import { PAGE_SETUP } from './sheet/seguimientoTutoriaDocentesSheetConfig.js';

/** Sanea el nombre de hoja: Excel prohíbe : \ / ? * [ ] y limita a 31 chars. */
const sanitizarNombreHoja = (nombre) => {
  const limpio = String(nombre ?? 'Carrera')
    .replace(/[\\/?*[\]:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return (limpio || 'Carrera').slice(0, 31);
};

export class SeguimientoTutoriaDocentesExcelBuilder extends (
  ISeguimientoTutoriaDocentesExcelGenerator
) {
  /**
   * @param {Object} datos - { anio, mes, carreras } — ver
   *   ISeguimientoTutoriaDocentesExcelGenerator.
   * @returns {Promise<Buffer>}
   */
  async generarSeguimientoTutoriaDocentes(datos) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'INCOS Santa Cruz';
    workbook.created = new Date();

    const logoId = await this._tryAddLogo(workbook);

    const { anio, mes } = datos ?? {};
    const carreras = Array.isArray(datos?.carreras) ? datos.carreras : [];

    if (carreras.length === 0) {
      const composer = new ExcelSheetComposer(
        workbook.addWorksheet('Sin datos', { pageSetup: { ...PAGE_SETUP } }),
      );
      SeguimientoTutoriaDocentesSheetBuilder.build({
        composer,
        datos: { anio, mes, carrera: null },
        logoId,
      });
    } else {
      const nombresUsados = new Set();
      carreras.forEach((carrera) => {
        let nombreHoja = sanitizarNombreHoja(carrera.carreraNombre);
        let sufijo = 1;
        while (nombresUsados.has(nombreHoja)) {
          sufijo += 1;
          nombreHoja = sanitizarNombreHoja(`${carrera.carreraNombre} (${sufijo})`);
        }
        nombresUsados.add(nombreHoja);

        const worksheet = workbook.addWorksheet(nombreHoja, { pageSetup: { ...PAGE_SETUP } });
        SeguimientoTutoriaDocentesSheetBuilder.build({
          composer: new ExcelSheetComposer(worksheet),
          datos: { anio, mes, carrera },
          logoId,
        });
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  }

  /**
   * Logo institucional (asset compartido: `external/templates/logo.png`). Si
   * el archivo no existe, devuelve null y la cabecera queda sin logo — no
   * bloquea la exportación.
   * @param {ExcelJS.Workbook} workbook
   * @returns {Promise<number|null>}
   */
  async _tryAddLogo(workbook) {
    try {
      const dirname = path.dirname(fileURLToPath(import.meta.url));
      const logoPath = path.join(dirname, '../../templates/logo.png');
      const buffer = await fs.readFile(logoPath);
      return workbook.addImage({ buffer, extension: 'png' });
    } catch {
      return null;
    }
  }
}

export default SeguimientoTutoriaDocentesExcelBuilder;
