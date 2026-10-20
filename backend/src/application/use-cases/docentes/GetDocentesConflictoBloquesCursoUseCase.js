/**
 * GET /api/v1/docentes/conflicto-bloques?cursoId=X
 * Devuelve los IDs de docentes que tienen alguna asignación vigente
 * con horario solapado a los bloques del curso indicado.
 */

import { UnprocessableEntityError } from '../../../domain/errors/index.js';

export class GetDocentesConflictoBloquesCursoUseCase {
  constructor({ teacherRepository, logger }) {
    this.teacherRepository = teacherRepository;
    this.logger = logger;
  }

  async execute(cursoId) {
    const id = Number(cursoId);
    if (!Number.isFinite(id) || id < 1) {
      throw new UnprocessableEntityError('cursoId debe ser un entero positivo.', [
        { field: 'cursoId', message: 'Inválido' },
      ]);
    }
    this.logger.info('[Docentes] Conflicto bloques por curso', { cursoId: id });
    const docenteIds = await this.teacherRepository.getDocentesConChoqueBloques(id);
    return { cursoId: id, docenteIdsConChoque: docenteIds };
  }
}
