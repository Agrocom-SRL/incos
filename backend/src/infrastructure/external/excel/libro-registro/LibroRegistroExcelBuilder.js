/**
 * LibroRegistroExcelBuilder — servicio orquestador del Libro de registro
 * (.xlsx). Implementa ILibroRegistroExcelGenerator y se registra en el
 * container DI; el use case nunca lo importa de forma concreta.
 *
 * Responsabilidad: crear el workbook, cargar el logo del Ministerio (asset
 * compartido `external/templates/ministerio.png`; si falta, se omite sin
 * fallar), añadir una hoja por paralelo (nombre saneado/único ≤31 chars),
 * aplicar la configuración de página para encuadernado (margen izquierdo más
 * ancho) y delegar el pintado en LibroRegistroSheetBuilder. Sin lógica de
 * pintado de celdas aquí.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import ExcelJS from 'exceljs';
import { ILibroRegistroExcelGenerator } from '../../../../domain/interfaces/services/ILibroRegistroExcelGenerator.js';
import { LIBRO_REGISTRO_DOC } from '../../../../domain/constants/libros.constants.js';
import { ExcelSheetComposer } from '../shared/index.js';
import { LibroRegistroSheetBuilder } from './LibroRegistroSheetBuilder.js';
import { PAGE_SETUP, ROW_HEIGHTS } from './sheet/libroRegistroSheetConfig.js';

/** Sanea el nombre de hoja: Excel prohíbe : \ / ? * [ ] y limita a 31 chars. */
const sanitizarNombreHoja = (nombre) => {
  const limpio = String(nombre ?? 'Paralelo')
    .replace(/[\\/?*[\]:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return (limpio || 'Paralelo').slice(0, 31);
};

/** Nombre de hoja saneado y ÚNICO dentro de `usados` (sufijo numérico si colisiona). */
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
  const fallback = String(Date.now()).slice(-31);
  usados.add(fallback);
  return fallback;
};

export class LibroRegistroExcelBuilder extends ILibroRegistroExcelGenerator {
  /**
   * @param {Object} params - Ver ILibroRegistroExcelGenerator.
   * @returns {Promise<Buffer>}
   */
  async generarLibroRegistro({ libro, hojas, incluirFirmas = false } = {}) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'INCOS Santa Cruz';
    workbook.created = new Date();
    if (libro?.numeroLibro != null) {
      workbook.title = `Libro de registro N° ${libro.numeroLibro}`;
    }

    const logoId = await this._tryAddMinisterioLogo(workbook);

    const lista = Array.isArray(hojas) ? hojas : [];
    const usados = new Set();

    for (const hoja of lista) {
      const nombre = nombreHojaUnico(hoja?.nombreHoja || 'Paralelo', usados);
      const worksheet = workbook.addWorksheet(nombre, {
        pageSetup: { ...PAGE_SETUP },
        // Alto de fila por defecto del libro físico (16.5pt) para las filas
        // que el builder no fija explícitamente.
        properties: { defaultRowHeight: ROW_HEIGHTS.base },
        // Hoja en blanco fiel al libro físico: sin líneas de cuadrícula.
        views: [{ showGridLines: false }],
      });

      LibroRegistroSheetBuilder.build({
        composer: new ExcelSheetComposer(worksheet),
        hoja,
        doc: LIBRO_REGISTRO_DOC,
        logoId,
        incluirFirmas,
      });
    }

    // Excel no admite libros sin hojas; deja una pestaña informativa si no hubo.
    if (lista.length === 0) {
      workbook.addWorksheet('Sin folios');
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  }

  /**
   * Logo del Ministerio de Educación (asset compartido con ExcelGenerator:
   * `infrastructure/external/templates/ministerio.png`). Si el archivo no
   * existe, devuelve null y la cabecera queda con la caja del escudo vacía —
   * no bloquea la exportación.
   * @param {ExcelJS.Workbook} workbook
   * @returns {Promise<number|null>}
   */
  async _tryAddMinisterioLogo(workbook) {
    try {
      const dirname = path.dirname(fileURLToPath(import.meta.url));
      const logoPath = path.join(dirname, '../../templates/ministerio.png');
      const buffer = await fs.readFile(logoPath);
      return workbook.addImage({ buffer, extension: 'png' });
    } catch {
      return null;
    }
  }
}

export default LibroRegistroExcelBuilder;
