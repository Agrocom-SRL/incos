/**
 * Materias pendientes/arrastradas de un estudiante (B2, buscador sin
 * contexto, "Gap 2"). `null` si el estudiante no tiene ningún evento vigente.
 */

export class ListarMateriasPendientesEstudianteUseCase {
  /**
   * @param {import('@infrastructure/repositories/NivelacionRepository.js').default} nivelacionRepository
   */
  constructor(nivelacionRepository) {
    this.nivelacionRepository = nivelacionRepository;
  }

  /**
   * @param {{ estudianteId: number }} params
   */
  async ejecutar({ estudianteId } = {}) {
    return this.nivelacionRepository.listarMateriasPendientesEstudiante(estudianteId);
  }
}

export default ListarMateriasPendientesEstudianteUseCase;
