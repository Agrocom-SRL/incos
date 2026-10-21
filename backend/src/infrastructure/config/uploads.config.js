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

  /** Ruta relativa para imágenes de carreras (backend/uploads/carreras/) */
  carreras: () => 'carreras',

  /** Extensiones permitidas para imagen de carrera */
  carreraImageExtensions: [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
    '.bmp',
    '.tiff',
    '.tif',
    '.svg',
    '.avif',
    '.heic',
    '.heif',
  ],

  /**
   * Nombre de archivo: {codigo}_{timestamp}.{ext}
   * @param {string} codigo - Código de la carrera (ej. SIS-INF)
   * @param {string} originalName - Nombre original del archivo subido
   */
  generateCarreraImageFileName: (codigo, originalName) => {
    const ts = Date.now();
    const safeCodigo = String(codigo || 'carrera')
      .trim()
      .replace(/[^a-zA-Z0-9-]/g, '_')
      .toUpperCase();
    const ext = path.extname(originalName || '').toLowerCase() || '.webp';
    const allowed = UPLOAD.carreraImageExtensions;
    const finalExt = allowed.includes(ext) ? ext : '.webp';
    return `${safeCodigo}_${ts}${finalExt}`;
  },

  /** Ruta pública relativa para respuesta API */
  carreraImagePublicPath: (filename) => `/uploads/carreras/${filename}`,

  /**
   * Ruta base para documentos de un proyecto de grado (módulo TUT)
   * @param {number|string} proyectoId - ID del proyecto de grado
   * @returns {string} Ruta relativa (ej: 'documentos/proyectos-grado/1')
   */
  proyectosGrado: (proyectoId) => `documentos/proyectos-grado/${proyectoId}`,

  /** Extensiones permitidas para archivos de avance de proyecto (solo PDF/Word) */
  avanceProyectoExtensions: ['.pdf', '.doc', '.docx'],

  /**
   * Genera un nombre de archivo único para avances de proyecto de grado
   * @param {string} originalName - Nombre original del archivo
   * @returns {string} Nombre generado (ej: 'avance_1234567890_capitulo2.pdf')
   */
  generateAvanceProyectoFileName: (originalName) => {
    const ts = Date.now();
    const sanitizedName = String(originalName || 'archivo').replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = path.extname(sanitizedName).toLowerCase();
    const nameWithoutExt = path.basename(sanitizedName, ext);
    return `avance_${ts}_${nameWithoutExt}${ext}`;
  },

  /**
   * Ruta base para documentos de un trámite de pasantía (módulo TUT)
   * @param {number|string} pasantiaId - ID del trámite de pasantía
   * @returns {string} Ruta relativa (ej: 'documentos/pasantias/1')
   */
  pasantias: (pasantiaId) => `documentos/pasantias/${pasantiaId}`,

  /**
   * Ruta base para comprobantes de pago de una inscripción de capacitación (módulo CAP)
   * @param {number|string} inscripcionId - ID de la inscripción
   * @returns {string} Ruta relativa (ej: 'documentos/capacitacion/1/comprobantes')
   */
  capacitacionComprobantes: (inscripcionId) =>
    `documentos/capacitacion/${inscripcionId}/comprobantes`,

  /** Extensiones permitidas para comprobantes de capacitación (imagen o PDF) */
  comprobanteCapacitacionExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],

  /**
   * Genera un nombre de archivo único para comprobantes de capacitación
   * @param {string} originalName - Nombre original del archivo
   * @returns {string} Nombre generado (ej: 'comprobante_1234567890_deposito.pdf')
   */
  generateComprobanteCapacitacionFileName: (originalName) => {
    const ts = Date.now();
    const sanitizedName = String(originalName || 'archivo').replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = path.extname(sanitizedName).toLowerCase();
    const nameWithoutExt = path.basename(sanitizedName, ext);
    return `comprobante_${ts}_${nameWithoutExt}${ext}`;
  },

  /** Ruta relativa para imágenes QR de cuentas de pago (backend/uploads/cuentas-pago/qr/) */
  cuentasPagoQr: () => 'cuentas-pago/qr',

  /**
   * Nombre de archivo del QR: qr_{timestamp}.{ext}
   * @param {string} originalName - Nombre original del archivo subido
   */
  generateCuentaPagoQrFileName: (originalName) => {
    const ts = Date.now();
    const ext = path.extname(originalName || '').toLowerCase() || '.png';
    const allowed = UPLOAD.carreraImageExtensions;
    const finalExt = allowed.includes(ext) ? ext : '.png';
    return `qr_${ts}${finalExt}`;
  },

  /** Ruta pública relativa para respuesta API */
  cuentaPagoQrPublicPath: (filename) => `/uploads/cuentas-pago/qr/${filename}`,
};
