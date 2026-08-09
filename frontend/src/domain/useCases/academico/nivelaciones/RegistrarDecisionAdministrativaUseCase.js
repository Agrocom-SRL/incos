/**
 * Registra una decisión administrativa ABANDONO/RETIRADO (nota forzada,
 * irreversible). SIEMPRE decisión de RECTOR/DIR_ACADEMICO — nunca del
 * docente (permiso `academico.nivelacion.aprobar`).
 */

export class RegistrarDecisionAdministrativaUseCase {
  /**
   * @param {import('@infrastructure/repositories/NivelacionRepository.js').default} nivelacionRepository
   */
  constructor(nivelacionRepository) {
    this.nivelacionRepository = nivelacionRepository;
  }

  /**
   * @param {{ subjectEnrollmentId:number, stateType:'ABANDONO'|'RETIRADO',
   *   resultingGrade:number, transitionDate?:string, observations?:string }} payload
   */
  async ejecutar(payload) {
    return this.nivelacionRepository.registrarDecisionAdministrativa(payload);
  }
}

export default RegistrarDecisionAdministrativaUseCase;
