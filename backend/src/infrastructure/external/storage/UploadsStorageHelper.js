/**
 * UploadsStorageHelper - Clase helper para guardar archivos en el directorio uploads
 *
 * Responsabilidad exclusiva: resolver rutas, crear directorios y escribir archivos
 * dentro de uploads (documentos/estudiantes, recibos, etc.). Similar a PDFGenerator
 * en external: métodos estáticos, sin DI.
 *
 * Si ya existe un archivo en la misma ruta, se reemplaza (fs.writeFileSync sobrescribe).
 *
 * Uso:
 *   const { filePath, fileName, absolutePath } = UploadsStorageHelper.saveToUploads(
 *     'documentos/estudiantes/1',
 *     'ACTA_COMPROMISO_1.pdf',
 *     buffer
 *   );
 *
 * @module UploadsStorageHelper
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { serverConfig } from '../../config/server.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Base absoluta para uploads (backend root cuando uploadDir es relativo) */
const BACKEND_ROOT = path.resolve(__dirname, '../../../..');

export class UploadsStorageHelper {
  /**
   * Guarda un archivo en el directorio uploads.
   * Crea la estructura de directorios (relativeScope) si no existe.
   * Si ya existe un archivo en la misma ruta, lo reemplaza (sobrescribe).
   *
   * @param {string} relativeScope - Ruta relativa dentro de uploads (ej: 'documentos/estudiantes/1')
   * @param {string} fileName - Nombre del archivo (ej: 'ACTA_COMPROMISO_1.pdf')
   * @param {Buffer} buffer - Contenido del archivo
   * @returns {{ filePath: string, fileName: string, absolutePath: string }}
   */
  static saveToUploads(relativeScope, fileName, buffer) {
    const uploadDir = serverConfig.uploadsPath || 'uploads';
    const relativePath = path.join(relativeScope, fileName);

    const absolutePath = path.isAbsolute(uploadDir)
      ? path.join(uploadDir, relativePath)
      : path.resolve(BACKEND_ROOT, uploadDir, relativePath);

    const dir = path.dirname(absolutePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(absolutePath, buffer);

    const filePath = path.join('/', uploadDir, relativePath).replace(/\\/g, '/');

    return {
      filePath,
      fileName,
      absolutePath,
    };
  }
}
