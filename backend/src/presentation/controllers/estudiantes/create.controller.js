import { RegisterStudentUseCase } from '../../../application/use-cases/Estudiantes/RegisterStudentUseCase.js';
import { RegisterStudentDTO } from '../../../application/dtos/request/RegisterStudentDTO.js';
import { StudentResponseDTO } from '../../../application/dtos/response/StudentResponseDTO.js';
import { logger } from '../../../shared/logger.js';

/**
 * POST /api/v1/estudiantes
 * Controller para crear un nuevo estudiante
 */
export class CreateStudentController {
  constructor({ registerStudentUseCase }) {
    this.registerStudentUseCase = registerStudentUseCase;
  }

  async handle(req, res, next) {
    try {
      logger.info(`Request de registro de estudiante recibido - ${req.method} ${req.originalUrl}`);
      console.log('Body recibido:', JSON.stringify(req.body, null, 2));
      console.log('Content-Type:', req.headers['content-type']);
      console.log('Body keys:', Object.keys(req.body || {}));

      let dto;
      try {
        dto = RegisterStudentDTO.fromRequest(req);
      } catch (dtoError) {
        logger.error('Error al crear DTO desde request', {
          error: dtoError.message,
          stack: dtoError.stack,
          body: req.body,
        });
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Error al procesar los datos del request',
            details: [{ field: 'body', message: dtoError.message }],
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        });
      }

      const userId = req.user?.id || req.user?.userId;

      logger.info('DTO creado correctamente', {
        ci: dto.ci,
        expedicion: dto.expedicion,
        nombres: dto.nombres,
        apellidoPaterno: dto.apellidoPaterno,
        userId,
      });

      const student = await this.registerStudentUseCase.execute(dto, userId);
      const responseDTO = StudentResponseDTO.fromEntity(student);

      res.status(201).json({
        success: true,
        data: responseDTO,
        message: 'Estudiante creado correctamente',
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error en CreateStudentController', {
        error: error.message,
        stack: error.stack,
        errorName: error.name,
        isOperational: error.isOperational,
        statusCode: error.statusCode,
        code: error.code,
        details: error.details,
        body: req.body,
      });
      next(error);
    }
  }
}
