/**
 * PDFGenerator - Clase principal para generación de PDFs del Instituto INCOS
 * 
 * Esta clase sirve como fachada para todos los generadores de PDF específicos.
 * Cada tipo de documento tiene su propio generador especializado que extiende
 * de IncosPDFBase para mantener consistencia visual y funcional.
 * 
 * Generadores disponibles:
 * - FormularioInscripcionGenerator: Formularios de inscripción
 * - ActaCompromisoGenerator: Actas de compromiso para documentos
 * - ReciboPagoGenerator: Recibos de pago y aranceles
 * 
 * Uso:
 * await PDFGenerator.generateFormularioInscripcion(data, outputPath);
 * await PDFGenerator.generateCompromisoActa(data, outputPath);
 * await PDFGenerator.generateReciboPago(data, outputPath);
 */

import { FormularioInscripcionGenerator } from './FormularioInscripcionGenerator.js';
import { ActaCompromisoGenerator } from './ActaCompromisoGenerator.js';
import { ReciboPagoGenerator } from './ReciboPagoGenerator.js';

export class PDFGenerator {
  // ============================================
  // GENERADORES ESPECÍFICOS
  // ============================================

  /**
   * Genera el Formulario de Inscripción
   * 
   * @param {Object} data - Datos del estudiante y de la inscripción
   * @param {string} data.gestionYear - Año de la gestión
   * @param {string} data.apellidoPaterno - Apellido paterno
   * @param {string} data.apellidoMaterno - Apellido materno
   * @param {string} data.nombres - Nombres
   * @param {string} data.ci - Cédula de identidad
   * @param {string} data.expedicion - Lugar de expedición del CI
   * @param {string} data.genero - Género (Masculino/Femenino)
   * @param {string} data.tipoSangre - Tipo sanguíneo
   * @param {string} data.emailPersonal - Email personal
   * @param {string} data.estadoCivil - Estado civil
   * @param {boolean} data.tieneDiscapacidad - Si tiene discapacidad
   * @param {string} data.ciudadNacimiento - Ciudad de nacimiento
   * @param {string} data.provincia - Provincia
   * @param {string} data.departamento - Departamento
   * @param {string} data.fechaNacimiento - Fecha de nacimiento (formato DD/MM/YYYY)
   * @param {string} data.nacionalidad - Nacionalidad
   * @param {string} data.edad - Edad
   * @param {string} data.direccion - Dirección
   * @param {string} data.idiomaMaterno - Idioma materno
   * @param {string} data.celular - Número de celular
   * @param {string} data.carrera - Nombre de la carrera
   * @param {string} data.anio - Año académico (Primer Año, Segundo Año, etc.)
   * @param {Object} data.documentos - Estado de documentos entregados
   * @param {boolean} data.documentos.ci - CI entregado
   * @param {boolean} data.documentos.certificadoNacimiento - Certificado entregado
   * @param {boolean} data.documentos.diplomaBachiller - Diploma entregado
   * @param {boolean} data.documentos.aporteVoluntario - Aporte realizado
   * 
   * @param {string} outputPath - Ruta donde guardar el PDF
   * @returns {Promise<string>} Ruta del archivo generado
   * 
   * @example
   * const data = {
   *   gestionYear: 2026,
   *   apellidoPaterno: 'Pérez',
   *   apellidoMaterno: 'García',
   *   nombres: 'Juan Carlos',
   *   ci: '12345678',
   *   expedicion: 'S.C.',
   *   genero: 'Masculino',
   *   // ... más datos
   *   documentos: {
   *     ci: true,
   *     certificadoNacimiento: true,
   *     diplomaBachiller: false,
   *     aporteVoluntario: true,
   *   },
   * };
   * 
   * await PDFGenerator.generateFormularioInscripcion(data, '/path/to/output.pdf');
   */
  static async generateFormularioInscripcion(data, outputPath) {
    return await FormularioInscripcionGenerator.generate(data, outputPath);
  }

