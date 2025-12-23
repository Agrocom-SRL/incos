/**
 * GET /api/v1/estudiantes/:id/entregas-documentos
 * Controller para obtener entregas de documentos de un estudiante
 */

import { logger } from '../../../shared/logger.js';
import { StudentDocumentDeliveryRepository } from '../../../infrastructure/repositories/StudentDocumentDeliveryRepository.js';

// Crear instancia del repositorio
const studentDocumentDeliveryRepository = new StudentDocumentDeliveryRepository();

export class GetStudentDocumentDeliveriesController {
  async handle(req, res, next) {
    try {
      const { id } = req.params;
      const estudianteId = parseInt(id);

      logger.info('Request de entregas de documentos de estudiante', {
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

      // Buscar entregas de documentos del estudiante
      const entregas = await studentDocumentDeliveryRepository.findByEstudianteId(estudianteId);
      
      logger.info('Entregas encontradas en repositorio', {
        estudianteId,
        total: entregas.length,
      });

      // Convertir entidades a formato de presentación (castellano)
      const entregasData = entregas.map((entrega) => ({
        id: entrega.id,
        estudianteId: entrega.studentId,
        documentacionId: entrega.documentacionId,
        entregado: entrega.entregado,
        enTramite: entrega.enTramite,
        esOriginal: entrega.esOriginal,
        fechaEntrega: entrega.fechaEntrega,
        fechaVencimientoTramite: entrega.fechaVencimientoTramite,
        observaciones: entrega.observaciones,
        activo: entrega.activo,
        createdAt: entrega.createdAt,
        updatedAt: entrega.updatedAt,
      }));

      res.status(200).json({
        success: true,
        data: entregasData,
        message: 'Entregas de documentos obtenidas correctamente',
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error al obtener entregas de documentos de estudiante', {
        error: error.message,
        stack: error.stack,
      });
      next(error);
    }
  }
}

