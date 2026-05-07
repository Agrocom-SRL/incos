import { ICursoRepository } from '@domain/repositories';

export class ActualizarCursoOfertaUseCase {
  constructor(cursoRepository) {
    this.cursoRepository = cursoRepository;
  }

  async ejecutar(courseId, payload) {
    try {
      if (!courseId) {
        return { success: false, error: 'ID de curso es requerido' };
      }
      const result = await this.cursoRepository.actualizarOferta({ courseId, payload });
      if (!result.success) return result;
      return { success: true, data: result.data ?? null };
    } catch (error) {
      return { success: false, error: error.message || 'Error al actualizar el curso' };
    }
  }
}