  /**
   * Genera el Acta de Compromiso para la Entrega de Documentos
   * 
   * @param {Object} data - Datos del estudiante y del compromiso
   * @param {string} data.nombreCompleto - Nombre completo del estudiante
   * @param {string} data.ci - Cédula de identidad
   * @param {string} data.expedicion - Lugar de expedición del CI (default: 'S.C.')
   * @param {string} data.ciudad - Ciudad donde se firma el acta
   * @param {Date|string} data.fecha - Fecha del acta (default: fecha actual)
   * @param {number} data.dia - Día del mes
   * @param {string} data.mes - Nombre del mes
   * @param {number} data.anio - Año
   * @param {string} data.anioCarrera - Año de la carrera (opcional)
   * @param {string} data.paralelo - Paralelo (opcional)
   * @param {string} data.carrera - Nombre de la carrera (opcional)
   * @param {Array<string>} data.documentosRequeridos - Lista de documentos requeridos
   * @param {Array<number>} data.documentosEntregados - Índices de documentos ya entregados
   * @param {number} data.plazoMaximo - Plazo en días para completar documentos (default: 10)
   * @param {string} data.motivos - Motivos por los que no se presentaron documentos
   * 
   * @param {string} outputPath - Ruta donde guardar el PDF
   * @returns {Promise<string>} Ruta del archivo generado
   * 
   * @example
   * const data = {
   *   nombreCompleto: 'Juan Carlos Pérez García',
   *   ci: '12345678',
   *   expedicion: 'S.C.',
   *   ciudad: 'Santa Cruz de la Sierra',
   *   fecha: new Date(),
   *   anioCarrera: 'Segundo',
   *   paralelo: 'A',
   *   carrera: 'Contaduría General',
   *   documentosRequeridos: [
   *     'Diploma de Bachiller',
   *     'Certificado de Nacimiento',
   *     'Carnet de Identidad',
   *     'Foto 3x3 fondo rojo',
   *     'Folder con nepaco',
   *   ],
   *   documentosEntregados: [2, 4], // Índices de documentos entregados (CI y Folder)
   *   plazoMaximo: 10,
   *   motivos: 'Actualización de carta aval del presente año.',
   * };
   * 
   * await PDFGenerator.generateCompromisoActa(data, '/path/to/output.pdf');
   */
  static async generateCompromisoActa(data, outputPath) {
    return await ActaCompromisoGenerator.generate(data, outputPath);
  }

  /**
   * Genera un Recibo de Pago
   * 
   * @param {Object} data - Datos del pago
   * @param {string} data.numeroRecibo - Número del recibo
   * @param {string} data.fechaPago - Fecha del pago (formato DD/MM/YYYY o ISO)
   * @param {string} data.nombreCompleto - Nombre completo del estudiante
   * @param {string} data.ci - Cédula de identidad
   * @param {string} data.carrera - Nombre de la carrera (opcional)
   * @param {string} data.gestion - Gestión (opcional)
   * @param {string} data.concepto - Concepto del pago
   * @param {number} data.montoTotal - Monto total del aporte
   * @param {number} data.descuentoBeca - Descuento por beca (opcional)
   * @param {string} data.metodoPago - Método de pago
   * @param {string} data.numeroTransaccion - Número de transacción (opcional)
   * @param {string} data.banco - Nombre del banco (opcional)
   * @param {string} data.estado - Estado del pago
   * 
   * @param {string} outputPath - Ruta donde guardar el PDF
   * @returns {Promise<string>} Ruta del archivo generado
   * 
   * @example
   * const data = {
   *   numeroRecibo: 'REC-2026-001',
   *   fechaPago: '19/01/2026',
   *   nombreCompleto: 'Juan Carlos Pérez García',
   *   ci: '12345678',
   *   carrera: 'Sistemas Informáticos',
   *   gestion: '2026',
   *   concepto: 'Aporte Voluntario Anual',
   *   montoTotal: 500.00,
   *   descuentoBeca: 100.00,
   *   metodoPago: 'Transferencia Bancaria',
   *   numeroTransaccion: 'TRX123456',
   *   banco: 'Banco Nacional de Bolivia',
   *   estado: 'APROBADO',
   * };
   * 
   * await PDFGenerator.generateReciboPago(data, '/path/to/output.pdf');
   */
  static async generateReciboPago(data, outputPath) {
    // ✅ Usar el generador mejorado basado en IncosPDFBase
    return await ReciboPagoGenerator.generate(data, outputPath);
  }

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Obtiene el nombre del mes en español
   * @param {number} monthIndex - Índice del mes (0-11)
   * @returns {string} Nombre del mes
   */
  static getMonthName(monthIndex) {
    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return meses[monthIndex] || '';
  }
}
