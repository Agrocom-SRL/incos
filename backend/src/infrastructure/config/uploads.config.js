import path from 'path';

/**
 * Configuración de rutas relativas para uploads
 * 
 * Define la estructura de directorios dentro de uploads/ para diferentes tipos de documentos.
 * Estas rutas son relativas a uploads/ y se usan en use cases para organizar archivos.
 * 
 * Ejemplo:
 *   uploads/documentos/estudiantes/{studentId}/acta_compromiso.pdf
 *   uploads/documentos/estudiantes/{studentId}/pagos/comprobante.pdf
 */
export const UPLOAD = {
  /**
   * Ruta base para documentos de estudiantes
   * @param {number} studentId - ID del estudiante
   * @returns {string} Ruta relativa (ej: 'documentos/estudiantes/1')
   */
  studentDocuments: (studentId) => `documentos/estudiantes/${studentId}`,

  /**
   * Ruta para actas de compromiso de estudiantes
   * @param {number} studentId - ID del estudiante
   * @returns {string} Ruta relativa (ej: 'documentos/estudiantes/1')
   */
  actaCompromiso: (studentId) => `documentos/estudiantes/${studentId}`,

  /**
   * Ruta para documentos de pagos de estudiantes
   * @param {number} studentId - ID del estudiante
   * @returns {string} Ruta relativa (ej: 'documentos/estudiantes/1/pagos')
   */
  studentPayments: (studentId) => `documentos/estudiantes/${studentId}/pagos`,

  /**
   * Ruta para recibos de pago
   * @param {number} studentId - ID del estudiante
   * @returns {string} Ruta relativa (ej: 'documentos/estudiantes/1/recibos')
   */
  paymentReceipts: (studentId) => `documentos/estudiantes/${studentId}/recibos`,

  /**
   * Genera un nombre de archivo único para documentos de pago
   * @param {string} originalName - Nombre original del archivo
   * @param {number} [timestamp] - Timestamp opcional (si no se proporciona, se calcula automáticamente)
   * @returns {string} Nombre generado (ej: 'pago_1234567890_comprobante.pdf')
   */
  generatePaymentFileName: (originalName, timestamp = null) => {
    const ts = timestamp ?? Date.now();
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = path.extname(sanitizedName);
    const nameWithoutExt = path.basename(sanitizedName, ext);
    return `pago_${ts}_${nameWithoutExt}${ext}`;
  },
};
