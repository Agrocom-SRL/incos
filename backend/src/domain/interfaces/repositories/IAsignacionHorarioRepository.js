import { IRepository } from './IRepository.js';

/**
 * Repositorio de bloques horarios (asignacion_horarios).
 */
export class IAsignacionHorarioRepository extends IRepository {
  async hasClassroomConflict({ scheduleId, classroomId, excludeAsignacionHorarioId = null }) {
    throw new Error('Method hasClassroomConflict() must be implemented');
  }

  async findClassroomConflict({ scheduleId, classroomId, excludeAsignacionHorarioId = null }) {
    throw new Error('Method findClassroomConflict() must be implemented');
  }

  async findBloquesByOfertaCursoIdForPresentation(ofertaCursoId) {
    throw new Error('Method findBloquesByOfertaCursoIdForPresentation() must be implemented');
  }
}
