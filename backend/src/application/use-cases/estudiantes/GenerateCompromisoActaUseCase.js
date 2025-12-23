/**
 * Use Case: GenerateCompromisoActaUseCase
 * Módulo: Estudiantes
 * Genera el ACTA DE COMPROMISO para la entrega de documentos
 * Recupera automáticamente todos los datos del estudiante (carrera, gestión, documentos)
 */

import { PDFGenerator } from '../../../infrastructure/external/pdf/PDFGenerator.js';
import { logger } from '../../../shared/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class GenerateCompromisoActaUseCase {
  constructor({ 
    studentRepository, 
    documentacionRepository, 
    studentAcademicDataRepository,
    studentDocumentRepository,
    careerRepository,
    managementRepository,
    logger: loggerInstance 
  }) {
    this.studentRepository = studentRepository;
    this.documentacionRepository = documentacionRepository;
    this.studentAcademicDataRepository = studentAcademicDataRepository;
    this.studentDocumentRepository = studentDocumentRepository;
    this.careerRepository = careerRepository;
    this.managementRepository = managementRepository;
    this.logger = loggerInstance || logger;
  }

  /**
   * Ejecuta el caso de uso
   * @param {number} studentId - ID del estudiante
   * @param {Object} options - Opciones adicionales (opcional, solo para motivos personalizados)
   * @param {string} options.motivos - Motivos personalizados (opcional)
   * @param {number} options.plazoMaximo - Plazo máximo en días (default: 10)
   * @returns {Promise<{filePath: string, fileName: string}>}
   */
  async execute(studentId, options = {}) {
    this.logger.info('[Estudiantes] Generando ACTA DE COMPROMISO', {
      studentId,
    });

    // 1. Obtener datos del estudiante
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new Error(`Estudiante con ID ${studentId} no encontrado`);
    }

    // 2. Obtener datos académicos del estudiante (carrera, gestión)
    const datosAcademicos = await this.studentAcademicDataRepository.findByEstudianteId(studentId);
    
    let carreraNombre = '';
    let gestionNombre = '';
    let anioCarrera = '';
    let paralelo = '';

    if (datosAcademicos) {
      // Obtener nombre de la carrera
      if (datosAcademicos.careerId) {
        const carrera = await this.careerRepository.findById(datosAcademicos.careerId);
        if (carrera) {
          carreraNombre = carrera.name || '';
        }
      }

      // Obtener nombre de la gestión
      if (datosAcademicos.managementId) {
        const gestion = await this.managementRepository.findById(datosAcademicos.managementId);
        if (gestion) {
          gestionNombre = gestion.code || '';
          // Extraer año de la gestión (ej: "2025-1" -> "2" para segundo año)
          // Por ahora usamos el código completo, pero se puede extraer el año si es necesario
          anioCarrera = gestion.year?.toString() || '';
        }
      }
    }

    // 3. Obtener documentos requeridos de tipo INSCRIPCION
    const documentosRequeridos = await this.documentacionRepository.findRequeridos({
      tipoDocumento: 'INSCRIPCION',
      includeInactive: false,
    });

    // 4. Obtener documentos entregados del estudiante
    const documentosEntregados = await this.studentDocumentRepository.findByEstudianteId(studentId);
    const documentosEntregadosIds = documentosEntregados
      .map(doc => doc.documentacionId)
      .filter(id => id !== null && id !== undefined);

    // 5. Determinar qué documentos faltan
    // Mapear documentos requeridos a índices según el orden en el PDF
    // Los documentos en el PDF son:
    // 0: Copia de simple del Diploma de Bachiller
    // 1: Copia Simple Certificado de nacimiento
    // 2: Copia simple del Carnet de identidad
    // 3: Una foto 3 x 3 fondo rojo
    // 4: Folder con nepaco
    
    // Función para mapear un documento a su índice en el PDF
    const mapearDocumentoAIndice = (nombreDoc) => {
      const nombre = (nombreDoc || '').toLowerCase();
      
      // Mapeo más específico primero
      if (nombre.includes('diploma') && nombre.includes('bachiller')) {
        return 0; // Diploma de Bachiller
      }
      if (nombre.includes('certificado') && nombre.includes('nacimiento')) {
        return 1; // Certificado de Nacimiento
      }
      if (nombre.includes('carnet') || nombre.includes('identidad') || 
          nombre.includes('cédula') || nombre.includes('cedula') || nombre.includes('ci')) {
        return 2; // Carnet de Identidad
      }
      if (nombre.includes('foto') || nombre.includes('fotografía') || nombre.includes('fotografia')) {
        return 3; // Foto 3x3
      }
      if (nombre.includes('folder') || nombre.includes('nepaco') || nombre.includes('carpeta')) {
        return 4; // Folder con nepaco
      }
      
      // Mapeo por palabras clave individuales (fallback)
      if (nombre.includes('diploma') || nombre.includes('bachiller')) {
        return 0;
      }
      if (nombre.includes('certificado') || nombre.includes('nacimiento')) {
        return 1;
      }
      
      return null; // No mapea a ningún documento del PDF
    };

    const documentosFaltantesIndices = [];
    
    documentosRequeridos.forEach((docRequerido) => {
      const tieneDocumento = documentosEntregadosIds.includes(docRequerido.id);
      
      if (!tieneDocumento) {
        const indice = mapearDocumentoAIndice(docRequerido.name);
        if (indice !== null && !documentosFaltantesIndices.includes(indice)) {
          documentosFaltantesIndices.push(indice);
        }
      }
    });

    // 6. Preparar datos para el PDF
    const fecha = new Date();
    const data = {
      ciudad: 'Santa Cruz de la Sierra',
      dia: fecha.getDate(),
      mes: PDFGenerator.getMonthName(fecha.getMonth()),
      anio: fecha.getFullYear(),
      nombreCompleto: `${student.firstName} ${student.lastName} ${student.motherLastName || ''}`.trim(),
      ci: student.ci,
      expedicion: student.expedition || 'S.C.',
      anioCarrera: anioCarrera || '',
      paralelo: paralelo || '',
      carrera: carreraNombre,
      documentosFaltantes: documentosFaltantesIndices,
      motivos: options.motivos || 'Actualización de carta aval del presente año.',
      plazoMaximo: options.plazoMaximo || 10,
    };

    this.logger.info('[Estudiantes] Datos preparados para ACTA DE COMPROMISO', {
      studentId,
      carrera: carreraNombre,
      gestion: gestionNombre,
      documentosRequeridos: documentosRequeridos.length,
      documentosEntregados: documentosEntregadosIds.length,
      documentosFaltantes: documentosFaltantesIndices,
    });

    // 7. Generar ruta de salida
    const uploadsDir = path.join(
      __dirname,
      '../../../../uploads/documentos/estudiantes',
      studentId.toString()
    );
    const fileName = `ACTA_COMPROMISO_${student.ci}_${Date.now()}.pdf`;
    const outputPath = path.join(uploadsDir, fileName);

    // 8. Generar PDF
    await PDFGenerator.generateCompromisoActa(data, outputPath);

    this.logger.info('[Estudiantes] ACTA DE COMPROMISO generada exitosamente', {
      studentId,
      filePath: outputPath,
      fileName,
    });

    // 9. Retornar ruta relativa y nombre del archivo
    const relativePath = `/uploads/documentos/estudiantes/${studentId}/${fileName}`;

    return {
      filePath: relativePath,
      fileName,
      absolutePath: outputPath,
    };
  }
}

