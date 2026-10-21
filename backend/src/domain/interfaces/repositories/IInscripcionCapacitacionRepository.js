import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: IInscripcionCapacitacionRepository
 *
 * Inscripciones de participantes a capacitaciones (tabla
 * `capacitacion_inscritos`, módulo CAP). Se llama "inscritos" (no
 * "inscripciones") para no chocar con la tabla `inscripciones` de la
 * matrícula formal.
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository. Añade las lecturas de listado y
 * ficha que combinan participante + curso + estado de pago (SUM de
 * `capacitacion_pagos` vs `capacitaciones.costo`), sin vista SQL dedicada.
 */
export class IInscripcionCapacitacionRepository extends IRepository {
  /**
   * Inscripción activa (estado='INSCRITO', activo) de un participante a un
   * curso, o null. Regla "una inscripción activa por participante+curso"
   * (sin UNIQUE en BD, mismo criterio que `pago_aporte`).
   *
   * @param {number} participanteId
   * @param {number} capacitacionId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<Object|null>}
   */
  async findActivaByParticipanteAndCapacitacion(_participanteId, _capacitacionId, _options = {}) {
    throw new Error('Method findActivaByParticipanteAndCapacitacion() must be implemented');
  }

  /**
   * Filas del listado de inscripciones: inscripción + participante + curso +
   * total pagado (agregado de `capacitacion_pagos`). Filas crudas snake_case;
   * el estado de pago derivado se calcula en el mapper de aplicación.
   *
   * @param {Object} filters
   *   - search: texto (CI/nombres/apellidos del participante o título del curso)
   *   - capacitacionId: filtrar por curso
   *   - participanteId: filtrar por participante (historial en su ficha)
   *   - estado: 'INSCRITO' | 'RETIRADO'
   *   - includeInactive: incluir inscripciones inactivas
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<{rows: Array<Object>, total: number}>}
   */
  async findListadoRows(_filters = {}, _page = 1, _limit = 50) {
    throw new Error('Method findListadoRows() must be implemented');
  }

  /**
   * Fila de ficha de UNA inscripción (mismas columnas que el listado), o null.
   *
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async findListadoRowById(_id) {
    throw new Error('Method findListadoRowById() must be implemented');
  }

  /**
   * Cantidad de inscripciones vigentes (PENDIENTE o INSCRITO) por grupo.
   *
   * @param {number[]} grupoIds
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<Object<number, number>>} Mapa grupoId → cantidad
   */
  async countVigentesByGrupoIds(_grupoIds, _options = {}) {
    throw new Error('Method countVigentesByGrupoIds() must be implemented');
  }
}
