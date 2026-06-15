/**
 * GET /api/v1/gestiones/:id/carga-docentes — dashboard de carga horaria por gestión.
 */

import { NotFoundError } from '../../../domain/errors/index.js';
import { GestionCargaDocentesMapper } from '../../mappers/docentes/GestionCargaDocentesMapper.js';

export class GetGestionCargaDocentesUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/ManagementRepository.js').ManagementRepository} deps.managementRepository
   * @param {import('../../../infrastructure/repositories/TeacherAssignmentRepository.js').TeacherAssignmentRepository} deps.teacherAssignmentRepository
   * @param {import('../../../infrastructure/repositories/CourseOfferRepository.js').CourseOfferRepository} deps.courseOfferRepository
   * @param {import('../../../domain/interfaces/ILogger.js').ILogger} deps.logger
   */
  constructor({
    managementRepository,
    teacherAssignmentRepository,
    courseOfferRepository,
    logger,
  }) {
    this.managementRepository = managementRepository;
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.courseOfferRepository = courseOfferRepository;
    this.logger = logger;
  }

  /**
   * @param {number} gestionId
   */
  async execute(gestionId) {
    const gId = Number(gestionId);
    if (!Number.isFinite(gId) || gId < 1) {
      throw new NotFoundError('Gestión');
    }

    const gestion = await this.managementRepository.findById(gId);
    if (!gestion) {
      throw new NotFoundError('Gestión', gId);
    }

    const [docentes, cobertura] = await Promise.all([
      this.teacherAssignmentRepository.findCargaResumenByGestion(gId),
      this.courseOfferRepository.findCoberturaTotalesByGestionId(gId),
    ]);

    const payload = GestionCargaDocentesMapper.toPresentation({ docentes, cobertura });

    this.logger.info('[Docentes] Carga docentes por gestión', {
      gestionId: gId,
      docentesActivos: payload.totales.docentes_activos,
      cobertura: payload.totales.cobertura,
    });

    return payload;
  }
}
