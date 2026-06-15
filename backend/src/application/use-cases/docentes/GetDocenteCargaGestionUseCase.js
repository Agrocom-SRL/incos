import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { DocenteCargaGestionMapper } from '../../mappers/docentes/DocenteCargaGestionMapper.js';

/**
 * Carga horaria acumulada del docente en una gestión (asignaciones vigentes sobre oferta_cursos).
 */
export class GetDocenteCargaGestionUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/TeacherRepository.js').TeacherRepository} deps.teacherRepository
   * @param {import('../../../infrastructure/repositories/TeacherAssignmentRepository.js').TeacherAssignmentRepository} deps.teacherAssignmentRepository
   * @param {import('../../../infrastructure/repositories/ManagementRepository.js').ManagementRepository} deps.managementRepository
   * @param {import('../../../domain/interfaces/ILogger.js').ILogger} deps.logger
   */
  constructor({ teacherRepository, teacherAssignmentRepository, managementRepository, logger }) {
    this.teacherRepository = teacherRepository;
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.managementRepository = managementRepository;
    this.logger = logger;
  }

  /**
   * @param {{ docenteId: number, gestionId: number }} params
   * @returns {Promise<Object>}
   */
  async execute({ docenteId, gestionId }) {
    const teacherId = Number(docenteId);
    const managementId = Number(gestionId);

    if (!Number.isFinite(teacherId) || teacherId < 1) {
      throw new ValidationError('docenteId inválido');
    }
    if (!Number.isFinite(managementId) || managementId < 1) {
      throw new ValidationError('gestion_id inválido');
    }

    const gestion = await this.managementRepository.findById(managementId);
    if (!gestion) {
      throw new NotFoundError('Gestión', managementId);
    }

    const limites = await this.teacherRepository.findCargaLimitesById(teacherId);
    if (!limites) {
      throw new NotFoundError('Docente', teacherId);
    }

    const asignaciones = await this.teacherAssignmentRepository.findCargaDetalleByDocenteAndGestion(
      teacherId,
      managementId
    );

    const payload = DocenteCargaGestionMapper.toPresentation({
      docenteId: teacherId,
      gestionId: managementId,
      maxHorasSemana: limites.maxHorasSemana,
      maxHorasMes: limites.maxHorasMes,
      asignaciones,
    });

    this.logger.info('Carga gestión docente calculada', {
      docenteId: teacherId,
      gestionId: managementId,
      cargaSemana: payload.carga_actual_semana,
      sobrecarga: payload.sobrecarga,
    });

    return payload;
  }
}
