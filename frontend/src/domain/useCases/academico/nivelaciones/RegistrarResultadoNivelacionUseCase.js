/**
 * Cierra el examen de nivelación (transición de estado + nota, si
 * corresponde). Guardado directo, sin `Modal.confirm` — es el examen, no la
 * decisión administrativa irreversible.
 */

export class RegistrarResultadoNivelacionUseCase {
  /**
   * @param {import('@infrastructure/repositories/NivelacionRepository.js').default} nivelacionRepository
   */
  constructor(nivelacionRepository) {
    this.nivelacionRepository = nivelacionRepository;
  }

  /**
   * @param {number} levelingId
   * @param {{ status:'EN_CURSO'|'APROBADA'|'REPROBADA'|'CANCELADA', levelingGrade?:number,
   *   passed?:boolean, observations?:string }} payload
   */
  async ejecutar(levelingId, payload) {
    return this.nivelacionRepository.registrarResultadoExamen(levelingId, payload);
  }
}

export default RegistrarResultadoNivelacionUseCase;
