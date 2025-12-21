/**
 * Use Case: GenerateCompromisoActaUseCase
 * Módulo: Estudiantes
 * Genera el ACTA DE COMPROMISO para la entrega de documentos
 */

import { PDFGenerator } from '../../../infrastructure/external/pdf/PDFGenerator.js';
import { logger } from '../../../shared/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class GenerateCompromisoActaUseCase {
  constructor({ studentRepository, documentacionRepository, logger: loggerInstance }) {
    this.studentRepository = studentRepository;
    this.documentacionRepository = documentacionRepository;
    this.logger = loggerInstance || logger;
  }

  /**
   * Ejecuta el caso de uso
   * @param {number} studentId - ID del estudiante
   * @param {Object} options - Opciones adicionales
   * @param {Array<number>} options.documentosFaltantes - IDs de documentos faltantes
   * @param {string} options.motivos - Motivos por los que faltan documentos
   * @param {number} options.plazoMaximo - Plazo máximo en días (default: 10)
   * @returns {Promise<{filePath: string, fileName: string}>}
   */
  async execute(studentId, options = {}) {
    this.logger.info('[Estudiantes] Generando ACTA DE COMPROMISO', {
      studentId,
      options,
    });

    // 1. Obtener datos del estudiante
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new Error(`Estudiante con ID ${studentId} no encontrado`);
    }

    // 2. Obtener documentos requeridos para determinar cuáles faltan
    const documentosRequeridos = await this.documentacionRepository.findRequeridos({
      tipoDocumento: 'INSCRIPCION',
      includeInactive: false,
    });

    // 3. Preparar datos para el PDF
    const fecha = new Date();
    const data = {
      ciudad: 'Santa Cruz de la Sierra',
      dia: fecha.getDate(),
      mes: PDFGenerator.getMonthName(fecha.getMonth()),
      anio: fecha.getFullYear(),
      nombreCompleto: `${student.nombres} ${student.apellidoPaterno} ${student.apellidoMaterno || ''}`.trim(),
      ci: student.ci,
      expedicion: student.expedicion || 'S.C.',
      anioCarrera: options.anioCarrera || '',
      paralelo: options.paralelo || '',
      carrera: options.carrera || '',
      documentosFaltantes: options.documentosFaltantes || [],
      motivos: options.motivos || 'Actualización de carta aval del presente año.',
      plazoMaximo: options.plazoMaximo || 10,
    };

    // 4. Generar ruta de salida
    const uploadsDir = path.join(
      __dirname,
      '../../../../uploads/documentos/estudiantes',
      studentId.toString()
    );
    const fileName = `ACTA_COMPROMISO_${student.ci}_${Date.now()}.pdf`;
    const outputPath = path.join(uploadsDir, fileName);

    // 5. Generar PDF
    await PDFGenerator.generateCompromisoActa(data, outputPath);

    this.logger.info('[Estudiantes] ACTA DE COMPROMISO generada exitosamente', {
      studentId,
      filePath: outputPath,
      fileName,
    });

    // 6. Retornar ruta relativa y nombre del archivo
    const relativePath = `/uploads/documentos/estudiantes/${studentId}/${fileName}`;

    return {
      filePath: relativePath,
      fileName,
      absolutePath: outputPath,
    };
  }
}

