/**
 * Interfaz del servicio de almacenamiento en uploads
 * Define el contrato que debe cumplir cualquier implementación de storage
 * para guardar archivos en el directorio uploads.
 *
 * Si ya existe un archivo en la misma ruta (relativeScope + fileName),
 * se reemplaza con el nuevo contenido (sobrescritura).
 */
export class IUploadsStorage {
  /**
   * Guarda un archivo en el directorio uploads.
   * Si ya existe en la misma ruta, lo reemplaza (sobrescribe).
   *
   * @param {string} relativeScope - Ruta relativa dentro de uploads (ej: 'documentos/estudiantes/1')
   * @param {string} fileName - Nombre del archivo (ej: 'ACTA_COMPROMISO_1.pdf')
   * @param {Buffer} buffer - Contenido del archivo
   * @returns {{ filePath: string, fileName: string, absolutePath: string }}
   */
  saveToUploads(relativeScope, fileName, buffer) {
    throw new Error('Method saveToUploads must be implemented');
  }
}
