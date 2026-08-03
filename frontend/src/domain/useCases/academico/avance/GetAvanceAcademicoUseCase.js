/**
 * Avance académico por estudiante × plan (Académico · /academico/avance).
 * El alcance (GLOBAL | PROPIO) lo resuelve el servidor según el vínculo del
 * usuario autenticado; el frontend solo consume el resultado.
 */

export class GetAvanceAcademicoUseCase {
  /**
   * @param {import('@infrastructure/repositories/AvanceAcademicoRepository.js').default} avanceAcademicoRepository
   */
  constructor(avanceAcademicoRepository) {
    this.avanceAcademicoRepository = avanceAcademicoRepository;
  }

  /**
   * @param {Object} [params]
   * @param {number|null} [params.carreraId]
   */
  async ejecutar({ carreraId = null } = {}) {
    return this.avanceAcademicoRepository.obtenerAvance({ carreraId });
  }
}
