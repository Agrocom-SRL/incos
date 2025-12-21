/**
 * Use Case: UploadDocumentUseCase
 * Módulo: Estudiantes
 * Sube un documento de estudiante
 */

import { logger } from '../../../shared/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class UploadDocumentUseCase {
  constructor({
    studentRepository,
    documentacionRepository,
    studentDocumentRepository,
    logger: loggerInstance,
  }) {
    this.studentRepository = studentRepository;
    this.documentacionRepository = documentacionRepository;
    this.studentDocumentRepository = studentDocumentRepository;
    this.logger = loggerInstance || logger;
  }

  /**
   * Ejecuta el caso de uso
   * @param {number} studentId - ID del estudiante
   * @param {number} documentacionId - ID del tipo de documentación
   * @param {Object} file - Archivo subido (de multer)
   * @param {boolean} esOriginal - Si el documento es original o fotocopia
   * @param {number} userId - ID del usuario que realiza la operación
   * @returns {Promise<Object>} Documento creado
   */
  async execute(studentId, documentacionId, file, esOriginal = false, userId) {
    this.logger.info('[Estudiantes] Subiendo documento', {
      studentId,
      documentacionId,
      fileName: file?.originalname,
      esOriginal,
    });

    // 1. Validar que el estudiante existe
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new Error(`Estudiante con ID ${studentId} no encontrado`);
    }

    // 2. Validar que el tipo de documentación existe y está activo
    const documentacion = await this.documentacionRepository.findById(
      parseInt(documentacionId)
    );
    if (!documentacion) {
      throw new Error('Tipo de documentación no encontrado');
    }
    if (!documentacion.active) {
      throw new Error('Tipo de documentación inactivo');
    }

    // 3. Mover archivo a la estructura correcta
    const uploadsBaseDir = path.join(
      __dirname,
      '../../../../uploads/documentos/estudiantes'
    );
    const targetDir = path.join(uploadsBaseDir, studentId.toString());

    // Crear directorio si no existe
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      this.logger.info('[Estudiantes] Directorio creado', { targetDir });
    }

    // Generar nuevo nombre de archivo
    const ext = path.extname(file.originalname);
    const newFileName = `${documentacionId}_${Date.now()}${ext}`;
    const targetPath = path.join(targetDir, newFileName);

    // Mover archivo de temp a la ubicación final
    if (file.path && file.path !== targetPath) {
      if (fs.existsSync(file.path)) {
        fs.renameSync(file.path, targetPath);
        this.logger.info('[Estudiantes] Archivo movido exitosamente', {
          from: file.path,
          to: targetPath,
        });
      }
    }

    // 4. Guardar información del documento en BD
    const relativeFilePath = `/uploads/documentos/estudiantes/${studentId}/${newFileName}`;

    const documentData = {
      studentId,
      documentacionId: parseInt(documentacionId),
      documentReason: documentacion.name,
      referenceType: 'inscripciones',
      description: documentacion.description || documentacion.name,
      fileName: newFileName,
      filePath: relativeFilePath,
      extension: ext.substring(1),
      sizeKb: Math.round(file.size / 1024),
      verified: false,
      state: 'PENDIENTE',
      esOriginal: esOriginal === 'true' || esOriginal === true,
    };

    const document = await this.studentDocumentRepository.create(
      documentData,
      userId
    );

    this.logger.info('[Estudiantes] Documento subido exitosamente', {
      studentId,
      documentId: document.id,
      fileName: newFileName,
    });

    return document;
  }
}

