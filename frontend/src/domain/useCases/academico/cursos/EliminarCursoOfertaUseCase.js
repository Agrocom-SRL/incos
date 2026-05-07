import { ICursoRepository } from '@domain/repositories';

export class EliminarCursoOfertaUseCase {
  constructor(cursoRepository) {
    this.cursoRepository = cursoRepository;
  }

  async ejecutar(courseId, parallelId) {
    try {
      if (!courseId) {
        return { success: false, error: 'ID de curso es requerido' };
      }
      const result = await this.cursoRepository.eliminarOferta({ courseId, parallelId });
      if (!result.success) return result;
      return { success: true, data: result.data ?? null };
    } catch (error) {
      return { success: false, error: error.message || 'Error al eliminar el curso' };
    }
  }
}
