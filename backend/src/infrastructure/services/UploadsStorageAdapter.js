import { IUploadsStorage } from '../../domain/interfaces/services/IUploadsStorage.js';
import { UploadsStorageHelper } from '../external/storage/UploadsStorageHelper.js';

/**
 * Adaptador de almacenamiento en uploads que implementa IUploadsStorage
 *
 * Delega en UploadsStorageHelper (external) la resolución de rutas, creación
 * de directorios y escritura de archivos. Se registra en el container y se
 * inyecta en use cases que necesitan guardar archivos en uploads.
 *
 * Clean Architecture:
 * - Domain: IUploadsStorage (interfaz)
 * - Infrastructure: UploadsStorageAdapter implementa IUploadsStorage
 *   y delega en UploadsStorageHelper (external)
 *
 * @implements {IUploadsStorage}
 */
export class UploadsStorageAdapter extends IUploadsStorage {
  /**
   * Guarda un archivo en el directorio uploads.
   *
   * @param {string} relativeScope - Ruta relativa dentro de uploads (ej: 'documentos/estudiantes/1')
   * @param {string} fileName - Nombre del archivo (ej: 'ACTA_COMPROMISO_1.pdf')
   * @param {Buffer} buffer - Contenido del archivo
   * @returns {{ filePath: string, fileName: string, absolutePath: string }}
   */
  saveToUploads(relativeScope, fileName, buffer) {
    return UploadsStorageHelper.saveToUploads(relativeScope, fileName, buffer);
  }
}
