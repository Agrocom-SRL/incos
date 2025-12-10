import { RegisterStudentUseCase } from '../../application/use-cases/estudiantes/RegisterStudentUseCase.js';
import { RegisterStudentDTO } from '../../application/dtos/request/RegisterStudentDTO.js';
import { StudentResponseDTO } from '../../application/dtos/response/StudentResponseDTO.js';
import { logger } from '../../config/logger.js';

/**
 * Controller: StudentController
 * Maneja las peticiones HTTP relacionadas con estudiantes
 */
export class StudentController {
  constructor({ registerStudentUseCase }) {
    this.registerStudentUseCase = registerStudentUseCase;
  }

  /**
   * POST /estudiantes
   * Registra un nuevo estudiante
   */
  async register(req, res, next) {
    try {
      const dto = RegisterStudentDTO.fromRequest(req);
      const userId = req.user?.id || req.user?.userId; // Del middleware de autenticación

      logger.info('Request de registro de estudiante', {
        ci: dto.ci,
        expedicion: dto.expedicion,
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
      next(error);
    }
  }
}
