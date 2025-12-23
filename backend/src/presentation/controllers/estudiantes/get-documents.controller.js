/**
 * GET /api/v1/estudiantes/:id/documentos
 * Controller para obtener documentos de un estudiante
 */

import { logger } from '../../../shared/logger.js';
import { StudentDocumentRepository } from '../../../infrastructure/repositories/StudentDocumentRepository.js';

// Crear instancia del repositorio
const studentDocumentRepository = new StudentDocumentRepository();

export class GetStudentDocumentsController {
  async handle(req, res, next) {
    try {
      const { id } = req.params;
      const estudianteId = parseInt(id);

      logger.info('Request de documentos de estudiante', {
        studentId: estudianteId,
      });

      if (isNaN(estudianteId)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'ID de estudiante inválido',
          },
        });
      }

      // Usar repositorio directamente

      logger.info('Buscando documentos del estudiante', {
        estudianteId,
        tipoEstudianteId: typeof estudianteId,
      });

      // Buscar documentos del estudiante
      const documentos = await studentDocumentRepository.findByEstudianteId(estudianteId);
      
      logger.info('Documentos encontrados en repositorio', {
        estudianteId,
        total: documentos.length,
        documentos: documentos.map(doc => ({
          id: doc.id,
          studentId: doc.studentId,
          documentacionId: doc.documentacionId,
          fileName: doc.fileName,
          activo: doc.activo,
        })),
      });

      // Convertir entidades a formato de presentación (castellano)
      const documentosData = documentos.map((doc) => ({
        id: doc.id,
        estudianteId: doc.studentId,
        tipoDocumento: doc.tipoDocumento,
        documentacionId: doc.documentacionId,
        nombreArchivo: doc.fileName,
        rutaArchivo: doc.filePath,
        extension: doc.extension,
        tipoMime: doc.tipoMime,
        contieneMultipleDocumentos: doc.contieneMultipleDocumentos,
        verificado: doc.verified,
        verificadoPor: doc.verifiedBy,
        fechaVerificacion: doc.verificationDate,
        observacionesVerificacion: doc.verificationObservations,
        estado: doc.state,
        motivoRechazo: doc.rejectionReason,
        activo: doc.activo,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }));

      logger.info('Documentos encontrados', {
        studentId: estudianteId,
        total: documentosData.length,
      });

      res.status(200).json({
        success: true,
        data: documentosData,
        message: 'Documentos obtenidos correctamente',
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error al obtener documentos de estudiante', {
        error: error.message,
        stack: error.stack,
      });
      next(error);
    }
  }
}

