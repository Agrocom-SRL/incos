/**
 * CentralizadorExcelBuilder — servicio orquestador del Centralizador de
 * Calificaciones (.xlsx). Implementa ICentralizadorExcelGenerator y se registra en
 * el container DI; el use case nunca lo importa de forma concreta.
 *
 * Responsabilidad: crear el workbook, añadir la hoja del paralelo (nombre saneado,
 * máx 31 chars de Excel) y delegar el pintado en CentralizadorSheetBuilder. No
 * contiene lógica de pintado de celdas.
 *
 * Fase 1: una hoja (un paralelo, un bimestre). Fase 2: un libro por carrera
 * reutilizando addWorksheet + CentralizadorSheetBuilder por cada paralelo.
 */

import ExcelJS from 'exceljs';
import { ICentralizadorExcelGenerator } from '../../../../domain/interfaces/services/ICentralizadorExcelGenerator.js';
import { ExcelSheetComposer } from '../shared/index.js';
import { CentralizadorSheetBuilder } from './CentralizadorSheetBuilder.js';

/** Sanea el nombre de hoja: Excel prohíbe : \ / ? * [ ] y limita a 31 chars. */
const sanitizarNombreHoja = (nombre) => {
  const limpio = String(nombre ?? 'Paralelo')
    .replace(/[\\/?*[\]:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return (limpio || 'Paralelo').slice(0, 31);
};

/**
 * Devuelve un nombre de hoja saneado y ÚNICO dentro de `usados`. Excel exige
 * nombres distintos por pestaña (≤31 chars); si colisiona, antepone un sufijo
 * numérico recortando el nombre base para no exceder el límite.
 */
const nombreHojaUnico = (nombre, usados) => {
  const base = sanitizarNombreHoja(nombre);
  if (!usados.has(base)) {
    usados.add(base);
    return base;
  }
  for (let n = 2; n < 1000; n += 1) {
    const sufijo = ` (${n})`;
    const candidato = `${base.slice(0, 31 - sufijo.length)}${sufijo}`;
    if (!usados.has(candidato)) {
      usados.add(candidato);
      return candidato;
    }
  }
  // Salida defensiva (no esperable con ≤6-10 hojas).
  const fallback = String(Date.now()).slice(-31);
  usados.add(fallback);
  return fallback;
};

export class CentralizadorExcelBuilder extends ICentralizadorExcelGenerator {
  /**
   * @param {Object} datos - Payload de una hoja (ver ICentralizadorExcelGenerator).
   * @returns {Promise<Buffer>}
   */
  async generarCentralizadorParaleloBimestre(datos) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'INCOS Santa Cruz';
    workbook.created = new Date();

    const cab = datos?.cabecera ?? {};
    const nombreHoja = sanitizarNombreHoja(cab.paralelo || 'Centralizador');

    CentralizadorSheetBuilder.build({
      composer: new ExcelSheetComposer(workbook.addWorksheet(nombreHoja)),
      datos
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  }

  /**
   * Libro por carrera (Fase 2): una hoja por paralelo, mismo bimestre. Reutiliza
   * el mismo CentralizadorSheetBuilder de la Fase 1 — sin lógica de pintado nueva.
   *
   * @param {Object} params
   * @param {Object} [params.carrera] - Metadatos de carrera (solo metadatos del libro).
   * @param {Array<{ nombreHoja: string, datos: Object }>} params.hojas
   * @returns {Promise<Buffer>}
   */
  async generarCentralizadorCarreraBimestre({ carrera, hojas } = {}) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'INCOS Santa Cruz';
    workbook.created = new Date();
    if (carrera?.nombre) {
      workbook.title = `Centralizador ${carrera.nombre}`;
    }

    const lista = Array.isArray(hojas) ? hojas : [];
    const usados = new Set();

    for (const hoja of lista) {
      const cab = hoja?.datos?.cabecera ?? {};
      const sugerido = hoja?.nombreHoja || cab.paralelo || 'Paralelo';
      const nombre = nombreHojaUnico(sugerido, usados);

      CentralizadorSheetBuilder.build({
        composer: new ExcelSheetComposer(workbook.addWorksheet(nombre)),
        datos: hoja.datos
      });
    }

    // Excel no admite libros sin hojas; deja una pestaña informativa si no hubo.
    if (lista.length === 0) {
      workbook.addWorksheet('Sin paralelos');
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  }
}

export default CentralizadorExcelBuilder;
