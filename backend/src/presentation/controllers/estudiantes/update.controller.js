import { logger } from '../../../shared/logger.js';
import { StudentRepository } from '../../../infrastructure/repositories/StudentRepository.js';
import { StudentMapper } from '../../../application/mappers/StudentMapper.js';
import { StudentResponseDTO } from '../../../application/dtos/response/StudentResponseDTO.js';

// Crear instancia del repositorio directamente
const studentRepository = new StudentRepository();

/**
 * PUT /api/v1/estudiantes/:id
 * Controller para actualizar datos de un estudiante
 */
export class UpdateStudentController {
  async handle(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user?.id || req.user?.userId;

      logger.info('Request de actualización de estudiante', {
        studentId: id,
        fields: Object.keys(updateData),
        sampleData: {
          nombres: updateData.nombres,
          apellidoPaterno: updateData.apellidoPaterno,
          ci: updateData.ci,
          celular: updateData.celular,
        },
        userId,
      });

      // Verificar que el estudiante existe
      const estudianteId = parseInt(id, 10);
      if (isNaN(estudianteId)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'ID de estudiante inválido',
          },
        });
      }

      const estudianteExistente = await studentRepository.findById(estudianteId);
      if (!estudianteExistente) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'STUDENT_NOT_FOUND',
            message: 'Estudiante no encontrado',
          },
        });
      }

      // Convertir datos del request (castellano) a formato de dominio (inglés)
      const datosDominio = StudentMapper.toDomain(updateData);
      
      logger.info('Datos convertidos a dominio', {
        dominioFields: Object.keys(datosDominio),
        sampleDominio: {
          firstName: datosDominio.firstName,
          lastName: datosDominio.lastName,
          ci: datosDominio.ci,
          mobilePhone: datosDominio.mobilePhone,
        },
      });

      // Actualizar el estudiante usando el repositorio
      const estudianteActualizado = await studentRepository.update(
        estudianteId,
        datosDominio,
        userId
      );

      if (!estudianteActualizado) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Error al actualizar el estudiante',
          },
        });
      }

      // Convertir entidad a DTO de respuesta
      const responseDTO = StudentResponseDTO.fromEntity(estudianteActualizado);

      logger.info('Estudiante actualizado correctamente', {
        studentId: estudianteId,
        updatedFields: Object.keys(datosDominio),
      });

      res.status(200).json({
        success: true,
        data: responseDTO,
        message: 'Estudiante actualizado correctamente',
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error en UpdateStudentController', {
        error: error.message,
        stack: error.stack,
        studentId: req.params.id,
        body: req.body,
      });
      next(error);
    }
  }
}
