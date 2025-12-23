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
   * @param {string} tipoDocumento - Tipo de documento (INSCRIPCION, LICENCIA, etc.)
   * @param {number|null} documentacionId - ID del documento específico (opcional, NULL si contiene todos los documentos del tipo)
   * @param {Object} file - Archivo subido (de multer)
   * @param {boolean} contieneMultipleDocumentos - Si el archivo contiene múltiples documentos
   * @param {number} userId - ID del usuario que realiza la operación
   * @returns {Promise<Object>} Documento creado
   */
  async execute(studentId, tipoDocumento, documentacionId, file, contieneMultipleDocumentos = false, userId) {
    this.logger.info('[Estudiantes] Subiendo documento', {
      studentId,
      tipoDocumento,
      documentacionId,
      fileName: file?.originalname,
      contieneMultipleDocumentos,
    });

    // 1. Validar que el estudiante existe
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new Error(`Estudiante con ID ${studentId} no encontrado`);
    }

    // 2. Validar tipo de documento
    const tiposValidos = ['INSCRIPCION', 'LICENCIA', 'PASANTIA', 'DESCUENTO', 'TITULACION', 'TRASPASO', 'TRANSFERENCIA', 'BECA', 'OTRO'];
    if (!tiposValidos.includes(tipoDocumento)) {
      throw new Error(`Tipo de documento inválido: ${tipoDocumento}`);
    }

    // 3. Si se proporciona documentacionId, validar que existe y está activo
    let documentacion = null;
    if (documentacionId) {
      documentacion = await this.documentacionRepository.findById(
        parseInt(documentacionId)
      );
      if (!documentacion) {
        throw new Error('Documento específico no encontrado');
      }
      if (!documentacion.active) {
        throw new Error('Documento específico inactivo');
      }
      // Validar que el tipo de documento coincide
      if (documentacion.documentType !== tipoDocumento) {
        throw new Error(`El documento específico no pertenece al tipo ${tipoDocumento}`);
      }
    }

    // 4. Mover archivo a la estructura correcta
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
    const documentacionPrefix = documentacionId ? `${documentacionId}_` : `${tipoDocumento}_`;
    const newFileName = `${documentacionPrefix}${Date.now()}${ext}`;
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

    // 5. Guardar información del documento en BD
    const relativeFilePath = `/uploads/documentos/estudiantes/${studentId}/${newFileName}`;
    const mimeType = file.mimetype || null;

    const documentData = {
      studentId,
      tipoDocumento: tipoDocumento,
      documentacionId: documentacionId ? parseInt(documentacionId) : null,
      fileName: newFileName,
      filePath: relativeFilePath,
      extension: ext.substring(1),
      tipoMime: mimeType,
      contieneMultipleDocumentos: contieneMultipleDocumentos === 'true' || contieneMultipleDocumentos === true,
      verified: false,
      state: 'PENDIENTE',
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

