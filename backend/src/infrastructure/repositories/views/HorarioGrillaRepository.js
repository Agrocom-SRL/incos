import { IHorarioGrillaRepository } from '../../../domain/interfaces/repositories/IHorarioGrillaRepository.js';

/**
 * Fachada de lectura para GET /paralelos-gestion/:id/grilla-horario.
 * Delega en un repositorio por vista SQL (03-views/122–126).
 */
export class HorarioGrillaRepository extends IHorarioGrillaRepository {
  constructor({
    grillaBloqueViewRepository,
    asignacionCoberturaBloquesViewRepository,
    conflictoParaleloBloqueViewRepository,
    conflictoAulaBloqueViewRepository,
    conflictoDocenteBloqueViewRepository,
  }) {
    super();
    this.grillaBloqueViewRepository = grillaBloqueViewRepository;
    this.asignacionCoberturaBloquesViewRepository = asignacionCoberturaBloquesViewRepository;
    this.conflictoParaleloBloqueViewRepository = conflictoParaleloBloqueViewRepository;
    this.conflictoAulaBloqueViewRepository = conflictoAulaBloqueViewRepository;
    this.conflictoDocenteBloqueViewRepository = conflictoDocenteBloqueViewRepository;
  }

  /** @param {number} paraleloGestionId */
  findBloquesByParaleloGestionId(paraleloGestionId) {
    return this.grillaBloqueViewRepository.findByParaleloGestionId(paraleloGestionId);
  }

  /** @param {number} paraleloGestionId */
  findCoberturaBloquesByParaleloGestionId(paraleloGestionId) {
    return this.asignacionCoberturaBloquesViewRepository.findByParaleloGestionId(paraleloGestionId);
  }

  /** @param {number} paraleloGestionId */
  findConflictosParaleloByParaleloGestionId(paraleloGestionId) {
    return this.conflictoParaleloBloqueViewRepository.findByParaleloGestionId(paraleloGestionId);
  }

  /** @param {number} paraleloGestionId */
  findConflictosAulaByParaleloGestionId(paraleloGestionId) {
    return this.conflictoAulaBloqueViewRepository.findByParaleloGestionId(paraleloGestionId);
  }

  /** @param {number} paraleloGestionId */
  findConflictosDocenteByParaleloGestionId(paraleloGestionId) {
    return this.conflictoDocenteBloqueViewRepository.findByParaleloGestionId(paraleloGestionId);
  }
}
